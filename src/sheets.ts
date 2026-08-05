import { google, sheets_v4 } from 'googleapis';
import type { PrayerTime } from './api.js';
import { getPrivateKeyFromEnvironment } from './credentials.js';
import { getLondonMonthDate } from './utils.js';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const PRIVATE_KEY = getPrivateKeyFromEnvironment();

const auth = new google.auth.JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth });

interface ColumnLayout {
  DATE: number;
  DAY: number;
  ISLAMIC: number;
  FAJR_START: number;
  FAJR_JAMAT: number;
  SUNRISE: number;
  DHUHR_START: number;
  DHUHR_JAMAT: number;
  ASR_START: number;
  ASR_JAMAT: number;
  MAGHRIB_START: number;
  MAGHRIB_JAMAT: number;
  ISHA_START: number;
  ISHA_JAMAT: number;
  totalColumns: number;
  showMaghribStart: boolean;
  showIshaStart: boolean;
}

function getColumnLayout(config?: SheetConfig): ColumnLayout {
  const showMaghribStart = config?.showMaghribStart ?? false;
  const showIshaStart = config?.showIshaStart ?? false;

  const DATE = 0;
  const DAY = 1;
  const ISLAMIC = 2;
  const FAJR_START = 3;
  const FAJR_JAMAT = 4;
  const SUNRISE = 5;
  const DHUHR_START = 6;
  const DHUHR_JAMAT = 7;
  const ASR_START = 8;
  const ASR_JAMAT = 9;

  let idx = 10;
  const MAGHRIB_START = showMaghribStart ? idx++ : -1;
  const MAGHRIB_JAMAT = idx++;
  const ISHA_START = showIshaStart ? idx++ : -1;
  const ISHA_JAMAT = idx++;

  return {
    DATE, DAY, ISLAMIC, FAJR_START, FAJR_JAMAT, SUNRISE,
    DHUHR_START, DHUHR_JAMAT, ASR_START, ASR_JAMAT,
    MAGHRIB_START, MAGHRIB_JAMAT, ISHA_START, ISHA_JAMAT,
    totalColumns: idx, showMaghribStart, showIshaStart,
  };
}

function colToLetter(n: number): string {
  let s = '';
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

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

export async function renameTab(oldName: string, newName: string): Promise<void> {
  const sheetsRes = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = sheetsRes.data.sheets?.find(s => s.properties?.title === oldName);
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId == null) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        updateSheetProperties: {
          properties: { sheetId, title: newName },
          fields: 'title',
        },
      }],
    },
  });
}

export function correctTabName(tabName: string): string | null {
  const { month, year } = parseMonthYearFromTab(tabName);
  if (year < 100) {
    const corrected = `${MONTH_NAMES_FULL[month - 1]} ${2000 + year}`;
    if (corrected !== tabName) return corrected;
  }
  return null;
}

