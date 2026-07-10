export interface SourceSheetConfig {
  sourceKey: string;
  spreadsheetId: string;
  gid?: string;
  sheetName?: string;
  description: string;
}

export const SOURCE_SHEETS: SourceSheetConfig[] = [
  {
    sourceKey: "vip_hotel",
    spreadsheetId: process.env.VIP_HOTEL_SPREADSHEET_ID || "1vrpQ-KKuT2Qf01C8lXJLkVExHUgz7R9t__D3DNMHgu4",
    gid: process.env.VIP_HOTEL_GID || "167014734",
    sheetName: process.env.VIP_HOTEL_SHEET_NAME,
    description: "VIP Data and Hotel source workbook"
  },
  {
    sourceKey: "form_responses",
    spreadsheetId: process.env.FORM_SPREADSHEET_ID || "1KRN68GZpi-jVMtbDOq3_JBhxGBW9iJin-Q-Q0hCj-oI",
    gid: process.env.FORM_GID || "965101690",
    sheetName: process.env.FORM_SHEET_NAME,
    description: "Participation confirmation form responses"
  },
  {
    sourceKey: "agenda",
    spreadsheetId: process.env.AGENDA_SPREADSHEET_ID || "1WrtspXZmBELnlwppFB6VImkjvGjGu4QaUCL0IY40Wvo",
    gid: process.env.AGENDA_GID || "1165886607",
    sheetName: process.env.AGENDA_SHEET_NAME,
    description: "RTD event agenda"
  }
];
