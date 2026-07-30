# Extractable components

## Navbar

- Source: `src/components/Navbar.jsx`
- Category: layout
- Description: Global sticky navigation with active route, network picker, wallet connection, and profile entry point.
- Extractable props: `activeRoute`, `activeNetwork`, `isConnected`, `walletLabel`.
- Hardcoded: AURA mark, navigation labels, Lucide icons, emerald/white styling.

## AppFooter

- Source: `src/App.jsx`
- Category: layout
- Description: Dark Midnight footer with protocol status and external Midnight/1AM links.
- Extractable props: none.
- Hardcoded: protocol label, status dot, link text, dark glass styling.

## StatusPill

- Source: repeated in `src/pages/NetworkSettings.jsx`, `src/pages/ContractExplorer.jsx`, and `src/pages/Profile.jsx`
- Category: basic
- Description: Small rounded state badge for connection, reservation, and environment status.
- Extractable props: `label`, `tone`.
- Hardcoded: mono typography, compact padding, semantic color treatments.
