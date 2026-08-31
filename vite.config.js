import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';

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
      const fsWrapperPath = id.replace(/_bg\.wasm$/, '_fs.js');
      const fsWrapper = await readFile(fsWrapperPath, 'utf8');
      const snippetEntries = [...fsWrapper.matchAll(/import \* as ([\w$]+) from '([^']*\/snippets\/[^']+\.js)';/g)]
        .map(([, binding, specifier]) => ({
          binding,
          specifier,
          absolutePath: resolve(dirname(fsWrapperPath), specifier),
        }));
      const snippetImports = snippetEntries
        .map(({ binding, absolutePath }) => `import * as ${binding} from ${JSON.stringify(absolutePath)};`)
        .join('\n');
      const importMapEntries = [
        `${JSON.stringify(`./${basename(bgPath)}`)}: bg`,
        ...snippetEntries.map(({ binding, specifier }) => `${JSON.stringify(specifier)}: ${binding}`),
      ].join(',\n');
      return `
        import * as bg from ${JSON.stringify(bgPath)};
        ${snippetImports}
        const bytes = Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0));
        // The Midnight Ledger WASM binary is >8 MB. Chromium rejects a
        // synchronous WebAssembly.Module constructor for binaries that large
        // on the UI thread. Its async instantiate API compiles without
        // blocking the app and preserves the module namespace expected by the
        // Ledger package.
        const { instance } = await WebAssembly.instantiate(bytes, {
          ${importMapEntries}
        });
        export default instance.exports;
        export const __wbindgen_start = instance.exports.__wbindgen_start || (() => {});
        export const memory = instance.exports.memory;
      `;
    },
    transform(code, id) {
      // The generated Ledger entry point imports the WASM module as a namespace
      // and then hands that namespace to wasm-bindgen. Our async module exposes
      // the raw instance through its default export, which contains every WASM
      // binding instead of only the statically declared ESM exports.
      if (!id.endsWith('_wasm.js') || !code.includes('__wbg_set_wasm(wasm)')) return null;
      return {
        code: code.replace(
          /import \* as wasm from ("[^\"]+_bg\.wasm");/,
          'import wasm from $1;',
        ),
        map: null,
      };
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
