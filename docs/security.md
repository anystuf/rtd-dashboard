# RTD Dashboard security model

The GitHub Pages site is only the frontend. Private participant data is not bundled into static files.

## Roles

- admin: can read all operational data and sensitive records.
- logistics: can read hotel, flight, pickup, people, agenda, issues, and sync logs.
- program: can read people, agenda, issues, and sync logs.
- guest: can only open /me and only read records linked through person_access.

## Guest access

Guests sign in with Google, then link their record with name plus phone/code/passport ending. The verification runs in the Firebase Cloud Function claimGuestAccess, not in the browser. A successful match creates person_access/{uid}_{personId}.

Do not publish a CSV/JSON containing all guest details to GitHub Pages. Name + phone is treated as a verification factor, not as a public password list.

## Source data

The sync worker reads:

- Checklist / VIP Data
- Checklist / Hotel
- Participation Confirmation Form
- Master Plan / AGENDA
- HCM Hotel source
- Logistics reference workbook

Scheduled sync runs every 2 minutes and writes normalized Firestore collections plus data_quality_issues.
