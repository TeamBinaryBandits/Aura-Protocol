import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import AiResponse from '../AiResponse';
import { runAuraAi, publicSurveySnapshot } from '../../services/aura-ai';
import { listKnownSurveys } from '../../services/survey-registry';

export default function DisclosureExplainer() {
  const surveys = listKnownSurveys();
  const [selectedAddress, setSelectedAddress] = useState(surveys[0]?.contractAddress || '');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');
  const survey = surveys.find((item) => item.contractAddress === selectedAddress);

  const explain = async (event) => {
    event.preventDefault(); setLoading(true); setError(null); setResult('');
    try { setResult((await runAuraAi('disclosure_explainer', { survey: publicSurveySnapshot(survey), question: context || 'Explain this survey privacy boundary for participants.' })).text); }
    catch (reason) { setError(reason.message || 'Unable to explain the disclosure boundary.'); }
    setLoading(false);
  };

  return <form onSubmit={explain} className="mt-7 space-y-4"><p className="text-xs leading-relaxed text-slate-600">This explanation is based on public contract metadata. The assistant cannot inspect a witness, proof, wallet, or ballot.</p>{surveys.length ? <label className="block text-xs font-mono uppercase text-slate-600">Registered public contract<select value={selectedAddress} onChange={(event) => setSelectedAddress(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none">{surveys.map((item) => <option value={item.contractAddress} key={item.contractAddress}>{item.title} · {item.network}</option>)}</select></label> : <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">No finalized survey is registered in this browser. You can still ask a general public disclosure question below.</p>}<label className="block text-xs font-mono uppercase text-slate-600">Public question <span className="normal-case text-slate-400">(optional)</span><textarea value={context} onChange={(event) => setContext(event.target.value)} maxLength={800} rows={3} placeholder="What can a participant and an observer learn?" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none" /></label><button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><ShieldCheck className="w-4 h-4" />Explain public disclosure</button><AiResponse loading={loading} error={error} result={result} emptyMessage="Select a public contract or ask a general disclosure question." /></form>;
}
