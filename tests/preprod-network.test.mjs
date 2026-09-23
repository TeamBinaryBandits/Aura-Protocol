import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFile } from 'node:fs/promises';

describe('Preprod network isolation', () => {
  it('ships official v4 Preprod endpoints and faucet defaults', async () => {
    const service = await readFile('src/services/midnight.js', 'utf8');
    assert.match(service, /https:\/\/indexer\.preprod\.midnight\.network\/api\/v4\/graphql/);
    assert.match(service, /wss:\/\/indexer\.preprod\.midnight\.network\/api\/v4\/graphql\/ws/);
    assert.match(service, /https:\/\/faucet\.preprod\.midnight\.network/);
    assert.match(service, /VITE_MIDNIGHT_DEFAULT_NETWORK \|\| 'preprod'/);
  });

  it('disconnects an existing wallet session before changing networks', async () => {
    const { midnightService } = await import('../src/services/midnight.js');
    midnightService.setNetwork('preview');
    midnightService.isConnected = true;
    midnightService.walletApi = { connected: true };
    midnightService.walletConfiguration = { networkId: 'preview' };
    midnightService.connectedNetworkId = 'preview';

    assert.equal(midnightService.setNetwork('preprod'), true);
    assert.equal(midnightService.snapshot().network.id, 'preprod');
    assert.equal(midnightService.snapshot().isConnected, false);
    assert.equal(midnightService.walletApi, null);
    assert.match(midnightService.snapshot().lastError, /Reconnect 1AM/);
  });

  it('inherits the selected network on the deployment form', async () => {
    const page = await readFile('src/pages/CreateSurvey.jsx', 'utf8');
    assert.match(page, /midnightService\.snapshot\(\)\.network\.id/);
    assert.match(page, /midnightService\.setNetwork\(item\)/);
  });
});
