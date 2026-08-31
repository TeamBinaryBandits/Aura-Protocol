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
    assert.match(service, /getZkArtifactsUrl/);
    assert.match(service, /new FetchZkConfigProvider\(getZkArtifactsUrl\(\)\)/);
    assert.doesNotMatch(service, /new FetchZkConfigProvider\('\/anonymous_survey'\)/);
    assert.doesNotMatch(service, /connectDemoWallet|submitZKTransaction|activityReference|reserveContractAddress/);
  });

  it('shows wallet errors and a visible disconnect control', async () => {
    const [settings, navbar, main] = await Promise.all([
      readFile('src/pages/NetworkSettings.jsx', 'utf8'),
      readFile('src/components/Navbar.jsx', 'utf8'),
      readFile('src/main.jsx', 'utf8'),
    ]);
    assert.match(settings, /Disconnect/);
    assert.match(settings, /role="alert"/);
    assert.match(navbar, /connectionError/);
    assert.match(main, /import \{ Buffer \} from 'buffer'/);
    assert.match(main, /globalThis\.Buffer = Buffer/);
  });

  it('loads the large Midnight Ledger WASM module asynchronously', async () => {
    const viteConfig = await readFile('vite.config.js', 'utf8');
    assert.match(viteConfig, /await WebAssembly\.instantiate\(bytes/);
    assert.doesNotMatch(viteConfig, /new WebAssembly\.Module\(bytes\)/);
    assert.match(viteConfig, /fsWrapperPath/);
    assert.match(viteConfig, /snippetEntries/);
    assert.match(viteConfig, /import wasm from \$1/);
    assert.doesNotMatch(viteConfig, /virtual:buffer-polyfill/);
  });

  it('passes the complete WASM export object to wasm-bindgen', async () => {
    const { default: config } = await import('../vite.config.js');
    const plugin = config.plugins.find(({ name }) => name === 'aura-wasm-plugin');
    const transformed = plugin.transform(
      'import * as wasm from "./midnight_ledger_wasm_bg.wasm";\n__wbg_set_wasm(wasm);',
      'midnight_ledger_wasm.js',
    );
    assert.match(transformed.code, /import wasm from "\.\/midnight_ledger_wasm_bg\.wasm"/);
  });
});
