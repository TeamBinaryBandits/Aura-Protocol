/**
 * Public metadata for contracts that already exist on Midnight.
 *
 * Addresses are never generated here. Deployments are accepted only after the
 * 1AM/Midnight.js flow has finalized and returned an address and transaction
 * identifiers. Configure long-lived, team-visible contracts through the Vercel
 * VITE_AURA_SURVEY_CONTRACTS_JSON variable.
 */
const STORAGE_KEY = 'aura.real-surveys.v1';

const asArray = (value) => Array.isArray(value) ? value : [];

function parse(value) {
  if (!value) return [];
  try { return asArray(typeof value === 'string' ? JSON.parse(value) : value); } catch { return []; }
}

function validAddress(value) {
  return typeof value === 'string' && value.trim().length >= 16 && !/^(sample|demo|aura_deploy|unassigned)/i.test(value.trim());
}

function normalize(record) {
  if (!record || !validAddress(record.contractAddress)) return null;
  const options = asArray(record.options).map((option, index) => String(option || '').trim())
    .filter(Boolean).slice(0, 4);
  return {
    contractAddress: record.contractAddress.trim(),
    network: String(record.network || '').toLowerCase() === 'preprod' ? 'preprod' : 'preview',
    title: String(record.title || '').trim() || 'Untitled on-chain survey',
    description: String(record.description || '').trim(),
    options: options.length ? options : ['Option A', 'Option B', 'Option C', 'Option D'],
    deploymentTxId: String(record.deploymentTxId || ''),
    deploymentTxHash: String(record.deploymentTxHash || ''),
    initializationTxId: String(record.initializationTxId || ''),
    initializationTxHash: String(record.initializationTxHash || ''),
    blockHeight: Number.isFinite(Number(record.blockHeight)) ? Number(record.blockHeight) : null,
    blockTimestamp: Number.isFinite(Number(record.blockTimestamp)) ? Number(record.blockTimestamp) : null,
  };
}

function sessionRecords() {
  if (typeof sessionStorage === 'undefined') return [];
  return parse(sessionStorage.getItem(STORAGE_KEY));
}

function configuredRecords() {
  return parse(import.meta.env?.VITE_AURA_SURVEY_CONTRACTS_JSON);
}

export function listKnownSurveys() {
  const deduped = new Map();
  [...configuredRecords(), ...sessionRecords()].map(normalize).filter(Boolean)
    .forEach((survey) => deduped.set(survey.contractAddress, survey));
  return [...deduped.values()];
}

export function findKnownSurvey(contractAddress) {
  return listKnownSurveys().find((survey) => survey.contractAddress === contractAddress) || null;
}

export function recordFinalizedSurvey(record) {
  const survey = normalize(record);
  if (!survey) throw new Error('Only an actual finalized Midnight contract address can be registered.');
  if (typeof sessionStorage !== 'undefined') {
    const records = sessionRecords().filter((existing) => existing.contractAddress !== survey.contractAddress);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([survey, ...records]));
  }
  return survey;
}
