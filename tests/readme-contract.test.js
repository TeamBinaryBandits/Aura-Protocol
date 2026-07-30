import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

describe('submission contract evidence', () => {
  it('keeps the README contract reference aligned with the committed Compact source', async () => {
    const contractPath = 'contracts/anonymous_survey.compact';
    const readme = await readFile('README.md', 'utf8');

    await access(contractPath, constants.R_OK);
    assert.match(readme, /contracts\/anonymous_survey\.compact/);
    assert.doesNotMatch(readme, /contracts\/veil-allowlist\.compact/);
  });
});
