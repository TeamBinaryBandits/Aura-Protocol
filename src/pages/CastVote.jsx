import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, LockKeyhole, ShieldCheck, Wallet } from 'lucide-react';
import { midnightService } from '../services/midnight';
import { findKnownSurvey } from '../services/survey-registry';

export default function CastVote() {
  const { id } = useParams();
  const address = decodeURIComponent(id || '');
  const survey = findKnownSurvey(address);
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const vote = async (event) => {
    event.preventDefault();
    setError(null); setMessage('Checking 1AM and the issuer-backed credential…');
    try {
      // There is intentionally no local credential fallback. A production issuer
      // integration passes a holder-local getEligibilityScore closure here.
      await midnightService.submitEligibilityGatedVote({ contractAddress: address, selectedOption: selected, credential: null });
    } catch (reason) { setMessage(null); setError(reason.message || 'Vote was not submitted.'); }
  };

  return <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
    <Link to={`/survey/${encodeURIComponent(address)}`} className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-emerald-800"><ArrowLeft className="w-3.5 h-3.5" />Verified state</Link>
    <section className="p-7 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-950 text-xs font-mono"><LockKeyhole className="w-3.5 h-3.5" />Credential issuer required</span><h1 className="text-2xl font-extrabold text-slate-900">Eligibility-gated on-chain vote</h1><p className="text-sm leading-relaxed text-slate-600">This screen has no demo vote. AURA will submit only when a configured credential issuer supplies a holder-local witness implementation that the contract can prove. It will never generate a score, nullifier, ballot receipt, or transaction hash itself.</p><p className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs break-all text-slate-600">Contract: {address}</p></section>
    <form onSubmit={vote} className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"><div><h2 className="font-bold text-slate-900">Choose public option</h2><p className="mt-1 text-xs text-slate-600">The current Compact circuit explicitly discloses the option to maintain the public counter. Do not use it for secret ballots.</p></div><div className="grid gap-3">{(survey?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, index) => <label key={option} className={`p-4 rounded-2xl border cursor-pointer flex justify-between ${selected === index ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-200'}`}><span className="font-semibold text-sm text-slate-800">{option}</span><input type="radio" className="accent-emerald-700" checked={selected === index} onChange={() => setSelected(index)} /></label>)}</div><div className="flex gap-3 p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs leading-relaxed"><ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" /><p>An issuer integration is deliberately not faked. Once installed, 1AM will prove, balance, sign, and submit the real call transaction; the UI will display only its finalized ID and hash.</p></div>{message && <p className="text-xs text-emerald-800">{message}</p>}{error && <p role="alert" className="flex gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}<button className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex gap-2 items-center justify-center"><Wallet className="w-4 h-4" />Submit through 1AM</button></form>
  </div>;
}
