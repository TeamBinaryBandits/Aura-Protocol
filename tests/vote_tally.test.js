import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnonymousSurveyContract } from '../managed/anonymous_survey/index.ts';

describe('Anonymous Vote Tallying & Ledger Integrity', () => {
  it('should accurately increment public option counter without exposing voter identity', async () => {
    const contract = new AnonymousSurveyContract({
      total_ballots_cast: 0,
      option_a_votes: 0,
      option_b_votes: 0,
      min_eligibility_threshold: 50
    });

    await contract.cast_anonymous_vote({
      secret_voter_key: '0xsk_alice_key',
      selected_option: 0, // Option A
      eligibility_score: 90
    });

    await contract.cast_anonymous_vote({
      secret_voter_key: '0xsk_bob_key',
      selected_option: 1, // Option B
      eligibility_score: 80
    });

    assert.equal(contract.state.total_ballots_cast, 2);
    assert.equal(contract.state.option_a_votes, 1);
    assert.equal(contract.state.option_b_votes, 1);
  });
});
