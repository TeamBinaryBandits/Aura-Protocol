# AURA — Midnight private-survey workspace

AURA is a React/Vite interface for exploring private survey flows on Midnight Preview and Preprod. It includes the Compact source, a local contract adapter for fast tests, a verified Preview faucet route, and a 1AM connector boundary.

## What is real, what is demo

- `contracts/anonymous_survey.compact` is included in this repository and is the source of truth for the survey circuit.
- `managed/anonymous_survey/index.ts` is a deterministic local test adapter. It is not a substitute for generated Compact bindings or a deployed contract.
- 1AM is detected from its injected connector and is never replaced by a fabricated production wallet account.
- Contract identifiers come from the server-side `/api/contract-address` endpoint. They are **15-minute reservations**, not live on-chain contract addresses. A canonical address must come back from a wallet-authorized Midnight deployment.
- Local Vite development enables a clearly labelled demo path by default. Vercel production keeps it off unless `VITE_AURA_DEMO_MODE=true` is configured deliberately.

## Contract evidence

The mandatory Compact source is committed at:

```text
contracts/anonymous_survey.compact
```

The repository also includes explicit test coverage for contract behavior and the browser deployment surface:

```text
tests/compact_contract.test.js
tests/privacy_witness.test.js
tests/vote_tally.test.js
tests/contract-address.test.js
tests/rendered-html.test.mjs
```

`npm run contract:check` ensures the Compact source exists and has the expected circuits, witnesses, assertion, and disclosure boundary before tests/build run. Use your installed Midnight Compact toolchain to generate production bindings from `contracts/anonymous_survey.compact`; do not treat the local adapter as compiler output.

## Local development and CI

```bash
npm ci
npm run contract:check
npm test
npm run build
npm run dev
```

The GitHub Actions workflow performs these local quality checks only. It does not deploy. This keeps CI independent from Vercel while still validating the committed Compact source, API behavior, tests, and Vite build.

## 1AM, Preview faucet, and DUST buffer

1. Install and unlock [1AM Wallet](https://chromewebstore.google.com/detail/1am/bphnkdkcnfhompoegfpgnkidcjfbojjp).
2. Set the same network in 1AM and AURA.
3. For Preview, use the [Preview tNIGHT faucet](https://faucet.preview.midnight.network) with the appropriate unshielded Preview address. Register received tNIGHT in the wallet to generate tDUST.
4. AURA retains a configurable DUST buffer before its local demo flow. The default is `30` DUST in addition to a `12` DUST transaction estimate. The wallet’s own fee/sponsorship decision remains authoritative.

Copy `.env.example` to `.env.local` to override local behavior:

```dotenv
VITE_AURA_DEMO_MODE=false
VITE_MIDNIGHT_DUST_BUFFER=30
```

## Vercel

`vercel.json` builds the Vite app and preserves client-side routes. The `api/contract-address.js` Vercel Function uses Node’s CSPRNG to create non-cacheable contract reservations; no wallet key or secret is accepted by that endpoint.

Before enabling live transactions in Vercel, compile the Compact source with the version of the Midnight toolchain you deploy against, add the generated client binding, and route the wallet-approved deployment result back to AURA. Never promote a reservation or demo transaction as an on-chain confirmation.
