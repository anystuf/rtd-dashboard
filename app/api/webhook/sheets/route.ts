import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const secret = request.headers.get("x-webhook-secret") || new URL(request.url).searchParams.get("secret");
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.FIREBASE_WEBHOOK_URL;
  if (!url) return NextResponse.json({ error: "FIREBASE_WEBHOOK_URL is missing" }, { status: 500 });
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-webhook-secret": process.env.WEBHOOK_SECRET },
    body
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
