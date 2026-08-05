import { createPrivateKey } from 'node:crypto';

function unwrapValue(value: string): string {
  let result = value.trim();

  if (result.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(result);
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'private_key' in parsed &&
        typeof parsed.private_key === 'string'
      ) {
        result = parsed.private_key;
      }
    } catch {
      // Continue with the original value so validation reports the real problem.
    }
  }

  const hasDoubleQuoteWrapper = result.startsWith('"') && (result.endsWith('"') || result.endsWith('",'));
  const hasSingleQuoteWrapper = result.startsWith("'") && result.endsWith("'");
  if (hasDoubleQuoteWrapper) {
    result = result.endsWith('",') ? result.slice(1, -2) : result.slice(1, -1);
  } else if (hasSingleQuoteWrapper) {
    result = result.slice(1, -1);
  }

  return result;
}

export function normalizePrivateKey(raw: string): string {
  return unwrapValue(raw)
    // Handle both `\\n` and `\\\\n`, which are common after env-file imports.
    .replace(/\\+r\\+n/g, '\n')
    .replace(/\\+n/g, '\n')
    .replace(/\\+r/g, '\r')
    .replace(/\r\n?/g, '\n')
    .trim();
}

export function getPrivateKeyFromEnvironment(env: NodeJS.ProcessEnv = process.env): string {
  const encoded = env.GOOGLE_PRIVATE_KEY_BASE64?.trim();
  const raw = encoded
    ? Buffer.from(encoded, 'base64').toString('utf8')
    : env.GOOGLE_PRIVATE_KEY ?? '';
  const key = normalizePrivateKey(raw);

  if (!key) return '';

  try {
    createPrivateKey(key);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'invalid PEM data';
    throw new Error(
      'GOOGLE_PRIVATE_KEY is not a valid private-key PEM. Use the service account private_key value, or set GOOGLE_PRIVATE_KEY_BASE64. ' + reason,
      { cause: error },
    );
  }

  return key;
}
