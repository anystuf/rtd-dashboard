import { collection, doc, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebaseClient";

export const qDashboardMetrics = () => doc(db, "dashboard_metrics", "current");
export const qPeople = () => query(collection(db, "people"), orderBy("fullName"), limit(1000));
export const qVIP = () => query(collection(db, "people"), where("isVIP", "==", true), orderBy("fullName"), limit(1000));
export const qUEH = () => query(collection(db, "people"), where("isUEH", "==", true), orderBy("fullName"), limit(1000));
export const qParticipation = () => query(collection(db, "participation"), limit(1000));
export const qHotel = () => query(collection(db, "hotel_bookings"), orderBy("fullName"), limit(1000));
export const qFlights = () => query(collection(db, "flight_segments"), orderBy("fullName"), limit(1000));
export const qPickup = () => query(collection(db, "pickup_tasks"), orderBy("fullName"), limit(1000));
export const qAgenda = () => query(collection(db, "agenda_items"), orderBy("date"), orderBy("startTime"), limit(1000));
export const qIssues = () => query(collection(db, "data_quality_issues"), orderBy("createdAt", "desc"), limit(1000));
export const qSyncLogs = () => query(collection(db, "sync_logs"), orderBy("startedAt", "desc"), limit(100));
