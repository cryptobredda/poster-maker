import { fetchPrayerTimesForRange, calculateJamaatTimes } from './api.js';
import { getSheetTabs, getSheetId, createTab, writeTab, monthTabName, parseMonthYearFromTab, readConfig, correctTabName, renameTab, sortMonthTabsChronologically, type SheetConfig } from './sheets.js';
import { getLondonMonthDate } from './utils.js';

function configToFetchOptions(config: { calculationMethod: number; school: number; timeOffsets: { fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number } }) {
  return {
    calculationMethod: config.calculationMethod,
    school: config.school,
    timeOffsets: { ...config.timeOffsets },
  };
}

const pendingMonthGenerations = new Map<string, Promise<boolean>>();

async function createMissingMonthTab(tabName: string, config?: SheetConfig): Promise<boolean> {
  if ((await getSheetId(tabName)) !== null) return false;

  const cfg = config ?? await readConfig();
  const { month, year } = parseMonthYearFromTab(tabName);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const { times } = await fetchPrayerTimesForRange(startDate, endDate, configToFetchOptions(cfg));
  const timesWithJamaat = calculateJamaatTimes(times);

  // Another request or process may have created the tab while the API request was running.
  if ((await getSheetId(tabName)) !== null) return false;

  try {
    await createTab(tabName);
  } catch (error) {
    // A separate process may have created the tab between the existence check and create.
    if ((await getSheetId(tabName)) !== null) return false;
    throw error;
  }
  await writeTab(tabName, timesWithJamaat, cfg);
  console.log(`Created month tab: ${tabName}`);
  return true;
}

export function ensureMonthTab(tabName: string, config?: SheetConfig): Promise<boolean> {
  const pending = pendingMonthGenerations.get(tabName);
  if (pending) return pending;

  const generation = createMissingMonthTab(tabName, config);
  pendingMonthGenerations.set(tabName, generation);
  void generation.finally(() => {
    if (pendingMonthGenerations.get(tabName) === generation) pendingMonthGenerations.delete(tabName);
  }).catch(() => undefined);
  return generation;
}

export async function syncMonthlyTabs(): Promise<{ created: string[] }> {
  const created: string[] = [];
  const today = getLondonMonthDate();
  const tabs = await getSheetTabs();
  const config = await readConfig();

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

  const currentName = monthTabName(today);

  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextName = monthTabName(nextMonth);

  if (await ensureMonthTab(currentName, config)) created.push(currentName);
  if (await ensureMonthTab(nextName, config)) created.push(nextName);

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
