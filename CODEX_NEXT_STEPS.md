# Codex Next Steps

Open this repo in Codex and ask it to harden implementation in this order:

1. Run `npm install` and `cd functions && npm install`.
2. Fix TypeScript compile errors if any.
3. Add Firebase project config values to `.env.local`.
4. Decide Google Sheets auth mode:
   - Recommended: service account. Share all source sheets to the service account email.
   - Alternative: OAuth refresh token for `trantrongnguyenhg@gmail.com`.
5. Deploy Firestore rules and functions.
6. Run `manualSync` and inspect:
   - `raw_sheet_snapshots`
   - `sync_logs`
   - `people`
   - `person_sensitive`
   - `data_quality_issues`
7. Adjust header mappings in `functions/src/normalize.ts` after seeing real raw snapshots.
8. Add additional tabs/gids in `functions/src/sourceSheets.ts` if VIP and Hotel are separate tabs in the same workbook.
9. Deploy frontend to Vercel or Firebase Hosting.

Important: the current implementation is a production-ready scaffold, but the exact normalization rules may need tuning once the live sheet tab names and raw headers are confirmed.
