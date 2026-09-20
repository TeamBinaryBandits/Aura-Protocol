import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import AiResponse from '../AiResponse';
import { runAuraAi } from '../../services/aura-ai';
import { listKnownSurveys } from '../../services/survey-registry';

export default function AdminBriefing() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [result, setResult] = useState('');
  const createBriefing = async () => { const surveys = listKnownSurveys(); setLoading(true); setError(null); setResult(''); try { setResult((await runAuraAi('admin_briefing', { generatedAt: new Date().toISOString(), finalizedRegistryEntries: surveys.map(({ contractAddress, network, title, deploymentTxHash, blockHeight }) => ({ contractAddress, network, title, deploymentTxHash, blockHeight })), note: 'Registry metadata only. Check the indexer separately for current contract state.' })).text); } catch (reason) { setError(reason.message || 'Unable to create the operations briefing.'); } setLoading(false); };
  return <div className="mt-7"><p className="text-xs leading-relaxed text-slate-600">This briefing uses only explicitly configured or browser-session finalized registry entries. It does not query wallets or fabricate health data.</p><button type="button" onClick={createBriefing} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"><Activity className="w-4 h-4" />Create registry briefing</button><AiResponse loading={loading} error={error} result={result} emptyMessage="Create an operations briefing from the current public registry." /></div>;
}
