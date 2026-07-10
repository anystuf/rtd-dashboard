# Google Apps Script Data API

Fastest no-Firebase data path:

1. Create one Google Apps Script project.
2. Paste the script below.
3. Put the 3 source Spreadsheet IDs and tab names in `SOURCES`.
4. Deploy as **Web app**.
5. Set access to **Anyone with the link**.
6. Open the dashboard once with:

```text
https://anystuf.github.io/rtd-dashboard/?dataApiUrl=YOUR_WEB_APP_URL
```

The dashboard saves that API URL in the browser and refreshes it every 60 seconds. For a permanent shared setup, add `NEXT_PUBLIC_DATA_API_URL` as a GitHub repository variable and rerun the Pages workflow.

```js
const SOURCES = [
  { key: "people", spreadsheetId: "1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4", gid: 167014734, sheetName: "VIP" },
  { key: "participation", spreadsheetId: "1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI", gid: 965101690, sheetName: "Form Responses 1" },
  { key: "agenda_items", spreadsheetId: "1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo", gid: 1165886607, sheetName: "Agenda" }
];

function doGet(e) {
  const payload = buildPayload();
  const json = JSON.stringify(payload);
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function buildPayload() {
  const raw = {};
  SOURCES.forEach((source) => {
    raw[source.key] = readSheet(source);
  });

  const people = normalizePeople(raw.people || []);
  const participation = raw.participation || [];
  const agenda = normalizeAgenda(raw.agenda_items || []);
  const issues = [];

  return {
    generatedAt: new Date().toISOString(),
    dashboard_metrics: metrics(people, participation, issues),
    people,
    participation,
    agenda_items: agenda,
    hotel_bookings: normalizeHotel(participation),
    flight_segments: normalizeFlights(participation),
    pickup_tasks: normalizePickup(participation),
    data_quality_issues: issues,
    sync_logs: [{
      id: `apps-script-${Date.now()}`,
      sourceKey: "apps-script",
      status: "success",
      rowsRead: people.length + participation.length + agenda.length,
      rowsInserted: 0,
      rowsUpdated: 0,
      issuesCreated: issues.length,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString()
    }]
  };
}

function readSheet(source) {
  const workbook = SpreadsheetApp.openById(source.spreadsheetId);
  const sheet = workbook.getSheets().find((item) => item.getSheetId() === source.gid)
    || workbook.getSheetByName(source.sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map(normalizeHeader);
  return values.slice(1).filter((row) => row.some(Boolean)).map((row, index) => {
    const item = { id: `${source.key}-${index + 2}`, sourceRow: index + 2 };
    headers.forEach((header, col) => {
      item[header] = row[col];
    });
    return item;
  });
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

function pick(row, names) {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== "") return row[name];
  }
  return "";
}

function truthy(value) {
  return /^(true|yes|y|1|vip|ueh|co|có)$/i.test(String(value || "").trim());
}

function normalizePeople(rows) {
  return rows.map((row, index) => {
    const fullName = pick(row, ["fullName", "hoVaTen", "name", "guest", "participant", "speaker"]);
    const organization = pick(row, ["organization", "institution", "donVi", "company", "affiliation"]);
    const role = pick(row, ["role", "conferenceRole", "vaiTro", "type"]);
    const country = pick(row, ["country", "nationality", "quocGia"]);

    return {
      id: row.id || `person-${index + 1}`,
      fullName,
      academicTitle: pick(row, ["academicTitle", "title", "hocHamHocVi"]),
      organization,
      department: pick(row, ["department", "faculty", "khoaPhong"]),
      country,
      role,
      email: pick(row, ["email", "emailAddress"]),
      isVIP: truthy(pick(row, ["isVIP", "vip", "guestType"])),
      isUEH: truthy(pick(row, ["isUEH", "ueh"])) || /ueh/i.test(organization),
      issueCount: 0
    };
  }).filter((row) => row.fullName || row.email || row.organization);
}

function normalizeAgenda(rows) {
  return rows.map((row, index) => ({
    id: row.id || `agenda-${index + 1}`,
    date: pick(row, ["date", "ngay"]),
    startTime: pick(row, ["startTime", "start", "gioBatDau"]),
    endTime: pick(row, ["endTime", "end", "gioKetThuc"]),
    session: pick(row, ["session", "phien"]),
    title: pick(row, ["title", "topic", "sessionTitle", "tenBai"]),
    speaker: pick(row, ["speaker", "presenter", "dienGia"]),
    room: pick(row, ["room", "venue", "phong"]),
    notes: pick(row, ["notes", "note", "ghiChu"])
  }));
}

function normalizeHotel(rows) {
  return rows.filter((row) => truthy(pick(row, ["rtdSupportHotel", "hotelSupport", "needHotel"]))).map((row, index) => ({
    id: `hotel-${index + 1}`,
    fullName: pick(row, ["fullName", "hoVaTen", "name", "guest"]),
    hotelName: pick(row, ["hotelName", "hotel"]),
    checkIn: pick(row, ["checkIn", "checkin"]),
    checkOut: pick(row, ["checkOut", "checkout"]),
    roomType: pick(row, ["roomType", "room"]),
    supportStatus: pick(row, ["supportStatus", "hotelStatus", "status"]),
    notes: pick(row, ["notes", "note", "ghiChu"])
  }));
}

function normalizeFlights(rows) {
  return rows.filter((row) => truthy(pick(row, ["rtdSupportFlight", "flightSupport", "needFlight"]))).map((row, index) => ({
    id: `flight-${index + 1}`,
    fullName: pick(row, ["fullName", "hoVaTen", "name", "guest"]),
    direction: pick(row, ["direction", "arrivalDeparture"]),
    flightNo: pick(row, ["flightNo", "flightNumber"]),
    airport: pick(row, ["airport"]),
    flightDatetime: pick(row, ["flightDatetime", "flightTime", "arrivalTime"]),
    airline: pick(row, ["airline"]),
    notes: pick(row, ["notes", "note", "ghiChu"])
  }));
}

function normalizePickup(rows) {
  return rows.filter((row) => truthy(pick(row, ["pickupRequired", "needPickup", "airportPickup"]))).map((row, index) => ({
    id: `pickup-${index + 1}`,
    fullName: pick(row, ["fullName", "hoVaTen", "name", "guest"]),
    pickupRequired: "Yes",
    pickupDatetime: pick(row, ["pickupDatetime", "pickupTime"]),
    pickupLocation: pick(row, ["pickupLocation", "pickup"]),
    dropoffLocation: pick(row, ["dropoffLocation", "dropoff"]),
    driver: pick(row, ["driver"]),
    vehicle: pick(row, ["vehicle"]),
    pickupStatus: pick(row, ["pickupStatus", "status"])
  }));
}

function metrics(people, participation, issues) {
  return {
    totalParticipants: people.length,
    totalVIPs: people.filter((row) => row.isVIP).length,
    totalUEH: people.filter((row) => row.isUEH).length,
    internationalGuests: people.filter((row) => row.country && !/viet\s*nam|vietnam/i.test(row.country)).length,
    confirmedAttendance: participation.filter((row) => /confirm|yes|co|có/i.test(JSON.stringify(row))).length,
    pendingConfirmation: participation.length,
    flightSupportRequired: participation.filter((row) => truthy(pick(row, ["rtdSupportFlight", "flightSupport", "needFlight"]))).length,
    hotelSupportRequired: participation.filter((row) => truthy(pick(row, ["rtdSupportHotel", "hotelSupport", "needHotel"]))).length,
    pickupPending: participation.filter((row) => truthy(pick(row, ["pickupRequired", "needPickup", "airportPickup"]))).length,
    openIssues: issues.filter((row) => row.status !== "Resolved").length,
    criticalIssues: issues.filter((row) => row.severity === "Critical").length,
    lastSyncAt: new Date().toISOString()
  };
}
```

If Google creates a new tab with a different `gid`, update that number in `SOURCES`. The `sheetName` value is only a fallback.
