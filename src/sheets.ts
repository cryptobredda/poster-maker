import { google, sheets_v4 } from 'googleapis';
import type { PrayerTime } from './api.js';

function cleanPrivateKey(raw: string): string {
  let key = raw;
  if (key.startsWith('"')) key = key.slice(1);
  if (key.endsWith('",')) key = key.slice(0, -2);
  else if (key.endsWith('"')) key = key.slice(0, -1);
  return key.replace(/\\n/g, '\n');
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const PRIVATE_KEY = cleanPrivateKey(process.env.GOOGLE_PRIVATE_KEY!);

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth });

// 12 columns matching the poster layout exactly
const COL = {
  DATE: 0,           // Day number only (1, 2, 3...)
  DAY: 1,            // 3-letter day name
  ISLAMIC: 2,        // Hijri day or month name when it changes
  FAJR_START: 3,
  FAJR_JAMAT: 4,
  SUNRISE: 5,
  DHUHR_START: 6,
  DHUHR_JAMAT: 7,
  ASR_START: 8,
  ASR_JAMAT: 9,
  MAGHRIB_JAMAT: 10,
  ISHA_JAMAT: 11,
} as const;

export interface SheetColorScheme {
  headerBg: string;
  headerText: string;
  fridayBg: string;
  fridayText: string;
  evenRowBg: string;
  evenRowText: string;
  oddRowBg: string;
  oddRowText: string;
  borderColor: string;
}

const DEFAULT_COLORS: SheetColorScheme = {
  headerBg: '#62121b',
  headerText: '#ffffff',
  fridayBg: '#62121b',
  fridayText: '#ffffff',
  evenRowBg: '#ffffff',
  evenRowText: '#62121b',
  oddRowBg: '#e8e8e8',
  oddRowText: '#62121b',
  borderColor: '#000000',
};

function colorToHex(color?: sheets_v4.Schema$Color): string | null {
  if (!color) return null;
  const r = color.red ?? 0;
  const g = color.green ?? 0;
  const b = color.blue ?? 0;
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export async function getSheetTabs(): Promise<string[]> {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  return res.data.sheets?.map(s => s.properties?.title || '') || [];
}

export async function createTab(name: string): Promise<void> {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{ addSheet: { properties: { title: name } } }],
    },
  });
}

