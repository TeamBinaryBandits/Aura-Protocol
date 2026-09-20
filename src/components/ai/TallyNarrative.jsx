import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import AiResponse from '../AiResponse';
import { runAuraAi, publicSurveySnapshot } from '../../services/aura-ai';
import { listKnownSurveys } from '../../services/survey-registry';
import { midnightService } from '../../services/midnight';

export default function TallyNarrative() {
  const surveys = listKnownSurveys(); const [address, setAddress] = useState(surveys[0]?.contractAddress || '');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [result, setResult] = useState('');
  const survey = surveys.find((item) => item.contractAddress === address);
  const summarize = async (event) => { event.preventDefault(); if (!survey) return; setLoading(true); setError(null); setResult(''); try { const state = await midnightService.getSurveyState(survey.contractAddress, survey.network); setResult((await runAuraAi('tally_narrative', { survey: publicSurveySnapshot(survey, state), source: 'Live Midnight indexer state read immediately before this request.' })).text); } catch (reason) { setError(reason.message || 'Unable to read or summarize the public tally.'); } setLoading(false); };
  return <form onSubmit={summarize} className="mt-7 space-y-4"><p className="text-xs leading-relaxed text-slate-600">AURA reads the selected contract from its configured Midnight indexer, then Gemini summarizes those public counts only.</p>{surveys.length ? <label className="block text-xs font-mono uppercase text-slate-600">Indexed contract<select value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none">{surveys.map((item) => <option key={item.contractAddress} value={item.contractAddress}>{item.title} · {item.network}</option>)}</select></label> : <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Register a finalized contract first. AURA will not fabricate tally data for the assistant.</p>}<button disabled={loading || !survey} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><BarChart3 className="w-4 h-4" />Summarize live public tally</button><AiResponse loading={loading} error={error} result={result} emptyMessage="Choose a registered on-chain survey to create a live public-tally narrative." /></form>;
}
