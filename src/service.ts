import type { PrayerTime } from './api.js';
import { getLondonDateParts } from './utils.js';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface MonthYearSelection {
  year: number;
  month: number;
}

export function posterCacheKey(year: number, month: number): string {
  return `poster:${year}-${String(month).padStart(2, '0')}`;
}

export function posterFilename(year: number, month: number): string {
  return `prayer-times-${year}-${String(month).padStart(2, '0')}.png`;
}

export function parsePrayerDate(value: unknown, now = new Date()): string {
  if (value === undefined) return getLondonDateParts(now).isoDate;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'INVALID_DATE', 'The date query parameter must use YYYY-MM-DD.');
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new HttpError(400, 'INVALID_DATE', 'The date query parameter is not a valid calendar date.');
  }

  return value;
}

export function parseMonthYear(monthValue: unknown, yearValue: unknown, now = new Date()): MonthYearSelection {
  const hasMonth = monthValue !== undefined;
  const hasYear = yearValue !== undefined;
  if (hasMonth !== hasYear) {
    throw new HttpError(400, 'INVALID_MONTH_YEAR', 'The month and year query parameters must be supplied together.');
  }

  if (!hasMonth) {
    const { month, year } = getLondonDateParts(now);
    return { month, year };
  }

  if (
    typeof monthValue !== 'string' ||
    typeof yearValue !== 'string' ||
    !/^(?:[1-9]|1[0-2])$/.test(monthValue) ||
    !/^(?:19|20|21)\d{2}$/.test(yearValue)
  ) {
    throw new HttpError(400, 'INVALID_MONTH_YEAR', 'Month must be 1-12 and year must be between 1900 and 2199.');
  }

  return { month: Number(monthValue), year: Number(yearValue) };
}

function cleanTime(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function formatLondonDate(isoDate: string, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    ...options,
  }).format(date);
}

export function getJumuahJamaah(monthTimes: PrayerTime[]): string | null {
  const friday = monthTimes.find(time => time.dayName === 'FRI' && time.dhuhrJamat.trim());
  return friday ? cleanTime(friday.dhuhrJamat) : null;
}

export async function fillMissingMaghribStart(
  prayerTime: PrayerTime,
  calculateMaghribStart: () => Promise<string>,
): Promise<PrayerTime> {
  if (prayerTime.maghribStart.trim()) return prayerTime;
  return { ...prayerTime, maghribStart: await calculateMaghribStart() };
}

export interface NormalizePrayerTimeOptions {
  isoDate: string;
  monthTimes: PrayerTime[];
  maghribStartSource: 'sheet' | 'calculated';
}

export function normalizePrayerTime(
  prayerTime: PrayerTime,
  { isoDate, monthTimes, maghribStartSource }: NormalizePrayerTimeOptions,
) {
  return {
    date: isoDate,
    dateLabel: formatLondonDate(isoDate, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).replace(',', ''),
    timezone: 'Europe/London' as const,
    source: 'maintained-sheet',
    month: formatLondonDate(isoDate, { month: 'long', year: 'numeric' }),
    prayers: {
      fajr: { start: cleanTime(prayerTime.fajrStart), jamaah: cleanTime(prayerTime.fajrJamat) },
      sunrise: { start: cleanTime(prayerTime.sunrise) },
      dhuhr: { start: cleanTime(prayerTime.dhuhrStart), jamaah: cleanTime(prayerTime.dhuhrJamat) },
      asr: { start: cleanTime(prayerTime.asrStart), jamaah: cleanTime(prayerTime.asrJamat) },
      maghrib: {
        start: cleanTime(prayerTime.maghribStart),
        jamaah: cleanTime(prayerTime.maghribJamat),
        startSource: maghribStartSource,
      },
      isha: { start: cleanTime(prayerTime.ishaStart), jamaah: cleanTime(prayerTime.ishaJamat) },
    },
    jumuah: { jamaah: getJumuahJamaah(monthTimes) },
  };
}