const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function monthTabName(date: Date): string {
  return `${MONTH_NAMES_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

function monthTabSortValue(tabName: string): number | null {
  const match = tabName.match(/^([A-Za-z]+) (\d{2}|\d{4})$/);
  if (!match) return null;
  const month = MONTH_NAMES_FULL.findIndex(name => name.toLowerCase() === match[1].toLowerCase());
  if (month < 0) return null;
  const parsedYear = Number(match[2]);
  const year = match[2].length === 2 ? 2000 + parsedYear : parsedYear;
  return year * 12 + month;
}

export function sortMonthTabsChronologically(tabs: string[]): string[] {
  return tabs
    .filter(tab => monthTabSortValue(tab) !== null)
    .sort((a, b) => monthTabSortValue(a)! - monthTabSortValue(b)!);
}

export function findCurrentMonthTab(tabs: string[], now = new Date()): string | null {
  const currentName = monthTabName(getLondonMonthDate(now));
  if (tabs.includes(currentName)) return currentName;
  const monthTabs = sortMonthTabsChronologically(tabs);
  return monthTabs.length > 0 ? monthTabs[monthTabs.length - 1] : null;
}

export function parseMonthYearFromTab(tabName: string): { month: number; year: number } {
  const parts = tabName.split(' ');
  const year = parseInt(parts[parts.length - 1], 10);
  const monthName = parts.slice(0, -1).join(' ');
  const month = MONTH_NAMES_FULL.findIndex(
    n => n.toLowerCase() === monthName.toLowerCase()
  ) + 1;
  return { month: month > 0 ? month : 1, year: isNaN(year) ? 2000 : year };
}

export async function readTab(name: string, config?: SheetConfig): Promise<PrayerTime[]> {
  const cfg = config ?? await readConfig();
  const col = getColumnLayout(cfg);
  const rangeEnd = colToLetter(col.totalColumns);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${name}!A:${rangeEnd}`,
  });
  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  // Detect header format
  const hasTwoHeaders = rows.length > 1 && ['Date', 'DATE', 'Day', 'DAY'].includes(rows[1][0]);
  const dataStartIndex = hasTwoHeaders ? 2 : 1;
  const dataRows = rows.slice(dataStartIndex).filter(r => r[col.DATE] && String(r[col.DATE]).trim());

  const { month: tabMonth, year: tabYear } = parseMonthYearFromTab(name);
  const hijriYear = await getTabHijriYear(name);

  return dataRows.map((r, idx) => {
    const dayStr = String(r[col.DATE] || '').trim().split('-')[0];
    const dayNum = parseInt(dayStr, 10) || 1;
    const dateStr = `${String(dayNum).padStart(2, '0')}-${String(tabMonth).padStart(2, '0')}-${tabYear}`;
    const islamicVal = (r[col.ISLAMIC] || '').trim();

    // Determine if Islamic value is a day number or month name
    const isMonthName = isNaN(Number(islamicVal));
    const hijriDay = isMonthName ? '' : islamicVal;
    const hijriMonth = isMonthName ? islamicVal : '';

    // If current is month name, use it; otherwise use previous month's info
    let hijriMonthName = hijriMonth;
    if (!hijriMonthName && idx > 0) {
      for (let i = idx - 1; i >= 0; i--) {
        const val = (dataRows[i][col.ISLAMIC] || '').trim();
        if (isNaN(Number(val))) {
          hijriMonthName = val;
          break;
        }
      }
    }

    return {
      date: dateStr,
      dayName: (r[col.DAY] || '').trim(),
      dayNumber: String(dayNum),
      gregorianDate: `${dayNum} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][tabMonth - 1] || ''}`,
      hijriDate: `${hijriDay || islamicVal}`,
      hijriDay: hijriDay || islamicVal,
      hijriMonth: (hijriMonthName || islamicVal).toUpperCase(),
      hijriMonthEn: (hijriMonthName || islamicVal).toUpperCase(),
      hijriMonthNumber: 1,
      hijriYear: hijriYear,
      fajrStart: (r[col.FAJR_START] || '').trim(),
      fajrJamat: (r[col.FAJR_JAMAT] || '').trim(),
      sunrise: (r[col.SUNRISE] || '').trim(),
      dhuhrStart: (r[col.DHUHR_START] || '').trim(),
      dhuhrJamat: (r[col.DHUHR_JAMAT] || '').trim(),
      asrStart: (r[col.ASR_START] || '').trim(),
      asrJamat: (r[col.ASR_JAMAT] || '').trim(),
      maghribStart: col.MAGHRIB_START >= 0 ? (r[col.MAGHRIB_START] || '').trim() : '',
      maghribJamat: (r[col.MAGHRIB_JAMAT] || '').trim(),
      ishaStart: col.ISHA_START >= 0 ? (r[col.ISHA_START] || '').trim() : '',
      ishaJamat: (r[col.ISHA_JAMAT] || '').trim(),
    };
  });
}

