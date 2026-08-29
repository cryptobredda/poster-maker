import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'test';
process.env.CRON_SECRET = '';
process.env.CORS_ALLOWED_ORIGIN = 'https://www.zawia.org.uk';

const { app } = await import('../src/index.js');
let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('public endpoints expose CORS only to the configured exact origin', async () => {
  const allowed = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'https://www.zawia.org.uk' },
  });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://www.zawia.org.uk');
  assert.match(allowed.headers.get('vary') || '', /Origin/);

  const other = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'https://zawia.org.uk' },
  });
  assert.equal(other.status, 200);
  assert.equal(other.headers.get('access-control-allow-origin'), null);
});

test('public endpoints allow the production WordPress origin by default', async () => {
  const previousOrigin = process.env.CORS_ALLOWED_ORIGIN;
  delete process.env.CORS_ALLOWED_ORIGIN;
  try {
    const response = await fetch(`${baseUrl}/health`, {
      headers: { Origin: 'https://zawia.org' },
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://zawia.org');
  } finally {
    if (previousOrigin === undefined) delete process.env.CORS_ALLOWED_ORIGIN;
    else process.env.CORS_ALLOWED_ORIGIN = previousOrigin;
  }
});

test('disallowed CORS preflight receives a structured error', async () => {
  const response = await fetch(`${baseUrl}/prayer-times`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://example.com' },
  });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed.' },
  });
});

test('invalid prayer date returns a structured 400 before accessing Sheets', async () => {
  const response = await fetch(`${baseUrl}/prayer-times?date=2026-02-29`, {
    headers: { Origin: 'https://www.zawia.org.uk' },
  });
  assert.equal(response.status, 400);
  const body = await response.json() as { error: { code: string } };
  assert.equal(body.error.code, 'INVALID_DATE');
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://www.zawia.org.uk');
});

test('poster and table-svg enforce paired month and year parameters', async () => {
  for (const path of ['/poster?month=7', '/table-svg?year=2026']) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 400);
    const body = await response.json() as { error: { code: string } };
    assert.equal(body.error.code, 'INVALID_MONTH_YEAR');
  }
});

test('cron middleware fails closed when CRON_SECRET is unset', async () => {
  const response = await fetch(`${baseUrl}/cron/sync?secret=`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: { code: 'CRON_SECRET_NOT_CONFIGURED', message: 'Cron endpoints are unavailable.' },
  });
});

test('cron middleware rejects a mismatched configured secret', async () => {
  process.env.CRON_SECRET = 'configured-for-test';
  try {
    const response = await fetch(`${baseUrl}/cron/sync?secret=wrong`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized.' },
    });
  } finally {
    process.env.CRON_SECRET = '';
  }
});
