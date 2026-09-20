import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AiResponse from '../AiResponse';
import { runAuraAi } from '../../services/aura-ai';

export default function SurveyBriefBuilder() {
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');

  const createBrief = async (event) => {
    event.preventDefault();
    setLoading(true); setError(null); setResult('');
    try {
      const output = await runAuraAi('survey_brief', { goal, audience, constraints: constraints || 'No additional constraints.' });
      setResult(output.text);
    } catch (reason) { setError(reason.message || 'Unable to build a survey brief.'); }
    setLoading(false);
  };

  return <form onSubmit={createBrief} className="mt-7 space-y-4"><p className="text-xs leading-relaxed text-slate-600">Describe only the public purpose and audience. This draft is not stored in AURA and is never sent to 1AM.</p><label className="block text-xs font-mono uppercase text-slate-600">Public survey goal<textarea required value={goal} onChange={(event) => setGoal(event.target.value)} maxLength={1200} rows={3} placeholder="Understand which public workshop topics a community wants next." className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none" /></label><label className="block text-xs font-mono uppercase text-slate-600">Intended audience<input required value={audience} onChange={(event) => setAudience(event.target.value)} maxLength={400} placeholder="Registered community members" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none" /></label><label className="block text-xs font-mono uppercase text-slate-600">Public constraints <span className="normal-case text-slate-400">(optional)</span><input value={constraints} onChange={(event) => setConstraints(event.target.value)} maxLength={600} placeholder="Keep the wording neutral and suitable for a broad audience" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm normal-case font-sans focus:border-emerald-600 focus:outline-none" /></label><button disabled={loading || !goal.trim() || !audience.trim()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Sparkles className="w-4 h-4" />Build public survey brief</button><AiResponse loading={loading} error={error} result={result} emptyMessage="Describe a public goal to generate a publishable survey brief." /></form>;
}
