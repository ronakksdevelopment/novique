# Icons

All icons across the site (navigation, buttons, service cards,
portfolio stats, social links, the Nova chat widget, the custom
context menu, etc.) come from **Font Awesome 6.7.2**, loaded via CDN
in the `<head>` of `index.html`:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer">
```

Icons are used as inline `<i class="fa-solid fa-...">` / `<i class="fa-brands fa-...">`
elements throughout the markup, several with Font Awesome's built-in
animation classes (`fa-shake`, `fa-bounce`, `fa-beat`, `fa-fade`,
`fa-spin`) for the hand-drawn "wobble" feel used across the design.
There's also a custom SVG filter (`#sketchWobble` / `#sketchWobbleStatic`,
defined inline near the top of `<body>`) that distorts these icons
into a whiteboard-marker look — see `assets/css/style.css` for the
`filter: url(#sketchWobble)` rules that apply it.

No icon files were bundled in the original project — this folder is
kept as the designated home for icon assets (e.g. a self-hosted
Font Awesome kit, or standalone SVGs) if you choose to stop depending
on the CDN.

## Self-hosting Font Awesome (optional)

1. Download the Font Awesome 6.7.2 "Free" package (webfonts + CSS)
   from [fontawesome.com](https://fontawesome.com/download) or the
   [CDN's GitHub release](https://github.com/FortAwesome/Font-Awesome/releases/tag/6.7.2).
2. Place the `webfonts/` folder here (`assets/icons/webfonts/`) and
   the CSS bundle alongside it (e.g. `assets/icons/all.min.css`).
3. In `index.html`, replace the CDN `<link>` above with:
   ```html
   <link rel="stylesheet" href="assets/icons/all.min.css">
   ```
4. No other markup changes are needed — every `fa-*` class name stays
   the same.
