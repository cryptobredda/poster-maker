import test from 'node:test';
import assert from 'node:assert/strict';
import type { PrayerTime } from '../src/api.js';
import { fillMissingMaghribStart, getJumuahJamaah, HttpError, normalizePrayerTime, parseMonthYear, parsePrayerDate, posterCacheKey, posterFilename } from '../src/service.js';
import { getLondonDateParts } from '../src/utils.js';

function prayerTime(overrides: Partial<PrayerTime> = {}): PrayerTime {
  return {
    date: '25-07-2026',
    dayName: 'SAT',
    dayNumber: '25',
    gregorianDate: '25 JUL',
    hijriDate: '',
    hijriDay: '',
    hijriMonth: '',
    hijriMonthEn: '',
    hijriMonthNumber: 1,
    hijriYear: '',
    fajrStart: '3:12',
    fajrJamat: '4:00',
    sunrise: '5:16',
    dhuhrStart: '1:14',
    dhuhrJamat: '1:30',
    asrStart: '5:31',
    asrJamat: '6:15',
    maghribStart: '',
    maghribJamat: '9:08',
    ishaStart: '',
    ishaJamat: '10:30',
    ...overrides,
  };
}

test('London date helper crosses midnight during BST', () => {
  assert.deepEqual(getLondonDateParts(new Date('2026-07-24T23:30:00.000Z')), {
    year: 2026,
    month: 7,
    day: 25,
    isoDate: '2026-07-25',
  });
});

test('prayer date defaults to the Europe/London calendar date', () => {
  assert.equal(parsePrayerDate(undefined, new Date('2026-07-24T23:30:00.000Z')), '2026-07-25');
});

test('prayer date validation rejects malformed and impossible dates', () => {
  for (const value of ['25-07-2026', '2026-7-25', '2026-02-29']) {
    assert.throws(() => parsePrayerDate(value), (error: unknown) => {
      if (!(error instanceof HttpError)) return false;
      assert.equal(error.code, 'INVALID_DATE');
      return true;
    });
  }
  assert.equal(parsePrayerDate('2028-02-29'), '2028-02-29');
});

test('month and year must be supplied as a strict pair', () => {
  assert.throws(() => parseMonthYear('7', undefined), (error: unknown) => {
    if (!(error instanceof HttpError)) return false;
    assert.equal(error.code, 'INVALID_MONTH_YEAR');
    return true;
  });
  assert.throws(() => parseMonthYear('07', '2026'), HttpError);
  assert.throws(() => parseMonthYear('7', '0000'), HttpError);
  assert.deepEqual(parseMonthYear('7', '2026'), { month: 7, year: 2026 });
  assert.deepEqual(parseMonthYear(undefined, undefined, new Date('2026-07-24T23:30:00.000Z')), { month: 7, year: 2026 });
});

test('poster cache keys and download filenames are month-specific', () => {
  assert.equal(posterCacheKey(2026, 7), 'poster:2026-07');
  assert.equal(posterCacheKey(2026, 8), 'poster:2026-08');
  assert.equal(posterFilename(2026, 7), 'prayer-times-2026-07.png');
});

test('only a missing Maghrib start invokes the calculator', async () => {
  let calls = 0;
  const maintained = prayerTime({ maghribStart: '9:07' });
  const unchanged = await fillMissingMaghribStart(maintained, async () => {
    calls++;
    return '9:08';
  });
  assert.strictEqual(unchanged, maintained);
  assert.equal(calls, 0);

  const filled = await fillMissingMaghribStart(prayerTime(), async () => {
    calls++;
    return '9:07';
  });
  assert.equal(filled.maghribStart, '9:07');
  assert.equal(filled.fajrStart, '3:12');
  assert.equal(filled.ishaStart, '');
  assert.equal(calls, 1);
});

test('Jumuah uses the first maintained Friday Dhuhr jamaah without changing its format', () => {
  const monthTimes = [
    prayerTime({ dayName: 'FRI', dhuhrJamat: '' }),
    prayerTime({ dayName: 'FRI', dhuhrJamat: '1:45' }),
    prayerTime({ dayName: 'FRI', dhuhrJamat: '2:00' }),
  ];
  assert.equal(getJumuahJamaah(monthTimes), '1:45');
  assert.equal(getJumuahJamaah([prayerTime({ dayName: 'SAT' })]), null);
});

test('normalized response matches the Astro prayer timetable contract', () => {
  const maintained = prayerTime({ maghribStart: '9:07' });
  const monthTimes = [
    maintained,
    prayerTime({ dayName: 'FRI', dhuhrJamat: '1:45' }),
  ];
  const response = normalizePrayerTime(maintained, {
    isoDate: '2026-07-25',
    monthTimes,
    maghribStartSource: 'sheet',
  });

  assert.deepEqual(response, {
    date: '2026-07-25',
    dateLabel: 'Saturday 25 July 2026',
    timezone: 'Europe/London',
    source: 'maintained-sheet',
    month: 'July 2026',
    prayers: {
      fajr: { start: '3:12', jamaah: '4:00' },
      sunrise: { start: '5:16' },
      dhuhr: { start: '1:14', jamaah: '1:30' },
      asr: { start: '5:31', jamaah: '6:15' },
      maghrib: { start: '9:07', jamaah: '9:08', startSource: 'sheet' },
      isha: { start: null, jamaah: '10:30' },
    },
    jumuah: { jamaah: '1:45' },
  });
  assert.equal('day' in response, false);
  assert.equal('jamaat' in response.prayers.fajr, false);
});

test('normalized response identifies a calculated Maghrib fallback', () => {
  const response = normalizePrayerTime(prayerTime({ maghribStart: '9:07' }), {
    isoDate: '2026-07-25',
    monthTimes: [],
    maghribStartSource: 'calculated',
  });
  assert.equal(response.prayers.maghrib.startSource, 'calculated');
});