export async function readTabColors(name: string, config?: SheetConfig): Promise<SheetColorScheme> {
  try {
    const cfg = config ?? await readConfig();
    const col = getColumnLayout(cfg);
    const rangeEnd = colToLetter(Math.max(col.totalColumns, 12));
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      ranges: [`${name}!A1:${rangeEnd}15`],
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

export async function rewriteTab(name: string, config?: SheetConfig): Promise<void> {
  const cfg = config ?? await readConfig();
  const times = await readTab(name, cfg);
  if (times.length === 0) return;
  await writeTab(name, times, cfg);
}

export async function writeTab(name: string, times: PrayerTime[], config?: SheetConfig): Promise<void> {
  const cfg = config ?? await readConfig();
  const col = getColumnLayout(cfg);
  const { showMaghribStart, showIshaStart } = cfg;

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
  if (hijriYear) await saveTabMetadata(name, hijriYear);

  const rows = times.map((t, i) => {
    const prevT = i > 0 ? times[i - 1] : null;
    const row: string[] = [
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
    ];
    if (showMaghribStart) row.push(t.maghribStart);
    row.push(t.maghribJamat);
    if (showIshaStart) row.push(t.ishaStart);
    row.push(t.ishaJamat);
    return row;
  });

  // Extract month name from tab name for header (e.g., "May 2026" → "MAY")
  const { month: headerMonth } = parseMonthYearFromTab(name);
  const monthNameHeader = MONTH_NAMES_FULL[headerMonth - 1].toUpperCase();

  // Row 1: Prayer group names (matching poster)
  const headerRow1: string[] = [];
  headerRow1.push(monthNameHeader, '', '');
  headerRow1.push('FAJR', '', '');
  headerRow1.push('DHUHR', '');
  headerRow1.push('ASR', '');
  headerRow1.push('MAGHRIB');
  if (showMaghribStart) headerRow1.push('');
  headerRow1.push('ISHA');
  if (showIshaStart) headerRow1.push('');

  // Row 2: Column labels (matching poster)
  const headerRow2: string[] = [];
  headerRow2.push('DATE', 'DAY', firstMonthName.toUpperCase());
  headerRow2.push('START', 'JAMAT', 'SUNRISE');
  headerRow2.push('START', 'JAMAT');
  headerRow2.push('START', 'JAMAT');
  if (showMaghribStart) headerRow2.push('START');
  headerRow2.push('JAMAT');
  if (showIshaStart) headerRow2.push('START');
  headerRow2.push('JAMAT');

  // Save hijri year to Config tab before clearing (so readTab can find it)
  const firstHijriYear = times.find(t => t.hijriYear)?.hijriYear || '';
  if (firstHijriYear) await saveTabMetadata(name,firstHijriYear);

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
  const merges: { start: number; end: number }[] = [
    { start: 0, end: 3 },   // MAY spans DATE, DAY, ISLAMIC
    { start: 3, end: 6 },   // FAJR spans START, JAMAT, SUNRISE
    { start: 6, end: 8 },   // DHUHR spans START, JAMAT
    { start: 8, end: 10 },  // ASR spans START, JAMAT
  ];
  let mg = 10;
  if (showMaghribStart) {
    merges.push({ start: mg, end: mg + 2 }); // MAGHRIB spans START + JAMAT
    mg += 2;
  } else {
    merges.push({ start: mg, end: mg + 1 }); // MAGHRIB (JAMAT only)
    mg += 1;
  }
  if (showIshaStart) {
    merges.push({ start: mg, end: mg + 2 }); // ISHA spans START + JAMAT
    mg += 2;
  } else {
    merges.push({ start: mg, end: mg + 1 }); // ISHA (JAMAT only)
    mg += 1;
  }

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
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: col.totalColumns },
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
      range: { sheetId, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 0, endColumnIndex: col.totalColumns },
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
          range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: col.totalColumns },
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
          range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: col.totalColumns },
          cell: {
            userEnteredFormat: {
              backgroundColor: bg,
              textFormat: { bold: true, foregroundColor: { red: 0.384, green: 0.071, blue: 0.106 } },
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
      range: { sheetId, startRowIndex: 0, endRowIndex: 2 + times.length, startColumnIndex: 0, endColumnIndex: col.totalColumns },
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
      dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: col.totalColumns },
    },
  });

  // Clear formatting on columns beyond the table to remove leftover borders/colors from old format
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 2 + times.length, startColumnIndex: col.totalColumns, endColumnIndex: 26 },
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

