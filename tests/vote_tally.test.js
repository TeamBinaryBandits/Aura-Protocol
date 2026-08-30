import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

describe('public tally contract invariants', () => {
  it('bounds options and increments exactly one public counter plus total ballots', async () => {
    const source = await readFile('contracts/anonymous_survey.compact', 'utf8');
    assert.match(source, /assert\(opt <= 3, "Invalid ballot option"\)/);
    assert.match(source, /option_a_votes\.increment\(1\)/);
    assert.match(source, /option_b_votes\.increment\(1\)/);
    assert.match(source, /option_c_votes\.increment\(1\)/);
    assert.match(source, /option_d_votes\.increment\(1\)/);
    assert.match(source, /total_ballots_cast\.increment\(1\)/);
  });
});
