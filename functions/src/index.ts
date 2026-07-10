import { initializeApp } from "firebase-admin/app";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { setGlobalOptions } from "firebase-functions/v2";
import { syncAll } from "./syncSheets.js";

initializeApp();
setGlobalOptions({ region: "asia-southeast1", memory: "1GiB", timeoutSeconds: 540 });

export const scheduledSync = onSchedule("every 5 minutes", async () => {
  await syncAll();
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
