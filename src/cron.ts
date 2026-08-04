import { fetchPrayerTimesForRange, calculateJamaatTimes } from './api.js';
import { getSheetTabs, getSheetId, createTab, writeTab, monthTabName, parseMonthYearFromTab, readConfig, correctTabName, renameTab, sortMonthTabsChronologically } from './sheets.js';
import { getLondonMonthDate } from './utils.js';

function configToFetchOptions(config: { calculationMethod: number; school: number; timeOffsets: { fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number } }) {
  return {
    calculationMethod: config.calculationMethod,
    school: config.school,
    timeOffsets: { ...config.timeOffsets },
  };
}

export async function syncMonthlyTabs(): Promise<{ created: string[] }> {
  const created: string[] = [];
  const today = getLondonMonthDate();
  const tabs = await getSheetTabs();
  const config = await readConfig();
  const fetchOpts = configToFetchOptions(config);

  // Fix any tabs with 2-digit years (e.g., "June 26" → "June 2026")
  const renamed: string[] = [];
  for (const tab of tabs) {
    const corrected = correctTabName(tab);
    if (corrected) {
      await renameTab(tab, corrected);
      renamed.push(`${tab} → ${corrected}`);
    }
  }
  if (renamed.length > 0) {
    console.log('Fixed tab names:', renamed.join(', '));
  }

  // Re-fetch tabs after potential renames
  const currentTabs = await getSheetTabs();
  const currentName = monthTabName(today);

  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextName = monthTabName(nextMonth);

  if (!currentTabs.includes(currentName)) {
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { times } = await fetchPrayerTimesForRange(startDate, endDate, fetchOpts);
    const timesWithJamaat = calculateJamaatTimes(times);

    await createTab(currentName);
    await writeTab(currentName, timesWithJamaat, config);
    created.push(currentName);
  }

  if (!currentTabs.includes(nextName)) {
    const endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    const startDate = new Date(nextMonth);
    const { times } = await fetchPrayerTimesForRange(startDate, endDate, fetchOpts);
    const timesWithJamaat = calculateJamaatTimes(times);

    await createTab(nextName);
    await writeTab(nextName, timesWithJamaat, config);
    created.push(nextName);
  }

  return { created };
}

export async function regenerateAllTabs(): Promise<string[]> {
  const tabs = await getSheetTabs();
  const regenerated: string[] = [];
  for (const tab of sortMonthTabsChronologically(tabs)) {
    await regenerateTab(tab);
    regenerated.push(tab);
  }
  return regenerated;
}

export async function regenerateTab(tabName: string): Promise<boolean> {
  if (tabName === 'How To' || tabName === 'Config') return false;

  // Fix 2-digit year in tab name (e.g., "June 26" → "June 2026")
  const correctedName = correctTabName(tabName) || tabName;
  if (correctedName !== tabName) {
    const existingId = await getSheetId(tabName);
    if (existingId != null) {
      await renameTab(tabName, correctedName);
    }
  }

  const { month, year } = parseMonthYearFromTab(correctedName);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const config = await readConfig();
  const fetchOpts = configToFetchOptions(config);
  const { times } = await fetchPrayerTimesForRange(startDate, endDate, fetchOpts);
  const timesWithJamaat = calculateJamaatTimes(times);

  const existingId = await getSheetId(correctedName);
  if (existingId == null) {
    await createTab(correctedName);
  }

  await writeTab(correctedName, timesWithJamaat, config);
  return true;
}
