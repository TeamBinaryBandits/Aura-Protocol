import React, { useState } from 'react';
import { Award, ShieldCheck, CheckCircle2, Lock, Plus, Sparkles, Cpu } from 'lucide-react';
import { midnightService } from '../services/midnight';

export default function Credentials() {
  const [credentials, setCredentials] = useState([
    { id: 'c-1', title: 'Verified Developer Credential', issuer: 'Midnight Foundation', score: 85, badgeColor: 'border-cyan-500/40 text-cyan-300' },
    { id: 'c-2', title: 'Confidential Age & Residency Gate (18+)', issuer: 'PrivaID ZK Network', score: 90, badgeColor: 'border-indigo-500/40 text-indigo-300' },
    { id: 'c-3', title: 'AURA Protocol Governance Pass', issuer: 'AURA DAO', score: 70, badgeColor: 'border-emerald-500/40 text-emerald-300' }
  ]);

  const [isIssuing, setIsIssuing] = useState(false);

  const handleIssueCredential = async () => {
    setIsIssuing(true);
    await new Promise(res => setTimeout(res, 500));

    const newCred = {
      id: `c-${Date.now()}`,
      title: `Custom ZK Eligibility Badge #${credentials.length + 1}`,
      issuer: 'AURA Zero-Knowledge Authority',
      score: Math.floor(Math.random() * 30) + 70,
      badgeColor: 'border-purple-500/40 text-purple-300'
    };

    setCredentials([...credentials, newCred]);
    setIsIssuing(false);
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Award className="w-6 h-6" />
            </div>
            <span>Confidential Credentials & ZK Gates</span>
          </h1>
          <p className="text-sm text-slate-600">
            Issue and verify private zero-knowledge credential badges that satisfy Compact <code className="text-indigo-300 font-mono">witness eligibility_score()</code> assertions without exposing underlying identity details.
          </p>
        </div>

        <button
          onClick={handleIssueCredential}
          disabled={isIssuing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium text-xs shadow-glow-indigo transition-all disabled:opacity-50"
        >
          {isIssuing ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Issuing Proof...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Issue ZK Credential</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {credentials.map((cred) => (
          <div key={cred.id} className="p-6 rounded-3xl bg-midnight-900/80 border border-slate-800/80 backdrop-blur-md shadow-glass space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`px-2.5 py-0.5 rounded border font-semibold ${cred.badgeColor}`}>
                  +{cred.score} ZK Points
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <h2 className="text-base font-bold text-white leading-snug">
                {cred.title}
              </h2>

              <p className="text-xs text-slate-400 font-mono">
                Issuer: {cred.issuer}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Status: <strong className="text-emerald-400">Verified On-Device</strong></span>
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
        ))}
      </div>

      {/* ZK Gating Explanation */}
      <div className="p-6 rounded-3xl bg-midnight-900/80 border border-indigo-500/30 backdrop-blur-md shadow-glass space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>How Compact Smart Contract Eligibility Gating Works</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          When participating in a survey, your local 1AM Wallet evaluates your credentials off-chain and sums their contribution into a private witness value. The Compact smart contract executes <code className="text-indigo-300 font-mono">assert score &gt;= min_eligibility_threshold</code> inside a zero-knowledge proof. The ledger confirms your qualification while keeping your specific credentials completely confidential!
        </p>
      </div>

    </div>
  );
}
