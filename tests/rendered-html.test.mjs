import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('browser deployment surface', () => {
  it('ships an accessible app shell and a server-backed deployment path', async () => {
    const [html, app, service, settings] = await Promise.all([
      readFile('index.html', 'utf8'),
      readFile('src/App.jsx', 'utf8'),
      readFile('src/services/midnight.js', 'utf8'),
      readFile('src/pages/NetworkSettings.jsx', 'utf8'),
    ]);

    assert.match(html, /<html lang="en"/);
    assert.match(app, /<main[^>]*>/);
    assert.match(service, /\/api\/contract-address/);
    assert.doesNotMatch(service, /generateMidnightContractAddress/);
    assert.match(settings, /Open Preview tNIGHT faucet/);
  });
});
