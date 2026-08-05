import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { getPrivateKeyFromEnvironment, normalizePrivateKey } from '../src/credentials.js';

const privateKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey
  .export({ format: 'pem', type: 'pkcs8' })
  .toString();

test('normalizes PEM values from common environment encodings', () => {
  assert.equal(normalizePrivateKey(privateKey), privateKey.trim());
  assert.equal(normalizePrivateKey(JSON.stringify(privateKey)), privateKey.trim());
  assert.equal(normalizePrivateKey(JSON.stringify({ private_key: privateKey })), privateKey.trim());
  assert.equal(normalizePrivateKey(privateKey.replaceAll('\n', '\\n')), privateKey.trim());
  assert.equal(normalizePrivateKey(privateKey.replaceAll('\n', '\\\\n')), privateKey.trim());
});

test('reads a base64 private key without exposing multiline parsing to deployment', () => {
  const encoded = Buffer.from(privateKey).toString('base64');
  assert.equal(getPrivateKeyFromEnvironment({ GOOGLE_PRIVATE_KEY_BASE64: encoded }), privateKey.trim());
});

test('rejects malformed private keys with an actionable message', () => {
  assert.throws(
    () => getPrivateKeyFromEnvironment({ GOOGLE_PRIVATE_KEY: 'not-a-private-key' }),
    /GOOGLE_PRIVATE_KEY is not a valid private-key PEM/,
  );
});
