# Whole Hum website

The static site for **https://wholehum.github.io/**. It's plain HTML and CSS, with no build step, no JavaScript framework and no tracking. Fonts (Poppins, under the SIL Open Font License; see `assets/fonts/OFL.txt`) are self-hosted, so the site never contacts Google Fonts.

```
index.html                         Home: hero, intro, Latest session slot, 5 uses
about.html                         About, social links, contact, AI disclosure
sessions/432hz-deep-sleep.html     Session #1 (DRAFT: noindex until the video is live)
sessions/_template.html            Copy this for every new session
learn/what-is-432hz.html           Explainer
learn/what-are-binaural-beats.html Explainer
404.html  robots.txt  sitemap.xml  site.webmanifest  favicon.ico  .nojekyll
assets/css/style.css   assets/fonts/*.woff2   assets/img/*
```

## Preview locally

```bash
cd site && python3 -m http.server 8000
# open http://localhost:8000/
```

## Publish on GitHub Pages (free)

1. Create a free GitHub account with the username **wholehum**. The site address comes from the username (`https://<username>.github.io/`).
2. Create a **public** repository named exactly **`wholehum.github.io`**.
3. Upload the *contents* of this `site/` folder to the repo root. You can use **Add file → Upload files** in the browser, or run:
   ```bash
   cd site
   git init -b main && git add . && git commit -m "Launch Whole Hum site"
   git remote add origin https://github.com/wholehum/wholehum.github.io.git
   git push -u origin main
   ```
4. Go to repo **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, then Branch to **main** with folder **/ (root)**. Within a few minutes the site is live at https://wholehum.github.io/.
5. Make sure **Enforce HTTPS** is ticked.

**If the username isn't `wholehum`**, find and replace `https://wholehum.github.io/` in every `.html` file, `sitemap.xml` and `robots.txt` with the real address. These are the canonical, Open Graph and JSON-LD URLs. Page-to-page links are relative and need no changes.

## Google Search Console

1. In Search Console, add a **URL-prefix** property: `https://wholehum.github.io/`.
2. Choose the **HTML tag** method and copy the `<meta name="google-site-verification" ...>` tag.
3. Paste it into the `<head>` of `index.html` (right after `<meta name="viewport">`), commit, wait for Pages to redeploy, then click **Verify**.
4. Submit `https://wholehum.github.io/sitemap.xml` under **Sitemaps**.

## When video #1 goes live (session page checklist)

Edit `sessions/432hz-deep-sleep.html` and `index.html`:

1. **Embed:** replace the `<div class="video placeholder"> … </div>` block with the iframe shown in the comment just above it, and swap `VIDEO_ID` (the part after `watch?v=`) and `VIDEO TITLE`. Do this on **both** pages (home "Latest session" and the session page).
2. **JSON-LD** (the `"@type": "VideoObject"` block in `<head>`): replace every `VIDEO_ID` and set `uploadDate` to the publish date, for example `2026-10-27T18:00:00-04:00`. Adjust `duration` (ISO 8601, e.g. `PT3H`, `PT2H30M`) if the final cut differs.
3. Check the sound description matches the final mix (96 Hz left / 99 Hz right = 3 Hz, crystal bowls, rain, 3 hours).
4. **Go live in search:** delete `<meta name="robots" content="noindex, follow">` from the session page, and uncomment its `<url>` entry in `sitemap.xml`.
5. Optional: test the page with Google's Rich Results Test (https://search.google.com/test/rich-results).

## Add a new session page

1. Copy `sessions/_template.html` to `sessions/<slug>.html`. Use a short, keyword-rich slug, e.g. `528hz-morning-calm.html`.
2. Search for ALL-CAPS placeholders and replace them:
   - `<title>`: about 50–65 characters, ending in `| Whole Hum`.
   - `<meta name="description">`, `og:description`, `twitter:description`: 120–155 characters, unique per page.
   - `canonical` and `og:url`: `https://wholehum.github.io/sessions/<slug>.html`.
   - `og:title` and `twitter:title`: same as `<title>`.
   - JSON-LD `name`, `description`, `duration`, `uploadDate`, and `VIDEO_ID` (×3).
   - The body: H1, the "What you'll hear" paragraph, listening tips, and the frequency explanation (neutral, sourced, **no health claims**).
3. Replace the video placeholder with the iframe (see the comment in the file).
4. Optional: add a page-specific 1200×630 share image in `assets/img/` and point `og:image` / `twitter:image` to it.
5. Once the video is live, remove the `noindex` line.
6. Add the page to `sitemap.xml` with today's `<lastmod>`.
7. Update the home page's **Latest session** block (headline, blurb, link and embed). If you want, also point the **Sessions** nav link in every page's header to the newest session.
8. Commit and push. Pages redeploys automatically.

## Writing rules (keep these)

- No health or medical claims ("heals", "cures", "treats", "repairs DNA", and so on). Describe the sound and cite sources for facts.
- Keep the not-medical-advice note and the footer disclosure: *Sound and visuals are made with original and AI-assisted tools. Whole Hum is for relaxation and wellbeing and isn't medical advice.*
- Every image needs meaningful `alt` text (use `alt=""` only for purely decorative images).

## Notes

- `tools/build_site.py`, outside this folder, is the one-off script that first generated these pages. You don't need it to publish or edit; edit the HTML directly.
- The canonical page for the home page is `https://wholehum.github.io/` (not `/index.html`).
