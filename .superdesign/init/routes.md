# Route map

Router configuration lives in `src/App.jsx`.

| URL | Component | Shared layout |
| --- | --- | --- |
| `/` | `src/pages/Home.jsx` | App + Navbar + canvas + footer |
| `/create` | `src/pages/CreateSurvey.jsx` | App shell |
| `/vote/:id` | `src/pages/CastVote.jsx` | App shell |
| `/survey/:id` | `src/pages/SurveyDetails.jsx` | App shell |
| `/explorer` | `src/pages/ZKCircuitExplorer.jsx` | App shell |
| `/settings` | `src/pages/NetworkSettings.jsx` | App shell |
| `/profile` | `src/pages/Profile.jsx` | App shell |
| `/contracts` | `src/pages/ContractExplorer.jsx` | App shell |
| `/credentials` | `src/pages/Credentials.jsx` | App shell |

The key product journeys are Home → Create Survey → Contract reservation; Network Settings → 1AM configuration → Preview faucet; and Profile → session activity.
