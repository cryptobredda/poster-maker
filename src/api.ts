import { formatTimeHHMM } from './utils.js';
import { TEMPLATE_CONFIG } from './template-config.js';

// Hijri month names indexed by month number (1-12)
const HIJRI_MONTH_NAMES: Record<number, string> = {
  1: 'MUHARRAM',
  2: 'SAFAR',
  3: 'RABI AL-AWWAL',
  4: 'RABI AL-THANI',
  5: 'JUMADA AL-AWWAL',
  6: 'JUMADA AL-THANI',
  7: 'RAJAB',
  8: 'SHABAN',
  9: 'RAMADAN',
  10: 'SHAWWAL',
  11: 'DHUL-QADAH',
  12: 'DHUL-HIJJAH',
};

function getHijriMonthName(monthNumber: number): string {
  return HIJRI_MONTH_NAMES[monthNumber] || 'UNKNOWN';
}

export interface FetchOptions {
  calculationMethod?: number;
  school?: number;
  timeOffsets?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
}

export interface PrayerTime {
  date: string;
  dayName: string;
  dayNumber: string;
  gregorianDate: string;
  hijriDate: string;
  hijriDay: string;
  hijriMonth: string;
  hijriMonthEn: string;
  hijriMonthNumber: number;
  hijriYear: string;
  fajrStart: string;
  fajrJamat: string;
  sunrise: string;
  dhuhrStart: string;
  dhuhrJamat: string;
  asrStart: string;
  asrJamat: string;
  maghribStart: string;
  maghribJamat: string;
  ishaStart: string;
  ishaJamat: string;
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: Array<{
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      [key: string]: string;
    };
    date: {
      readable: string;
      gregorian: {
        date: string;
        day: string;
        weekday: { en: string };
        month: { en: string };
        year: string;
      };
      hijri: {
        date: string;
        day: string;
        weekday: { en: string };
        month: { en: string; number: number };
        year: string;
      };
    };
  }>;
}

