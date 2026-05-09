import { fetchPrayerTimesForRange, calculateJamaatTimes } from './api';
import { getSheetTabs, getSheetId, createTab, writeTab, monthTabName, parseMonthYearFromTab } from './sheets';

export async function syncMonthlyTabs(): Promise<{ created: string[] }> {
  const created: string[] = [];
  const today = new Date();
  const tabs = await getSheetTabs();

  const currentName = monthTabName(today);

  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextName = monthTabName(nextMonth);

  if (!tabs.includes(currentName)) {
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { times } = await fetchPrayerTimesForRange(startDate, endDate);
    const timesWithJamaat = calculateJamaatTimes(times);

    await createTab(currentName);
    await writeTab(currentName, timesWithJamaat);
    created.push(currentName);
  }

  if (!tabs.includes(nextName)) {
    const endDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
    const startDate = new Date(nextMonth);
    const { times } = await fetchPrayerTimesForRange(startDate, endDate);
    const timesWithJamaat = calculateJamaatTimes(times);

    await createTab(nextName);
    await writeTab(nextName, timesWithJamaat);
    created.push(nextName);
  }

  return { created };
}

export async function regenerateTab(tabName: string): Promise<boolean> {
  if (tabName === 'How To' || tabName === 'Config') return false;
  const { month, year } = parseMonthYearFromTab(tabName);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const { times } = await fetchPrayerTimesForRange(startDate, endDate);
  const timesWithJamaat = calculateJamaatTimes(times);

  const existingId = await getSheetId(tabName);
  if (existingId == null) {
    await createTab(tabName);
  }

  await writeTab(tabName, timesWithJamaat);
  return true;
}
