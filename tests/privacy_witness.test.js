import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnonymousSurveyContract } from '../managed/anonymous_survey/index.ts';

describe('Zero-Knowledge Witness & Disclose Bounds Tests', () => {
  it('should reject vote if private eligibility score is below required threshold', async () => {
    const contract = new AnonymousSurveyContract({ min_eligibility_threshold: 75 });
    
    await assert.rejects(
      async () => {
        await contract.cast_anonymous_vote({
          secret_voter_key: '0xsk_test_key_1',
          selected_option: 0,
          eligibility_score: 50 // Ineligible! (50 < 75)
        });
      },
      (err) => {
        assert.match(err.message, /ZK Circuit Assertion Failed/);
        return true;
      }
    );
  });

  it('should accept vote and generate ZK proof when eligibility score >= threshold', async () => {
    const contract = new AnonymousSurveyContract({ min_eligibility_threshold: 75 });
    
    const res = await contract.cast_anonymous_vote({
      secret_voter_key: '0xsk_test_key_valid',
      selected_option: 1,
      eligibility_score: 85 // Eligible!
    });

    assert.equal(res.success, true);
    assert.ok(res.nullifier.startsWith('0xnullifier_'));
    assert.ok(res.proof_hash.startsWith('0xzk_proof_'));
  });

  it('should reject a duplicate nullifier without storing voter identity in state', async () => {
    const contract = new AnonymousSurveyContract({ min_eligibility_threshold: 50 });
    const witness = {
      secret_voter_key: '0xsk_repeat_key',
      selected_option: 0,
      eligibility_score: 90
    };

    await contract.cast_anonymous_vote(witness);
    await assert.rejects(() => contract.cast_anonymous_vote(witness), /nullifier was already used/);
    assert.equal('secret_voter_key' in contract.state, false);
  });
});
