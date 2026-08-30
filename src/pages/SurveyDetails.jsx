import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BarChart3, CheckCircle2, Copy, LockKeyhole, RefreshCw, Vote } from 'lucide-react';
import { midnightService } from '../services/midnight';
import { findKnownSurvey } from '../services/survey-registry';

const count = (value) => typeof value === 'bigint' ? Number(value) : Number(value || 0);

export default function SurveyDetails() {
  const { id } = useParams();
  const address = decodeURIComponent(id || '');
  const survey = findKnownSurvey(address);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setState(await midnightService.getSurveyState(address, survey?.network)); }
    catch (reason) { setError(reason.message || 'Unable to read this contract state.'); }
    setLoading(false);
  }, [address, survey?.network]);

  useEffect(() => { refresh(); }, [refresh]);
  const optionCounts = state ? [state.option_a_votes, state.option_b_votes, state.option_c_votes, state.option_d_votes].map(count) : [];
  const total = state ? count(state.total_ballots_cast) : 0;
  const options = survey?.options || ['Option A', 'Option B', 'Option C', 'Option D'];

  return <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
    <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-emerald-800"><ArrowLeft className="w-3.5 h-3.5" />Dashboard</Link>
    <section className="p-7 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-4"><div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between"><div><span className={`px-2.5 py-1 rounded-lg text-[11px] uppercase font-mono font-bold ${survey?.network === 'preprod' ? 'bg-violet-100 text-violet-900' : 'bg-sky-100 text-sky-900'}`}>{survey?.network || 'unknown'} contract</span><h1 className="mt-3 text-2xl font-extrabold text-slate-900">{survey?.title || 'On-chain survey'}</h1>{survey?.description && <p className="mt-2 text-sm text-slate-600">{survey.description}</p>}</div><button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold disabled:opacity-50"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div><div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono break-all flex items-center justify-between gap-3"><span>{address}</span><button type="button" onClick={async () => { await navigator.clipboard.writeText(address); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }} className="shrink-0 text-slate-500 hover:text-emerald-800">{copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button></div></section>
    {error ? <p role="alert" className="flex gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p> : state && <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-6"><div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-700" />Indexed public tally</h2><span className="text-xs font-mono text-emerald-800">{total} ballots</span></div><div className="space-y-4">{options.map((option, index) => { const votes = optionCounts[index] || 0; const percent = total ? Math.round(votes / total * 100) : 0; return <div key={option} className="space-y-2"><div className="flex justify-between gap-4 text-xs"><span className="font-semibold text-slate-700">{option}</span><span className="font-mono text-slate-600">{votes} · {percent}%</span></div><div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-600 rounded-full" style={{ width: `${percent}%` }} /></div></div>; })}</div><Link to={`/vote/${encodeURIComponent(address)}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"><Vote className="w-4 h-4" />Eligibility-gated vote</Link></div><aside className="p-7 rounded-3xl bg-slate-900 text-slate-100 space-y-3"><LockKeyhole className="w-6 h-6 text-emerald-400" /><h2 className="font-bold">Disclosure status</h2><p className="text-xs text-slate-300 leading-relaxed">The eligibility score is a witness evaluated in the proof. The option counters are public because the circuit explicitly discloses the selected option before incrementing a counter.</p><dl className="text-xs space-y-2 pt-2 border-t border-slate-700"><div className="flex justify-between"><dt className="text-slate-400">Threshold</dt><dd>{count(state.min_eligibility_threshold)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Network code</dt><dd>{count(state.active_network_id)}</dd></div><div className="flex justify-between"><dt className="text-slate-400">Poll revision</dt><dd>{count(state.poll_id)}</dd></div></dl></aside></section>}
  </div>;
}
