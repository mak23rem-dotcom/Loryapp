# AGENTS.md

## What This Is

Static landing page for LORY — an AI travel audio guide app by Sinequanon Labs. Pure HTML/CSS/JS, no build tools, no package manager. Code lives in `code/`.

## Project Structure

- `code/` — deployable static site (HTML + CSS + JS + assets)
- `code/index.html` — **coming soon page** (public, blocks unauthenticated visitors)
- `code/lory.html` — **full landing page** (protected by auth gate)
- `code/js/auth.js` — staff login credentials and session management
- `code/js/i18n.js` — all translations (EN, FR, AR)
- `code/js/main.js` — landing page logic (i18n engine, accordion, form, scroll effects)
- `Code.gs` — Google Apps Script backend for waitlist form (deployed as web app)
- `Documentation/` — brand book, PRD, logos, strategy docs
- `PRD - LORY Landing Page.md` — full product spec (future 3D features not yet implemented)

## Auth Gate

Visitors see the coming soon page. Staff log in to access the full landing page.

- Credentials stored in `code/js/auth.js` — STAFF array
- Session stored in `sessionStorage` as `lory_auth` (24h TTL)
- `lory.html` guards with `LORY_AUTH.guard('index.html')` — redirects unauthenticated users
- Logout button in landing page nav clears session

### Staff Accounts

| Username | Password |
|----------|----------|
| `makrem` | `lory2026!` |
| `admin` | `lory@staff` |
| `Dev` | `Dev@lory2026` |
| `marketing` | `Marketing@lory2026` |
| `Sinequanon` | `Sinequanon@lory2026` |
| `testing` | `Testing@lory2026` |

To add more staff, edit the `STAFF` array in `code/js/auth.js`.

## Key Technical Details

### Waitlist Backend
- Form submits to Google Apps Script endpoint (hardcoded in `code/js/main.js:183`)
- Posts to: `https://script.google.com/macros/s/AKfycbxv7w6ElnC1LEW-7XAJj_RZE4OoaDBW7_O_R5sajNXivI50BgyNvdRYs4W1HjLz-Qi4/exec`
- `Code.gs` has an older deployment URL — the live one in `main.js` is authoritative
- Sheet ID in `Code.gs`: `1D38eg7m5MqS0gikHdRBQPskBlCWDlLLSc6Lu_o9vD0o`

### i18n
- 3 languages only: EN, FR, AR (with RTL support for Arabic)
- All translations in `code/js/i18n.js` — single file, no extraction tool
- Text uses `data-i18n` attributes for DOM elements, `data-i18n-placeholder` for inputs
- Meta/OG tags also updated dynamically on language switch
- Language auto-detected from browser, saved to `localStorage` as `lory_lang`
- Coming soon page has its own mini i18n engine (same `LORY_I18N` object)
- No offline/download/cache claims in copy — LORY does not have offline services

### Fonts
- Space Grotesk + Inter (loaded from Google Fonts) — PRD says Nunito/Poppins but current implementation differs

### Hosting
- OVH personal web hosting, Apache
- `.htaccess` handles compression, caching, HTTPS redirect, www → non-www
- Deploy via FTP — upload `code/` contents to `www/` root

## Deployment

No build step. Copy `code/` directory contents to OVH hosting root via FTP. Ensure `.htaccess` is included.

## Sensitive Files

- `credentials and tokens .txt` — contains GitHub token and Apps Script deployment IDs. Never commit or reference these values in code.
- `google app script.txt` — older deployment record (superseded by values in `main.js`)

## Conventions

- No frameworks, no transpilation, no bundler
- CSS in single file: `code/css/style.css`
- JS is vanilla, IIFE-wrapped, no modules
- Scroll reveal uses IntersectionObserver (no library)
- Confetti effect is pure CSS/JS on waitlist submit
- 3D features (Three.js, model-viewer) are PRD-specified but not yet implemented
