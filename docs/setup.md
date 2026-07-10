# Setup Guide

## 1. Firebase project

Create a Firebase project and enable:

- Authentication → Google provider
- Firestore database
- Cloud Functions
- Hosting is not required for the frontend if you use GitHub Pages

For GitHub Pages Google sign-in, add `anystuf.github.io` in Firebase Console under **Authentication** -> **Settings** -> **Authorized domains**.

## 2. Google Sheets API access

### Recommended: service account

1. Open Google Cloud Console for your Firebase project.
2. Enable Google Sheets API.
3. Create a service account.
4. Download JSON key.
5. Share every RTD Google Sheet with the service account email as Viewer.
6. Store the JSON as `GOOGLE_SERVICE_ACCOUNT_JSON` in Cloud Functions runtime.

### Alternative: OAuth Gmail account

Because you shared the sheets to `trantrongnguyenhg@gmail.com`, OAuth mode can work if you create a client ID and generate a refresh token for that exact Gmail. This is more complex and less stable than a service account.

## 3. Deploy security rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 4. Deploy functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## 5. Deploy website

The frontend is configured for GitHub Pages at:

```txt
https://anystuf.github.io/rtd-dashboard/
```

Push to `main` and the GitHub Actions workflow in `.github/workflows/pages.yml` will build and publish the static export.

Before the first deployment, set the repository Pages source to **GitHub Actions**.

## 6. Set admin role

```bash
FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON='...' npm run claims:set -- trantrongnguyenhg@gmail.com admin
```
