import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  eligibility_score(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  initialize_survey(context: __compactRuntime.CircuitContext<PS>,
                    title_hash_0: Uint8Array,
                    network_id_0: bigint,
                    threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_anonymous_vote(context: __compactRuntime.CircuitContext<PS>,
                      opt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  get_public_summary(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type ProvableCircuits<PS> = {
  initialize_survey(context: __compactRuntime.CircuitContext<PS>,
                    title_hash_0: Uint8Array,
                    network_id_0: bigint,
                    threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_anonymous_vote(context: __compactRuntime.CircuitContext<PS>,
                      opt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  get_public_summary(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initialize_survey(context: __compactRuntime.CircuitContext<PS>,
                    title_hash_0: Uint8Array,
                    network_id_0: bigint,
                    threshold_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  cast_anonymous_vote(context: __compactRuntime.CircuitContext<PS>,
                      opt_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  get_public_summary(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly poll_id: bigint;
  readonly poll_title_hash: Uint8Array;
  readonly active_network_id: bigint;
  readonly total_ballots_cast: bigint;
  readonly option_a_votes: bigint;
  readonly option_b_votes: bigint;
  readonly option_c_votes: bigint;
  readonly option_d_votes: bigint;
  readonly min_eligibility_threshold: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
