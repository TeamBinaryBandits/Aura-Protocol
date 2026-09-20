/**
 * Client for AURA's server-side Gemini assistant.
 *
 * Requests intentionally contain only public survey metadata or text that a
 * user has typed for review. Wallet keys, credential witnesses, proof inputs,
 * and transaction payloads must never be sent to this endpoint.
 */
export const AI_FEATURES = [
  { id: 'survey_brief', title: 'Survey brief builder', description: 'Turn a public goal into a clear title, context, and four neutral options.', category: 'Creator' },
  { id: 'disclosure_explainer', title: 'Disclosure explainer', description: 'Explain exactly what this Compact survey keeps private and makes public.', category: 'Privacy' },
  { id: 'copy_review', title: 'Plain-language review', description: 'Check public copy for clarity, inclusiveness, and leading language.', category: 'Creator' },
  { id: 'tally_narrative', title: 'Public tally narrative', description: 'Summarize only the indexed counts that an observer can already see.', category: 'Insights' },
  { id: 'deployment_coach', title: 'Deployment readiness', description: 'Review public form details before the wallet-authorized deploy flow.', category: 'Creator' },
];

export const ADMIN_FEATURES = [
  { id: 'admin_briefing', title: 'Operations briefing', description: 'Summarize configured public contracts and their indexer-read state.', category: 'Admin' },
  { id: 'policy_review', title: 'Publication policy review', description: 'Review proposed public survey copy against AURA publication guidance.', category: 'Admin' },
];

export async function runAuraAi(action, payload) {
  const response = await fetch('/api/aura-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'AURA Assistant could not complete this request.');
  }
  if (!body.text || typeof body.text !== 'string') {
    throw new Error('Gemini returned no readable assistant response.');
  }
  return body;
}

export function publicSurveySnapshot(survey, state) {
  return {
    contractAddress: survey?.contractAddress || null,
    network: survey?.network || null,
    title: survey?.title || null,
    description: survey?.description || null,
    options: Array.isArray(survey?.options) ? survey.options : [],
    threshold: state?.min_eligibility_threshold == null ? null : Number(state.min_eligibility_threshold),
    totalBallots: state?.total_ballots_cast == null ? null : Number(state.total_ballots_cast),
    optionCounts: state ? [state.option_a_votes, state.option_b_votes, state.option_c_votes, state.option_d_votes].map(Number) : [],
  };
}
