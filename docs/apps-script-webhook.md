# Apps Script Webhook

Use this only for near-realtime push updates. Scheduled sync already runs every 5 minutes.

Open each source Google Sheet → Extensions → Apps Script → paste:

```javascript
const WEBHOOK_URL = 'https://asia-southeast1-YOUR_PROJECT.cloudfunctions.net/webhookSync';
const WEBHOOK_SECRET = 'YOUR_SECRET';
const SOURCE_KEY = 'vip_hotel'; // change per sheet: vip_hotel, form_responses, agenda

function notifyDashboard(e) {
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-webhook-secret': WEBHOOK_SECRET },
    payload: JSON.stringify({ sourceKey: SOURCE_KEY, eventType: e && e.changeType ? e.changeType : 'edit' }),
    muteHttpExceptions: true
  });
}
```

Install triggers:

1. Apps Script → Triggers
2. Add trigger
3. Function: `notifyDashboard`
4. Event source: From spreadsheet
5. Event type: On edit
6. Add another trigger with Event type: On change

Repeat for each source workbook.
