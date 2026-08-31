import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('real wallet and browser surfaces', () => {
  it('ships a real 1AM prove-balance-submit path and no demo transaction path', async () => {
    const service = await readFile('src/services/midnight.js', 'utf8');
    assert.match(service, /dappConnectorProofProvider/);
    assert.match(service, /indexerPublicDataProvider/);
    assert.match(service, /balanceUnsealedTransaction/);
    assert.match(service, /submitTransaction/);
    assert.match(service, /deployContract\(providers/);
    assert.doesNotMatch(service, /connectDemoWallet|submitZKTransaction|activityReference|reserveContractAddress/);
  });

  it('shows wallet errors and a visible disconnect control', async () => {
    const [settings, navbar] = await Promise.all([
      readFile('src/pages/NetworkSettings.jsx', 'utf8'),
      readFile('src/components/Navbar.jsx', 'utf8'),
    ]);
    assert.match(settings, /Disconnect/);
    assert.match(settings, /role="alert"/);
    assert.match(navbar, /connectionError/);
  });

  it('loads the large Midnight Ledger WASM module asynchronously', async () => {
    const viteConfig = await readFile('vite.config.js', 'utf8');
    assert.match(viteConfig, /await WebAssembly\.instantiate\(bytes/);
    assert.doesNotMatch(viteConfig, /new WebAssembly\.Module\(bytes\)/);
  });
});
