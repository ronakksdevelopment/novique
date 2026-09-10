# Pages

The original NoviQue site (`novique-main.zip`) is a **single-page
site**: every item in the top navigation — Home, Portfolio, Services,
Process, Pricing, About, Testimonials, FAQ, Contact — is an anchor
link (`#services`, `#portfolio`, `#contact`, etc.) that scrolls to a
`<section>` inside the one `index.html` file. There is no separate
`services.html`, `portfolio.html`, `about.html`, and so on in the
source project, and no routing between distinct pages.

Because of that, this folder is intentionally empty of generated
pages: creating standalone `pages/services.html`,
`pages/portfolio.html`, etc. that only duplicated content already on
`index.html` would introduce content that didn't exist in the original
site, change the navigation behavior (anchor scroll → full page
navigation), and risk drifting out of sync with the real source of
truth. That would work against the "exact same UI/UX/behavior, no
changes" requirement this project was rebuilt under.

**`index.html` at the project root is the entire site.** All sections,
all navigation, and all interactive features (portfolio filters, case
study accordion, FAQ accordion, testimonial carousel, contact form,
newsletter form, Nova chat widget, custom context menu, doodle cursor)
live there and work exactly as they did in the original file.

## If you want real multi-page navigation later

If you decide to split sections like Services, Portfolio, or About
into their own standalone pages, this is the folder to put them in.
A clean approach:

1. Copy the `<header>` and `<footer>` markup from `components/header.html`
   and `components/footer.html` into the new page.
2. Move the relevant `<section>` out of `index.html` into the new file
   under `pages/`, keeping its `id` if other links reference it.
3. Update the header nav links (in `index.html` and every page) to
   point at the new page instead of the in-page anchor — e.g. change
   `href="#services"` to `href="pages/services.html"` (and
   `href="../index.html#..."` for links back to root-level anchors
   from inside `pages/`).
4. Keep `assets/css/style.css` and the three files in `assets/js/`
   shared across every page via relative paths (`../assets/css/style.css`
   from inside `pages/`).

Doing this changes the site's navigation model (page loads instead of
smooth-scrolling to an anchor), so it's a deliberate design decision
rather than something this rebuild should do silently.
