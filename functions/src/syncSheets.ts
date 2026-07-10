import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { SOURCE_SHEETS, SourceSheetConfig } from "./sourceSheets.js";
import { readSheet } from "./googleSheets.js";
import { buildPersonCore, detectUEH, firstField, normalizeAttendanceStatus, normalizeBoolean, normalizeDate, normalizeFlightNo, normalizeSupportStatus, stableId } from "./normalize.js";
import { resolvePersonId } from "./matchPeople.js";
import { extractSensitiveFields } from "./pii.js";
import { DataQualityIssueInput, validateRow } from "./validators.js";
import { log } from "./logger.js";

const db = getFirestore();

function now() {
  return new Date();
}

function docIdFromParts(...parts: string[]) {
  return stableId(parts.filter(Boolean).join("|"));
}

async function writeIssues(issues: DataQualityIssueInput[]) {
  if (!issues.length) return 0;
  const writer = db.bulkWriter();
  for (const item of issues) {
    const id = docIdFromParts(item.sourceKey, item.sourceSheet, String(item.sourceRow), item.sourceField, item.issueDescription);
    writer.set(db.collection("data_quality_issues").doc(id), item, { merge: true });
  }
  await writer.close();
  return issues.length;
}

async function syncOneSource(source: SourceSheetConfig) {
  const startedAt = now();
  const syncLogRef = db.collection("sync_logs").doc();
  let rowsInserted = 0;
  let rowsUpdated = 0;
  let issuesCreated = 0;
  try {
    await syncLogRef.set({ sourceKey: source.sourceKey, status: "Running", startedAt, rowsRead: 0 });
    const result = await readSheet(source);
    const writer = db.bulkWriter();

    for (const row of result.rows) {
      const snapId = docIdFromParts(result.sourceKey, result.spreadsheetId, result.gid || result.sheetName, String(row.rowIndex));
      const snapRef = db.collection("raw_sheet_snapshots").doc(snapId);
      const prev = await snapRef.get();
      if (!prev.exists) rowsInserted++;
      else if (prev.data()?.rowHash !== row.rowHash) rowsUpdated++;
      writer.set(snapRef, {
        sourceKey: result.sourceKey,
        spreadsheetId: result.spreadsheetId,
        sheetGid: result.gid || "",
        sheetName: result.sheetName,
        rowIndex: row.rowIndex,
        rawJson: row.rawJson,
        rowHash: row.rowHash,
        syncedAt: now()
      }, { merge: true });
    }
    await writer.close();

    const norm = await normalizeSourceRows(result);
    issuesCreated += await writeIssues([...result.headerIssues, ...norm.issues]);
    await syncLogRef.set({
      sourceKey: source.sourceKey,
      status: "Success",
      rowsRead: result.rows.length,
      rowsInserted,
      rowsUpdated,
      issuesCreated,
      errorMessage: "",
      startedAt,
      finishedAt: now()
    }, { merge: true });
    return { sourceKey: source.sourceKey, status: "Success", rowsRead: result.rows.length, rowsInserted, rowsUpdated, issuesCreated };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("Sync failed", { sourceKey: source.sourceKey, message });
    await syncLogRef.set({
      sourceKey: source.sourceKey,
      status: "Failed",
      rowsRead: 0,
      rowsInserted,
      rowsUpdated,
      issuesCreated,
      errorMessage: message,
      startedAt,
      finishedAt: now()
    }, { merge: true });
    return { sourceKey: source.sourceKey, status: "Failed", errorMessage: message, rowsRead: 0, rowsInserted, rowsUpdated, issuesCreated };
  }
}

type ReadSheetResult = Awaited<ReturnType<typeof readSheet>>;

