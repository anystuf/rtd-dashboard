# Deployment

## Project

- Firebase project ID: `rtd-2026-dashboard`
- GitHub repo: `https://github.com/anystuf/rtd-dashboard`
- Frontend target: GitHub Pages
- Expected URL: `https://anystuf.github.io/rtd-dashboard/`

## Recommended deployment

- Next.js frontend: GitHub Pages static export
- Firebase: Auth, Firestore, Functions

## Required frontend env vars

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCb0Kq_KQouHQSlN4-fQdlLjIqIdM70ups
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rtd-2026-dashboard.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rtd-2026-dashboard
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rtd-2026-dashboard.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=965601362778
NEXT_PUBLIC_FIREBASE_APP_ID=1:965601362778:web:a82c7c0a5368c63279e963
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R1FJQW22EL
```

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` builds the static site whenever `main` is pushed.

Before the first deployment, open the GitHub repo settings and set Pages source to **GitHub Actions**.

### Optional no-Firebase data mode

1. Deploy the Apps Script API in `docs/apps-script-data-api.md`.
2. Add a GitHub repository variable named `NEXT_PUBLIC_DATA_API_URL` with the web app URL.
3. Rerun the GitHub Pages workflow.

For a quick one-browser test, open:

```text
https://anystuf.github.io/rtd-dashboard/?dataApiUrl=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

For Google sign-in on GitHub Pages, open Firebase Console:

1. Go to **Authentication**.
2. Open **Settings**.
3. Under **Authorized domains**, add:

```txt
anystuf.github.io
```

Without this domain, Firebase rejects Google sign-in from `https://anystuf.github.io/rtd-dashboard/` with `auth/unauthorized-domain`.

For GitHub Pages, the build sets:

```env
NEXT_EXPORT=true
GITHUB_PAGES=true
```

`GITHUB_PAGES=true` makes Next.js serve the app under `/rtd-dashboard`.

To test the same export locally on macOS/Linux:

```bash
NEXT_EXPORT=true GITHUB_PAGES=true npm run build
```

On Windows PowerShell:

```powershell
$env:NEXT_EXPORT="true"; $env:GITHUB_PAGES="true"; npm run build
```

## Required function env vars

```env
WEBHOOK_SECRET=
GOOGLE_SERVICE_ACCOUNT_JSON=
```

Optional OAuth mode:

```env
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```
