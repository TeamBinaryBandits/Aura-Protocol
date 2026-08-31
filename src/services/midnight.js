/**
 * AURA's only Midnight transaction boundary.
 *
 * This module deliberately has no demo wallet, generated-looking identifier,
 * or local transaction fallback. 1AM proves, balances, signs, and submits;
 * this app only displays identifiers returned by Midnight.js/the indexer.
 */
import { ErrorCodes } from '@midnight-ntwrk/dapp-connector-api';

const env = import.meta.env ?? {};

export const ONE_AM_INSTALL_URL = 'https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp';
export const PREVIEW_FAUCET_URL = 'https://faucet.preview.midnight.network';
export const MIN_DUST_BUFFER = Number(env.VITE_MIDNIGHT_DUST_BUFFER || 30);
export const ESTIMATED_TRANSACTION_DUST = 12;

export const NETWORKS = {
  PREVIEW: {
    id: 'preview', name: 'Midnight Preview', walletNetworkId: 'preview', contractNetworkId: 1,
    faucetUrl: PREVIEW_FAUCET_URL,
    tokenGuideUrl: 'https://docs.midnight.network/guides/acquire-tokens',
    indexerUri: env.VITE_MIDNIGHT_PREVIEW_INDEXER_URI || null,
    indexerWsUri: env.VITE_MIDNIGHT_PREVIEW_INDEXER_WS_URI || null,
  },
  PREPROD: {
    id: 'preprod', name: 'Midnight Preprod', walletNetworkId: 'preprod', contractNetworkId: 2,
    faucetUrl: null,
    tokenGuideUrl: 'https://docs.midnight.network/guides/acquire-tokens',
    indexerUri: env.VITE_MIDNIGHT_PREPROD_INDEXER_URI || null,
    indexerWsUri: env.VITE_MIDNIGHT_PREPROD_INDEXER_WS_URI || null,
  },
};

/**
 * FetchZkConfigProvider requires an absolute HTTP(S) URL. Vercel preview and
 * production domains vary per deployment, so derive it from the browser that
 * is actually submitting the transaction instead of hard-coding a hostname.
 */
