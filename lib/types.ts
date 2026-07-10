export type UserRole = "admin" | "logistics" | "program" | "guest";
export type IssueSeverity = "Critical" | "High" | "Medium" | "Low";

export interface DashboardMetrics {
  totalParticipants: number;
  totalVIPs: number;
  totalUEH: number;
  internationalGuests: number;
  confirmedAttendance: number;
  pendingConfirmation: number;
  flightSupportRequired: number;
  hotelSupportRequired: number;
  airportHotelPickupRequired?: number;
  airportHotelPickupReady?: number;
  hotelAirportPickupRequired?: number;
  hotelAirportPickupReady?: number;
  pickupPending: number;
  openIssues: number;
  criticalIssues: number;
  lastSyncAt?: unknown;
}

export interface Person {
  id: string;
  fullName?: string;
  normalizedName?: string;
  email?: string;
  organization?: string;
  department?: string;
  positionTitle?: string;
  academicTitle?: string;
  country?: string;
  nationality?: string;
  role?: string;
  isUEH?: boolean;
  isVIP?: boolean;
  issueCount?: number;
}

export interface Participation {
  id: string;
  personId?: string;
  fullName?: string;
  session?: string;
  presentationTitle?: string;
  conferenceRole?: string;
  typeOfAttendance?: string;
  attendConference?: string;
  attendanceConfirmStatus?: string;
  formConfirmStatus?: string;
  rtdSupportFlight?: string;
  rtdSupportHotel?: string;
}

export interface HotelBooking {
  id: string;
  personId?: string;
  fullName?: string;
  hotelName?: string;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  supportStatus?: string;
  notes?: string;
}

export interface FlightSegment {
  id: string;
  personId?: string;
  fullName?: string;
  direction?: string;
  flightNo?: string;
  airport?: string;
  flightDatetime?: string;
  airline?: string;
  notes?: string;
}

export interface PickupTask {
  id: string;
  personId?: string;
  fullName?: string;
  pickupRequired?: boolean;
  pickupDatetime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  driver?: string;
  vehicle?: string;
  pickupStatus?: string;
  notes?: string;
}

export interface PersonSensitive {
  id: string;
  personId?: string;
  dateOfBirth?: string;
  passportNo?: string;
  passportName?: string;
  passportImageUrl?: string;
  phone?: string;
}

export interface GuestAccess {
  id: string;
  uid?: string;
  personId?: string;
  fullName?: string;
  email?: string;
  claimMethod?: string;
  claimedAt?: unknown;
}

export interface DataQualityIssue {
  id: string;
  severity?: IssueSeverity;
  category?: string;
  sourceKey?: string;
  sourceSheet?: string;
  sourceRow?: number;
  sourceField?: string;
  personId?: string;
  issueDescription?: string;
  evidenceType?: string;
  evidence?: string;
  recommendedFix?: string;
  status?: string;
  createdAt?: unknown;
}
