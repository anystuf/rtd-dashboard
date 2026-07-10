const url = process.env.FIREBASE_WEBHOOK_URL;
const secret = process.env.WEBHOOK_SECRET;
if (!url || !secret) throw new Error("Set FIREBASE_WEBHOOK_URL and WEBHOOK_SECRET");
const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-webhook-secret": secret }, body: JSON.stringify({}) });
console.log(await res.text());

export {};
