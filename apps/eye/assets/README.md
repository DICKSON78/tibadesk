# Best Vision Eye Care — Website Starter (Static)

## How to run locally
Option A: Open `index.html` directly in your browser.

Option B (recommended): run a local web server:
- macOS/Linux:
  python3 -m http.server 8000
  Then open: http://localhost:8000

## What to customize
1) Add logo images to `assets/img/` and replace the gradient mark in the header if desired.
2) Replace the Google Maps iframe `src` in `contact.html`.
3) If you want real form submissions (instead of mailto/WhatsApp):
   - Use Formspree / Netlify Forms / your backend endpoint.
4) Update Privacy/Terms with finalized legal content.

## Contact details included
- Call center: +255 678 110 376
- Email: info@bestvisioneyecare.com
- Address: Natta–Mwanza, Tanzania


## Using your real clinic photos (auto-cropped to look like the mockup)
This site is configured to **auto-crop** images using CSS `object-fit: cover` and centered positioning.

### Replace these files (keep the same filenames)
Put your photos here: `assets/img/` and overwrite the existing ones:

- `team.jpg`        → Home hero banner image (wide)
- `storefront.jpg`  → About / Contact / supporting sections
- `exam.jpg`        → Service card thumbnail (circle)
- `equipment.jpg`   → Facility / Services / Products visuals
- `frames.jpg`      → Products / Optical shop visuals
- `director.jpg`    → Team page (portrait)
- `hero.jpg`        → Extra service thumbnail (circle)

### If a photo needs a different focus (left/right/up)
Edit `assets/css/styles.css`:
- For the hero banner: change `object-position:center` under `.hero-banner img`
- For circle thumbs: change `object-position:center` under `.thumb-circle img`

Example:
  object-position: 60% 30%;
