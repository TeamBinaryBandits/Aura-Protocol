# Theme

## Compact token summary

- Fonts: Plus Jakarta Sans / Inter (`sans`); Fira Code (`mono`).
- Canvas/background: `#f7f4ef` paper, sky `#e0f2fe`, river cyan, emerald landscape.
- Primary interaction: emerald 700 `#047857` through emerald 500 `#10b981`.
- Supporting network color: sky/indigo for Preview, violet/purple for Preprod.
- Base text: Slate 900/800; light cards use white with slate 200 borders.
- Radius: cards `rounded-3xl`, controls `rounded-xl` or `rounded-2xl`.
- Shadows: subtle `shadow-sm` on paper cards; available glow tokens for dark technical panels.
- Responsive breakpoints: Tailwind defaults (`sm`, `md`, `lg`).

## Raw Tailwind source

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: { midnight: { 950: '#060913', 900: '#0b0f19', 850: '#111827', 800: '#161f33', 700: '#1e293b', 600: '#334155', accent: '#6366f1', emerald: '#10b981', cyan: '#06b6d4', purple: '#8b5cf6' } },
    fontFamily: { sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'], mono: ['Fira Code', 'JetBrains Mono', 'monospace'] },
    boxShadow: { 'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.4)', 'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)', 'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)', glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }
  } }, plugins: []
}
```

## Raw global CSS

```css
body { background: #f7f4ef; color: #1e293b; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #ede7dd; }
::-webkit-scrollbar-thumb { background: #a7f3d0; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #34d399; }
```
