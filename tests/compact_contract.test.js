import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

describe('compiled Compact contract evidence', () => {
  it('keeps the mandatory Compact source and generated compiler output committed', async () => {
    await Promise.all([
      access('contracts/anonymous_survey.compact', constants.R_OK),
      access('managed/anonymous_survey/contract/index.js', constants.R_OK),
      access('managed/anonymous_survey/compiler/contract-info.json', constants.R_OK),
      access('managed/anonymous_survey/keys/initialize_survey.prover', constants.R_OK),
      access('managed/anonymous_survey/zkir/initialize_survey.bzkir', constants.R_OK),
    ]);
  });

  it('matches the compiler-generated circuit and witness surface', async () => {
    const info = JSON.parse(await readFile('managed/anonymous_survey/compiler/contract-info.json', 'utf8'));
    assert.equal(info['language-version'], '0.23.0');
    assert.deepEqual(info.circuits.map((circuit) => circuit.name), ['initialize_survey', 'cast_anonymous_vote', 'get_public_summary']);
    assert.equal(info.circuits.every((circuit) => circuit.proof), true);
    assert.deepEqual(info.witnesses.map((witness) => witness.name), ['eligibility_score']);
  });
});
