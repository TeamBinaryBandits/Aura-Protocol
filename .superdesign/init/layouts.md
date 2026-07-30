# Shared layouts

## App shell — `src/App.jsx`

`App` mounts React Router, the fixed canvas background, `Navbar`, route outlet, and Midnight footer. Every route uses this shell.

```jsx
<Router>
  <div className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
    <GhibliCanvas2D />
    <Navbar />
    <main className="pb-20"><Routes>{/* route map */}</Routes></main>
    <footer>{/* Midnight and 1AM links */}</footer>
  </div>
</Router>
```

## Navigation — `src/components/Navbar.jsx`

The navigation is a sticky, translucent white bar with emerald borders. Desktop routes are Dashboard, New Survey, Contracts & Hashes, ZK Badges, and Compact Circuit. Right-side controls expose sound, Preview/Preprod selection, profile, and 1AM connection.

The full implementation is `src/components/Navbar.jsx`; pass the complete file whenever a draft needs the app shell.
