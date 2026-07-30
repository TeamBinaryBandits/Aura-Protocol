import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createContractReservation, normalizeNetwork } from './api/contract-address.js'
import { createActivityReference } from './api/activity-reference.js'

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
  plugins: [react(), contractAddressApi(), activityReferenceApi()],
  server: {
    port: 3000,
    host: true
  }
})
