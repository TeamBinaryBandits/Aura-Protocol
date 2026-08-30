import React, { useEffect, useState } from 'react';
import { Activity, Check, Copy, ExternalLink, LogOut, ShieldCheck, Wallet } from 'lucide-react';
import { midnightService, ONE_AM_INSTALL_URL } from '../services/midnight';

export default function Profile() {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    walletAddress: null,
    network: null,
    dustBalance: null,
    nightBalance: null,
    walletType: null,
    transactions: [],
  });
  const [copied, setCopied] = useState(null);

  useEffect(() => midnightService.subscribe(setWalletState), []);

  const copy = async (value, id) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const balance = (value, suffix) => (typeof value === 'number' ? `${value} ${suffix}` : 'Not reported');

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Wallet activity
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">Your 1AM connection</h1>
          <p className="mt-1 text-sm text-slate-600">AURA displays only 1AM connector values and finalized Midnight transaction records.</p>
        </div>
        {walletState.isConnected ? (
          <button type="button" onClick={() => midnightService.disconnectWallet()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => midnightService.connectWallet()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">
              <Wallet className="w-4 h-4" /> Connect 1AM
            </button>
            <a href={ONE_AM_INSTALL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
              Install <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-mono text-slate-500">Account</p>
          <div className="mt-2 flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 break-all">{walletState.walletAddress || 'Not connected'}</p>
            {walletState.walletAddress && <button type="button" onClick={() => copy(walletState.walletAddress, 'account')} className="text-slate-500 hover:text-emerald-700">{copied === 'account' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>}
          </div>
          <p className="mt-3 text-xs text-slate-600">{walletState.walletType === '1am' ? '1AM Wallet account' : 'No wallet connection'}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-mono text-slate-500">Network</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{walletState.network?.name || 'Choose a network'}</p>
          <p className="mt-3 text-xs text-slate-600">DUST: {balance(walletState.dustBalance, 'DUST')}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-mono text-slate-500">NIGHT / tNIGHT</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{balance(walletState.nightBalance, 'tNIGHT')}</p>
          {walletState.network?.faucetUrl ? (
            <a href={walletState.network.faucetUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-800 hover:underline">Open Preview faucet <ExternalLink className="w-3.5 h-3.5" /></a>
          ) : <p className="mt-3 text-xs text-slate-600">Consult the token guide for the active network.</p>}
        </div>
      </section>

      <section className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm" aria-labelledby="activity-heading">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-700" /><h2 id="activity-heading" className="font-bold text-slate-900">Recorded activity</h2></div>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-mono text-slate-600">{walletState.transactions.length}</span>
        </div>
        {walletState.transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">No activity has been recorded in this browser session.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {walletState.transactions.map((transaction) => (
              <article key={transaction.txId || transaction.deploymentTxId || transaction.contractAddress} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-800">{transaction.type.replaceAll('_', ' ')}</span>
                  <span className="text-slate-500">{transaction.status}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <p className="p-2.5 rounded-xl bg-white border border-slate-200 break-all text-slate-700"><span className="block mb-1 text-slate-500">Contract address</span>{transaction.contractAddress}</p>
                  <p className="p-2.5 rounded-xl bg-white border border-slate-200 break-all text-slate-700"><span className="block mb-1 text-slate-500">Finalized transaction hash</span>{transaction.txHash || transaction.deploymentTxHash}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
