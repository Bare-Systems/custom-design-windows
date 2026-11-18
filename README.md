# Custom Design Windows — faithful production-site mirror

**Original:** https://www.customdesignwindows.com/  
**GitHub Pages preview:** https://bare-systems.github.io/custom-design-windows/

This project now serves a snapshot of the **original site's actual compiled React app**, styling, copy, navigation, and images. It is **not a new design**. The repository contains the original HTML, compiled JavaScript/CSS, and 19 copied images under `vendor/legacy/`.

## Architecture

```text
www.customdesignwindows.com (original)
                |
     scripts/import-original.py
                |
          vendor/legacy/
     original HTML + React JS
      original CSS + 19 photos
                |
       scripts/build-mirror.py
        URLs / routes rebased
                |
              dist/
                |
      GitHub Actions → Pages
                |
bare-systems.github.io/custom-design-windows/
```

The build adjusts absolute paths for the GitHub Pages project preview, rewrites original image URLs to self-hosted asset paths, and generates HTML entries for **all eight original routes**: `/`, `/about`, `/window-treatments`, `/solar-screen-shades`, `/gallery`, `/reviews`, `/custom-window-treatments-faq-fort-lauderdale-`, and `/contact`.

This is a **compiled snapshot**, not the original unminified React source repository. The captured app is faithful in appearance and content but harder to maintain at a component level without obtaining the original source.

## Contact form / Cloudflare API

The original contact form posts a LeadConnector-style payload to `https://backend.leadconnectorhq.com/external-tracking/events`. It includes `formData.first_name`, `email`, `phone`, `contact.service_needed`, and `contact.contact_notes`, as well as tracking metadata. The **original frontend does not verify the HTTP response** before reporting success; email delivery by that service cannot be established from the browser bundle alone.

A replacement Cloudflare Worker has been scaffolded at `worker/`. It accepts the **same** form payload:

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/health` | Public `{"ok":true}` diagnostic |
| `OPTIONS` | `/api/contact` | Browser CORS preflight |
| `POST` | `/api/contact` | Validate original form payload, send via Resend, return `{"ok":true}` **only on provider acceptance** |

The eventual URL is `https://api.customdesignwindows.com/api/contact`. The Worker sends to `customdesignwindows1@gmail.com` and sets the visitor's email as `reply_to`. Invalid input returns 400; disallowed origin 403; missing email configuration 503; upstream failure 502.

**Not yet live:** The Worker needs a verified Resend sending domain and its API key before mail delivery works. By default the preview retains the original form endpoint. When you set GitHub Actions variable `CONTACT_API_URL` to the new Worker URL, the build changes the original POST to the Worker and waits for a successful HTTP response before showing the original success message.

### Worker configuration

`worker/wrangler.toml` contains:

| Binding | Value / purpose |
| --- | --- |
| `CONTACT_TO_EMAIL` | `customdesignwindows1@gmail.com` |
| `CONTACT_FROM_EMAIL` | `Custom Design Windows <inquiries@customdesignwindows.com>` — sender must be verified with Resend |
| `ALLOWED_ORIGINS` | GitHub Pages preview and both production website origins |

Set the **Cloudflare secret** `RESEND_API_KEY` (not in GitHub):

```bash
cd worker
npx wrangler login
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy
```

Once the domain is managed as a Cloudflare zone, attach the Worker **Custom Domain** `api.customdesignwindows.com` in the dashboard, or uncomment the `[[routes]]` stanza in `wrangler.toml`. The custom domain is **not** configured yet.

The optional **Deploy contact API Worker (manual)** workflow needs GitHub Actions secrets `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. It is deliberately manual-only until configured. Implement bot protection/rate limits before production; CORS alone is not spam protection.

## GitHub Pages CI and manual deployment

The `.github/workflows/pages.yml` workflow runs on every push to `main`, tests the Worker with Node.js 22, builds/tests the faithful mirror for both root and preview paths, and deploys the generated `dist/` artifact to GitHub Pages.

GitHub Actions **repository variables**:

| Variable | Preview default | Production setting |
| --- | --- | --- |
| `SITE_BASE` | `/custom-design-windows/` | `/` |
| `CONTACT_API_URL` | unset (original endpoint) | `https://api.customdesignwindows.com/api/contact` after Worker is ready |
| `ALLOW_INDEXING` | `0` | `1` only after domain cutover |

No repository secret is needed for Pages itself.

To build and test locally (Python 3 + Node.js 22):

```bash
python3 scripts/build-mirror.py
python3 scripts/test-mirror.py
node --test worker/index.test.js
```

To publish manually without CI, upload `dist/` to a static host. A production-root build uses `SITE_BASE=/ python3 scripts/build-mirror.py`. The original site can be recaptured through **Actions → Capture original website assets → Run workflow**, or by running `python3 scripts/import-original.py` and committing `vendor/legacy/`.

## Before moving the real domain

1. Compare the eight routes on desktop and mobile with the current live website.
2. Verify the email sending domain with Resend, configure the Worker, and test successful/failed submissions.
3. Add bot/rate-limit protection; review customer data handling.
4. Add the GitHub Pages custom domain `customdesignwindows.com`, set `SITE_BASE=/`, and change **website** DNS while preserving all existing email MX/SPF/DKIM records.
5. Connect `api.customdesignwindows.com`, set `CONTACT_API_URL`, and then enable search indexing.

**The existing production website, DNS, and business email setup have not been changed.**
