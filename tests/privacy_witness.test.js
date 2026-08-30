import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('selective disclosure boundary', () => {
  it('keeps eligibility as a Compact witness and rejects ineligible proofs', async () => {
    const source = await readFile('contracts/anonymous_survey.compact', 'utf8');
    assert.match(source, /witness eligibility_score\(\): Uint<32>;/);
    assert.match(source, /assert\(score >= req_threshold/);
  });

  it('documents and implements the option disclosure required for public tallies', async () => {
    const source = await readFile('contracts/anonymous_survey.compact', 'utf8');
    assert.match(source, /export circuit cast_anonymous_vote\(opt: Uint<8>\)/);
    assert.match(source, /const public_opt: Uint<8> = disclose\(opt\);/);
    assert.match(source, /This is selective disclosure, not a secret-ballot contract\./);
  });
});
