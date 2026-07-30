import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Vote, 
  BarChart3, 
  Activity,
  ChevronRight,
  Copy,
  Check,
  Award,
  FileCode2,
  User,
  Flower2,
  Mountain,
  Waves
} from 'lucide-react';
export const INITIAL_SURVEYS = [
  {
    id: 'survey-1',
    title: 'Midnight Ecosystem Development Priorities (Q3 2026)',
    description: 'Provide confidential feedback on which Compact developer tools, SDK extensions, and 1AM wallet integrations should receive grant funding.',
    network: 'preview',
    contractAddress: 'sample_preview_grants_q3',
    deploymentTxHash: 'sample_deployment_001',
    creator: 'sample_governance',
    threshold: 50,
    totalVotes: 142,
    options: [
      { id: 0, label: 'Enhanced Compact Debugger & VS Code Extension', votes: 64 },
      { id: 1, label: '1AM Wallet Mobile DApp Connector', votes: 42 },
      { id: 2, label: 'High-Throughput Midnight ProofStation', votes: 24 },
      { id: 3, label: 'Cross-Chain ZK Bridges to Cardano & Ethereum', votes: 12 }
    ],
    status: 'SAMPLE',
    privacyScore: 98
  },
  {
    id: 'survey-2',
    title: 'Confidential Workplace Sentiment & Compensation Gate',
    description: 'Anonymous survey for verified contributors to assess organizational health without exposing individual identity or salary bracket.',
    network: 'preprod',
    contractAddress: 'sample_preprod_sentiment',
    deploymentTxHash: 'sample_deployment_002',
    creator: 'sample_workplace',
    threshold: 80,
    totalVotes: 89,
    options: [
      { id: 0, label: 'Highly Satisfied - Remote Flexibility & Culture', votes: 48 },
      { id: 1, label: 'Moderately Satisfied - Need Better Dev Tooling', votes: 27 },
      { id: 2, label: 'Needs Improvement - Workload Balance', votes: 10 },
      { id: 3, label: 'Dissatisfied', votes: 4 }
    ],
    status: 'SAMPLE',
    privacyScore: 94
  },
  {
    id: 'survey-3',
    title: 'Private Whistleblower Feedback Protocol',
    description: 'Secure, zero-knowledge anonymous channel for reporting governance anomalies with verified credential eligibility.',
    network: 'preview',
    contractAddress: 'sample_preview_feedback',
    deploymentTxHash: 'sample_deployment_003',
    creator: 'sample_audit',
    threshold: 90,
    totalVotes: 34,
    options: [
      { id: 0, label: 'No Anomalies Observed', votes: 22 },
      { id: 1, label: 'Minor Procedural Delay', votes: 8 },
      { id: 2, label: 'Critical Review Required', votes: 4 }
    ],
    status: 'SAMPLE',
    privacyScore: 100
  }
];

export default function Home() {
  const [surveys] = useState(INITIAL_SURVEYS);
  const [activeTab, setActiveTab] = useState('ALL');
  const [copiedAddressId, setCopiedAddressId] = useState(null);

  const filteredSurveys = surveys.filter(s => {
    if (activeTab === 'PREVIEW') return s.network === 'preview';
    if (activeTab === 'PREPROD') return s.network === 'preprod';
    return true;
  });

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedAddressId(id);
    setTimeout(() => setCopiedAddressId(null), 2000);
  };

  const truncate = (str) => {
    if (!str) return '';
    return str.substring(0, 10) + '...' + str.substring(str.length - 6);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-mono font-medium shadow-sm">
          <Mountain className="w-4 h-4 text-emerald-700" />
          <span>AURA · Midnight privacy workspace</span>
          <Waves className="w-4 h-4 text-sky-600" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Cast Your Ballot Like a <span className="text-emerald-700">Fallen Leaf</span> on a River
        </h1>

        <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
          A privacy-first survey workspace for Midnight. Connect 1AM for wallet approval, use the verified Preview faucet, and keep demo data visibly separate from live chain activity.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/create"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            <Vote className="w-4 h-4" />
            <span>Create New Survey</span>
          </Link>

          <Link
            to="/contracts"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 hover:bg-white border border-emerald-200 text-emerald-950 font-semibold text-sm shadow-sm transition-all duration-300"
          >
            <FileCode2 className="w-4 h-4 text-sky-700" />
            <span>Contracts & Hashes</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 hover:bg-white border border-emerald-200 text-emerald-950 font-semibold text-sm shadow-sm transition-all duration-300"
          >
            <User className="w-4 h-4 text-emerald-700" />
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 border border-emerald-200/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Networks</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Preview & Preprod</span>
          </div>
          <p className="text-[11px] text-slate-600 font-mono">1AM connector ready</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-emerald-200/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">ZK Protocol</span>
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            Compact 0.14+
          </div>
          <p className="text-[11px] text-slate-600 font-mono">Explicit disclose() Bounds</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-emerald-200/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">ZK Credentials</span>
            <Award className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            Eligibility Gates
          </div>
          <p className="text-[11px] text-slate-600 font-mono">On-Device Witness Evaluation</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 border border-emerald-200/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Sample ballots</span>
            <BarChart3 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            265 Demo Ballots
          </div>
          <p className="text-[11px] text-slate-600 font-mono">Replace with indexer data for production</p>
        </div>
      </div>

      {/* Survey Cards */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-200/80 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Survey workspace</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                {filteredSurveys.length} Examples
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Examples demonstrate the flow only; deployed contracts appear after wallet-authorized submission.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-white border border-emerald-200 text-xs font-mono">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              All Networks
            </button>
            <button
              onClick={() => setActiveTab('PREVIEW')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'PREVIEW' ? 'bg-sky-700 text-white font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('PREPROD')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'PREPROD' ? 'bg-purple-700 text-white font-bold' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Preprod
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="group p-6 rounded-3xl bg-white/90 hover:bg-white border border-emerald-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-1 rounded-lg font-mono font-bold uppercase ${
                    survey.network === 'preview'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                  }`}>
                    {survey.network} testnet
                  </span>

                  <div className="flex items-center gap-1 text-emerald-800 font-mono text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{survey.privacyScore}% Verified</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                  {survey.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {survey.description}
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-100 space-y-3">
                
                {/* Contract Address Box */}
                <div className="p-2 rounded-xl bg-slate-50 border border-emerald-200/60 text-[11px] font-mono text-slate-700 flex items-center justify-between">
                  <span>Contract / sample ID:</span>
                  <div className="flex items-center gap-1 text-sky-800 font-bold">
                    <span>{truncate(survey.contractAddress || survey.deploymentReference || 'Awaiting deployment')}</span>
                    <button
                      onClick={() => handleCopy(survey.contractAddress || survey.deploymentReference || 'Awaiting deployment', survey.id)}
                      className="text-slate-500 hover:text-emerald-700"
                    >
                      {copiedAddressId === survey.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-700">
                  <span>Votes Cast: <strong className="text-slate-900">{survey.totalVotes}</strong></span>
                  <span>Threshold: <strong className="text-emerald-800">{survey.threshold}+</strong></span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to={`/vote/${survey.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>Cast Vote</span>
                  </Link>

                  <Link
                    to={`/survey/${survey.id}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
                  >
                    <span>View Tallies</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