export function monthTabName(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function findCurrentMonthTab(tabs: string[]): string | null {
  const today = new Date();
  const currentName = monthTabName(today);
  if (tabs.includes(currentName)) return currentName;
  const monthTabs = tabs.filter(t => t !== 'How To' && t !== 'Config').sort();
  if (monthTabs.length === 0) return null;
  return monthTabs[monthTabs.length - 1];
}

export function parseMonthYearFromTab(tabName: string): { month: number; year: number } {
  const parts = tabName.split(' ');
  const year = parseInt(parts[parts.length - 1], 10);
  const monthName = parts.slice(0, -1).join(' ');
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const month = monthNames.indexOf(monthName.toLowerCase()) + 1;
  return { month, year };
}

export async function readTab(name: string): Promise<PrayerTime[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${name}!A:L`,
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  // Detect header format
  const hasTwoHeaders = rows.length > 1 && ['Date', 'DATE', 'Day', 'DAY'].includes(rows[1][0]);
  const dataStartIndex = hasTwoHeaders ? 2 : 1;
  const dataRows = rows.slice(dataStartIndex).filter(r => r[COL.DATE] && String(r[COL.DATE]).trim());

  const { month: tabMonth, year: tabYear } = parseMonthYearFromTab(name);
  const hijriYear = await getTabHijriYear(name);

  return dataRows.map((r, idx) => {
    const dayStr = String(r[COL.DATE] || '').trim().split('-')[0];
    const dayNum = parseInt(dayStr, 10) || 1;
    const dateStr = `${String(dayNum).padStart(2, '0')}-${String(tabMonth).padStart(2, '0')}-${tabYear}`;
    const islamicVal = (r[COL.ISLAMIC] || '').trim();

    // Determine if Islamic value is a day number or month name
    const isMonthName = isNaN(Number(islamicVal));
    const hijriDay = isMonthName ? '' : islamicVal;
    const hijriMonth = isMonthName ? islamicVal : '';

    // If current is month name, use it; otherwise use previous month's info
    let hijriMonthName = hijriMonth;
    if (!hijriMonthName && idx > 0) {
      for (let i = idx - 1; i >= 0; i--) {
        const val = (dataRows[i][COL.ISLAMIC] || '').trim();
        if (isNaN(Number(val))) {
          hijriMonthName = val;
          break;
        }
      }
    }

    return {
      date: dateStr,
      dayName: (r[COL.DAY] || '').trim(),
      dayNumber: String(dayNum),
      gregorianDate: `${dayNum} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][tabMonth - 1] || ''}`,
      hijriDate: `${hijriDay || islamicVal}`,
      hijriDay: hijriDay || islamicVal,
      hijriMonth: (hijriMonthName || islamicVal).toUpperCase(),
      hijriMonthEn: (hijriMonthName || islamicVal).toUpperCase(),
      hijriMonthNumber: 1,
      hijriYear: hijriYear,
      fajrStart: (r[COL.FAJR_START] || '').trim(),
      fajrJamat: (r[COL.FAJR_JAMAT] || '').trim(),
      sunrise: (r[COL.SUNRISE] || '').trim(),
      dhuhrStart: (r[COL.DHUHR_START] || '').trim(),
      dhuhrJamat: (r[COL.DHUHR_JAMAT] || '').trim(),
      asrStart: (r[COL.ASR_START] || '').trim(),
      asrJamat: (r[COL.ASR_JAMAT] || '').trim(),
      maghribStart: '',
      maghribJamat: (r[COL.MAGHRIB_JAMAT] || '').trim(),
      ishaStart: '',
      ishaJamat: (r[COL.ISHA_JAMAT] || '').trim(),
    };
  });
}

export async function readTabColors(name: string): Promise<SheetColorScheme> {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      ranges: [`${name}!A1:L15`],
      includeGridData: true,
    });
    
    const gridData = res.data.sheets?.[0]?.data?.[0];
    if (!gridData?.rowData) return DEFAULT_COLORS;

    const rows = gridData.rowData;
    
    const headerCell = rows[0]?.values?.[0];
    const headerBg = colorToHex(headerCell?.effectiveFormat?.backgroundColor) || DEFAULT_COLORS.headerBg;
    const headerText = colorToHex(headerCell?.effectiveFormat?.textFormat?.foregroundColor) || DEFAULT_COLORS.headerText;

    let evenRowBg = DEFAULT_COLORS.evenRowBg;
    let evenRowText = DEFAULT_COLORS.evenRowText;
    let oddRowBg = DEFAULT_COLORS.oddRowBg;
    let oddRowText = DEFAULT_COLORS.oddRowText;
    let fridayBg = DEFAULT_COLORS.fridayBg;
    let fridayText = DEFAULT_COLORS.fridayText;
    let borderColor = DEFAULT_COLORS.borderColor;

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row.values || row.values.length === 0) continue;
      
      const dayCell = row.values[1];
      const dayName = dayCell?.formattedValue || dayCell?.effectiveValue?.stringValue || '';
      const sampleCell = row.values[0];
      
      const bg = colorToHex(sampleCell?.effectiveFormat?.backgroundColor);
      const fg = colorToHex(sampleCell?.effectiveFormat?.textFormat?.foregroundColor);

      if (dayName === 'FRI') {
        if (bg) fridayBg = bg;
        if (fg) fridayText = fg;
      } else if ((i - 2) % 2 === 0) {
        if (bg) evenRowBg = bg;
        if (fg) evenRowText = fg;
      } else {
        if (bg) oddRowBg = bg;
        if (fg) oddRowText = fg;
      }

      if (i === 2) {
        const borders = sampleCell?.effectiveFormat?.borders;
        const bc = colorToHex(borders?.bottom?.color);
        if (bc) borderColor = bc;
      }
    }

    return { headerBg, headerText, fridayBg, fridayText, evenRowBg, evenRowText, oddRowBg, oddRowText, borderColor };
  } catch (err) {
    console.warn('Could not read tab colors, using defaults:', err);
    return DEFAULT_COLORS;
  }
}

export async function getSheetId(name: string): Promise<number | null> {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = res.data.sheets?.find(s => s.properties?.title === name);
  return sheet?.properties?.sheetId ?? null;
}

function getIslamicDisplayValue(t: PrayerTime, prevT: PrayerTime | null): string {
  if (prevT && t.hijriMonth !== prevT.hijriMonth) {
    return t.hijriMonth;
  }
  return t.hijriDay;
}

export async function rewriteTab(name: string): Promise<void> {
  const times = await readTab(name);
  if (times.length === 0) return;
  await writeTab(name, times);
}

export async function writeTab(name: string, times: PrayerTime[]): Promise<void> {
  // Get Islamic month name for header (scan for first non-numeric month name)
  const firstMonthName = times.find(t => t.hijriMonth && isNaN(Number(t.hijriMonth)))?.hijriMonth || '';

  // Extract hijri year: from Config, from times data, or from old columns N before clearing
  let hijriYear = await getTabHijriYear(name);
  if (!hijriYear) {
    hijriYear = times.find(t => t.hijriYear)?.hijriYear || '';
  }
  if (!hijriYear) {
    try {
      const oldRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${name}!N1:N5`,
      });
      const oldVal = oldRes.data.values?.[0]?.[0] || '';
      if (oldVal && !/^(19|20|21)\d{2}$/.test(oldVal)) hijriYear = oldVal;
    } catch {}
  }
  if (hijriYear) await saveTabMetadata(name, 'hijriYear', hijriYear);

  const rows = times.map((t, i) => {
    const prevT = i > 0 ? times[i - 1] : null;
    return [
      t.dayNumber,
      t.dayName,
      getIslamicDisplayValue(t, prevT),
      t.fajrStart,
      t.fajrJamat,
      t.sunrise,
      t.dhuhrStart,
      t.dhuhrJamat,
      t.asrStart,
      t.asrJamat,
      t.maghribJamat,
      t.ishaJamat,
    ];
  });

  // Row 1: Prayer group names (matching poster)
  const headerRow1 = [
    'MAY', '', '',
    'FAJR', '', '',
    'DHUHR', '',
    'ASR', '',
    'MAGHRIB',
    'ISHA',
  ];

  // Row 2: Column labels (matching poster)
  const headerRow2 = [
    'DATE', 'DAY', firstMonthName.toUpperCase(),
    'START', 'JAMAT', 'SUNRISE',
    'START', 'JAMAT',
    'START', 'JAMAT',
    'JAMAT',
    'JAMAT',
  ];

  // Save hijri year to Config tab before clearing (so readTab can find it)
  const firstHijriYear = times.find(t => t.hijriYear)?.hijriYear || '';
  if (firstHijriYear) await saveTabMetadata(name, 'hijriYear', firstHijriYear);

  // Clear old data beyond column L to remove leftover columns M+ from previous format
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `${name}!A:Z`,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${name}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headerRow1, headerRow2, ...rows] },
  });

  const sheetId = await getSheetId(name);
  if (sheetId == null) return;

  const requests: sheets_v4.Schema$Request[] = [];

  // Merge cells for prayer groups in row 1
  const merges = [
    { start: 0, end: 3 },   // MAY spans DATE, DAY, ISLAMIC
    { start: 3, end: 6 },   // FAJR spans START, JAMAT, SUNRISE
    { start: 6, end: 8 },   // DHUHR spans START, JAMAT
    { start: 8, end: 10 },  // ASR spans START, JAMAT
    { start: 10, end: 11 }, // MAGHRIB (single column)
    { start: 11, end: 12 }, // ISHA (single column)
  ];
  for (const m of merges) {
    requests.push({
      mergeCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: m.start, endColumnIndex: m.end },
        mergeType: 'MERGE_ALL',
      },
    });
  }

  // Format row 1 (prayer group names)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.384, green: 0.071, blue: 0.106 },
          textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // Format row 2 (sub-headers)
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: 12 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.384, green: 0.071, blue: 0.106 },
          textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 9 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // Format data rows
  for (let i = 0; i < times.length; i++) {
    const rowIndex = i + 2;
    const isFriday = times[i].dayName === 'FRI';

    if (isFriday) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 12 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.384, green: 0.071, blue: 0.106 },
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      });
    } else {
      const bg = (i % 2 === 0)
        ? { red: 1, green: 1, blue: 1 }
        : { red: 0.91, green: 0.91, blue: 0.91 };
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 12 },
          cell: {
            userEnteredFormat: {
              backgroundColor: bg,
              textFormat: { foregroundColor: { red: 0.384, green: 0.071, blue: 0.106 } },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      });
    }
  }

  // Add borders
  requests.push({
    updateBorders: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 2 + times.length, startColumnIndex: 0, endColumnIndex: 12 },
      top: { style: 'SOLID', width: 2, color: { red: 0.384, green: 0.071, blue: 0.106 } },
      bottom: { style: 'SOLID', width: 2, color: { red: 0.384, green: 0.071, blue: 0.106 } },
      left: { style: 'SOLID', width: 2, color: { red: 0.384, green: 0.071, blue: 0.106 } },
      right: { style: 'SOLID', width: 2, color: { red: 0.384, green: 0.071, blue: 0.106 } },
      innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
      innerVertical: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
    },
  });

  // Auto-resize columns
  requests.push({
    autoResizeDimensions: {
      dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 12 },
    },
  });

  // Clear formatting on columns beyond the table (13+) to remove leftover borders/colors from old format
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 2 + times.length, startColumnIndex: 12, endColumnIndex: 26 },
      cell: { userEnteredFormat: { backgroundColor: { red: 1, green: 1, blue: 1 } } },
      fields: 'userEnteredFormat.backgroundColor',
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });
}

