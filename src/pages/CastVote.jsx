import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Vote, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  AlertCircle, 
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';
import { INITIAL_SURVEYS } from './Home';
import { midnightService } from '../services/midnight';

export default function CastVote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const survey = INITIAL_SURVEYS.find(s => s.id === id) || INITIAL_SURVEYS[0];
  const deploymentReference = survey.deploymentReference || survey.contractAddress || 'unassigned_contract';

  const [selectedOption, setSelectedOption] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofProgress, setProofProgress] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCastVote = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    setIsSubmitting(true);

    try {
      midnightService.setNetwork(survey.network);

      const result = await midnightService.submitZKTransaction(
        'cast_anonymous_vote',
        { pollId: survey.id, title: survey.title, deploymentReference },
        {
          selected_option: selectedOption
        },
        (progress) => setProofProgress(progress)
      );

      survey.options[selectedOption].votes += 1;
      survey.totalVotes += 1;

      setTxResult(result);
      setIsSubmitting(false);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Transaction submission failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="p-8 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase ${
            survey.network === 'preview' ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-purple-100 text-purple-900 border border-purple-300'
          }`}>
            {survey.network} testnet
          </span>
          <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Knowledge Protected</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {survey.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {survey.description}
        </p>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>Deployment target:</span>
          <div className="flex items-center gap-2 text-sky-800 font-bold break-all">
            <span>{deploymentReference}</span>
            <button
              onClick={() => handleCopy(deploymentReference, 'ca')}
              className="text-slate-500 hover:text-emerald-700"
            >
              {copiedKey === 'ca' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {!txResult ? (
        <form onSubmit={handleCastVote} className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm backdrop-blur-md space-y-4">
            <h2 className="text-sm font-mono uppercase text-emerald-900 font-bold flex items-center gap-2">
              <Vote className="w-4 h-4 text-emerald-700" />
              <span>Step 1: Select Option</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {survey.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                    selectedOption === idx
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      selectedOption === idx ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </div>
                  {selectedOption === idx && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm backdrop-blur-md space-y-4">
            <h2 className="text-sm font-mono uppercase text-emerald-900 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Step 2: Wallet authorization</span>
              </div>
              <span className="text-[10px] text-slate-500 font-normal">no witness values enter this app</span>
            </h2>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
              1AM evaluates your eligibility witness and creates the proof on your device. AURA receives only the approved transaction result; it never asks you to type, generate, or reveal a secret key or score.
              <span className="block mt-2 font-mono text-emerald-800">Required proof threshold: {survey.threshold}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Cpu className="w-5 h-5 animate-spin text-emerald-200" />
                <span>{proofProgress ? proofProgress.text : 'Proving ZK Circuit...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize ballot with 1AM</span>
              </>
            )}
          </button>

        </form>
      ) : (
        /* Success Screen */
        <div className="p-8 rounded-3xl bg-white/95 border border-emerald-300 shadow-md backdrop-blur-md text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {txResult.status === 'WALLET_CONNECTED' ? 'Ballot confirmed via 1AM' : 'Demo ballot recorded'}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              {txResult.status === 'WALLET_CONNECTED'
                ? <>Your <strong className="text-emerald-800">1AM wallet</strong> signed the vote reservation on Midnight <strong className="text-sky-800 capitalize">{txResult.network}</strong>. Your transaction hash is recorded below. DUST has not been spent from this build — on-chain settlement requires the compiled Compact bindings.
                  </>
                : <>This local demo result is not an on-chain ballot. Connect a generated Midnight transaction client to submit a wallet-approved proof to <strong className="text-sky-800 capitalize">{txResult.network}</strong>.</>
              }
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-3 max-w-xl mx-auto">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Deployment reference:</span>
                <button
                  onClick={() => handleCopy(txResult.deploymentReference, 'ca')}
                  className="text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedKey === 'ca' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-sky-800 font-bold text-sm break-all">
                {txResult.deploymentReference}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>{txResult.status === 'WALLET_CONNECTED' ? 'Transaction hash:' : 'Demo activity ID:'}</span>
                <button
                  onClick={() => handleCopy(txResult.activityReference, 'tx')}
                  className="text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedKey === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-emerald-800 font-bold text-sm break-all">
                {txResult.activityReference}
              </div>
            </div>

          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to={`/survey/${survey.id}`}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition-all"
            >
              View Verifiable Results
            </Link>

            <Link
              to="/profile"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-all"
            >
              View My Activity
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
