import { getFirestore } from "firebase-admin/firestore";
import { stableId } from "./normalize.js";

export interface PersonCore {
  fullName: string;
  normalizedName: string;
  email: string;
  organization: string;
  country: string;
  sourcePersonKey: string;
}

export async function resolvePersonId(core: PersonCore) {
  const db = getFirestore();
  if (core.email) {
    const snap = await db.collection("people").where("email", "==", core.email).limit(2).get();
    if (snap.size === 1) return snap.docs[0].id;
  }
  const base = core.email || `${core.normalizedName}|${core.country}|${core.organization}` || core.sourcePersonKey || core.fullName;
  return stableId(base || cryptoRandomFallback());
}

function cryptoRandomFallback() {
  return `unknown-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
