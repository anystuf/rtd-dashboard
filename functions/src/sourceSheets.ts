export interface SourceSheetConfig {
  sourceKey: string;
  spreadsheetId: string;
  gid?: string;
  sheetName?: string;
  description: string;
  sourceUrl: string;
}

const CHECKLIST_ID = process.env.CHECKLIST_SPREADSHEET_ID || "1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4";
const FORM_ID = process.env.FORM_SPREADSHEET_ID || "1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI";
const AGENDA_ID = process.env.AGENDA_SPREADSHEET_ID || "1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo";
const HCM_HOTEL_ID = process.env.HCM_HOTEL_SPREADSHEET_ID || "1ek07p5w9xwGpajfvg4jvh-ioHdFPLMbVIHCltqkoFLo";
const LOGISTICS_ID = process.env.LOGISTICS_REFERENCE_SPREADSHEET_ID || "1XG5tHUu5X9EaMqgupCseAjYi5O-b9QhttK6DDvaU4MU";

function url(spreadsheetId: string, gid?: string) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit${gid ? `#gid=${gid}` : ""}`;
}

export const SOURCE_SHEETS: SourceSheetConfig[] = [
  {
    sourceKey: "checklist_vip",
    spreadsheetId: CHECKLIST_ID,
    gid: "167014734",
    sheetName: process.env.CHECKLIST_VIP_SHEET_NAME || "VIP Data",
    description: "Checklist Tong HC - KT / VIP Data",
    sourceUrl: url(CHECKLIST_ID, "167014734")
  },
  {
    sourceKey: "checklist_hotel",
    spreadsheetId: CHECKLIST_ID,
    gid: "1985155730",
    sheetName: process.env.CHECKLIST_HOTEL_SHEET_NAME || "Hotel",
    description: "Checklist Tong HC - KT / Hotel",
    sourceUrl: url(CHECKLIST_ID, "1985155730")
  },
  {
    sourceKey: "form_confirmation",
    spreadsheetId: FORM_ID,
    gid: "965101690",
    sheetName: process.env.FORM_CONFIRMATION_SHEET_NAME || "Sheet3",
    description: "Participation Confirmation Form responses",
    sourceUrl: url(FORM_ID, "965101690")
  },
  {
    sourceKey: "form_responses",
    spreadsheetId: FORM_ID,
    gid: "779978401",
    sheetName: process.env.FORM_RESPONSES_SHEET_NAME || "Form responses 1",
    description: "Raw form response sheet",
    sourceUrl: url(FORM_ID, "779978401")
  },
  {
    sourceKey: "master_agenda",
    spreadsheetId: AGENDA_ID,
    gid: "876983529",
    sheetName: process.env.AGENDA_SHEET_NAME || "AGENDA",
    description: "Master Plan - RTD 2026 / AGENDA",
    sourceUrl: url(AGENDA_ID, "876983529")
  },
  {
    sourceKey: "agenda_logistics_support",
    spreadsheetId: AGENDA_ID,
    gid: "1165886607",
    sheetName: process.env.AGENDA_LOGISTICS_SUPPORT_SHEET_NAME || "InternationalVIP_Logistics_Support",
    description: "Master Plan - RTD 2026 / International VIP Logistics Support",
    sourceUrl: url(AGENDA_ID, "1165886607")
  },
  {
    sourceKey: "hcm_hotel",
    spreadsheetId: HCM_HOTEL_ID,
    gid: "2020929252",
    sheetName: process.env.HCM_HOTEL_SHEET_NAME,
    description: "HCM hotel source workbook",
    sourceUrl: url(HCM_HOTEL_ID, "2020929252")
  },
  {
    sourceKey: "logistics_reference",
    spreadsheetId: LOGISTICS_ID,
    sheetName: process.env.LOGISTICS_REFERENCE_SHEET_NAME,
    description: "Du lieu luu tru - Tong quan Logistics Tham du HCM NT VL",
    sourceUrl: url(LOGISTICS_ID)
  }
];
