import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Send, 
  Cpu,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { geminiService } from '../services/gemini';
import { midnightService, reserveContractAddress } from '../services/midnight';
import { INITIAL_SURVEYS } from './Home';

export default function CreateSurvey() {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetNetwork, setTargetNetwork] = useState('preview');
  const [threshold, setThreshold] = useState(50);
  const [options, setOptions] = useState([
    'Option A - High Priority',
    'Option B - Moderate Priority',
    'Option C - Low Priority'
  ]);

  const [isAuditing, setIsAuditing] = useState(false);
  const [privacyAudit, setPrivacyAudit] = useState(null);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    if (!title.trim()) return;

    const timer = setTimeout(async () => {
      setIsAuditing(true);
      const result = await geminiService.auditSurveyPrivacy(title, description, options, threshold);
      setPrivacyAudit(result);
      setIsAuditing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, options, threshold]);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeployContract = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsDeploying(true);
    setDeployError(null);

    try {
      midnightService.setNetwork(targetNetwork);
      const reservation = await reserveContractAddress(targetNetwork);
      const connection = midnightService.isConnected
        ? { success: true }
        : await midnightService.connectWallet();
      if (!connection.success) throw new Error(connection.error);
      
      const result = await midnightService.submitZKTransaction(
        'initialize_survey',
        {
          title,
          targetNetwork,
          threshold,
          deploymentReference: reservation.deploymentReference,
          reservationId: reservation.reservationId,
          addressStatus: reservation.status,
        },
        {},
        (progress) => setDeployStep(progress)
      );

      const newSurvey = {
        id: `survey-${Date.now()}`,
        title,
        description: description || 'No detailed description provided.',
        network: targetNetwork,
        deploymentReference: reservation.deploymentReference,
        deploymentActivityReference: result.activityReference,
        creator: midnightService.walletAddress || '0xmn_creator',
        threshold: parseInt(threshold),
        totalVotes: 0,
        options: options.map((opt, idx) => ({ id: idx, label: opt, votes: 0 })),
        status: 'ACTIVE',
        privacyScore: privacyAudit ? privacyAudit.privacyScore : 95
      };

      INITIAL_SURVEYS.unshift(newSurvey);

      setDeployResult({
        deploymentReference: reservation.deploymentReference,
        activityReference: result.activityReference,
        network: targetNetwork
      });

      setIsDeploying(false);

    } catch (err) {
      setDeployError(err.message || 'Unable to start deployment.');
      setIsDeploying(false);
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Lock className="w-6 h-6" />
          </div>
          <span>Create Private Survey</span>
        </h1>
        <p className="text-sm text-slate-600">
          Deploy an anonymous survey smart contract on Midnight <strong className="text-sky-800">Preview</strong> or <strong className="text-purple-800">Preprod</strong> with real-time privacy verification.
        </p>
      </div>

      {!deployResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <form onSubmit={handleDeployContract} className="lg:col-span-7 space-y-6 p-6 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm backdrop-blur-md">
            
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-600 font-bold flex items-center justify-between">
                <span>Target Midnight Network</span>
                <span className="text-emerald-800 font-normal">1AM Wallet / explicit demo mode</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetNetwork('preview')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    targetNetwork === 'preview'
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                  <div>
                    <div className="text-xs font-mono font-bold">Midnight Preview</div>
                    <div className="text-[10px] text-slate-500">Match the network selected in 1AM</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetNetwork('preprod')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    targetNetwork === 'preprod'
                      ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <div>
                    <div className="text-xs font-mono font-bold">Midnight Preprod</div>
                    <div className="text-[10px] text-slate-500">Match the network selected in 1AM</div>
                  </div>
                </button>
              </div>
            </div>

            {deployError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {deployError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-600 font-bold">
                Survey Title / Question
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Community Priorities for Midnight Grant Proposal #4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-600 font-bold">
                Description & Context
              </label>
              <textarea
                rows={3}
                placeholder="Provide background context for participants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-slate-600 font-bold">
                  Choice Options (2 to 4)
                </label>
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-xs text-emerald-800 font-bold font-mono"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Choice</span>
                  </button>
                )}
              </div>

              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs font-mono font-bold text-emerald-900">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-700 font-bold">Confidential Eligibility Score Gate</span>
                <span className="text-emerald-800 font-bold">{threshold} Score</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <p className="text-[11px] text-slate-600 font-sans">
                Voters must prove <code className="text-emerald-800 font-mono">score &gt;= {threshold}</code> in zero-knowledge without revealing their exact credentials.
              </p>
            </div>

            <button
              type="submit"
              disabled={isDeploying || !title.trim()}
              className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeploying ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin text-emerald-200" />
                  <span>{deployStep ? deployStep.text : 'Reserving contract deployment...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Reserve & deploy with 1AM</span>
                </>
              )}
            </button>

          </form>

          {/* Privacy Guard */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white/90 border border-emerald-200 shadow-sm backdrop-blur-md space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">Smart Privacy Guard</h3>
                </div>
                {isAuditing && <span className="text-xs font-mono text-emerald-700 animate-pulse">Analyzing...</span>}
              </div>

              {privacyAudit ? (
                <div className="space-y-4 pt-1">
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-mono">Privacy Rating</div>
                      <div className="text-2xl font-extrabold font-mono text-emerald-700">
                        {privacyAudit.privacyScore} / 100
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                      privacyAudit.riskLevel === 'LOW' 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {privacyAudit.riskLevel} RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {privacyAudit.summary}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase text-slate-600 font-bold">
                      Privacy Checks
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      {privacyAudit.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600/60" />
                  <p>Type a survey question to run real-time privacy verification...</p>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : (
        /* Deployment Success Screen */
        <div className="p-8 rounded-3xl bg-white/95 border border-emerald-300 shadow-md backdrop-blur-md text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Survey deployment reserved</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              The server issued this temporary reservation for Midnight <strong className="text-sky-800 capitalize">{deployResult.network}</strong>. A real on-chain address is returned only after a generated Midnight client submits a wallet-approved deployment.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-3 max-w-xl mx-auto">
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Server deployment reference:</span>
                <button
                  onClick={() => handleCopy(deployResult.deploymentReference, 'deployment')}
                  className="text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedKey === 'deployment' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-sky-800 font-bold text-sm break-all">
                {deployResult.deploymentReference}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Server demo activity reference:</span>
                <button
                  onClick={() => handleCopy(deployResult.activityReference, 'activity')}
                  className="text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                >
                  {copiedKey === 'activity' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-emerald-800 font-bold text-sm break-all">
                {deployResult.activityReference}
              </div>
            </div>

          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/contracts"
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm transition-all"
            >
              View in Contract Explorer
            </Link>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-all"
            >
              Go to Dashboard
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
