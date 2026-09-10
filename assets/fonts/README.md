# Fonts

The site uses two Google Fonts, loaded via a CDN `<link>` in the
`<head>` of `index.html` (and documented as a dependency in the
component files under `components/`):

| Font | Weights | Used for | CDN link |
|---|---|---|---|
| Permanent Marker | 400 | Display / headline text (`--font-display`) | `https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Kalam:wght@400;700&display=swap` |
| Kalam | 400, 700 | Body text (`--font-body`) | (same link, combined request) |

No font files were bundled in the original project — this folder is
kept as the designated home for font files if you choose to
self-host them instead of depending on Google's CDN.

## Self-hosting these fonts (optional)

Self-hosting removes the `fonts.googleapis.com` / `fonts.gstatic.com`
network dependency (useful for offline demos, stricter CSPs, or GDPR/
privacy requirements around third-party font requests).

1. Download the `.woff2` files for Permanent Marker (400) and Kalam
   (400, 700) — e.g. via [google-webfonts-helper](https://gwfh.mranftl.com/fonts)
   — into this folder.
2. Add `@font-face` rules at the top of `assets/css/style.css`:
   ```css
   @font-face {
     font-family: 'Permanent Marker';
     src: url('../fonts/permanent-marker-v16-latin-regular.woff2') format('woff2');
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }
   @font-face {
     font-family: 'Kalam';
     src: url('../fonts/kalam-v17-latin-regular.woff2') format('woff2');
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }
   @font-face {
     font-family: 'Kalam';
     src: url('../fonts/kalam-v17-latin-700.woff2') format('woff2');
     font-weight: 700;
     font-style: normal;
     font-display: swap;
   }
   ```
3. Remove the Google Fonts `<link rel="preconnect">` and
   `<link href="https://fonts.googleapis.com/css2?...">` tags from
   `index.html`'s `<head>`.
4. Leave the `--font-display` / `--font-body` CSS variables in
   `assets/css/style.css` untouched — they already reference these
   exact font names, so no other CSS needs to change.
