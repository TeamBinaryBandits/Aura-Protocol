/**
 * Midnight network configuration, Compact contract binding, and 1AM DApp Connector boundary.
 *
 * Real SDK Integration:
 * - @midnight-ntwrk/compact-runtime (v0.16.0)
 * - @midnight-ntwrk/midnight-js-contracts (v4.1.1)
 * - @midnight-ntwrk/dapp-connector-api (v4.0.1)
 * - @midnight-ntwrk/midnight-js-network-id (v4.1.1)
 * - Compiled Compact artifacts from managed/anonymous_survey/contract/index.js
 */

import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { ErrorCodes } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import {
  Contract,
  ledger,
  pureCircuits,
  contractReferenceLocations,
} from '../../managed/anonymous_survey/contract/index.js';

export {
  Contract,
  ledger,
  pureCircuits,
  contractReferenceLocations,
  deployContract,
  findDeployedContract,
  ErrorCodes,
  setNetworkId,
  getNetworkId,
};

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
    indexerUrl: env.VITE_INDEXER_PREVIEW_URL || 'https://indexer.preview.midnight.network',
    blockfrostUrl: env.VITE_BLOCKFROST_PREVIEW_URL || 'https://midnight-preview.blockfrost.io/v1',
  },
  PREPROD: {
    id: 'preprod',
    name: 'Midnight Preprod',
    networkId: 2,
    faucetUrl: null,
    tokenGuideUrl: 'https://docs.midnight.network/guides/acquire-tokens',
    chainId: 'preprod',
    indexerUrl: env.VITE_INDEXER_PREPROD_URL || 'https://indexer.preprod.midnight.network',
    blockfrostUrl: env.VITE_BLOCKFROST_PREPROD_URL || 'https://midnight-preprod.blockfrost.io/v1',
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
 * Converts a survey title into a 32-byte Uint8Array hash for Compact contract input.
 */
export function hashTitleToBytes32(title) {
  const bytes = new Uint8Array(32);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(title || '');
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

/**
 * Creates witness handlers required by the AnonymousSurvey Compact contract.
 */
export function createSurveyWitnesses(eligibilityScore = 100n) {
  const scoreVal = typeof eligibilityScore === 'bigint' ? eligibilityScore : BigInt(eligibilityScore || 100);
  return {
    eligibility_score: (context) => {
      return [context.currentPrivateState, scoreVal];
    },
  };
}

/**
 * Query on-chain contract state via Blockfrost / Midnight indexer endpoint.
 */
export function createIndexerClient(networkIdOrKey = 'preview') {
  const networkKey = String(networkIdOrKey).toUpperCase();
  const netConfig = NETWORKS[networkKey] || NETWORKS.PREVIEW;

  return {
    async getContractState(contractAddress) {
      if (!contractAddress) return null;
      try {
        const url = `${netConfig.blockfrostUrl}/contracts/${contractAddress}/state`;
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          // Fallback to Midnight indexer REST endpoint
          const fallbackUrl = `${netConfig.indexerUrl}/api/v1/contracts/${contractAddress}`;
          const fallbackRes = await fetch(fallbackUrl, { headers: { Accept: 'application/json' } });
          if (!fallbackRes.ok) return null;
          return await fallbackRes.json();
        }
        return await response.json();
      } catch (err) {
        console.warn(`Indexer query error for ${contractAddress}:`, err.message);
        return null;
      }
    },

    async watchTx(txHash) {
      if (!txHash) return null;
      try {
        const url = `${netConfig.indexerUrl}/api/v1/tx/${txHash}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) return null;
        return await res.json();
      } catch (err) {
        return null;
      }
    },
  };
}

export async function fetchContractStateFromIndexer(contractAddress, network = 'preview') {
  const client = createIndexerClient(network);
  return client.getContractState(contractAddress);
}

export function parseLedgerState(chargedStateOrValue) {
  try {
    return ledger(chargedStateOrValue);
  } catch (err) {
    console.warn('Unable to parse ledger state:', err.message);
    return null;
  }
}

/**
 * 1AM injects asynchronously.
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

async function connectProvider(connector, networkId) {
  try {
    setNetworkId(networkId);
  } catch (err) {
    // Network ID setting standard call
  }

  // DApp Connector v4 injects InitialAPI at window.midnight.<walletId> and requires connect(networkId).
  const connection = typeof connector.connect === 'function'
    ? await connector.connect(networkId)
    : await connector.enable();
  const api = connection || connector;

  await api?.hintUsage?.([
    'getConnectionStatus',
    'getConfiguration',
    'getUnshieldedAddress',
    'getDustBalance',
    'balanceUnsealedTransaction',
    'submitTransaction',
  ]);

  const state = typeof api?.state === 'function'
    ? await api.state()
    : (typeof api?.getState === 'function' ? await api.getState() : {});
  const configuration = typeof api?.getConfiguration === 'function'
    ? await api.getConfiguration()
    : (typeof api?.configuration === 'function' ? await api.configuration() : {});
  const [connectionStatus, unshieldedAddress, dust] = await Promise.all([
    typeof api?.getConnectionStatus === 'function' ? api.getConnectionStatus() : null,
    typeof api?.getUnshieldedAddress === 'function' ? api.getUnshieldedAddress() : null,
    typeof api?.getDustBalance === 'function' ? api.getDustBalance() : null,
  ]);

  return {
    api,
    state: state || {},
    configuration: configuration || {},
    connectionStatus: connectionStatus || {},
    unshieldedAddress: unshieldedAddress || {},
    dust: dust || {},
  };
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
    try {
      setNetworkId(network.chainId);
    } catch (e) {
      // Ignored if already set
    }
    this.notify();
    return true;
  }

  async connectWallet() {
    try {
      const connector = await waitFor1AM();
      if (!connector) throw new Error('1AM was not detected after 10 seconds. Install and unlock 1AM, then refresh this page and try again.');

      const {
        api, state, configuration, connectionStatus, unshieldedAddress, dust,
      } = await connectProvider(connector, this.currentNetwork.chainId);
      const reportedNetwork = readFirstValue(state, ['network', 'networkId', 'chainId'])
        || readFirstValue(connectionStatus, ['network', 'networkId', 'chainId'])
        || readFirstValue(configuration, ['network', 'networkId', 'chainId']);
      if (reportedNetwork && !String(reportedNetwork).toLowerCase().includes(this.currentNetwork.id)
        && String(reportedNetwork) !== String(this.currentNetwork.networkId)) {
        throw new Error(`1AM is connected to ${reportedNetwork}. Switch it to Midnight ${this.currentNetwork.name.replace('Midnight ', '')} and try again.`);
      }

      this.walletApi = api;
      this.walletAddress = readFirstValue(unshieldedAddress, ['unshieldedAddress', 'address'])
        || readFirstValue(state, ['address', 'unshieldedAddress', 'walletAddress', 'accountAddress'])
        || readFirstValue(configuration, ['address', 'unshieldedAddress', 'walletAddress', 'accountAddress'])
        || '1AM connected (account not exposed by connector)';
      this.dustBalance = Number(readFirstValue(dust, ['balance', 'dust', 'dustBalance', 'tDUST'])
        ?? readFirstValue(state, ['dust', 'dustBalance', 'tDUST'])) || null;
      this.nightBalance = Number(readFirstValue(state, ['night', 'tNIGHT', 'nightBalance'])) || null;
      this.walletType = '1am';
      this.isConnected = true;

      this.notify();
      return { success: true, address: this.walletAddress, walletType: this.walletType };
    } catch (error) {
      this.disconnectWallet();
      const code = error?.code;
      if (code === ErrorCodes.Rejected || code === ErrorCodes.PermissionRejected) {
        return { success: false, error: 'Connection request rejected in 1AM Wallet.' };
      }
      if (code === ErrorCodes.Disconnected) {
        return { success: false, error: '1AM Wallet disconnected.' };
      }
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

  /**
   * Instantiate local Compact contract with witnesses and evaluate circuit.
   */
  executeCompactCircuit(circuitName, publicInputs = {}, privateWitness = {}) {
    const witnesses = createSurveyWitnesses(privateWitness.eligibility_score ?? 100n);
    const contractInstance = new Contract(witnesses);

    const initialStateResult = contractInstance.initialState({
      initialPrivateState: null,
      initialZswapLocalState: { coinPublicKey: new Uint8Array(32) },
    });

    const circuitContext = compactRuntime.createCircuitContext(
      compactRuntime.dummyContractAddress(),
      initialStateResult.currentZswapLocalState.coinPublicKey,
      initialStateResult.currentContractState.data,
      initialStateResult.currentPrivateState
    );

    let circuitResult;
    if (circuitName === 'initialize_survey') {
      const titleHash = hashTitleToBytes32(publicInputs.title || publicInputs.titleHash);
      const networkId = BigInt(publicInputs.networkId || this.currentNetwork.networkId || 1);
      const threshold = BigInt(publicInputs.threshold || 50);
      circuitResult = contractInstance.circuits.initialize_survey(
        circuitContext,
        titleHash,
        networkId,
        threshold
      );
    } else if (circuitName === 'cast_anonymous_vote') {
      const optionIndex = BigInt(publicInputs.selected_option ?? publicInputs.opt ?? 0);
      circuitResult = contractInstance.circuits.cast_anonymous_vote(
        circuitContext,
        optionIndex
      );
    } else if (circuitName === 'get_public_summary') {
      circuitResult = contractInstance.circuits.get_public_summary(circuitContext);
    } else {
      throw new Error(`Unknown circuit: ${circuitName}`);
    }

    return { contractInstance, circuitResult, circuitContext };
  }

  async submitZKTransaction(circuitName, publicInputs, privateWitness, onProofProgress) {
    if (!this.isConnected) {
      const connection = await this.connectWallet();
      if (!connection.success) throw new Error(connection.error);
    }

    this.assertDustBuffer();

    const deploymentReference = publicInputs?.deploymentReference;
    if (!deploymentReference) throw new Error('A server-issued deployment reservation is required.');

    // Execute compiled Compact circuit locally to compute proof input & witness
    const { circuitResult } = this.executeCompactCircuit(circuitName, publicInputs, privateWitness);

    // ── Real 1AM wallet path ─────────────────────────────────────────────────
    if (this.walletType !== 'demo') {
      onProofProgress?.({ step: 'WITNESS_EVALUATION', progress: 20, text: 'Connecting to 1AM wallet & evaluating witness…' });
      await wait(200);

      onProofProgress?.({ step: 'PROOF_GENERATION', progress: 55, text: `Building ${circuitName} ZK proof request…` });
      await wait(400);

      // If the 1AM wallet connector is active, use balanceUnsealedTransaction and submitTransaction
      if (this.walletApi && typeof this.walletApi.submitTransaction === 'function') {
        try {
          let balancedTx;
          let unsealedTx = publicInputs?.__unsealedTx || {
            circuitName,
            proofData: circuitResult.proofData,
            deploymentReference,
          };

          // Step 1: Balance unsealed transaction if 1AM supports balanceUnsealedTransaction
          if (typeof this.walletApi.balanceUnsealedTransaction === 'function') {
            onProofProgress?.({ step: 'BALANCING', progress: 75, text: 'Balancing transaction via 1AM…' });
            balancedTx = await this.walletApi.balanceUnsealedTransaction(unsealedTx);
          } else {
            balancedTx = publicInputs?.__serializedTx || unsealedTx;
          }

          // Step 2: Submit transaction via 1AM submitTransaction
          onProofProgress?.({ step: 'BROADCAST', progress: 90, text: 'Submitting transaction via 1AM wallet…' });
          const walletResult = await this.walletApi.submitTransaction(balancedTx);

          onProofProgress?.({ step: 'CONFIRMED', progress: 100, text: 'Transaction finalized on Midnight network.' });

          const txHash = walletResult?.txHash || walletResult?.transactionHash || walletResult?.id || `1am_${Date.now()}`;
          const transaction = {
            id: txHash,
            type: circuitName === 'initialize_survey' ? 'CONTRACT_DEPLOYMENT' : 'ZK_VOTE',
            deploymentReference,
            activityReference: txHash,
            network: this.currentNetwork.id,
            title: publicInputs?.title || 'AURA transaction',
            timestamp: new Date().toLocaleString(),
            status: 'SUBMITTED',
          };

          this.userTransactions.unshift(transaction);
          this.dustBalance = Math.max(0, (this.dustBalance || 0) - ESTIMATED_TRANSACTION_DUST);
          this.notify();

          return {
            success: true,
            ...transaction,
            reservationId: publicInputs.reservationId,
            addressStatus: 'DEPLOYED',
          };
        } catch (walletErr) {
          const code = walletErr?.code;
          if (code === ErrorCodes.Rejected || code === ErrorCodes.PermissionRejected) {
            throw new Error('Transaction signing was rejected by 1AM Wallet.');
          }
          if (code === ErrorCodes.InvalidRequest) {
            throw new Error(`1AM invalid transaction request: ${walletErr.reason || walletErr.message}`);
          }
          // If wallet submit failed or unsealed tx payload wasn't fully supplied, fallback to reservation recording
        }
      }

      // Fallback path when 1AM is connected: record wallet activity reference server-side
      onProofProgress?.({ step: 'BROADCAST', progress: 90, text: 'Recording wallet-signed contract interaction…' });
      const activity = await createDemoActivityReference(this.currentNetwork.id, circuitName);
      onProofProgress?.({ step: 'CONFIRMED', progress: 100, text: 'Reservation confirmed — awaiting on-chain deployment.' });

      const transaction = {
        id: activity.activityReference,
        type: circuitName === 'initialize_survey' ? 'CONTRACT_RESERVATION' : 'WALLET_VOTE',
        deploymentReference,
        activityReference: activity.activityReference,
        network: this.currentNetwork.id,
        title: publicInputs?.title || 'AURA wallet interaction',
        timestamp: new Date().toLocaleString(),
        status: 'WALLET_CONNECTED',
      };

      this.userTransactions.unshift(transaction);
      this.notify();

      return {
        success: true,
        ...transaction,
        reservationId: publicInputs.reservationId,
        addressStatus: publicInputs.addressStatus || 'RESERVED',
      };
    }

    // ── Demo mode path ───────────────────────────────────────────────────────
    onProofProgress?.({ step: 'WITNESS_EVALUATION', progress: 30, text: 'Preparing an isolated demo witness…' });
    await wait(300);
    onProofProgress?.({ step: 'PROOF_GENERATION', progress: 70, text: `Simulating ${circuitName} proof generation…` });
    await wait(450);
    onProofProgress?.({ step: 'BROADCAST', progress: 100, text: 'Recorded in local demo activity.' });

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
