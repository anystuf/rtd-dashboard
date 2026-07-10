# RTD Dashboard Apps Script API

Use this when the dashboard should read from the target Google Sheets without Firebase Blaze.

## Source target sheets

The API reads these target spreadsheets:

- RTD 2026 - VIP Data: `1BXjxZEYe4dQywBDukAjRaMrgBdKyHVIIP0V02HmEYTM`, tab `VIP Data`
- RTD 2026 - UEH Data: `1WAlN21qu-_5su8xxiOak2sc-5EJ-QeVm0W5AU4SCleY`, tab `UEH Data`
- RTD 2026 - Flight and Transfer: `1VB3c5gplt9aEX5CIF-elAAEpDE6bY839KKVCMcECmcU`, tab `Flight Transfer`
- RTD 2026 - Hotel Schedule: `1C5OeZYQncAJHQVr_PFTShvYls7mP8BUcam-6yZlPKF8`, tab `Hotel Schedule`

## Deploy

1. Open Apps Script: https://script.google.com/home
2. Create a new project named `RTD Dashboard Data API`.
3. Paste the contents of `C:\Users\ACER\Documents\RTD_Dashboard\apps_script\rtd_dashboard_data_api.gs` into `Code.gs`.
4. Click Deploy -> New deployment.
5. Type: Web app.
6. Execute as: Me.
7. Who has access: Anyone with the link. The script only returns sanitized dashboard fields.
8. Copy the Web app URL ending in `/exec`.

## Test

Open:

```text
YOUR_EXEC_URL?callback=test
```

It should return JavaScript like:

```js
test({ ...dashboard data... });
```

## Connect GitHub Pages

Open the dashboard once with:

```text
https://anystuf.github.io/rtd-dashboard/dashboard/?dataApiUrl=YOUR_EXEC_URL
```

The browser stores this URL and refreshes every 2 minutes.

For permanent deployment, set the same URL as `NEXT_PUBLIC_DATA_API_URL` in `.github/workflows/pages.yml`, build, and push `main`.