export async function readTabGrid(name: string, config?: SheetConfig): Promise<SheetGrid> {
  const cfg = config ?? await readConfig();
  const col = getColumnLayout(cfg);
  const rangeEnd = colToLetter(col.totalColumns);

  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: [`${name}!A1:${rangeEnd}40`],
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
      for (let c = 0; c < col.totalColumns; c++) {
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
      for (let c = 0; c < col.totalColumns; c++) {
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

export async function getTabData(tabName: string, config?: SheetConfig): Promise<PrayerTime[]> {
  const tabs = await getSheetTabs();
  if (!tabs.includes(tabName)) throw new Error(`Tab "${tabName}" not found`);
  return await readTab(tabName, config);
}

export async function getPrayerTimeForDate(isoDate: string, config?: SheetConfig): Promise<PrayerTime | null> {
  const [year, month, day] = isoDate.split('-').map(Number);
  const tabName = monthTabName(new Date(year, month - 1, 1));
  const tabs = await getSheetTabs();
  if (!tabs.includes(tabName)) return null;

  const sheetDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const times = await readTab(tabName, config);
  return times.find(time => time.date === sheetDate) ?? null;
}

export async function getCurrentMonthData(config?: SheetConfig): Promise<{ times: PrayerTime[]; tabName: string }> {
  const tabs = await getSheetTabs();
  const tab = findCurrentMonthTab(tabs);
  if (!tab) throw new Error('No current month tab found');
  const times = await readTab(tab, config);
  return { times, tabName: tab };
}

export interface SheetConfig {
  showMaghribStart: boolean;
  showIshaStart: boolean;
  calculationMethod: number;
  school: number;
  timeOffsets: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

const DEFAULT_CONFIG: SheetConfig = {
  showMaghribStart: false,
  showIshaStart: false,
  calculationMethod: 15,
  school: 0,
  timeOffsets: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
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

function parseNumericConfig(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') return 0;
  const parsed = parseInt(trimmed, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function defaultConfig(): SheetConfig {
  return {
    showMaghribStart: DEFAULT_CONFIG.showMaghribStart,
    showIshaStart: DEFAULT_CONFIG.showIshaStart,
    calculationMethod: DEFAULT_CONFIG.calculationMethod,
    school: DEFAULT_CONFIG.school,
    timeOffsets: { ...DEFAULT_CONFIG.timeOffsets },
  };
}

export function parseSheetConfigRows(rows: string[][]): SheetConfig {
  const config = defaultConfig();
  if (rows.length < 2) return config;

  const values = new Map<string, string>();
  for (const row of rows.slice(1)) {
    values.set((row[0] || '').trim().toLowerCase(), (row[1] || '').trim());
  }
  for (const [key, value] of values) {
    if (key === 'showmaghribstart') config.showMaghribStart = parseConfigValue(value);
    if (key === 'showishastart') config.showIshaStart = parseConfigValue(value);
    if (key === 'calculationmethod') { const n = parseNumericConfig(value); if (n > 0) config.calculationMethod = n; }
    if (key === 'school') { const n = parseNumericConfig(value); if (n >= 0) config.school = n; }
    if (key === 'fajroffset') config.timeOffsets.fajr = parseNumericConfig(value);
    if (key === 'sunriseoffset') config.timeOffsets.sunrise = parseNumericConfig(value);
    if (key === 'asroffset') config.timeOffsets.asr = parseNumericConfig(value);
    if (key === 'maghriboffset') config.timeOffsets.maghrib = parseNumericConfig(value);
    if (key === 'ishaoffset') config.timeOffsets.isha = parseNumericConfig(value);
  }
  const dhuhrOffset = values.get('dhuhroffset') ?? values.get('dhiroffset');
  if (dhuhrOffset !== undefined) config.timeOffsets.dhuhr = parseNumericConfig(dhuhrOffset);
  return config;
}

export async function readConfig(): Promise<SheetConfig> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Config!A:B',
    });
    return parseSheetConfigRows(res.data.values || []);
  } catch (err) {
    console.warn('Could not read Config tab, using defaults:', err);
    return defaultConfig();
  }
}

const CONFIG_DEFAULTS: [string, string][] = [
  ['showMaghribStart', 'FALSE'],
  ['showIshaStart', 'FALSE'],
  ['calculationMethod', '15'],
  ['school', '0'],
  ['fajrOffset', '0'],
  ['sunriseOffset', '0'],
  ['dhuhrOffset', '0'],
  ['asrOffset', '0'],
  ['maghribOffset', '0'],
  ['ishaOffset', '0'],
];

export async function ensureConfigTab(): Promise<void> {
  const tabs = await getSheetTabs();
  if (!tabs.includes('Config')) {
    await createTab('Config');
    const content: string[][] = [['Setting', 'Value', 'HijriYear']];
    for (const [setting, value] of CONFIG_DEFAULTS) {
      content.push([setting, value, '']);
    }
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: 'Config!A1',
      valueInputOption: 'RAW',
      requestBody: { values: content },
    });
    return;
  }

  // Sync missing settings into existing Config tab
  const existing = await getExistingConfigRows();
  const existingKeys = new Set(existing.slice(1).map(r => (r[0] || '').trim().toLowerCase()));
  const missing: string[][] = [];
  for (const [setting, value] of CONFIG_DEFAULTS) {
    if (!existingKeys.has(setting.toLowerCase())) {
      missing.push([setting, value, '']);
    }
  }
  if (missing.length > 0) {
    const nextRow = existing.length + 1;
    const rangeEnd = `A${nextRow}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Config!${rangeEnd}`,
      valueInputOption: 'RAW',
      requestBody: { values: missing },
    });
  }
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

async function saveTabMetadata(tabName: string, value: string): Promise<void> {
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
