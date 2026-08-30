import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const contractPath = resolve('contracts/anonymous_survey.compact');
const artifactInfoPath = resolve('managed/anonymous_survey/compiler/contract-info.json');

await access(contractPath, constants.R_OK);
const source = await readFile(contractPath, 'utf8');

const requiredFragments = [
  'pragma language_version',
  'export circuit initialize_survey',
  'export circuit cast_anonymous_vote',
  'witness eligibility_score',
  'assert(score >= req_threshold',
  'const public_opt: Uint<8> = disclose(opt);',
  'This is selective disclosure, not a secret-ballot contract.',
];

const missing = requiredFragments.filter((fragment) => !source.includes(fragment));
if (missing.length) {
  throw new Error(`Compact source validation failed. Missing: ${missing.join(', ')}`);
}

const compilerInfo = JSON.parse(await readFile(artifactInfoPath, 'utf8'));
const circuitNames = compilerInfo.circuits?.map((circuit) => circuit.name) || [];
const witnessNames = compilerInfo.witnesses?.map((witness) => witness.name) || [];
for (const expected of ['initialize_survey', 'cast_anonymous_vote', 'get_public_summary']) {
  if (!circuitNames.includes(expected)) throw new Error(`Generated Compact artifact is missing circuit: ${expected}`);
}
if (!witnessNames.includes('eligibility_score')) throw new Error('Generated Compact artifact is missing eligibility_score witness.');

console.log(`Verified Compact source and generated artifact: ${contractPath}`);
