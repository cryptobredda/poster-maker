// UK timezone utilities
export function getUKTimezone(date: Date): string {
  const year = date.getFullYear();
  
  // BST starts last Sunday of March
  const marchLastSunday = new Date(year, 2, 31);
  while (marchLastSunday.getDay() !== 0) {
    marchLastSunday.setDate(marchLastSunday.getDate() - 1);
  }
  marchLastSunday.setHours(1, 0, 0, 0);
  
  // BST ends last Sunday of October
  const octLastSunday = new Date(year, 9, 31);
  while (octLastSunday.getDay() !== 0) {
    octLastSunday.setDate(octLastSunday.getDate() - 1);
  }
  octLastSunday.setHours(1, 0, 0, 0);
  
  const d = new Date(date);
  if (d >= marchLastSunday && d < octLastSunday) {
    return 'Europe/London'; // JS Intl will handle BST
  }
  return 'Europe/London';
}

export function formatTimeHHMM(timeStr: string): string {
  // Aladhan returns times like "05:19 (GMT)" or just "05:19"
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  
  // Convert to 12-hour format to match poster style
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
  // dateStr expected: DD-MM-YYYY
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
  // We'll get hijri from API response, this is just a fallback
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
