import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const contractPath = resolve('contracts/anonymous_survey.compact');

await access(contractPath, constants.R_OK);
const source = await readFile(contractPath, 'utf8');

const requiredFragments = [
  'pragma language_version',
  'export circuit initialize_survey',
  'export circuit cast_anonymous_vote',
  'witness eligibility_score',
  'assert(score >= req_threshold',
  'disclose(',
];

const missing = requiredFragments.filter((fragment) => !source.includes(fragment));
if (missing.length) {
  throw new Error(`Compact source validation failed. Missing: ${missing.join(', ')}`);
}

console.log(`Verified Compact source: ${contractPath}`);
