import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AnonymousSurveyContract } from '../managed/anonymous_survey/index.ts';

describe('Compact Smart Contract State Tests', () => {
  it('should initialize ledger state with default Midnight network parameters', () => {
    const contract = new AnonymousSurveyContract();
    assert.equal(contract.state.poll_id, 1);
    assert.equal(contract.state.total_ballots_cast, 42);
    assert.equal(contract.state.active_network_id, 1); // 1 = Preview
  });

  it('should update public ledger state on survey initialization circuit', async () => {
    const contract = new AnonymousSurveyContract();
    const mockHash = '0xabc123';
    const res = await contract.initialize_survey(mockHash, 2, 80); // 2 = Preprod

    assert.equal(res.success, true);
    assert.equal(contract.state.poll_title_hash, mockHash);
    assert.equal(contract.state.active_network_id, 2);
    assert.equal(contract.state.min_eligibility_threshold, 80);
  });
});
