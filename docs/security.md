# Security Notes

- Do not connect the website directly to raw Google Sheets in the browser.
- Do not expose `raw_sheet_snapshots` to viewers.
- PII fields are isolated into `person_sensitive` and restricted to admin users.
- Flight/hotel/pickup logistics are restricted to logistics/admin users.
- Evidence in `data_quality_issues` is masked when the field is sensitive.
- Prefer service-account access to sheets rather than using a personal Gmail OAuth token.