export async function ensureHowToTab(): Promise<void> {
  const tabs = await getSheetTabs();
  if (tabs.includes('How To')) return;

  await createTab('How To');

  const content = [
    ['HOW TO USE THIS PRAYER TIMES SHEET'],
    [''],
    ['This Google Sheet is the source of truth for the mosque prayer times poster.'],
    [''],
    ['TABS:'],
    ['- "How To": This tab (instructions)'],
    ['- Month tabs (e.g. "May 2026"): Each month has its own tab with prayer times'],
    [''],
    ['HOW TO EDIT PRAYER TIMES:'],
    ['1. Find the current month\'s tab at the bottom of this sheet'],
    ['2. Edit the JAMAT columns to adjust prayer times for the poster'],
    ['3. Changes are reflected on the poster immediately'],
    ['4. You can also change the colors of any row and the poster will pick them up'],
    [''],
    ['JAMAT COLUMNS YOU CAN EDIT:'],
    ['- Fajr Jamat, Dhuhr Jamat, Asr Jamat, Maghrib Jamat, Isha Jamat'],
    [''],
    ['COLOR CUSTOMIZATION:'],
    ['- Change the background or text color of any row in the sheet'],
    ['- The poster will automatically use those colors when generating'],
    ['- Header row colors apply to the table header in the poster'],
    ['- Friday rows are highlighted in the poster using their sheet color'],
    [''],
    ['AUTOMATION:'],
    ['- A new tab is automatically created near the end of each month'],
    ['- The new tab is pre-filled with calculated prayer times from Aladhan API'],
    ['- Old tabs remain as a historical record'],
    [''],
    ['POSTER URL:'],
    ['- The poster image is served at the /poster endpoint'],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'How To!A1',
    valueInputOption: 'RAW',
    requestBody: { values: content },
  });
}

