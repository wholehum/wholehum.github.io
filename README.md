# Whole Hum website

The static site for **https://wholehum.github.io/**. It's plain HTML and CSS, with no build step and no JavaScript framework. Scripts: the Somatic Reset Space breathing pacer (inline at the bottom of `index.html`), the analytics tags described under **Analytics and privacy** below, and `assets/js/analytics.js` (consent banner, privacy-page switch, custom events). The site's content works without JavaScript. Fonts (Poppins, under the SIL Open Font License; see `assets/fonts/OFL.txt`) are self-hosted, so the site never contacts Google Fonts.

```
index.html                         Home: hero, intro, Latest session slot, breathing pacer, 5 uses
about.html                         About, social links, contact, AI disclosure
privacy.html                       Privacy: what analytics we use, retention, opt-out, contact
links/index.html                   Redirect only: /links/ -> home page (noindex, canonical home, not in sitemap)
sessions/432hz-deep-sleep.html     Session #1 (DRAFT: noindex until the video is live)
learn/what-is-432hz.html           Explainer
learn/what-are-binaural-beats.html Explainer
404.html  robots.txt  sitemap.xml  site.webmanifest  favicon.ico  .nojekyll
assets/css/style.css   assets/js/analytics.js   assets/js/links.js   assets/fonts/*.woff2   assets/img/*
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

## Analytics and privacy

Two analytics tools run on **every page** (including `404.html`; the session template `/workspace/wholehum/site-templates/session-template.html` carries them too, so pages copied from it get them automatically):

1. **Cloudflare Web Analytics** (cookieless). The beacon `<script>` sits just before `</body>`.
2. **Google Analytics 4**, Measurement ID `G-04TF991ZRR` (property 560375939, under wholehum@gmail.com). Property settings: Google signals off, data retention 14 months, no Google Ads links. Keep it that way, or update `privacy.html` first.

**The GA4 block in `<head>`** (right after `<meta name="viewport">`, between `<!-- Google Analytics 4 ... -->` and `<!-- End Google Analytics -->`) must be identical on every page. In order, it:
- sets Consent Mode v2 defaults: `ad_storage`, `ad_user_data` and `ad_personalization` **denied** everywhere; `analytics_storage` **granted** by default, but **denied** (with `wait_for_update: 500`) in the EEA, UK and Switzerland via the `region` list;
- sets `ads_data_redaction`;
- if the visitor's time zone is European (`Europe/*`, Iceland, Canary/Madeira/Azores/Faroe, Cyprus), sets `window.whNeedsConsent` and keeps analytics denied until they answer the banner (time zone is the only reliable client-side hint that doesn't need a third-party lookup; Google applies the region defaults itself by IP);
- applies a saved choice from `localStorage['wh-analytics-consent']` (`granted` / `denied`). An explicit `denied` also sets `window['ga-disable-G-04TF991ZRR'] = true`, so Google Analytics sends nothing at all;
- for those likely European visitors (time zone, above) uses **Consent Mode basic**: `window.whGaHold` is set unless the saved choice is `granted`, so `gtag.js` is **not loaded at all** (no request to Google, no cookieless pings) and `gtag('event', …)` calls are dropped rather than queued. Accept (banner or privacy switch) calls `window.whLoadGA()`, which loads `gtag.js` then; Decline keeps it unloaded on this and later visits;
- runs `gtag('config', 'G-04TF991ZRR', {allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: 34128000 /* 13 months */, cookie_flags: 'SameSite=Lax;Secure'})`, then (everyone else, as before) loads `gtag.js` async via `window.whLoadGA()` (a script element added from the inline block; there is no separate `<script src>` tag).

**`assets/js/analytics.js`** (loaded with `defer` just before the Cloudflare beacon; path `../assets/js/analytics.js` in `learn/` and `sessions/`, `/assets/js/analytics.js` in `404.html`):
- shows the consent banner (Accept / Decline, keyboard accessible, site colours) only when `whNeedsConsent` is set and no choice is saved; saves the choice and calls `gtag('consent', 'update', …)`, and on Accept `window.whLoadGA()`;
- drives the **Turn off Google Analytics on this site** switch on `privacy.html` (`#ga-toggle`);
- sends a `youtube_click` event (`link_url` without query string or fragment, `link_platform: 'youtube'`, `link_position: 'content'`; only after consent) for clicks on links to youtube.com / youtu.be (except links with `data-link-platform` when `links.js` is loaded; those are counted by `links.js`).

