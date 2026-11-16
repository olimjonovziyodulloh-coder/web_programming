# Project instructions

## Default visual theme

Every page in this repository uses the **Spider-Man / Iron Man archive theme**. When building or restyling any task page, exercise page, report or sub-site, match this theme by default — no need to ask.

Canonical references (source of truth):

- `index.html` — course archive home, full theme implementation
- `week10/task1.html` — long-form evidence/report page in the same theme
- `webpro-w9/index.html`, `webpro-w9/404.html` — standalone card pages in the same theme

Copy the CSS and SVG markup from those files rather than inventing new values.

### Palette

```css
--bg:#0e0d0f;
--panel:#161416;
--panel-hi:#1d1a1c;
--line:#2e2729;
--crimson:#9c2b2b;
--crimson-deep:#5e1c1f;
--gold:#b8924f;
--gold-soft:#8d7240;
--gold-light:#d9b877;
--text:#e6e1db;
--muted:#8f8a86;
--reactor:#6fa8b8;
--blue:#2c4a86;
--blue-deep:#17284a;
--web:#8fa0c4;
```

### Typography

- Headings, badges, buttons, labels: `"Rajdhani","Arial Narrow",Arial,sans-serif`, weight 600/700, slight letter-spacing.
- Body, code, captions: `"Inter",Arial,Helvetica,sans-serif`.
- Load with preconnect + `preload`/`onload` stylesheet swap and a `<noscript>` fallback:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500&display=swap"></noscript>
```

### Motifs

- `body::before` — fixed radial gradients: crimson glow top-right, blue glow bottom-left.
- Spider web SVG (`.web`) — 300×300, top-left of the header or fixed to the viewport corner, opacity ~0.14–0.16, `stroke: var(--web)`.
- Arc reactor SVG (`.reactor`) — 400×400, right side of the header, opacity ~0.22, `stroke: var(--reactor)`, slow-spinning dashed ring (`120s linear infinite`).
- Corner brackets on panels (`.module`, `main`) via `::before` / `::after`, 14px, 2px solid `var(--gold-soft)`, gold on hover.
- Clipped number/badge chips: `clip-path: polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)`.
- Accent alternation: odd items crimson (`--crimson-deep` background, `--crimson` border), even items blue (`--blue-deep` / `--blue`).
- Links gold (`--gold`), hover `--gold-light`.
- Terminal/code blocks: `#09080a` background, `1px solid var(--line)`, 4px radius.

### Accessibility rules (non-negotiable)

- Keep Lighthouse **Accessibility / Best Practices / SEO at 100** on every page touched. Re-run it after any restyle.
- Body text on panels must be `#a8a29b` or lighter; `--muted` (`#8f8a86`) is for captions/footers only.
- Never leave text at 4.5:1 contrast or below — this theme is dark, so check inline `code` inside captions.
- Visible focus ring on every interactive element: `outline:2px solid var(--gold); outline-offset:3px`.
- Keep the skip link, `lang`, page `<title>`, meta description, and `prefers-reduced-motion` block that disables the reactor spin and transitions.
- No horizontal scroll at 320px–1440px.

### Scope rule

Re-theming must not change content, structure, link targets or wording. Theme only — markup order, headings, text and URLs stay as they are unless the user explicitly asks for content changes.
