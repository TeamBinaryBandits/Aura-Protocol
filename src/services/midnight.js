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

function shortRandomHex(bytes = 16) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('');
}

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
function getInjected1AM() {
  if (typeof window === 'undefined') return null;
  const midnight = window.midnight;
  if (!midnight) return null;

  return midnight['1am'] || midnight.mn1am || (typeof midnight.enable === 'function' ? midnight : null);
}

async function waitFor1AM(timeoutMs = 4000) {
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
      if (connector) {
        const api = await connector.enable();
        const state = typeof api?.state === 'function' ? await api.state() : {};
        const configuration = typeof api?.getConfiguration === 'function' ? await api.getConfiguration() : {};

        this.walletApi = api;
        this.walletAddress = readFirstValue(state, ['address', 'unshieldedAddress', 'walletAddress'])
          || readFirstValue(configuration, ['address', 'unshieldedAddress']);
        this.dustBalance = Number(readFirstValue(state, ['dust', 'dustBalance', 'tDUST'])) || null;
        this.nightBalance = Number(readFirstValue(state, ['night', 'tNIGHT', 'nightBalance'])) || null;
        this.walletType = '1am';
        this.isConnected = true;
      } else if (DEMO_MODE) {
        this.walletApi = null;
        this.walletAddress = `demo_${shortRandomHex(10)}`;
        this.dustBalance = 250;
        this.nightBalance = 0;
        this.walletType = 'demo';
        this.isConnected = true;
      } else {
        throw new Error('1AM was not detected. Install or unlock the extension, then try again.');
      }

      this.notify();
      return { success: true, address: this.walletAddress, walletType: this.walletType };
    } catch (error) {
      this.disconnectWallet();
      return { success: false, error: error.message || 'Unable to connect 1AM Wallet.' };
    }
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

    const contractAddress = publicInputs?.contractAddress;
    if (!contractAddress) throw new Error('A server-issued contract reservation is required.');

    const transaction = {
      id: `demo-${Date.now()}`,
      type: circuitName === 'initialize_survey' ? 'CONTRACT_RESERVATION' : 'DEMO_VOTE',
      contractAddress,
      txHash: `demo_tx_${shortRandomHex(20)}`,
      nullifier: `demo_nullifier_${shortRandomHex(16)}`,
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
