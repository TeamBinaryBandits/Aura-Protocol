import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Gauge, Globe, ShieldCheck, Wallet } from 'lucide-react';
import {
  ESTIMATED_TRANSACTION_DUST,
  DEMO_MODE,
  MIN_DUST_BUFFER,
  midnightService,
  NETWORKS,
  ONE_AM_INSTALL_URL,
} from '../services/midnight';

const networkCards = [NETWORKS.PREVIEW, NETWORKS.PREPROD];

export default function NetworkSettings() {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    walletAddress: null,
    network: NETWORKS.PREVIEW,
    dustBalance: null,
    nightBalance: null,
    walletType: null,
  });
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => midnightService.subscribe(setWalletState), []);

  const connect = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    const result = await midnightService.connectWallet();
    if (!result.success) setConnectionError(result.error);
    setIsConnecting(false);
  };

  const connectDemo = () => {
    setConnectionError(null);
    const result = midnightService.connectDemoWallet();
    if (!result.success) setConnectionError(result.error);
  };

  const formatBalance = (value, token) => (typeof value === 'number' ? `${value} ${token}` : 'Reported by wallet after connection');
  const bufferRequired = ESTIMATED_TRANSACTION_DUST + MIN_DUST_BUFFER;

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-mono">
          <Globe className="w-3.5 h-3.5" />
          Network & wallet readiness
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Configure Midnight safely</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Choose the network in AURA and in 1AM. The wallet remains the source of truth for the active network, account, DUST, and proof approval.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {networkCards.map((network) => {
          const active = walletState.network.id === network.id;
          const isPreview = network.id === 'preview';

          return (
            <article
              key={network.id}
              className={`text-left p-6 rounded-3xl border transition-all ${active
                ? 'bg-white border-emerald-500 shadow-md shadow-emerald-900/5'
                : 'bg-white/70 border-slate-200 hover:border-emerald-300'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isPreview ? 'bg-sky-500' : 'bg-violet-500'}`} />
                    <h2 className="font-bold text-slate-900">{network.name}</h2>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {isPreview
                      ? 'Use a Preview unshielded address at the faucet, then register received tNIGHT in 1AM to begin generating tDUST.'
                      : 'Use the current Midnight token guide for this environment; AURA does not ship an unverified faucet URL.'}
                  </p>
                </div>
                {active ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-label="Selected network" />
                ) : (
                  <button
                    type="button"
                    onClick={() => midnightService.setNetwork(network.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-xs font-semibold text-slate-700 hover:text-emerald-900"
                  >
                    Select
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {network.faucetUrl && (
                  <a
                    href={network.faucetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-semibold text-sky-900"
                  >
                    Open Preview tNIGHT faucet <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={network.tokenGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  Token guide <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <section className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6" aria-labelledby="wallet-heading">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-700" />
              <h2 id="wallet-heading" className="font-bold text-slate-900">1AM DApp Connector</h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              AURA waits for the 1AM injection instead of inventing a wallet account in production.
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono ${walletState.isConnected
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${walletState.isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {walletState.isConnected ? (walletState.walletType === 'demo' ? 'LOCAL DEMO' : 'CONNECTED') : 'NOT CONNECTED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-mono text-slate-500">Account</p>
            <p className="mt-1.5 font-semibold text-slate-900 break-all">{walletState.walletAddress || 'Connect 1AM to share an account'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-mono text-slate-500">Available DUST</p>
            <p className="mt-1.5 font-semibold text-slate-900">{formatBalance(walletState.dustBalance, 'DUST')}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="font-mono text-slate-500">NIGHT / tNIGHT</p>
            <p className="mt-1.5 font-semibold text-slate-900">{formatBalance(walletState.nightBalance, 'tNIGHT')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
          <Gauge className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            <strong>Transaction buffer: {MIN_DUST_BUFFER} DUST.</strong> AURA blocks its demo flow below {bufferRequired} DUST ({ESTIMATED_TRANSACTION_DUST} estimated transaction cost + buffer). Your wallet’s final fee and sponsorship decision always win.
          </p>
        </div>

        {connectionError && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {connectionError}
          </div>
        )}

        {!walletState.isConnected && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Looking for 1AM…' : 'Connect 1AM'}
            </button>
            <a href={ONE_AM_INSTALL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold">
              Install 1AM <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {DEMO_MODE && (
              <button type="button" onClick={connectDemo} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold">
                Use local demo
              </button>
            )}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p>Production wallet activity requires generated contract bindings. The local demo is visibly labelled and never represents a simulated result as a Midnight transaction.</p>
      </div>
    </div>
  );
}
