# Components

This folder documents the reusable UI pieces that make up the NoviQue
site, extracted from `index.html` as standalone reference partials:

| File | What it is |
|---|---|
| `header.html` | Site header: logo, primary nav, "Start Project" CTA, mobile nav toggle |
| `footer.html` | Site footer: brand block, link columns, legal bar |
| `context-menu.html` | Custom right-click context menu + toast confirmation |
| `nova-chatbot.html` | Nova AI chat widget: launcher, chat window, FAQ quick-replies, history panel |

## Why these exist as separate files

NoviQue is a single-page site (all sections live on one page, navigated
via in-page anchors like `#services`, `#portfolio`, `#contact`). Plain
HTML has no native "include" or templating mechanism, so `index.html`
ships as one complete, self-contained file with this markup inlined —
that's what makes it work correctly when opened locally or served from
GitHub Pages with zero build step.

The files in this folder are **the same markup, kept here as the
single source of truth for each component**, so that:

- If you add more pages later, you can copy the exact header/footer
  markup from here instead of re-deriving it from `index.html`.
- If you introduce a build step (11ty, Astro, Jekyll includes, a small
  Node script, etc.), these are ready to wire up as real partials/includes.
- Anyone editing the header, footer, context menu, or chat widget has
  one clearly-documented place to understand what a component depends
  on (which CSS classes, which JS file, which element IDs are required).

Each file's top comment lists its dependencies (CSS selectors, JS
files, required element IDs) so you can safely reuse or restyle it.
