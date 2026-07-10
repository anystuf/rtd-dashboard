export type UserRole = "admin" | "logistics" | "program" | "viewer";
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
