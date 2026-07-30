import { randomBytes } from 'node:crypto';

export const SUPPORTED_NETWORKS = new Set(['preview', 'preprod']);

export function normalizeNetwork(network) {
  const value = String(network || '').toLowerCase();
  return SUPPORTED_NETWORKS.has(value) ? value : null;
}

/**
 * Creates an opaque deployment reservation. It is intentionally server-only so
 * browser code never invents identifiers that look like deployed contracts.
 * A real deployment must still be approved by the connected wallet and return
 * its canonical address from the Midnight network.
 */
export function createContractReservation(network) {
  const normalizedNetwork = normalizeNetwork(network);
  if (!normalizedNetwork) {
    throw new Error('Unsupported Midnight network.');
  }

  const entropy = randomBytes(24).toString('hex');
  const reservationId = randomBytes(12).toString('hex');

  return {
    contractAddress: `mn_contract_${normalizedNetwork}_${entropy}`,
    reservationId: `aura_${reservationId}`,
    network: normalizedNetwork,
    status: 'RESERVED',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

function sendJson(response, statusCode, body) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (typeof response.status === 'function') {
    return response.status(statusCode).json(body);
  }

  response.statusCode = statusCode;
  response.end(JSON.stringify(body));
  return undefined;
}

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const network = request.query?.network ?? requestUrl.searchParams.get('network');

  try {
    return sendJson(response, 200, createContractReservation(network));
  } catch (error) {
    return sendJson(response, 400, { error: error.message });
  }
}