async function normalizeSourceRows(result: ReadSheetResult) {
  const issues: DataQualityIssueInput[] = [];
  const writer = db.bulkWriter();
  const peopleIssueCount = new Map<string, number>();

  for (const row of result.rows) {
    const { rawJson } = row;
    const core = buildPersonCore(rawJson);
    const personId = await resolvePersonId(core);
    const { sensitive, sanitized } = extractSensitiveFields(rawJson);
    const rowIssues = validateRow({ sourceKey: result.sourceKey, sheetName: result.sheetName, rowIndex: row.rowIndex, row: rawJson, headers: result.headers, personId });
    issues.push(...rowIssues);
    peopleIssueCount.set(personId, (peopleIssueCount.get(personId) || 0) + rowIssues.length);

    if (core.fullName || core.email || core.organization) {
      writer.set(db.collection("people").doc(personId), {
        id: personId,
        sourcePersonKey: core.sourcePersonKey,
        fullName: core.fullName,
        normalizedName: core.normalizedName,
        email: core.email,
        organization: core.organization,
        department: core.department,
        positionTitle: core.positionTitle,
        academicTitle: core.academicTitle,
        country: core.country,
        nationality: core.nationality,
        role: core.role,
        isUEH: detectUEH(rawJson),
        isVIP: ["vip_hotel", "checklist_vip"].includes(result.sourceKey) || /vip/i.test(JSON.stringify(rawJson)),
        sourceKeys: FieldValue.arrayUnion(result.sourceKey),
        updatedAt: now(),
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    if (Object.keys(sensitive).length) {
      writer.set(db.collection("person_sensitive").doc(personId), {
        personId,
        dateOfBirth: firstField(sensitive, [/date\s*of\s*birth/i, /day\s*of\s*birth/i, /dob/i]),
        passportNo: firstField(sensitive, [/passport\s*no/i, /passport/i]),
        passportName: firstField(sensitive, [/full\s*name.*passport/i, /passport\s*name/i]),
        passportImageUrl: firstField(sensitive, [/hÃ¬nh\s*passport/i, /passport\s*image/i]),
        phone: firstField(sensitive, [/phone/i, /mobile/i, /sÄ‘t/i]),
        rawSensitiveJson: sensitive,
        updatedAt: now(),
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
    }

    if (result.sourceKey === "master_agenda") {
      const agendaId = docIdFromParts(result.sourceKey, result.sheetName, String(row.rowIndex));
      writer.set(db.collection("agenda_items").doc(agendaId), {
        sourceRow: row.rowIndex,
        date: firstField(sanitized, [/date/i, /ngÃ y/i]),
        startTime: firstField(sanitized, [/start/i, /begin/i, /báº¯t\s*Ä‘áº§u/i, /time/i]),
        endTime: firstField(sanitized, [/end/i, /káº¿t\s*thÃºc/i]),
        session: firstField(sanitized, [/session/i, /phiÃªn/i]),
        title: firstField(sanitized, [/title/i, /topic/i, /ná»™i\s*dung/i]),
        speaker: firstField(sanitized, [/speaker/i, /presenter/i, /diá»…n\s*giáº£/i]),
        room: firstField(sanitized, [/room/i, /venue/i, /location/i, /phÃ²ng/i]),
        notes: firstField(sanitized, [/note/i, /ghi\s*chÃº/i]),
        updatedAt: now(),
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      const participationId = docIdFromParts(personId, result.sourceKey, String(row.rowIndex), "participation");
      writer.set(db.collection("participation").doc(participationId), {
        personId,
        fullName: core.fullName,
        session: firstField(sanitized, [/session/i]),
        presentationTitle: firstField(sanitized, [/presentation\s*title/i, /paper\s*title/i, /title/i]),
        conferenceRole: firstField(sanitized, [/conference\s*role/i, /^role$/i]),
        typeOfAttendance: firstField(sanitized, [/type\s*of\s*attendance/i, /attendance\s*type/i]),
        attendConference: normalizeAttendanceStatus(firstField(sanitized, [/attend\s*the\s*conference/i, /attend/i])),
        attendanceConfirmStatus: normalizeAttendanceStatus(firstField(sanitized, [/tÃ¬nh\s*tráº¡ng\s*confirm/i, /confirm/i, /status/i])),
        formConfirmStatus: normalizeAttendanceStatus(firstField(sanitized, [/confirm.*form/i, /form.*confirm/i])),
        rtdSupportFlight: normalizeSupportStatus(firstField(sanitized, [/support\s*flight/i, /flight\s*ticket/i])),
        rtdSupportHotel: normalizeSupportStatus(firstField(sanitized, [/support\s*hotel/i, /hotel/i])),
        updatedAt: now(),
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });

      const hotelSignal = firstField(sanitized, [/hotel/i, /check\s*in/i, /check\s*out/i, /room/i]);
      if (hotelSignal || /hotel/i.test(JSON.stringify(sanitized))) {
        const hotelId = docIdFromParts(personId, result.sourceKey, String(row.rowIndex), "hotel");
        writer.set(db.collection("hotel_bookings").doc(hotelId), {
          personId,
          fullName: core.fullName,
          hotelName: firstField(sanitized, [/hotel\s*name/i, /^hotel$/i]),
          checkIn: normalizeDate(firstField(sanitized, [/check\s*in/i, /arrival\s*date/i])),
          checkOut: normalizeDate(firstField(sanitized, [/check\s*out/i, /departure\s*date/i])),
          roomType: firstField(sanitized, [/room\s*type/i, /room/i]),
          supportStatus: normalizeSupportStatus(firstField(sanitized, [/support\s*hotel/i, /hotel\s*support/i])),
          notes: firstField(sanitized, [/note/i, /ghi\s*chÃº/i]),
          updatedAt: now(),
          createdAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }

      const arrivalFlight = normalizeFlightNo(firstField(sanitized, [/arrival.*flight/i, /flight.*arrival/i, /flight\s*no/i]));
      const departureFlight = normalizeFlightNo(firstField(sanitized, [/departure.*flight/i, /flight.*departure/i]));
      if (arrivalFlight) writeFlight(writer, personId, core.fullName, "arrival", arrivalFlight, sanitized, result, row.rowIndex);
      if (departureFlight) writeFlight(writer, personId, core.fullName, "departure", departureFlight, sanitized, result, row.rowIndex);

      const pickupRequired = normalizeBoolean(firstField(sanitized, [/pickup/i, /Ä‘Æ°a\s*Ä‘Ã³n/i, /dua\s*don/i]));
      if (pickupRequired || /pickup|Ä‘Æ°a Ä‘Ã³n|dua don/i.test(JSON.stringify(sanitized))) {
        const pickupId = docIdFromParts(personId, result.sourceKey, String(row.rowIndex), "pickup");
        writer.set(db.collection("pickup_tasks").doc(pickupId), {
          personId,
          fullName: core.fullName,
          pickupRequired,
          pickupDatetime: normalizeDate(firstField(sanitized, [/pickup.*time/i, /arrival.*time/i])),
          pickupLocation: firstField(sanitized, [/pickup\s*location/i, /airport/i]),
          dropoffLocation: firstField(sanitized, [/dropoff/i, /hotel/i]),
          driver: firstField(sanitized, [/driver/i, /tÃ i\s*xáº¿/i]),
          vehicle: firstField(sanitized, [/vehicle/i, /car/i, /xe/i]),
          pickupStatus: firstField(sanitized, [/pickup\s*status/i, /status/i]),
          sharedPickupGroupId: "",
          notes: firstField(sanitized, [/note/i, /ghi\s*chÃº/i]),
          updatedAt: now(),
          createdAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }
  }

  for (const [personId, count] of peopleIssueCount) {
    writer.set(db.collection("people").doc(personId), { issueCount: count, updatedAt: now() }, { merge: true });
  }

  await writer.close();
  return { issues };
}

function writeFlight(writer: FirebaseFirestore.BulkWriter, personId: string, fullName: string, direction: "arrival" | "departure", flightNo: string, row: Record<string, unknown>, result: ReadSheetResult, rowIndex: number) {
  const id = docIdFromParts(personId, result.sourceKey, String(rowIndex), direction, flightNo);
  writer.set(db.collection("flight_segments").doc(id), {
    personId,
    fullName,
    direction,
    flightNo,
    airport: firstField(row, [new RegExp(`${direction}.*airport`, "i"), /airport/i]),
    flightDatetime: normalizeDate(firstField(row, [new RegExp(`${direction}.*time`, "i"), /flight.*time/i, /arrival/i, /departure/i])),
    airline: firstField(row, [/airline/i]),
    notes: firstField(row, [/note/i, /ghi\s*chÃº/i]),
    updatedAt: now(),
    createdAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

async function updateMetrics() {
  const [peopleSnap, issuesSnap, participationSnap, flightsSnap, hotelsSnap, pickupsSnap] = await Promise.all([
    db.collection("people").get(),
    db.collection("data_quality_issues").where("status", "==", "Open").get(),
    db.collection("participation").get(),
    db.collection("flight_segments").get(),
    db.collection("hotel_bookings").get(),
    db.collection("pickup_tasks").get()
  ]);
  const people = peopleSnap.docs.map((d) => d.data());
  const participation = participationSnap.docs.map((d) => d.data());
  const confirmed = participation.filter((p) => /confirmed/i.test(String(p.attendanceConfirmStatus || p.attendConference))).length;
  const pending = participation.filter((p) => /pending|unknown/i.test(String(p.attendanceConfirmStatus || p.attendConference))).length;
  await db.collection("dashboard_metrics").doc("current").set({
    totalParticipants: people.length,
    totalVIPs: people.filter((p) => p.isVIP).length,
    totalUEH: people.filter((p) => p.isUEH).length,
    internationalGuests: people.filter((p) => p.country && !/vietnam|viá»‡t nam/i.test(String(p.country))).length,
    confirmedAttendance: confirmed,
    pendingConfirmation: pending,
    flightSupportRequired: flightsSnap.size,
    hotelSupportRequired: hotelsSnap.size,
    pickupPending: pickupsSnap.docs.filter((d) => !/done|completed/i.test(String(d.data().pickupStatus))).length,
    openIssues: issuesSnap.size,
    criticalIssues: issuesSnap.docs.filter((d) => d.data().severity === "Critical").length,
    lastSyncAt: now()
  }, { merge: true });
}

export async function syncAll(sourceKey?: string) {
  const sources = sourceKey ? SOURCE_SHEETS.filter((s) => s.sourceKey === sourceKey) : SOURCE_SHEETS;
  if (!sources.length) throw new Error(`Unknown sourceKey: ${sourceKey}`);
  const results = [];
  for (const source of sources) results.push(await syncOneSource(source));
  await updateMetrics();
  return { ok: true, results };
}

