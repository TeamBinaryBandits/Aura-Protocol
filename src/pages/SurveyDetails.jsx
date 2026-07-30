import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft, 
  Vote, 
  CheckCircle2, 
  Lock, 
  TrendingUp,
  Brain,
  Cpu
} from 'lucide-react';
import { INITIAL_SURVEYS } from './Home';
import { geminiService } from '../services/gemini';

export default function SurveyDetails() {
  const { id } = useParams();
  const survey = INITIAL_SURVEYS.find(s => s.id === id) || INITIAL_SURVEYS[0];

  const [aiInsights, setAiInsights] = useState(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setIsSynthesizing(true);
      const res = await geminiService.synthesizeSurveyResults(
        survey.title,
        survey.totalVotes,
        survey.options
      );
      setAiInsights(res);
      setIsSynthesizing(false);
    }
    fetchInsights();
  }, [survey]);

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-emerald-800 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header Info */}
      <div className="p-8 rounded-3xl bg-midnight-900/80 border border-slate-800/80 backdrop-blur-md shadow-glass space-y-4">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase ${
            survey.network === 'preview' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
          }`}>
            {survey.network} testnet
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Verifiable Public Export Ledger</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {survey.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300">
          {survey.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono text-slate-400">
          <span>Creator: <code className="text-indigo-300">{survey.creator}</code></span>
          <span>Total Ballots Verified: <strong className="text-white font-bold">{survey.totalVotes}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Real-Time Tallies (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6 p-6 rounded-3xl bg-midnight-900/80 border border-slate-800/80 backdrop-blur-md shadow-glass">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h2 className="text-sm font-mono uppercase text-white font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Verifiable Option Tallies</span>
            </h2>
            <span className="text-[11px] font-mono text-emerald-400">disclose() Output</span>
          </div>

          <div className="space-y-4">
            {survey.options.map((opt, idx) => {
              const pct = survey.totalVotes > 0 ? Math.round((opt.votes / survey.totalVotes) * 100) : 0;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{opt.label}</span>
                    <span className="text-indigo-300">{opt.votes} votes ({pct}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-950/80 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
            <Link
              to={`/vote/${survey.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-glow-indigo transition-all"
            >
              <Vote className="w-4 h-4" />
              <span>Cast Anonymous Vote</span>
            </Link>

            <span className="text-[10px] font-mono text-slate-400">
              Updated via Midnight Compact State
            </span>
          </div>
        </div>

        {/* Gemini AI Insights Panel (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-midnight-900/80 border border-cyan-500/30 backdrop-blur-md shadow-glass space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h2 className="text-base font-bold text-white">Gemini ZK Synthesizer</h2>
              </div>
              {isSynthesizing && <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />}
            </div>

            {aiInsights ? (
              <div className="space-y-4 pt-1">
                
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Consensus Level</span>
                    <span className="text-emerald-400 font-bold uppercase">{aiInsights.consensusLevel}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans pt-1">
                    {aiInsights.executiveSummary}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                    Key AI Takeaways
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2">
                    {aiInsights.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{aiInsights.privacyConfidence}</span>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Analyzing zero-knowledge ballot distribution...
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
