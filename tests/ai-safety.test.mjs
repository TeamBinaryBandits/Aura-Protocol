import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFile } from 'node:fs/promises';

describe('Gemini assistant safety boundary', () => {
  it('keeps the Gemini key in the server-side Vercel function', async () => {
    const [client, server] = await Promise.all([
      readFile(new URL('../src/services/aura-ai.js', import.meta.url), 'utf8'),
      readFile(new URL('../api/aura-ai.js', import.meta.url), 'utf8'),
    ]);
    assert.doesNotMatch(client, /GEMINI_API_KEY|VITE_GEMINI/i);
    assert.match(server, /process\.env\.GEMINI_API_KEY/);
    assert.match(server, /x-goog-api-key/);
    assert.match(server, /store: false/);
  });

  it('rejects unknown actions and documents private inputs that must not cross the boundary', async () => {
    const server = await readFile(new URL('../api/aura-ai.js', import.meta.url), 'utf8');
    assert.match(server, /Unsupported assistant action/);
    assert.match(server, /wallet private keys/);
    assert.match(server, /credential witnesses/);
    assert.match(server, /serialized transactions/);
  });
});
