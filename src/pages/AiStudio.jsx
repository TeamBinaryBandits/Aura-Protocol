import React, { useState } from 'react';
import { Bot, ChevronRight, LockKeyhole, Sparkles } from 'lucide-react';
import { AI_FEATURES } from '../services/aura-ai';
import SurveyBriefBuilder from '../components/ai/SurveyBriefBuilder';
import DisclosureExplainer from '../components/ai/DisclosureExplainer';

export default function AiStudio() {
  const [selected, setSelected] = useState(AI_FEATURES[0].id);
  const feature = AI_FEATURES.find((item) => item.id === selected) || AI_FEATURES[0];

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/90 shadow-sm">
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="p-8 sm:p-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-mono text-emerald-950"><Sparkles className="w-3.5 h-3.5" /> Gemini 2 · server-side assistance</div>
            <div><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">AURA Assistant</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Thoughtful help for the public side of a Midnight survey: wording, disclosure clarity, public tallies, and deployment readiness. It never generates or signs a transaction.</p></div>
          </div>
          <aside className="bg-slate-950 p-8 text-slate-100 space-y-3"><LockKeyhole className="w-6 h-6 text-emerald-400" /><h2 className="font-bold">Private by design</h2><p className="text-xs leading-relaxed text-slate-300">Only public metadata you explicitly enter is sent to the server. Do not paste seeds, wallet keys, credential witnesses, proof inputs, private eligibility scores, or transaction payloads.</p></aside>
        </div>
      </section>

      <section className="grid lg:grid-cols-[.85fr_1.15fr] gap-6 items-start">
        <nav aria-label="AURA Assistant features" className="rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm space-y-1">
          {AI_FEATURES.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={`w-full text-left rounded-2xl p-4 transition-colors ${item.id === selected ? 'bg-emerald-700 text-white shadow-sm' : 'hover:bg-emerald-50 text-slate-800'}`}><span className="block text-[10px] uppercase tracking-wider font-mono opacity-70">{item.category}</span><span className="mt-1 flex items-center justify-between gap-3 font-semibold text-sm">{item.title}<ChevronRight className="w-4 h-4 shrink-0" /></span><span className="mt-1 block text-xs leading-relaxed opacity-75">{item.description}</span></button>)}
        </nav>
        <section className="rounded-3xl border border-emerald-200 bg-white/90 p-7 sm:p-8 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800"><Bot className="w-5 h-5" /></div><div><p className="text-xs font-mono uppercase text-emerald-800">Selected tool</p><h2 className="mt-1 text-xl font-bold text-slate-900">{feature.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p></div></div>{selected === 'survey_brief' ? <SurveyBriefBuilder /> : selected === 'disclosure_explainer' ? <DisclosureExplainer /> : <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">This public-input tool is being prepared.</div>}</section>
      </section>
    </div>
  );
}
