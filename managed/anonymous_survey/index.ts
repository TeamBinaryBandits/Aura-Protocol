/**
 * Managed Compact Smart Contract Interface & Bindings
 * Generated for Midnight Network (Preview & Preprod)
 * Contract: AnonymousSurvey
 */

export interface ContractState {
  poll_id: number;
  poll_title_hash: string;
  active_network_id: number; // 1 = Preview, 2 = Preprod
  total_ballots_cast: number;
  option_a_votes: number;
  option_b_votes: number;
  option_c_votes: number;
  option_d_votes: number;
  min_eligibility_threshold: number;
}

export interface VoterWitness {
  secret_voter_key: string;
  selected_option: number;
  eligibility_score: number;
}

export interface CircuitOutputs {
  disclosed_hash?: string;
  success: boolean;
  nullifier: string;
  proof_hash: string;
}

export class AnonymousSurveyContract {
  state: ContractState;
  private usedNullifiers = new Set<string>();

  constructor(initialState?: Partial<ContractState>) {
    this.state = {
      poll_id: 1,
      poll_title_hash: "0x8f3c2a1b9e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      active_network_id: 1, // Preview by default
      total_ballots_cast: 42,
      option_a_votes: 18,
      option_b_votes: 14,
      option_c_votes: 7,
      option_d_votes: 3,
      min_eligibility_threshold: 75,
      ...initialState
    };
  }

  /**
   * Circuit: initialize_survey
   */
  async initialize_survey(titleHash: string, networkId: number, threshold: number): Promise<CircuitOutputs> {
    this.state.poll_title_hash = titleHash;
    this.state.active_network_id = networkId;
    this.state.min_eligibility_threshold = threshold;
    this.state.total_ballots_cast = 0;
    this.state.option_a_votes = 0;
    this.state.option_b_votes = 0;
    this.state.option_c_votes = 0;
    this.state.option_d_votes = 0;

    return {
      success: true,
      nullifier: "0x" + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      proof_hash: "0xzk_proof_" + Math.random().toString(36).substring(2, 15)
    };
  }

  /**
   * Circuit: cast_anonymous_vote
   * Evaluates private witness off-chain, enforces score >= threshold,
   * updates public tally without exposing voter secret.
   */
  async cast_anonymous_vote(witness: VoterWitness): Promise<CircuitOutputs> {
    if (witness.eligibility_score < this.state.min_eligibility_threshold) {
      throw new Error(`ZK Circuit Assertion Failed: Score ${witness.eligibility_score} is below required threshold ${this.state.min_eligibility_threshold}`);
    }

    if (!Number.isInteger(witness.selected_option) || witness.selected_option < 0 || witness.selected_option > 3) {
      throw new Error('ZK Circuit Assertion Failed: Selected option is outside the supported range.');
    }

    // The managed adapter is a deterministic local test double. Real Compact
    // bindings derive and store this nullifier inside the circuit/runtime.
    const nullifier = this.deriveDemoNullifier(witness.secret_voter_key);
    if (this.usedNullifiers.has(nullifier)) {
      throw new Error('ZK Circuit Assertion Failed: This voter nullifier was already used.');
    }

    // Update tally based on private choice
    if (witness.selected_option === 0) this.state.option_a_votes += 1;
    else if (witness.selected_option === 1) this.state.option_b_votes += 1;
    else if (witness.selected_option === 2) this.state.option_c_votes += 1;
    else this.state.option_d_votes += 1;

    this.state.total_ballots_cast += 1;

    this.usedNullifiers.add(nullifier);
    const proof_hash = "0xzk_proof_midnight_" + Math.random().toString(36).substring(2, 15);

    return {
      success: true,
      nullifier,
      proof_hash
    };
  }

  /**
   * Circuit: get_public_summary
   * Returns explicitly disclosed hash from export ledger
   */
  async get_public_summary(): Promise<string> {
    return this.state.poll_title_hash;
  }

  private deriveDemoNullifier(secret: string): string {
    let hash = 5381;
    for (const character of secret) {
      hash = ((hash * 33) ^ character.charCodeAt(0)) >>> 0;
    }
    return `0xnullifier_${hash.toString(16).padStart(8, '0')}`;
  }
}
