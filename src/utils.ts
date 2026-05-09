export function getUKTimezone(date: Date): string {
  const year = date.getFullYear();
  const marchLastSunday = new Date(year, 2, 31);
  while (marchLastSunday.getDay() !== 0) {
    marchLastSunday.setDate(marchLastSunday.getDate() - 1);
  }
  marchLastSunday.setHours(1, 0, 0, 0);
  const octLastSunday = new Date(year, 9, 31);
  while (octLastSunday.getDay() !== 0) {
    octLastSunday.setDate(octLastSunday.getDate() - 1);
  }
  octLastSunday.setHours(1, 0, 0, 0);
  const d = new Date(date);
  if (d >= marchLastSunday && d < octLastSunday) {
    return 'Europe/London';
  }
  return 'Europe/London';
}

export function isBST(date: Date): boolean {
  const year = date.getFullYear();
  const marchLastSunday = new Date(year, 2, 31);
  while (marchLastSunday.getDay() !== 0) {
    marchLastSunday.setDate(marchLastSunday.getDate() - 1);
  }
  marchLastSunday.setHours(1, 0, 0, 0);
  const octLastSunday = new Date(year, 9, 31);
  while (octLastSunday.getDay() !== 0) {
    octLastSunday.setDate(octLastSunday.getDate() - 1);
  }
  octLastSunday.setHours(1, 0, 0, 0);
  return date >= marchLastSunday && date < octLastSunday;
}

export function formatTimeHHMM(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  return `${hours}:${minutes}`;
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

export function getShortDayName(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
}

export function getDayNumber(dateStr: string): string {
  const [day] = dateStr.split('-');
  return day;
}

export function getHijriYear(dateStr: string): string {
  const [day, month, year] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return '';
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function formatDateDDMM(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
}

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

export function buildTitle(monthLabel: string, year: number, times: any[]): string {
  const hijriYears = [...new Set(times.map(t => t.hijriYear).filter(Boolean))].sort();
  let hijriYearStr = '';
  if (hijriYears.length === 1) {
    hijriYearStr = `${hijriYears[0]} AH`;
  } else if (hijriYears.length === 2) {
    const y1 = hijriYears[0];
    const y2 = hijriYears[1];
    const y2Short = String(y2).slice(-2);
    hijriYearStr = `${y1}/${y2Short} AH`;
  } else if (hijriYears.length > 2) {
    const y1 = hijriYears[0];
    const y2 = hijriYears[hijriYears.length - 1];
    const y2Short = String(y2).slice(-2);
    hijriYearStr = `${y1}/${y2Short} AH`;
  }
  if (hijriYearStr) {
    return `${monthLabel} ${year} - ${hijriYearStr}`;
  }
  return `${monthLabel} ${year}`;
}

export function getTodaysJumuahTime(times: any[]): string {
  const today = new Date();
  const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  const todayEntry = times.find(t => t.date === todayStr);
  if (todayEntry && todayEntry.dhuhrJamat) {
    return formatTime12h(todayEntry.dhuhrJamat);
  }
  return '';
}
