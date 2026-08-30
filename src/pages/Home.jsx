import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, ChevronRight, DatabaseZap, ExternalLink, FileCode2, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { midnightService } from '../services/midnight';
import { listKnownSurveys } from '../services/survey-registry';

const compact = (value) => value ? `${value.slice(0, 10)}…${value.slice(-8)}` : 'Not indexed';

const asCount = (value) => typeof value === 'bigint' ? Number(value) : Number(value || 0);

export default function Home() {
  const [surveys, setSurveys] = useState(() => listKnownSurveys());
  const [states, setStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    const known = listKnownSurveys();
    setSurveys(known);
    if (!known.length) return;
    setLoading(true);
    setError(null);
    const entries = await Promise.all(known.map(async (survey) => {
      try {
        const ledger = await midnightService.getSurveyState(survey.contractAddress, survey.network);
        return [survey.contractAddress, { ledger }];
      } catch (reason) {
        return [survey.contractAddress, { error: reason.message || 'Indexer query failed.' }];
      }
    }));
    setStates(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="grid lg:grid-cols-[1.3fr_.7fr] gap-6 items-stretch">
        <div className="p-8 sm:p-10 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Live-state only
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Selective-disclosure surveys on Midnight</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              AURA reads contract state from the Midnight indexer selected by 1AM. It never substitutes sample surveys, simulated balances, or made-up transaction identifiers.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/create" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold">
              <FileCode2 className="w-4 h-4" /> Deploy real survey
            </Link>
            <Link to="/settings" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold">
              <DatabaseZap className="w-4 h-4" /> Configure 1AM
            </Link>
          </div>
        </div>
        <aside className="p-7 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-sm space-y-4">
          <LockKeyhole className="w-6 h-6 text-emerald-400" />
          <h2 className="font-bold text-lg">Privacy boundary</h2>
          <p className="text-xs leading-relaxed text-slate-300">The Compact circuit proves eligibility from a private witness. Its option argument is deliberately disclosed to update a public tally, so AURA does not market this contract as a secret-ballot system.</p>
          <Link to="/explorer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200">Read the disclosure model <ChevronRight className="w-3.5 h-3.5" /></Link>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="onchain-surveys-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
          <div>
            <h2 id="onchain-surveys-heading" className="text-xl font-bold text-slate-900">Indexed contracts</h2>
            <p className="text-xs text-slate-600 mt-1">Configured in Vercel or finalized in this browser session.</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-700 hover:border-emerald-400 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Refreshing…' : 'Refresh live state'}
          </button>
        </div>

        {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{error}</p>}

        {!surveys.length ? (
          <div className="p-10 rounded-3xl bg-white/70 border border-dashed border-slate-300 text-center space-y-3">
            <Activity className="w-7 h-7 mx-auto text-slate-400" />
            <h3 className="font-bold text-slate-800">No on-chain survey is registered</h3>
            <p className="max-w-lg mx-auto text-xs text-slate-600">Deploy one with 1AM, then AURA will record the returned address and transaction IDs. For team-visible surveys, set VITE_AURA_SURVEY_CONTRACTS_JSON in Vercel with only finalized addresses.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {surveys.map((survey) => {
              const record = states[survey.contractAddress];
              const current = record?.ledger;
              return (
                <article key={survey.contractAddress} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase ${survey.network === 'preprod' ? 'bg-violet-100 text-violet-900' : 'bg-sky-100 text-sky-900'}`}>{survey.network}</span>
                      {record?.error ? <span className="inline-flex items-center gap-1 text-[11px] text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Awaiting indexer</span> : <span className="text-[11px] text-emerald-800 font-semibold">Live indexer state</span>}
                    </div>
                    <h3 className="font-bold text-slate-900">{survey.title}</h3>
                    {survey.description && <p className="text-xs leading-relaxed text-slate-600">{survey.description}</p>}
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200"><dt className="font-mono text-slate-500">Ballots</dt><dd className="mt-1 text-lg font-bold text-slate-900">{current ? asCount(current.total_ballots_cast) : '—'}</dd></div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200"><dt className="font-mono text-slate-500">Threshold</dt><dd className="mt-1 text-lg font-bold text-slate-900">{current ? asCount(current.min_eligibility_threshold) : '—'}</dd></div>
                  </dl>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 break-all"><span className="block text-slate-400 mb-1">Contract address</span>{compact(survey.contractAddress)}</div>
                  <Link to={`/survey/${encodeURIComponent(survey.contractAddress)}`} className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold">View verified state <ChevronRight className="w-3.5 h-3.5" /></Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <p className="flex items-center gap-2 text-[11px] text-slate-500"><ExternalLink className="w-3.5 h-3.5" /> The address and transaction hash shown anywhere in AURA come from a finalized Midnight response—not from AURA or a terminal command.</p>
    </div>
  );
}