function cellFormatFromGrid(cell?: sheets_v4.Schema$CellData): SheetCellFormat {
  const fmt = cell?.effectiveFormat;
  const bg = colorToHex(fmt?.backgroundColor) || '';
  const fg = colorToHex(fmt?.textFormat?.foregroundColor) || '';
  const bold = !!fmt?.textFormat?.bold;
  const fontSize = fmt?.textFormat?.fontSize ?? undefined;
  const ha = fmt?.horizontalAlignment ?? undefined;
  const verticalText = !!(fmt as any)?.textRotation?.vertical;
  return { bgColor: bg, textColor: fg, bold, fontSize, horizontalAlignment: ha, verticalText };
}

export async function readTabGrid(name: string): Promise<SheetGrid> {
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: [`${name}!A1:L40`],
    includeGridData: true,
  });

  const sheet = res.data.sheets?.find(s => s.properties?.title === name);
  const gridData = sheet?.data?.[0];
  const rowData = gridData?.rowData || [];
  const merges = sheet?.merges || [];

  // Detect header format
  const hasTwoHeaders = rowData.length > 1 && ['Date', 'DATE', 'Day', 'DAY'].includes(
    rowData[1]?.values?.[0]?.formattedValue || rowData[1]?.values?.[0]?.effectiveValue?.stringValue || ''
  );
  const dataStartIndex = hasTwoHeaders ? 2 : 1;

  const headers: string[][] = [];
  for (let i = 0; i < dataStartIndex; i++) {
    const row = rowData[i];
    const vals: string[] = [];
    if (row?.values) {
      for (let c = 0; c < 12; c++) {
        vals.push(row.values[c]?.formattedValue || row.values[c]?.effectiveValue?.stringValue || '');
      }
    }
    headers.push(vals);
  }

  const dataRows: { values: string[]; formats: SheetCellFormat[] }[] = [];
  for (let i = dataStartIndex; i < rowData.length; i++) {
    const row = rowData[i];
    const vals: string[] = [];
    const fmts: SheetCellFormat[] = [];
    if (row?.values) {
      for (let c = 0; c < 12; c++) {
        const cell = row.values[c];
        vals.push(cell?.formattedValue || cell?.effectiveValue?.stringValue || '');
        fmts.push(cellFormatFromGrid(cell));
      }
    }
    dataRows.push({ values: vals, formats: fmts });
  }

  const sheetMerges: SheetMerge[] = [];
  for (const m of merges) {
    const sRow = (m.startRowIndex ?? 0) - dataStartIndex;
    const eRow = (m.endRowIndex ?? 0) - dataStartIndex;
    const sCol = m.startColumnIndex ?? 0;
    const eCol = m.endColumnIndex ?? 0;
    if (sRow < 0) continue; // header merge, skip

    // Find top-left cell value and format
    const topRow = rowData[m.startRowIndex ?? 0];
    const topCell = topRow?.values?.[sCol];
    const value = topCell?.formattedValue || topCell?.effectiveValue?.stringValue || '';

    sheetMerges.push({
      startRow: sRow,
      endRow: eRow,
      startCol: sCol,
      endCol: eCol,
      value,
      format: cellFormatFromGrid(topCell),
    });
  }

  return { headers, rows: dataRows, merges: sheetMerges };
}