function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function minutesToTimeStr(m: number): string {
  m = ((m % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function applyOffset(timeStr: string, offsetMinutes: number): string {
  if (offsetMinutes === 0) return timeStr;
  return minutesToTimeStr(timeToMinutes(timeStr) + offsetMinutes);
}

function isSummer(month: number): boolean {
  return TEMPLATE_CONFIG.summerMonths.includes(month);
}

function getIshaRuleOffset(month: number): number {
  const offsets = TEMPLATE_CONFIG.ishaRuleOffsets as Record<string, number>;
  return offsets[String(month)] ?? offsets.default ?? 75;
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

async function fetchSingleMonth(year: number, month: number, options?: FetchOptions): Promise<PrayerTime[]> {
  const method = options?.calculationMethod ?? TEMPLATE_CONFIG.calculationMethod;
  const school = options?.school ?? TEMPLATE_CONFIG.school;
  const offsets = {
    fajr: options?.timeOffsets?.fajr ?? 0,
    sunrise: options?.timeOffsets?.sunrise ?? 0,
    dhuhr: options?.timeOffsets?.dhuhr ?? 0,
    asr: options?.timeOffsets?.asr ?? 0,
    maghrib: options?.timeOffsets?.maghrib ?? 0,
    isha: options?.timeOffsets?.isha ?? 0,
  };

  // Seasonal Fajr offset from template config (not from sheet)
  const seasonFajrOffset = isSummer(month)
    ? (TEMPLATE_CONFIG.timeOffsets.fajr as any).summer ?? 0
    : (TEMPLATE_CONFIG.timeOffsets.fajr as any).winter ?? 0;

  const url = new URL('https://api.aladhan.com/v1/calendar');
  url.searchParams.set('latitude', String(TEMPLATE_CONFIG.location.latitude));
  url.searchParams.set('longitude', String(TEMPLATE_CONFIG.location.longitude));
  url.searchParams.set('year', String(year));
  url.searchParams.set('month', String(month));
  url.searchParams.set('method', String(method));
  url.searchParams.set('timezone', 'Europe/London');
  url.searchParams.set('school', String(school));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Aladhan API error: ${response.status}`);
  }

  const json: AladhanResponse = await response.json();
  
  if (json.code !== 200 || !json.data) {
    throw new Error('Invalid response from Aladhan API');
  }

  return json.data.map(day => {
    const gregorian = day.date.gregorian;
    const hijri = day.date.hijri;
    const t = day.timings;

    const dayNum = String(parseInt(gregorian.day, 10));
    const hijriDayNum = String(parseInt(hijri.day, 10));

    // Apply offsets: seasonal Fajr offset + sheet/template offsets
    const fajrMins = timeToMinutes(t.Fajr) + seasonFajrOffset + offsets.fajr;

    return {
      date: gregorian.date,
      dayName: gregorian.weekday.en.substring(0, 3).toUpperCase(),
      dayNumber: dayNum,
      gregorianDate: `${dayNum} ${gregorian.month.en.substring(0, 3)}`,
      hijriDate: hijri.date,
      hijriDay: hijriDayNum,
      hijriMonth: getHijriMonthName(hijri.month.number),
      hijriMonthEn: getHijriMonthName(hijri.month.number),
      hijriMonthNumber: hijri.month.number,
      hijriYear: hijri.year,
      fajrStart: formatTimeHHMM(minutesToTimeStr(fajrMins)),
      fajrJamat: '',
      sunrise: formatTimeHHMM(applyOffset(t.Sunrise, offsets.sunrise)),
      dhuhrStart: formatTimeHHMM(applyOffset(t.Dhuhr, offsets.dhuhr)),
      dhuhrJamat: '',
      asrStart: formatTimeHHMM(applyOffset(t.Asr, offsets.asr)),
      asrJamat: '',
      maghribStart: formatTimeHHMM(applyOffset(t.Maghrib, offsets.maghrib)),
      maghribJamat: '',
      ishaStart: formatTimeHHMM(applyOffset(t.Isha, offsets.isha)),
      ishaJamat: '',
    };
  });
}

export async function fetchMaghribStartForDate(isoDate: string, options?: FetchOptions): Promise<string> {
  const [year, month, day] = isoDate.split('-').map(Number);
  const times = await fetchSingleMonth(year, month, options);
  const targetDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
  const prayerTime = times.find(time => time.date === targetDate);
  if (!prayerTime) throw new Error(`No calculated prayer time found for ${isoDate}`);
  return prayerTime.maghribStart;
}

export async function fetchPrayerTimesForRange(startDate: Date, endDate: Date, options?: FetchOptions): Promise<{ times: PrayerTime[]; monthLabel: string }> {
  // Determine which months we need to fetch
  const monthsToFetch: Array<{ year: number; month: number }> = [];
  
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  while (current <= lastMonth) {
    monthsToFetch.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  
  // Fetch all required months in parallel
  const monthResults = await Promise.all(
    monthsToFetch.map(m => fetchSingleMonth(m.year, m.month, options))
  );
  
  // Combine and filter to date range
  const allTimes = monthResults.flat();
  const filtered = allTimes.filter(t => {
    const [day, month, year] = t.date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    // Reset time for accurate comparison
    d.setHours(0, 0, 0, 0);
    const s = new Date(startDate); s.setHours(0, 0, 0, 0);
    const e = new Date(endDate); e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  });
  
  // Sort by date
  filtered.sort((a, b) => {
    const [da, ma, ya] = a.date.split('-').map(Number);
    const [db, mb, yb] = b.date.split('-').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });
  
  // Generate month label
  const startMonthName = monthsToFetch[0] ? new Date(monthsToFetch[0].year, monthsToFetch[0].month - 1).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase() : '';
  const endMonthName = monthsToFetch.length > 1 
    ? new Date(monthsToFetch[monthsToFetch.length - 1].year, monthsToFetch[monthsToFetch.length - 1].month - 1).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
    : '';
  
  const monthLabel = endMonthName && startMonthName !== endMonthName 
    ? `${startMonthName} - ${endMonthName}` 
    : startMonthName;
  
  return { times: filtered, monthLabel };
}

// Calculate Jamat times based on the Zawia pipeline model
export function calculateJamaatTimes(times: PrayerTime[]): PrayerTime[] {
  return times.map((t) => {
    const [, month] = t.date.split('-').map(Number);
    const summer = isSummer(month);

    const fajrStartM = timeToMinutes(t.fajrStart);
    const dhuhrStartM = timeToMinutes(t.dhuhrStart);
    const asrStartM = timeToMinutes(t.asrStart);
    const maghribStartM = timeToMinutes(t.maghribStart);

    // Maghrib Jamat = Maghrib Start + seasonal offset
    const maghribOffset = summer
      ? (TEMPLATE_CONFIG.maghribJamatOffset as any).summer ?? 0
      : (TEMPLATE_CONFIG.maghribJamatOffset as any).winter ?? 0;
    const maghribJamatM = maghribStartM + maghribOffset;

    // Isha Start = Maghrib Jamat + monthly offset
    const ishaOffset = getIshaRuleOffset(month);
    const ishaStartM = maghribJamatM + ishaOffset;

    // Fajr Jamat = round((Fajr Start + interval) / rounding) * rounding
    const fajrJamatM = roundToNearest(
      fajrStartM + TEMPLATE_CONFIG.jamatIntervals.fajr,
      TEMPLATE_CONFIG.fajrRounding,
    );

    // Dhuhr Jamat = Dhuhr Start + interval
    const dhuhrJamatM = dhuhrStartM + TEMPLATE_CONFIG.jamatIntervals.dhuhr;

    // Asr Jamat = Asr Start + interval
    const asrJamatM = asrStartM + TEMPLATE_CONFIG.jamatIntervals.asr;

    // Isha Jamat = Isha Start + seasonal interval
    const ishaJamatInterval = summer
      ? (TEMPLATE_CONFIG.ishaJamatInterval as any).summer ?? 11
      : (TEMPLATE_CONFIG.ishaJamatInterval as any).winter ?? 21;
    const ishaJamatM = ishaStartM + ishaJamatInterval;

    return {
      ...t,
      fajrJamat: formatTimeHHMM(minutesToTimeStr(fajrJamatM)),
      dhuhrJamat: formatTimeHHMM(minutesToTimeStr(dhuhrJamatM)),
      asrJamat: formatTimeHHMM(minutesToTimeStr(asrJamatM)),
      maghribJamat: formatTimeHHMM(minutesToTimeStr(maghribJamatM)),
      ishaStart: formatTimeHHMM(minutesToTimeStr(ishaStartM)),
      ishaJamat: formatTimeHHMM(minutesToTimeStr(ishaJamatM)),
    };
  });
}
