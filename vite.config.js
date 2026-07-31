import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createContractReservation, normalizeNetwork } from './api/contract-address.js'
import { createActivityReference } from './api/activity-reference.js'
import { readFile } from 'node:fs/promises'

function bufferPolyfill() {
  return {
    name: 'aura-buffer-polyfill',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'buffer' || id === 'node:buffer') {
        return 'virtual:buffer-polyfill'
      }
    },
    load(id) {
      if (id === 'virtual:buffer-polyfill') {
        return `
          export const Buffer = globalThis.Buffer || class Buffer {};
          export default { Buffer };
        `
      }
    }
  }
}

function wasmPlugin() {
  return {
    name: 'aura-wasm-plugin',
    enforce: 'pre',
    async load(id) {
      if (id.endsWith('.wasm')) {
        const buffer = await readFile(id)
        const base64 = buffer.toString('base64')
        const bgPath = id.replace(/\.wasm$/, '.js')
        return `
          import * as bg from ${JSON.stringify(bgPath)};
          const bytes = Uint8Array.from(atob("${base64}"), c => c.charCodeAt(0));
          const syncModule = new WebAssembly.Module(bytes);
          const syncInstance = new WebAssembly.Instance(syncModule, {
            './midnight_onchain_runtime_wasm_bg.js': bg,
            './midnight_ledger_wasm_bg.js': bg,
          });
          const exports = syncInstance.exports;
          export default exports;
          export const __wbindgen_start = exports.__wbindgen_start || (() => {});
          export const memory = exports.memory;
          export const __wbindgen_export_0 = exports.__wbindgen_export_0;
          export const __wbindgen_export_1 = exports.__wbindgen_export_1;
          export const __wbindgen_export_2 = exports.__wbindgen_export_2;
          export const __wbindgen_export_3 = exports.__wbindgen_export_3;
          export const __wbindgen_export_4 = exports.__wbindgen_export_4;
          export const __wbindgen_export_5 = exports.__wbindgen_export_5;
          export const __externref_table_alloc = exports.__externref_table_alloc;
          export const __wbindgen_exn_store = exports.__wbindgen_exn_store;
        `
      }
    }
  }
}

function contractAddressApi() {
  return {
    name: 'aura-local-contract-address-api',
    configureServer(server) {
      server.middlewares.use('/api/contract-address', (request, response) => {
        if (request.method !== 'GET') {
          response.statusCode = 405
          response.setHeader('Allow', 'GET')
          response.end(JSON.stringify({ error: 'Method not allowed.' }))
          return
        }

        const url = new URL(request.url || '/', 'http://localhost')
        const network = normalizeNetwork(url.searchParams.get('network'))
        if (!network) {
          response.statusCode = 400
          response.end(JSON.stringify({ error: 'Unsupported Midnight network.' }))
          return
        }

        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store, max-age=0')
        response.end(JSON.stringify(createContractReservation(network)))
      })
    }
  }
}

function activityReferenceApi() {
  return {
    name: 'aura-local-activity-reference-api',
    configureServer(server) {
      server.middlewares.use('/api/activity-reference', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405
          response.setHeader('Allow', 'POST')
          response.end(JSON.stringify({ error: 'Method not allowed.' }))
          return
        }

        let raw = ''
        request.on('data', (chunk) => { raw += chunk })
        request.on('end', () => {
          try {
            const body = raw ? JSON.parse(raw) : {}
            const activity = createActivityReference(body.network, body.action)
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.setHeader('Cache-Control', 'no-store, max-age=0')
            response.end(JSON.stringify(activity))
          } catch (error) {
            response.statusCode = 400
            response.end(JSON.stringify({ error: error.message || 'Invalid activity request.' }))
          }
        })
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [bufferPolyfill(), wasmPlugin(), react(), contractAddressApi(), activityReferenceApi()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
