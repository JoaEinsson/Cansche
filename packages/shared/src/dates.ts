export type ISODate = string; // Format: YYYY-MM-DD

export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(isoDate: ISODate): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(isoDate: ISODate, days: number): ISODate {
  const d = parseISODate(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function getDaysBetween(startDate: ISODate, endDate: ISODate): ISODate[] {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  
  const result: ISODate[] = [];
  const current = new Date(start);

  if (start > end) {
    while (current >= end) {
      result.push(toISODate(current));
      current.setDate(current.getDate() - 1);
    }
  } else {
    while (current <= end) {
      result.push(toISODate(current));
      current.setDate(current.getDate() + 1);
    }
  }
  return result;
}

export function getDayOfWeek(isoDate: ISODate): number {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return parseISODate(isoDate).getDay();
}

export function isWeekend(isoDate: ISODate): boolean {
  const day = getDayOfWeek(isoDate);
  return day === 0 || day === 6;
}

export function diffInDays(startDate: ISODate, endDate: ISODate): number {
  const start = parseISODate(startDate).getTime();
  const end = parseISODate(endDate).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}