The breathing pacer script in `index.html` sends `breath_pacer_start` once per page view, on the first Start. **`assets/js/links.js`** (on every page, before `analytics.js`) sends `select_content` (`content_type: 'bio_link'`, `content_id`, `link_platform`, `link_position`, `link_url`) for clicks on any link with a `data-link-platform` attribute: the social icon band under the header (`data-link-position="band"`) and the footer Google Site and email links (`"footer"`). It sets `window.whLinkEvents`, and `analytics.js` then skips those links, so a YouTube band click is one event, not two. Band links carry `utm_source=wholehum_site&utm_medium=bio_link&utm_campaign=social_band&utm_content=<platform>`; the footer Google Site link uses `utm_campaign=site_footer&utm_content=google_site` (no UTM on the mailto). The same script pins and shrinks the header + band after ~24px of scroll (`.is-compact`, IntersectionObserver sentinel, no layout shift). The old `/links/` bio page (campaign `links_page`) is now a redirect to the home page. GA4 enhanced measurement covers page views, scrolls and outbound clicks. To see `link_url` in reports, register it as an event-scoped custom dimension in GA4 (Admin → Custom definitions).

**Rules:** every new page needs the GA4 head block, the `links.js` and `analytics.js` tags, the Cloudflare beacon and the footer **Privacy** link (copying the session template gives you all four). If you add any new tracking, cookies, embeds or third-party services, update `privacy.html` (and its "Updated" date) in the same commit. Never turn on Google signals, Ads links or ad personalisation without updating the privacy page and the consent defaults.

## When video #1 goes live (session page checklist)

Edit `sessions/432hz-deep-sleep.html` and `index.html`:

1. **Embed:** replace the `<div class="video placeholder"> … </div>` block with the iframe shown in the comment just above it, and swap `VIDEO_ID` (the part after `watch?v=`) and `VIDEO TITLE`. Do this on **both** pages (home "Latest session" and the session page).
2. **JSON-LD** (the `"@type": "VideoObject"` block in `<head>`): replace every `VIDEO_ID` and set `uploadDate` to the publish date, for example `2026-10-27T18:00:00-04:00`. Adjust `duration` (ISO 8601, e.g. `PT3H`, `PT2H30M`) if the final cut differs.
3. Check the sound description matches the final mix (96 Hz left / 99 Hz right = 3 Hz, crystal bowls, rain, 3 hours).
4. **Go live in search:** delete `<meta name="robots" content="noindex, follow">` from the session page, and uncomment its `<url>` entry in `sitemap.xml`.
5. Optional: test the page with Google's Rich Results Test (https://search.google.com/test/rich-results).

## Add a new session page

1. Copy the session template `/workspace/wholehum/site-templates/session-template.html` (kept outside this repo so it is never published; GitHub Pages serves every file in the repo because of `.nojekyll`) to `sessions/<slug>.html`. Use a short, keyword-rich slug, e.g. `528hz-morning-calm.html`.
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

## Links on everything (rule)

**Every new page and every video description must include the full Whole Hum link set below.** The master list lives in `/workspace/wholehum/brand/links.md` (it also has the ready-to-paste block for video descriptions). If a link changes, update `links.md` first, then the footer on every page (including `404.html`, `privacy.html` and the session template `/workspace/wholehum/site-templates/session-template.html`), the About page's "Find Whole Hum" list, the social icon band in every page's header (keep the UTM tags and `data-link-*` attributes), the `sameAs` list in `index.html`, and `SOCIAL` in `tools/build_site.py`.

- YouTube: https://www.youtube.com/@wholehum
- Website: https://wholehum.github.io/
- X: https://x.com/WholeHum
- Bluesky: https://bsky.app/profile/wholehum.bsky.social
- TikTok: https://www.tiktok.com/@wholehum
- Pinterest: https://www.pinterest.com/wholehum/
- SoundCloud: https://soundcloud.com/wholehum
- Audiomack: https://audiomack.com/wholehum
- Google Site: https://sites.google.com/view/wholehum
- Email: wholehum@gmail.com

New session pages copied from the session template already carry the full footer.

## Writing rules (keep these)

- No health or medical claims ("heals", "cures", "treats", "repairs DNA", and so on). Describe the sound and cite sources for facts.
- Keep the not-medical-advice note and the footer disclosure: *Audio is AI-generated and made with code (algorithmic synthesis); visuals are AI-assisted. For relaxation and listening enjoyment only. Not medical advice or treatment. Sound made with code · visuals created with Grok.*
- Every image needs meaningful `alt` text (use `alt=""` only for purely decorative images).

## Notes

- `tools/build_site.py`, outside this folder, is the one-off script that first generated these pages. You don't need it to publish or edit; edit the HTML directly. If you ever re-run it, re-add the Search Console verification meta tag to `index.html` and restore `404.html`, which it doesn't generate.
- The canonical page for the home page is `https://wholehum.github.io/` (not `/index.html`).
