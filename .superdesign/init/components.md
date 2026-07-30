# Components

The app uses bespoke React/Tailwind components rather than a component library.

## `src/components/Navbar.jsx`

`Navbar` is the shared primary navigation and 1AM connection entry point. It renders the brand, route links, network picker, profile link, audio toggle, and wallet state.

```jsx
export default function Navbar() {
  // React state: location, wallet state, audio, network menu, connection state.
  // Renders a sticky white/emerald header with route links and wallet controls.
}
```

Full source is intentionally passed directly as `src/components/Navbar.jsx` to Superdesign drafts, so the source of truth stays the implemented component.

## `src/components/GhibliCanvas2D.jsx`

`GhibliCanvas2D` is the fixed, pointer-transparent canvas background. It draws the cream/sky/river scene, animated petals, and cursor ripples.

```jsx
export default function GhibliCanvas2D() {
  // Manages canvas sizing, scene drawing, animation frame and event cleanup.
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
}
```

## `src/components/Background3D.jsx`

`Background3D` is an unused alternative Three.js particle background. It is not part of the active app shell and should not be used by current-page designs.
