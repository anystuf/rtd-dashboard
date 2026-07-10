import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { setGlobalOptions } from "firebase-functions/v2";
import { syncAll } from "./syncSheets.js";
import { normalizeName } from "./normalize.js";

initializeApp();
setGlobalOptions({ region: "asia-southeast1", memory: "1GiB", timeoutSeconds: 540 });

const db = getFirestore();

function cleanSecret(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function secretMatches(secret: string, value: unknown) {
  const cleanValue = cleanSecret(value);
  return Boolean(secret && cleanValue && (cleanValue === secret || cleanValue.endsWith(secret) || cleanValue.includes(secret)));
}

export const scheduledSync = onSchedule("every 2 minutes", async () => {
  await syncAll();
});

export const claimGuestAccess = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in before claiming guest access.");
  }

  const fullName = String(request.data?.fullName || "").trim();
  const code = cleanSecret(request.data?.code);
  const normalizedName = normalizeName(fullName);
  const email = String(request.auth.token.email || "").toLowerCase();

  if (!normalizedName || (!code && !email)) {
    throw new HttpsError("invalid-argument", "Enter your full name and phone/code, or sign in with the same email in the RTD list.");
  }

  const peopleSnap = await db.collection("people").where("normalizedName", "==", normalizedName).limit(8).get();
  if (peopleSnap.empty) {
    throw new HttpsError("not-found", "No matching RTD guest was found for that name.");
  }

  for (const personDoc of peopleSnap.docs) {
    const person = personDoc.data();
    const sensitiveDoc = await db.collection("person_sensitive").doc(personDoc.id).get();
    const sensitive = sensitiveDoc.exists ? sensitiveDoc.data() || {} : {};
    const rawSensitive = (sensitive.rawSensitiveJson || {}) as Record<string, unknown>;
    const emailOk = email && String(person.email || "").toLowerCase() === email;
    const codeOk = code.length >= 4 && [
      sensitive.phone,
      sensitive.passportNo,
      person.sourcePersonKey,
      rawSensitive.phone,
      rawSensitive.Phone,
      rawSensitive["Phone number"],
      rawSensitive["Passport No."],
      rawSensitive["Passport No"],
      rawSensitive["No"],
      rawSensitive["Registration No"],
      rawSensitive["SBD"]
    ].some((value) => secretMatches(code, value));

    if (!emailOk && !codeOk) continue;

    const accessId = `${request.auth.uid}_${personDoc.id}`;
    await db.collection("person_access").doc(accessId).set({
      uid: request.auth.uid,
      personId: personDoc.id,
      fullName: person.fullName || fullName,
      email,
      claimMethod: emailOk ? "email" : "name_code",
      claimedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    await personDoc.ref.set({
      ownerUids: FieldValue.arrayUnion(request.auth.uid),
      updatedAt: new Date()
    }, { merge: true });

    return { ok: true, personId: personDoc.id, fullName: person.fullName || fullName };
  }

  throw new HttpsError("permission-denied", "The name matched, but the phone/code did not match any private RTD record.");
});

export const webhookSync = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const secret = req.header("x-webhook-secret") || req.query.secret;
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const sourceKey = typeof req.body?.sourceKey === "string" ? req.body.sourceKey : undefined;
    const result = await syncAll(sourceKey);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export const manualSync = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const secret = req.header("x-webhook-secret") || req.query.secret;
    if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const result = await syncAll(typeof req.body?.sourceKey === "string" ? req.body.sourceKey : undefined);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
