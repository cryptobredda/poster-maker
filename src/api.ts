import { formatTimeHHMM, isBST } from './utils.js';
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

function applyOffset(timeStr: string, offsetMinutes: number): string {
  if (offsetMinutes === 0) return timeStr;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10) + offsetMinutes;
  while (m >= 60) { m -= 60; h++; }
  while (m < 0) { m += 60; h--; }
  while (h >= 24) { h -= 24; }
  while (h < 0) { h += 24; }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function fetchSingleMonth(year: number, month: number): Promise<PrayerTime[]> {
  const url = new URL('https://api.aladhan.com/v1/calendar');
  url.searchParams.set('latitude', String(TEMPLATE_CONFIG.location.latitude));
  url.searchParams.set('longitude', String(TEMPLATE_CONFIG.location.longitude));
  url.searchParams.set('year', String(year));
  url.searchParams.set('month', String(month));
  url.searchParams.set('method', String(TEMPLATE_CONFIG.calculationMethod));
  url.searchParams.set('timezone', 'Europe/London');
  url.searchParams.set('school', String(TEMPLATE_CONFIG.school));

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
      fajrStart: formatTimeHHMM(applyOffset(t.Fajr, TEMPLATE_CONFIG.timeOffsets.fajr)),
      fajrJamat: '',
      sunrise: formatTimeHHMM(applyOffset(t.Sunrise, TEMPLATE_CONFIG.timeOffsets.sunrise)),
      dhuhrStart: formatTimeHHMM(applyOffset(t.Dhuhr, TEMPLATE_CONFIG.timeOffsets.dhuhr)),
      dhuhrJamat: '',
      asrStart: formatTimeHHMM(applyOffset(t.Asr, TEMPLATE_CONFIG.timeOffsets.asr)),
      asrJamat: '',
      maghribStart: formatTimeHHMM(applyOffset(t.Maghrib, TEMPLATE_CONFIG.timeOffsets.maghrib)),
      maghribJamat: '',
      ishaStart: formatTimeHHMM(applyOffset(t.Isha, TEMPLATE_CONFIG.timeOffsets.isha)),
      ishaJamat: '',
    };
  });
}

export async function fetchPrayerTimesForRange(startDate: Date, endDate: Date): Promise<{ times: PrayerTime[]; monthLabel: string }> {
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
    monthsToFetch.map(m => fetchSingleMonth(m.year, m.month))
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

// Calculate Jamaat times based on start times + offset
// For the poster, we can derive reasonable jamaat times
export function calculateJamaatTimes(times: PrayerTime[]): PrayerTime[] {
  return times.map((t, index) => {
    const [day, month, year] = t.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const bst = isBST(date);
    
    // Helper to add minutes
    const addMins = (time: string, mins: number): string => {
      const [h, m] = time.split(':').map(Number);
      const date = new Date(2000, 0, 1, h, m + mins);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      ...t,
      fajrJamat: addMins(t.fajrStart, 15),
      dhuhrJamat: bst ? '1:30' : '12:30',
      asrJamat: addMins(t.asrStart, 15),
      maghribJamat: t.maghribStart,
      ishaJamat: addMins(t.ishaStart, 15),
    };
  });
}
