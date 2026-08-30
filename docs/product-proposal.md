# AURA product proposal — selective-disclosure eligibility surveys

## Proposed idea

Build a Midnight dApp for community and partner surveys where a participant proves that they meet a private eligibility threshold without publishing the underlying score, credential, wallet secret, or proof preimage.

## User problem

Communities often need a public, auditable tally while restricting participation to members, grant recipients, verified developers, or other eligible groups. Conventional web forms collect identity and eligibility data centrally; open polls invite spam.

## MVP scope

1. A survey creator deploys a Compact contract through 1AM.
2. Midnight records a title commitment, network selection, threshold, participant count, and public tally counters.
3. A future approved credential issuer gives holders a private, holder-bound eligibility witness.
4. 1AM proves the witness locally and submits a wallet-authorized transaction.
5. AURA reads final public state from the user-selected Midnight indexer.

## Privacy model and non-goals

The current contract provides selective disclosure for `eligibility_score()`: the proof enforces a threshold without exposing the score. It deliberately discloses `opt` to update public tally counters. Therefore this MVP is appropriate only for public-choice surveys; it is not an anonymous election or secret-ballot solution.

The release gate for voting is an issuer-backed credential integration with holder binding, expiry/revocation checks, anti-replay/nullifier design, and independent security review. Until that exists, the app refuses to fabricate credentials or submit a “demo ballot.”

## Success criteria

- A Preview/Preprod deployment is finalized via 1AM and recorded with its actual address and hashes.
- The public indexer state matches the contract ledger.
- Tests validate the Compact artifact, witness/disclosure boundary, tally invariants, and wallet surface.
- The Vercel UI never displays mock chain data as if it were live.

## Approval request

Submit this proposal against the matching selective-disclosure / privacy-preserving survey idea in the provided idea list. Record the approval link or issue in the repository once it is granted; it cannot truthfully be claimed before then.
