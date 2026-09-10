# Images

The logo and brand banner are self-hosted locally in this folder.
Everything else (portfolio mockup photos, testimonial avatars) still
loads from Unsplash/randomuser.me by absolute URL, since those are
placeholder/stock images used for demo content.

## Local files in this folder

| File | Purpose |
|---|---|
| `logo.png` | Logo mark — nav, footer, favicons, chat avatar, hero badge, case study markers (512×512, from the source 2048×2048 artwork) |
| `banner.png` | Brand banner — hero watermark, footer watermark, footer banner (640×357, as provided) |
| `banner-og.png` | Open Graph / Twitter share image — logo + wordmark centered on a 1200×630 canvas matching the site's background, sized correctly for crisp link previews on social platforms |

The full favicon/PWA icon set (`favicon.ico`, 16/32px favicons, Apple
touch icon, Android Chrome icons, and the two maskable icons) is
generated from the same source logo and lives in `/favicon`.

## Remote images still in use

| Purpose | URL |
|---|---|
| Hero case-study card photo | `https://images.unsplash.com/photo-1547658719-da2b51169166` |
| Portfolio — Orbital Finance | `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c` |
| Portfolio — Northfield Goods | `https://images.unsplash.com/photo-1460925895917-afdab827c52f` |
| Portfolio — Quanta Health | `https://images.unsplash.com/photo-1600880292203-757bb62b4baf` |
| Portfolio — Voltiq Dashboard | `https://images.unsplash.com/photo-1551288049-bebda4e38f71` |
| Portfolio — Aeroloop Travel | `https://images.unsplash.com/photo-1512428813834-c702c7702b78` |
| Portfolio — Lumen Retail | `https://images.unsplash.com/photo-1551650975-87deedd944c3` |
| Case study deep-dive photos | `photo-1522071820081-009f0129c71c`, `photo-1563986768609-322da13575f3`, `photo-1441986300917-64674bd600d8` (all on `images.unsplash.com`) |
| Testimonial avatars | `https://randomuser.me/api/portraits/men/32.jpg`, `/men/56.jpg`, `/women/44.jpg`, `/women/68.jpg` |

Note: the Unsplash and randomuser.me images are placeholder/stock
photography used for portfolio mockups and testimonial avatars in the
demo content itself, not real client or team photos — swap them for
real assets when you have them, following the same pattern used for
the logo/banner above (drop the file in this folder, update the
`src`/`content` path in the relevant `.html` files).