export async function getCurrentMonthData(): Promise<{ times: PrayerTime[]; tabName: string }> {
  const tabs = await getSheetTabs();
  const tab = findCurrentMonthTab(tabs);
  if (!tab) throw new Error('No current month tab found');
  const times = await readTab(tab);
  return { times, tabName: tab };
}

export interface SheetConfig {
  showMaghribStart: boolean;
  showIshaStart: boolean;
}

const DEFAULT_CONFIG: SheetConfig = {
  showMaghribStart: false,
  showIshaStart: false,
};

export interface SheetCellFormat {
  bgColor: string;
  textColor: string;
  bold: boolean;
  fontSize?: number;
  horizontalAlignment?: string;
  verticalText?: boolean;
}

export interface SheetMerge {
  startRow: number;   // data row index (0 = first data row, after headers)
  endRow: number;     // exclusive
  startCol: number;   // 0-indexed column
  endCol: number;     // exclusive
  value: string;
  format: SheetCellFormat;
}

export interface SheetGrid {
  headers: string[][];
  rows: { values: string[]; formats: SheetCellFormat[] }[];
  merges: SheetMerge[];
}

function parseConfigValue(value: string): boolean {
  const v = value.trim().toLowerCase();
  return v === 'true' || v === 'yes' || v === '1' || v === 'on';
}

export async function readConfig(): Promise<SheetConfig> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Config!A:B',
    });
    const rows = res.data.values || [];
    if (rows.length < 2) return DEFAULT_CONFIG;

    const config: SheetConfig = { ...DEFAULT_CONFIG };
    for (const row of rows.slice(1)) {
      const key = (row[0] || '').trim().toLowerCase();
      const value = (row[1] || '').trim();
      if (key === 'showmaghribstart') config.showMaghribStart = parseConfigValue(value);
      if (key === 'showishastart') config.showIshaStart = parseConfigValue(value);
    }
    return config;
  } catch (err) {
    console.warn('Could not read Config tab, using defaults:', err);
    return DEFAULT_CONFIG;
  }
}

export async function ensureConfigTab(): Promise<void> {
  const tabs = await getSheetTabs();
  if (tabs.includes('Config')) return;

  await createTab('Config');

  const content = [
    ['Setting', 'Value', 'HijriYear'],
    ['showMaghribStart', 'FALSE', ''],
    ['showIshaStart', 'FALSE', ''],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Config!A1',
    valueInputOption: 'RAW',
    requestBody: { values: content },
  });
}

async function getExistingConfigRows(): Promise<string[][]> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Config!A:C',
    });
    return res.data.values || [];
  } catch { return []; }
}

async function saveTabMetadata(tabName: string, key: string, value: string): Promise<void> {
  const rows = await getExistingConfigRows();
  const existingIdx = rows.findIndex(r => r[0] === tabName);
  if (existingIdx >= 0) {
    rows[existingIdx] = [tabName, rows[existingIdx][1] || '', value];
  } else {
    rows.push([tabName, '', value]);
  }
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Config!A1',
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

async function getTabHijriYear(tabName: string): Promise<string> {
  const rows = await getExistingConfigRows();
  const row = rows.find(r => r[0] === tabName);
  return row?.[2] || '';
}