export function getZkArtifactsUrl() {
  const origin = globalThis.location?.origin;
  if (!origin || origin === 'null') {
    throw new Error('Unable to resolve this deployment origin for Midnight proof artifacts. Open AURA over HTTPS and try again.');
  }
  const basePath = String(env.BASE_URL || '/');
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return new URL(`${normalizedBasePath}anonymous_survey/`, origin).toString();
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const toHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const asText = (value) => (typeof value === 'string' ? value : value?.toString?.() || '');

const fromHex = (value) => {
  const hex = String(value || '').replace(/^0x/, '');
  if (!hex || hex.length % 2 || !/^[a-fA-F0-9]+$/.test(hex)) {
    throw new Error('1AM returned a transaction in an unsupported encoding. Update 1AM and try again.');
  }
  return Uint8Array.from(hex.match(/.{1,2}/g), (part) => Number.parseInt(part, 16));
};

function readFirstValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

/** A cryptographic, stable 32-byte title commitment for the public ledger. */
export async function hashTitleToBytes32(title) {
  const normalized = String(title || '').trim();
  if (!normalized) throw new Error('A survey title is required.');
  if (!globalThis.crypto?.subtle) throw new Error('This browser cannot create the required SHA-256 title commitment.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return new Uint8Array(digest);
}

function unavailableEligibilityWitness() {
  throw new Error('No issuer-backed eligibility credential is configured. AURA will not invent a private score or submit a ballot.');
}

/** Compiler-generated binding plus its browser-served proof artifacts. */
async function makeSurveyCompiledContract(eligibilityWitness = unavailableEligibilityWitness) {
  const [{ CompiledContract }, { Contract }] = await Promise.all([
    import('@midnight-ntwrk/compact-js'),
    import('../../managed/anonymous_survey/contract/index.js'),
  ]);
  const zkArtifactsUrl = getZkArtifactsUrl();
  return CompiledContract.make('anonymous_survey', Contract).pipe(
    CompiledContract.withWitnesses({
      eligibility_score: (context) => [context.currentPrivateState, eligibilityWitness()],
    }),
    CompiledContract.withCompiledFileAssets(zkArtifactsUrl),
  );
}

/**
 * The contract carries no app private state. This retains maintenance data in
 * the active browser session only; it never sends a key or witness to AURA.
 */
function createSessionPrivateStateProvider() {
  let contractAddress = '';
  const states = new Map();
  const signingKeys = new Map();
  const scopedKey = (key) => `${contractAddress}:${asText(key)}`;
  return {
    setContractAddress(address) { contractAddress = asText(address); },
    async set(privateStateId, state) { states.set(scopedKey(privateStateId), state); },
    async get(privateStateId) { return states.get(scopedKey(privateStateId)) ?? null; },
    async remove(privateStateId) { states.delete(scopedKey(privateStateId)); },
    async clear() { states.clear(); },
    async setSigningKey(address, key) { signingKeys.set(asText(address), key); },
    async getSigningKey(address) { return signingKeys.get(asText(address)) ?? null; },
    async removeSigningKey(address) { signingKeys.delete(asText(address)); },
    async clearSigningKeys() { signingKeys.clear(); },
    async exportPrivateStates() { return { version: 1, states: [] }; },
    async importPrivateStates() { return { imported: 0, skipped: 0 }; },
    async exportSigningKeys() { return { version: 1, keys: [] }; },
    async importSigningKeys() { return { imported: 0, skipped: 0 }; },
  };
}

async function createLiveProviders(walletApi, configuration) {
  const [
    { Transaction, CostModel },
    { dappConnectorProofProvider },
    { FetchZkConfigProvider },
    { indexerPublicDataProvider },
  ] = await Promise.all([
    import('@midnight-ntwrk/ledger-v8'),
    import('@midnight-ntwrk/midnight-js-dapp-connector-proof-provider'),
    import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
    import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
  ]);
  const indexerUri = configuration?.indexerUri;
  const indexerWsUri = configuration?.indexerWsUri;
  if (!indexerUri || !indexerWsUri) {
    throw new Error('1AM did not provide its Midnight indexer URLs. Unlock/update the wallet and reconnect.');
  }

  const shieldedAddresses = await walletApi.getShieldedAddresses();
  const coinPublicKey = shieldedAddresses?.shieldedCoinPublicKey;
  const encryptionPublicKey = shieldedAddresses?.shieldedEncryptionPublicKey;
  if (!coinPublicKey || !encryptionPublicKey) {
    throw new Error('1AM did not return the shielded keys required to prepare a Midnight contract transaction.');
  }

  const zkConfigProvider = new FetchZkConfigProvider(getZkArtifactsUrl());
  const proofProvider = await dappConnectorProofProvider(walletApi, zkConfigProvider, CostModel.initialCostModel());

  return {
    privateStateProvider: createSessionPrivateStateProvider(),
    publicDataProvider: indexerPublicDataProvider(indexerUri, indexerWsUri),
    zkConfigProvider,
    proofProvider,
    walletProvider: {
      getCoinPublicKey: () => coinPublicKey,
      getEncryptionPublicKey: () => encryptionPublicKey,
      balanceTx: async (transaction) => {
        const { tx } = await walletApi.balanceUnsealedTransaction(toHex(transaction.serialize()));
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(tx));
      },
    },
    midnightProvider: {
      submitTx: async (transaction) => {
        await walletApi.submitTransaction(toHex(transaction.serialize()));
        const [transactionId] = transaction.identifiers();
        if (!transactionId) throw new Error('1AM submitted the transaction but Midnight.js could not derive its transaction identifier.');
        return transactionId;
      },
    },
  };
}

function getInjected1AM() {
  if (typeof window === 'undefined' || !window.midnight) return null;
  const injected = window.midnight;
  const candidates = [injected['1am'], injected['1AM'], injected.mn1am, injected.wallets?.['1am'], injected.wallets?.['1AM'], ...Object.values(injected)];
  return candidates.find((candidate) => candidate && typeof candidate.connect === 'function'
    && /1am/i.test(`${candidate.rdns || ''} ${candidate.name || ''} ${candidate.id || ''}`))
    || candidates.find((candidate) => candidate && typeof candidate.connect === 'function')
    || null;
}

async function waitFor1AM(timeoutMs = 10_000) {
  const startedAt = Date.now();
  let connector = getInjected1AM();
  while (!connector && Date.now() - startedAt < timeoutMs) {
    await wait(250);
    connector = getInjected1AM();
  }
  return connector;
}

export function getConfiguredIndexer(networkKey) {
  const network = NETWORKS[String(networkKey || '').toUpperCase()];
  return network?.indexerUri && network?.indexerWsUri
    ? { indexerUri: network.indexerUri, indexerWsUri: network.indexerWsUri }
    : null;
}

class MidnightService {
  constructor() {
    this.currentNetwork = NETWORKS.PREVIEW;
    this.isConnected = false;
    this.walletAddress = null;
    this.dustBalance = null;
    this.nightBalance = null;
    this.walletApi = null;
    this.walletConfiguration = null;
    this.transactions = [];
    this.lastError = null;
    this.listeners = [];
  }

  snapshot() {
    return {
      isConnected: this.isConnected, walletAddress: this.walletAddress, network: this.currentNetwork,
      dustBalance: this.dustBalance, nightBalance: this.nightBalance,
      walletType: this.isConnected ? '1am' : null, transactions: this.transactions,
      dustBuffer: MIN_DUST_BUFFER, lastError: this.lastError,
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.snapshot());
    return () => { this.listeners = this.listeners.filter((candidate) => candidate !== listener); };
  }

  notify() { this.listeners.forEach((listener) => listener(this.snapshot())); }

  setNetwork(networkKey) {
    const network = NETWORKS[String(networkKey || '').toUpperCase()];
    if (!network) return false;
    this.currentNetwork = network;
    void import('@midnight-ntwrk/midnight-js-network-id').then(({ setNetworkId }) => setNetworkId(network.walletNetworkId)).catch(() => {});
    this.notify();
    return true;
  }

  async connectWallet() {
    this.lastError = null;
    this.notify();
    try {
      const connector = await waitFor1AM();
      if (!connector) throw new Error('1AM was not detected. Install and unlock 1AM, then refresh and try again.');
      try {
        const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
        setNetworkId(this.currentNetwork.walletNetworkId);
      } catch { /* the wallet validates the network */ }
      const api = await connector.connect(this.currentNetwork.walletNetworkId);
      await api.hintUsage?.(['getConnectionStatus', 'getConfiguration', 'getUnshieldedAddress', 'getShieldedAddresses', 'getDustBalance', 'getUnshieldedBalances', 'balanceUnsealedTransaction', 'submitTransaction', 'getProvingProvider']);

      const [status, configuration, unshieldedAddress, dust, unshieldedBalances] = await Promise.all([
        api.getConnectionStatus(), api.getConfiguration(), api.getUnshieldedAddress(), api.getDustBalance(), api.getUnshieldedBalances(),
      ]);
      const reportedNetwork = configuration?.networkId || status?.networkId;
      if (reportedNetwork && String(reportedNetwork).toLowerCase() !== this.currentNetwork.walletNetworkId) {
        throw new Error(`1AM is connected to ${reportedNetwork}; switch it to ${this.currentNetwork.name} and try again.`);
      }
      const address = readFirstValue(unshieldedAddress, ['unshieldedAddress', 'address']);
      if (!address) throw new Error('1AM connected but did not expose an unshielded address. Approve address access in the wallet and reconnect.');

      this.walletApi = api;
      this.walletConfiguration = configuration;
      this.walletAddress = address;
      this.dustBalance = numberOrNull(readFirstValue(dust, ['balance', 'dust', 'dustBalance']));
      this.nightBalance = Object.values(unshieldedBalances || {}).map(numberOrNull).filter((value) => value !== null).reduce((total, value) => total + value, 0) || null;
      this.isConnected = true;
      this.notify();
      return { success: true, address };
    } catch (error) {
      this.disconnectWallet();
      const code = error?.code;
      const message = code === ErrorCodes.Rejected || code === ErrorCodes.PermissionRejected
        ? 'The 1AM connection request was rejected.'
        : code === ErrorCodes.Disconnected ? '1AM disconnected. Open the wallet and reconnect.' : error?.message || 'Unable to connect 1AM.';
      this.lastError = message;
      this.notify();
      return { success: false, error: message };
    }
  }

  disconnectWallet() {
    this.isConnected = false;
    this.walletAddress = null;
    this.dustBalance = null;
    this.nightBalance = null;
    this.walletApi = null;
    this.walletConfiguration = null;
    this.notify();
  }

  assertDustBuffer() {
    if (this.dustBalance === null) return;
    const required = ESTIMATED_TRANSACTION_DUST + MIN_DUST_BUFFER;
    if (this.dustBalance < required) throw new Error(`Insufficient DUST buffer. Keep at least ${required} DUST available (${ESTIMATED_TRANSACTION_DUST} estimated + ${MIN_DUST_BUFFER} safety buffer).`);
  }

  async ensureConnected() {
    if (this.isConnected && this.walletApi && this.walletConfiguration) return;
    const connection = await this.connectWallet();
    if (!connection.success) throw new Error(connection.error);
  }

  async deploySurvey({ title, threshold, onProgress }) {
    await this.ensureConnected();
    this.assertDustBuffer();
    const titleHash = await hashTitleToBytes32(title);
    const providers = await createLiveProviders(this.walletApi, this.walletConfiguration);
    const [{ deployContract }, compiledContract] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-contracts'),
      makeSurveyCompiledContract(),
    ]);
    onProgress?.({ step: 'PROVING_DEPLOYMENT', text: '1AM is generating the deployment proof…' });
    const deployed = await deployContract(providers, { compiledContract });
    const deployment = deployed.deployTxData.public;
    onProgress?.({ step: 'INITIALIZING_SURVEY', text: '1AM is initializing the on-chain survey…' });
    const initialization = await deployed.callTx.initialize_survey(titleHash, BigInt(this.currentNetwork.contractNetworkId), BigInt(threshold));

    const result = {
      network: this.currentNetwork.id, contractAddress: asText(deployment.contractAddress),
      deploymentTxId: asText(deployment.txId), deploymentTxHash: asText(deployment.txHash),
      initializationTxId: asText(initialization.txId), initializationTxHash: asText(initialization.txHash),
      blockHeight: initialization.blockHeight ?? deployment.blockHeight ?? null,
      blockTimestamp: initialization.blockTimestamp ?? deployment.blockTimestamp ?? null, status: 'FINALIZED',
    };
    if (!result.contractAddress || !result.deploymentTxId || !result.deploymentTxHash) throw new Error('Midnight did not return finalized deployment identifiers; nothing was recorded as a live contract.');
    this.transactions.unshift({ type: 'deploy_and_initialize_survey', ...result });
    this.notify();
    return result;
  }

  /** Loads public state from a 1AM-selected or explicitly configured indexer. */
  async getSurveyState(contractAddress, networkKey = this.currentNetwork.id) {
    const configuration = this.isConnected ? this.walletConfiguration : getConfiguredIndexer(networkKey);
    if (!configuration?.indexerUri || !configuration?.indexerWsUri) throw new Error('Connect 1AM to use its indexer, or configure both public VITE_MIDNIGHT_*_INDEXER_URI values.');
    const [{ indexerPublicDataProvider }, { ledger }] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
      import('../../managed/anonymous_survey/contract/index.js'),
    ]);
    const provider = indexerPublicDataProvider(configuration.indexerUri, configuration.indexerWsUri);
    const state = await provider.queryContractState(contractAddress);
    if (!state) throw new Error('The configured indexer has no state for this contract address yet.');
    return ledger(state);
  }

  /** AURA accepts issuer-backed witnesses only; it never makes a score up. */
  async submitEligibilityGatedVote({ contractAddress, selectedOption, credential }) {
    if (!credential || typeof credential.getEligibilityScore !== 'function') throw new Error('No issuer-backed eligibility credential is available. AURA will not fabricate one; configure a credential issuer before enabling voting.');
    await this.ensureConnected();
    this.assertDustBuffer();
    const providers = await createLiveProviders(this.walletApi, this.walletConfiguration);
    const [{ findDeployedContract }, compiledContract] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-contracts'),
      makeSurveyCompiledContract(credential.getEligibilityScore),
    ]);
    const found = await findDeployedContract(providers, { compiledContract, contractAddress });
    const transaction = await found.callTx.cast_anonymous_vote(BigInt(selectedOption));
    const result = {
      network: this.currentNetwork.id, contractAddress, txId: asText(transaction.txId), txHash: asText(transaction.txHash),
      blockHeight: transaction.blockHeight ?? null, blockTimestamp: transaction.blockTimestamp ?? null, status: 'FINALIZED',
    };
    this.transactions.unshift({ type: 'cast_anonymous_vote', ...result });
    this.notify();
    return result;
  }
}

export const midnightService = new MidnightService();
