import React, { useState } from 'react';
import { Check, Copy, Loader2, Sparkles } from 'lucide-react';

export default function AiResponse({ loading, error, result, emptyMessage = 'Enter public information to receive an assistant response.' }) {
  const [copied, setCopied] = useState(false);
  if (loading) return <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950"><Loader2 className="w-5 h-5 animate-spin" />AURA Assistant is preparing a response with Gemini 2…</div>;
  if (error) return <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">{error}</div>;
  if (!result) return <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm text-slate-600">{emptyMessage}</div>;
  return <section aria-live="polite" className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-slate-800"><div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-3"><div className="flex items-center gap-2 font-semibold text-emerald-950"><Sparkles className="w-4 h-4 text-emerald-700" />Gemini 2 response</div><button type="button" onClick={async () => { await navigator.clipboard.writeText(result); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950">{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy'}</button></div><p className="mt-4 whitespace-pre-wrap leading-relaxed">{result}</p><p className="mt-4 text-[11px] leading-relaxed text-slate-500">Advisory output only. Review before publishing; it does not create, sign, submit, or verify a Midnight transaction.</p></section>;
}
