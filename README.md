# RTD 2026 Realtime Dashboard — Firebase Version

A secure internal website dashboard for RTD 2026 event operations.

It reads live Google Sheets, stores raw snapshots for audit, normalizes participant/logistics/agenda data, isolates sensitive PII, detects data-quality issues, and visualizes the results with realtime Firestore listeners.

## Project targets

- Firebase project: `rtd-2026-dashboard`
- Frontend hosting: GitHub Pages
- Frontend URL: `https://anystuf.github.io/rtd-dashboard/`
- Repository: `https://github.com/anystuf/rtd-dashboard`

## Architecture

```txt
Google Sheets
  ↓ Google Sheets API
Firebase Cloud Functions v2 sync worker
  ↓
Cloud Firestore
  ↓ realtime listeners
Next.js dashboard
```

## Important access note

Sharing the sheets with `trantrongnguyenhg@gmail.com` is not enough for the deployed backend unless you use OAuth mode.

Recommended production setup:

1. Create a Google Cloud service account.
2. Share each Google Sheet with the service account email as **Viewer**.
3. Store the service account JSON in Firebase/Cloud Function env as `GOOGLE_SERVICE_ACCOUNT_JSON`.

Alternative:

Use OAuth mode with the Gmail account by setting:

```env
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REFRESH_TOKEN=
```

Service account is safer and easier for production.

## Install

```bash
npm install
cd functions && npm install && cd ..
cp .env.example .env.local
```

## Firebase setup

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

For Google sign-in on GitHub Pages, add this authorized domain in Firebase Console:

```txt
anystuf.github.io
```

Path: **Authentication** -> **Settings** -> **Authorized domains**.

Set function environment variables/secrets in Firebase or Google Cloud Runtime environment:

```bash
firebase functions:config:set webhook.secret="YOUR_SECRET"
# Or set WEBHOOK_SECRET in Cloud Functions runtime environment.
```

For Google Sheets auth, set one of:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

or OAuth variables.

## Run locally

```bash
npm run dev
```

In another terminal:

```bash
npm run functions:serve
```

## Deploy

```bash
npm run functions:deploy
```

The frontend deploys to GitHub Pages through `.github/workflows/pages.yml` on pushes to `main`.
Firebase remains responsible for Auth, Firestore, and Functions.

## Fast no-Firebase data mode

The GitHub Pages site can read live data directly from a Google Apps Script web app. This avoids Firebase Cloud Functions, Firestore indexes, and the Blaze upgrade while still auto-refreshing the dashboard every 60 seconds.

Setup guide: `docs/apps-script-data-api.md`

Quick test URL:

```text
https://anystuf.github.io/rtd-dashboard/?dataApiUrl=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

## First manual sync

Call the function URL:

```bash
curl -X POST "https://asia-southeast1-YOUR_PROJECT.cloudfunctions.net/manualSync" \
  -H "content-type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET" \
  -d '{}'
```

## Set user roles

```bash
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='...' npm run claims:set -- trantrongnguyenhg@gmail.com admin
```

Roles:

- `admin`
- `logistics`
- `program`
- `viewer`

## Collections

- `raw_sheet_snapshots` — admin only
- `people` — sanitized people records
- `person_sensitive` — admin only PII
- `participation`
- `hotel_bookings`
- `flight_segments`
- `pickup_tasks`
- `agenda_items`
- `data_quality_issues`
- `sync_logs`
- `dashboard_metrics/current`
- `user_roles`

## Source sheets

Configured in `functions/src/sourceSheets.ts`.

- VIP/Hotel: `1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4`, gid `167014734`
- Form: `1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI`, gid `965101690`
- Agenda: `1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo`, gid `1165886607`

If one workbook contains multiple tabs you want to sync separately, add them in `SOURCE_SHEETS` with distinct `sourceKey` and gid/sheetName.
