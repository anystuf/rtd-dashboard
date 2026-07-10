import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
if (!serviceAccount) throw new Error("Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON");
if (!process.argv[2] || !process.argv[3]) throw new Error("Usage: npm run claims:set -- <email> <role>");

const email = process.argv[2];
const role = process.argv[3];
if (!["admin", "logistics", "program", "viewer"].includes(role)) throw new Error("Invalid role");

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccount)) });
const user = await admin.auth().getUserByEmail(email);
await admin.auth().setCustomUserClaims(user.uid, { role });
await admin.firestore().collection("user_roles").doc(user.uid).set({ email, role, updatedAt: new Date(), createdAt: new Date() }, { merge: true });
console.log(`Set ${email} to ${role}`);
