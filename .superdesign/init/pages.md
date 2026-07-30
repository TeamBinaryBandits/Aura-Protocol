# Key page dependencies

## `/` — Home

- `src/pages/Home.jsx`
  - `react-router-dom` links
  - `lucide-react` icons

Hero, network/stat cards, filters, and demo survey cards. It is the visual anchor for the paper-and-emerald dashboard style.

## `/settings` — Network settings

- `src/pages/NetworkSettings.jsx`
  - `src/services/midnight.js`

Network selection, verified Preview faucet entry point, 1AM connection state, and DUST safety buffer.

## `/contracts` — Contract reservations

- `src/pages/ContractExplorer.jsx`
  - `src/services/midnight.js`

Server-issued reservation list with an explicit non-on-chain status.

## `/profile` — Wallet activity

- `src/pages/Profile.jsx`
  - `src/services/midnight.js`

Account summary, balances from connector state, faucet link, and session activity.

## `/create` — Survey creation

- `src/pages/CreateSurvey.jsx`
  - `src/services/gemini.js`
  - `src/services/midnight.js`
  - `src/pages/Home.jsx` (in-memory demo list)

## `/vote/:id` — Voting

- `src/pages/CastVote.jsx`
  - `src/services/midnight.js`
  - `src/pages/Home.jsx`
