/**
 * Midnight network configuration and 1AM connector boundary.
 *
 * No private key, witness value, or contract identifier is generated in the
 * browser. Contract reservations are created by /api/contract-address and a
 * live submission must be completed by a generated Midnight client binding.
 */

const env = import.meta.env ?? {};

export const ONE_AM_INSTALL_URL = 'https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp';
export const PREVIEW_FAUCET_URL = 'https://faucet.preview.midnight.network';
export const MIN_DUST_BUFFER = Number(env.VITE_MIDNIGHT_DUST_BUFFER || 30);
export const ESTIMATED_TRANSACTION_DUST = 12;
export const DEMO_MODE = env.VITE_AURA_DEMO_MODE === 'true' || (env.DEV && env.VITE_AURA_DEMO_MODE !== 'false');

export const NETWORKS = {
  PREVIEW: {
    id: 'preview',
    name: 'Midnight Preview',
    networkId: 1,
    faucetUrl: PREVIEW_FAUCET_URL,
    tokenGuideUrl: 'https://docs.midnight.network/guides/acquire-tokens',
    chainId: 'preview',
  },
  PREPROD: {
    id: 'preprod',
    name: 'Midnight Preprod',
    networkId: 2,
    faucetUrl: null,
    tokenGuideUrl: 'https://docs.midnight.network/guides/acquire-tokens',
    chainId: 'preprod',
  },
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function readFirstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

/**
 * 1AM injects asynchronously. The connector shape is intentionally isolated
 * here so an SDK binding can replace it without changing UI components.
 */
export function getInjected1AM() {
  if (typeof window === 'undefined') return null;
  const midnight = window.midnight;
  const candidates = [
    midnight?.['1am'],
    midnight?.['1AM'],
    midnight?.mn1am,
    midnight?.wallets?.['1am'],
    midnight?.wallets?.['1AM'],
    window['1am'],
    midnight,
  ];
  return candidates.find((candidate) => (
    candidate && (typeof candidate.enable === 'function' || typeof candidate.connect === 'function')
  )) || null;
}

async function waitFor1AM(timeoutMs = 10000) {
  const startedAt = Date.now();
  let connector = getInjected1AM();

  while (!connector && Date.now() - startedAt < timeoutMs) {
    await wait(250);
    connector = getInjected1AM();
  }

  return connector;
}

export async function reserveContractAddress(network) {
  const response = await fetch(`/api/contract-address?network=${encodeURIComponent(network)}`, {
    headers: { Accept: 'application/json' },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'The deployment service could not reserve a contract address.');
  }

  return payload;
}

async function createDemoActivityReference(network, action) {
  const response = await fetch('/api/activity-reference', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ network, action }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The activity service could not record this demo.');
  return payload;
}

async function connectProvider(connector) {
  const connection = typeof connector.enable === 'function'
    ? await connector.enable()
    : await connector.connect();
  const api = connection || connector;
  const state = typeof api?.state === 'function'
    ? await api.state()
    : (typeof api?.getState === 'function' ? await api.getState() : {});
  const configuration = typeof api?.getConfiguration === 'function'
    ? await api.getConfiguration()
    : (typeof api?.configuration === 'function' ? await api.configuration() : {});
  return { api, state: state || {}, configuration: configuration || {} };
}

class MidnightService {
  constructor() {
    this.currentNetwork = NETWORKS.PREVIEW;
    this.isConnected = false;
    this.walletAddress = null;
    this.dustBalance = null;
    this.nightBalance = null;
    this.walletType = null;
    this.walletApi = null;
    this.listeners = [];
    this.userTransactions = [];
    this.userCredentials = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.snapshot());
    return () => {
      this.listeners = this.listeners.filter((candidate) => candidate !== listener);
    };
  }

  snapshot() {
    return {
      isConnected: this.isConnected,
      walletAddress: this.walletAddress,
      network: this.currentNetwork,
      dustBalance: this.dustBalance,
      nightBalance: this.nightBalance,
      walletType: this.walletType,
      transactions: this.userTransactions,
      credentials: this.userCredentials,
      dustBuffer: MIN_DUST_BUFFER,
      demoMode: DEMO_MODE,
    };
  }

  notify() {
    const nextState = this.snapshot();
    this.listeners.forEach((listener) => listener(nextState));
  }

  setNetwork(networkKey) {
    const network = NETWORKS[networkKey.toUpperCase()];
    if (!network) return false;
    this.currentNetwork = network;
    this.notify();
    return true;
  }

  async connectWallet() {
    try {
      const connector = await waitFor1AM();
      if (!connector) throw new Error('1AM was not detected after 10 seconds. Install and unlock 1AM, then refresh this page and try again.');

      const { api, state, configuration } = await connectProvider(connector);
      const reportedNetwork = readFirstValue(state, ['network', 'networkId', 'chainId'])
        || readFirstValue(configuration, ['network', 'networkId', 'chainId']);
      if (reportedNetwork && !String(reportedNetwork).toLowerCase().includes(this.currentNetwork.id)
        && String(reportedNetwork) !== String(this.currentNetwork.networkId)) {
        throw new Error(`1AM is connected to ${reportedNetwork}. Switch it to Midnight ${this.currentNetwork.name.replace('Midnight ', '')} and try again.`);
      }

      this.walletApi = api;
      this.walletAddress = readFirstValue(state, ['address', 'unshieldedAddress', 'walletAddress', 'accountAddress'])
        || readFirstValue(configuration, ['address', 'unshieldedAddress', 'walletAddress', 'accountAddress'])
        || '1AM connected (account not exposed by connector)';
      this.dustBalance = Number(readFirstValue(state, ['dust', 'dustBalance', 'tDUST'])) || null;
      this.nightBalance = Number(readFirstValue(state, ['night', 'tNIGHT', 'nightBalance'])) || null;
      this.walletType = '1am';
      this.isConnected = true;

      this.notify();
      return { success: true, address: this.walletAddress, walletType: this.walletType };
    } catch (error) {
      this.disconnectWallet();
      return { success: false, error: error.message || 'Unable to connect 1AM Wallet.' };
    }
  }

  connectDemoWallet() {
    if (!DEMO_MODE) return { success: false, error: 'Local demo mode is disabled.' };
    this.walletApi = null;
    this.walletAddress = 'Local demo wallet';
    this.dustBalance = 250;
    this.nightBalance = 0;
    this.walletType = 'demo';
    this.isConnected = true;
    this.notify();
    return { success: true, address: this.walletAddress, walletType: this.walletType };
  }

  disconnectWallet() {
    this.isConnected = false;
    this.walletAddress = null;
    this.dustBalance = null;
    this.nightBalance = null;
    this.walletType = null;
    this.walletApi = null;
    this.notify();
  }

  assertDustBuffer() {
    if (typeof this.dustBalance !== 'number') return;
    const required = ESTIMATED_TRANSACTION_DUST + MIN_DUST_BUFFER;
    if (this.dustBalance < required) {
      throw new Error(`Insufficient DUST buffer. Keep at least ${required} DUST available (${ESTIMATED_TRANSACTION_DUST} estimated + ${MIN_DUST_BUFFER} buffer).`);
    }
  }

  async submitZKTransaction(circuitName, publicInputs, privateWitness, onProofProgress) {
    if (!this.isConnected) {
      const connection = await this.connectWallet();
      if (!connection.success) throw new Error(connection.error);
    }

    this.assertDustBuffer();

    if (this.walletType !== 'demo') {
      throw new Error('1AM is connected, but this app has no generated Midnight transaction binding yet. Compile the included Compact contract and wire its generated client before submitting a live transaction.');
    }

    onProofProgress?.({ step: 'WITNESS_EVALUATION', progress: 30, text: 'Preparing an isolated demo witness…' });
    await wait(300);
    onProofProgress?.({ step: 'PROOF_GENERATION', progress: 70, text: `Simulating ${circuitName} proof generation…` });
    await wait(450);
    onProofProgress?.({ step: 'BROADCAST', progress: 100, text: 'Recorded in local demo activity.' });

    const deploymentReference = publicInputs?.deploymentReference;
    if (!deploymentReference) throw new Error('A server-issued deployment reservation is required.');
    const activity = await createDemoActivityReference(this.currentNetwork.id, circuitName);

    const transaction = {
      id: activity.activityReference,
      type: circuitName === 'initialize_survey' ? 'CONTRACT_RESERVATION' : 'DEMO_VOTE',
      deploymentReference,
      activityReference: activity.activityReference,
      network: this.currentNetwork.id,
      title: publicInputs?.title || 'AURA demo interaction',
      timestamp: new Date().toLocaleString(),
      status: 'DEMO',
    };

    this.userTransactions.unshift(transaction);
    this.dustBalance = Math.max(0, (this.dustBalance || 0) - ESTIMATED_TRANSACTION_DUST);
    this.notify();

    return {
      success: true,
      ...transaction,
      reservationId: publicInputs.reservationId,
      addressStatus: publicInputs.addressStatus || 'RESERVED',
    };
  }
}

export const midnightService = new MidnightService();
