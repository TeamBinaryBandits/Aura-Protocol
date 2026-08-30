import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';

function bufferPolyfill() {
  return {
    name: 'aura-buffer-polyfill',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'buffer' || id === 'node:buffer') return 'virtual:buffer-polyfill';
      return null;
    },
    load(id) {
      if (id !== 'virtual:buffer-polyfill') return null;
      return 'export const Buffer = globalThis.Buffer || class Buffer {}; export default { Buffer };';
    },
  };
}

function wasmPlugin() {
  return {
    name: 'aura-wasm-plugin',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('.wasm')) return null;
      const binary = await readFile(id);
      const base64 = binary.toString('base64');
      const bgPath = id.replace(/\.wasm$/, '.js');
      return `
        import * as bg from ${JSON.stringify(bgPath)};
        const bytes = Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0));
        const module = new WebAssembly.Module(bytes);
        const instance = new WebAssembly.Instance(module, {
          './midnight_onchain_runtime_wasm_bg.js': bg,
          './midnight_ledger_wasm_bg.js': bg,
        });
        export default instance.exports;
        export const __wbindgen_start = instance.exports.__wbindgen_start || (() => {});
        export const memory = instance.exports.memory;
      `;
    },
  };
}

// The indexer provider accepts a WebSocket implementation. Its browser export
// is a default-only module, while the provider reads a named `WebSocket`.
// Bind that name to the browser-native API instead of shipping a Node shim.
function webSocketShim() {
  return {
    name: 'aura-websocket-shim',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'isomorphic-ws' || id === 'isomorphic-ws/browser.js') return 'virtual:aura-websocket';
      return null;
    },
    load(id) {
      if (id !== 'virtual:aura-websocket') return null;
      return 'export const WebSocket = globalThis.WebSocket; export default WebSocket;';
    },
  };
}

// `managed/anonymous_survey` is compiler output. Vite copies its keys and
// binary ZKIR unchanged, making FetchZkConfigProvider work locally and Vercel
// without a private proof server or filesystem access.
export default defineConfig({
  publicDir: 'managed',
  plugins: [bufferPolyfill(), webSocketShim(), wasmPlugin(), react()],
  resolve: {
    alias: {
      // @subsquid (used by Midnight's indexer provider) imports Node's
      // `assert`; this package is its browser-compatible implementation.
      assert: 'assert/build/assert.js',
    },
  },
  define: { 'process.env': {}, global: 'globalThis' },
  build: { target: 'esnext' },
  optimizeDeps: { esbuildOptions: { target: 'esnext' } },
  server: { port: 3000, host: true },
});
