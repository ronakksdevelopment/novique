# NoviQue — Designed to Inspire

Production-ready static site for **NoviQue**, an independent design
studio. This repository is a restructured, deployment-ready rebuild
of the original single-file handoff, with the **exact same UI, UX,
layout, colors, typography, spacing, responsiveness, animations,
interactions, content, and functionality** — nothing visual or
behavioral was changed, only the file organization.

🔗 Live reference design: solid black / dark-green / lime accent
theme, hand-drawn "whiteboard marker" aesthetic, Permanent Marker +
Kalam typography.

---

## Overview

- **Type:** Single-page marketing site with in-page anchor navigation
  (Home, Portfolio, Services, Process, Pricing, About, Testimonials,
  FAQ, Contact all live as sections on one page — see
  [`pages/README.md`](pages/README.md) for why, and how to split them
  into real separate pages later if you want to).
- **Stack:** Plain HTML5, CSS3, vanilla JavaScript (ES5-style,
  no framework, no build step, no dependencies to install).
- **Notable features:**
  - Responsive layout (mobile / tablet / desktop) with a mobile nav
    drawer
  - Scroll-triggered reveal animations and animated stat counters
  - Optional 3D hero scene via Spline (`<spline-viewer>` web
    component), with an automatic CSS-orb fallback if it fails to
    load or on narrow / reduced-motion / no-JS-custom-element setups
  - Portfolio category filter, case-study accordion, FAQ accordion,
    auto-advancing testimonial carousel
  - Custom-styled dropdowns, contact form, newsletter form (client-side
    only — see [Forms](#forms) below)
  - **Nova**, an AI chat widget with FAQ quick-replies, persistent
    chat history (via `localStorage`), and optional live AI answers
    through the OpenRouter API (see
    [Nova chatbot setup](#nova-chatbot-setup))
  - A custom right-click context menu (with long-press support on
    touch devices) and a hand-drawn "doodle" custom cursor on
    desktop/fine-pointer devices
  - Respects `prefers-reduced-motion` throughout

---

## Folder structure

```
.
├── index.html                  # The entire site (all sections, single page)
├── README.md                   # This file
├── .gitignore
│
├── assets/
│   ├── css/
│   │   └── style.css           # All site styles (extracted from the original inline <style>)
│   ├── js/
│   │   ├── main.js             # Core interactions: nav, reveal animations, counters,
│   │   │                       #   portfolio filter, accordions, carousel, forms,
│   │   │                       #   custom dropdowns, custom context menu, hero 3D fallback
│   │   ├── nova-chatbot.js     # Nova AI chat widget logic
│   │   ├── nova-config.example.js  # Template for your own OpenRouter key (copy → nova-config.js)
│   │   └── doodle-cursor.js    # Custom cursor engine (desktop only)
│   ├── images/
│   │   └── README.md           # Catalogue of remote image URLs used + self-hosting guide
│   ├── fonts/
│   │   └── README.md           # Google Fonts in use + self-hosting guide
│   └── icons/
│       └── README.md           # Font Awesome in use + self-hosting guide
│
├── components/                 # Reference copies of reusable markup (see components/README.md)
│   ├── README.md
│   ├── header.html             # Site header / primary nav
│   ├── footer.html             # Site footer
│   ├── context-menu.html       # Custom right-click context menu
│   └── nova-chatbot.html       # Nova chat widget markup
│
├── pages/
│   └── README.md               # Explains the single-page architecture + how to add real pages later
│
└── favicon/
    ├── favicon.ico
    ├── favicon.png
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── android-chrome-192x192.png
    └── android-chrome-512x512.png
```

### Why `index.html` alone contains the whole site

The original project handoff was a single `index.html` file with every
section, all CSS, and all JavaScript inlined. It is a true one-page
site: the top navigation links are anchors (`#services`, `#portfolio`,
`#contact`, ...) that smooth-scroll to sections already present on the
page, not links to separate documents. Splitting that into multiple
standalone HTML files would have meant either duplicating content into
pages that didn't exist in the source, or changing the navigation
behavior from smooth-scroll to full page loads — both of which are
functional/behavioral changes. Instead:

- All CSS and JS were moved out of `index.html` into `assets/css/` and
  `assets/js/` (no more inline `<style>`/`<script>` blocks with logic
  in them).
- The reusable pieces of markup (header, footer, chat widget, context
  menu) are documented as standalone components in `components/`, with
  their dependencies spelled out, so they're easy to reuse if you add
  more pages later.
- `pages/` and its README explain exactly how to do that split later,
  without guessing at content that doesn't exist yet.

---

## Local setup

No build tools, package managers, or installation required — it's
static HTML/CSS/JS.

**Option 1 — just open it:**

```bash
# from the project root
open index.html        # macOS
start index.html        # Windows
xdg-open index.html     # Linux
```

**Option 2 — serve it locally** (recommended, avoids any
`file://` quirks with relative paths and gives a more accurate preview
of how it'll behave when deployed):

```bash
# Python 3
python3 -m http.server 8000

# or Node (no install needed, via npx)
npx serve .
```

Then visit `http://localhost:8000`.

---

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
4. Select your default branch (e.g. `main`) and the **`/ (root)`**
   folder, then **Save**.
5. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/` within a minute or
   two. `index.html` at the repo root is picked up automatically as
   the site's entry point.

All internal references (`assets/css/style.css`, `assets/js/main.js`,
`favicon/favicon.ico`, etc.) use **relative paths**, so the site works
correctly whether it's served from a domain root or from a GitHub
Pages project subpath (`/<repo-name>/`) — no path rewriting needed.

### Using a custom domain

If you point a custom domain (e.g. `novique.design`, which is what the
site's meta tags already reference) at GitHub Pages, add a `CNAME`
file at the repo root containing just the domain name, and configure
your DNS per
[GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

---

## Nova chatbot setup

Nova (the chat widget in the bottom-right corner) works out of the box
for its built-in FAQ quick-replies (Services, Pricing, Timeline, Get
started) with zero configuration. Free-form questions typed by a
visitor are answered by an LLM via the
[OpenRouter](https://openrouter.ai) API.

> **Security note:** the original handoff had a live OpenRouter API
> key hardcoded directly in `nova-chatbot.js`. That key was **removed**
> before publishing, because any key embedded in client-side code
> shipped to a public repo is visible to everyone and will get
> abused/rate-limited almost immediately. In its place, the key is now
> loaded from a separate, gitignored config file (below) so it's easy
> to set locally and impossible to commit by accident.

**Without any setup**, Nova still opens, still answers the FAQ
quick-replies (Services, Pricing, Timeline, Get started) instantly,
and gracefully tells the visitor that live chat isn't connected yet
for anything else — it never breaks or throws errors. To make
free-form questions get real AI answers:

1. Get an API key from [openrouter.ai](https://openrouter.ai/keys).
2. Copy `assets/js/nova-config.example.js` to `assets/js/nova-config.js`
   (same folder) and put your key in it:
   ```js
   window.NOVA_USER_CONFIG = {
     apiKey: 'sk-or-v1-...',   // your key
     endpoint: 'https://openrouter.ai/api/v1/chat/completions',
     model: 'openrouter/free',
     // ...
   };
   ```
3. That's it — `index.html` already loads `assets/js/nova-config.js`
   (if present) right before `nova-chatbot.js`, so the key is picked
   up automatically. `assets/js/nova-config.js` is listed in
   `.gitignore`, so it will never get committed even if you `git add .`.
4. **For a real production deployment**, don't ship the key to the
   browser at all — even in a gitignored file, anyone can open
   dev tools and read it out of the page's network requests once the
   site is live. Instead, proxy the request through a small
   server-side function (a Cloudflare Worker, Netlify/Vercel function,
   or any lightweight backend) that holds the key server-side and
   forwards chat requests to OpenRouter, then point `endpoint` in
   `nova-config.js` at your own function instead of OpenRouter
   directly. The widget's request/response shape (`messages`,
   `max_tokens`, `temperature` in; `choices[0].message.content` out)
   is unchanged either way.

### If Nova seems "not working"

- **Only the FAQ quick-reply buttons respond, typed questions get a
  "live chat isn't connected yet" message** → expected with no
  `nova-config.js` yet. Follow the steps above.
- **The launcher button does nothing at all, or the window won't
  open** → that's not an API key issue. Check the browser console for
  errors, and confirm all three scripts are loading in order
  (`main.js`, then `nova-chatbot.js`, then `doodle-cursor.js` — see
  the end of `index.html`) and that `assets/js/nova-chatbot.js`
  returns a 200, not a 404, in the Network tab.
- **A typed question errors instead of falling back gracefully** →
  open the console; `nova-chatbot.js` logs the real HTTP status/response
  body from OpenRouter (via `console.error('[Nova] ...')`) before
  falling back, which usually points at an invalid/expired key or an
  OpenRouter-side rate limit rather than a bug in the widget itself.

---

## Forms

The **contact form** and **newsletter signup form** are front-end only
in this rebuild, exactly as they were in the original: submitting
shows a success state (and resets the form) but doesn't send data
anywhere. To make them functional, wire the `<form>` submit handlers
in `assets/js/main.js` (`contactForm` / `newsletterForm` sections) to
a real endpoint — a form backend (Formspree, Getform, Netlify Forms,
etc.) or your own API — instead of just calling `preventDefault()`.

---

## Third-party services this site depends on

| Service | Used for | Loaded from |
|---|---|---|
| Google Fonts | Permanent Marker, Kalam typefaces | `fonts.googleapis.com` / `fonts.gstatic.com` |
| Font Awesome 6.7.2 | All icons | `cdnjs.cloudflare.com` |
| Spline | Optional 3D hero scene | `unpkg.com/@splinetool/viewer` + `prod.spline.design` |
| Unsplash / randomuser.me / ibb.co | Portfolio photos, testimonial avatars, logo, banner | see [`assets/images/README.md`](assets/images/README.md) |
| OpenRouter | Nova chatbot's live AI answers (optional) | `openrouter.ai` |

See the READMEs in `assets/fonts/`, `assets/icons/`, and
`assets/images/` for how to self-host any of these if you'd rather not
depend on third-party CDNs at runtime.

---

## Accessibility & SEO

Preserved from the original exactly as authored:

- Semantic landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`,
  `<section aria-label="...">`)
- A "Skip to content" link as the first focusable element
- `aria-label`, `aria-expanded`, `aria-hidden`, `aria-haspopup`, and
  `role` attributes on interactive widgets (nav toggle, custom
  dropdowns, accordions, chat widget, context menu)
- Descriptive `alt` text on meaningful images, empty `alt=""` on
  decorative ones
- `prefers-reduced-motion` support disabling/softening animations,
  the custom cursor, and scroll-behavior site-wide
- Open Graph and Twitter Card meta tags, canonical URL, descriptive
  `<title>` and meta description, for link-preview and search-engine
  behavior identical to the original

---

## Browser support

Works in all evergreen browsers (Chrome, Firefox, Safari, Edge).
Progressive-enhancement fallbacks are already built in for:
`IntersectionObserver` (reveal animations / counters degrade to
"show immediately" if unsupported), `spline-viewer` (falls back to a
CSS orb scene), and `matchMedia('hover: hover')`/`pointer: fine`
(doodle cursor simply doesn't activate on touch devices).

---

## License / content notice

Portfolio project photography and testimonial avatars are stock/
placeholder images (Unsplash, randomuser.me) used for demo purposes in
the original design, not real client or team photos — replace them
with real assets before using this as an actual production site for a
real studio. See [`assets/images/README.md`](assets/images/README.md).
