import { ISODate, toISODate, getDaysBetween, getDayOfWeek, isWeekend } from '@cansche/shared';
import { CalendarEvent } from '@cansche/domain';

export class SelectionService {
  private selectedDatesSet: Set<ISODate> = new Set();
  private anchorDate: ISODate | null = null;

  public getSelectedDates(): ISODate[] {
    return Array.from(this.selectedDatesSet).sort();
  }

  public isSelected(date: ISODate): boolean {
    return this.selectedDatesSet.has(date);
  }

  public clear(): void {
    this.selectedDatesSet.clear();
    this.anchorDate = null;
  }

  public clearSelection(): void {
    this.clear();
  }

  public selectSingle(date: ISODate): void {
    this.selectedDatesSet.clear();
    this.selectedDatesSet.add(date);
    this.anchorDate = date;
  }

  public selectSingleDate(date: ISODate): void {
    this.selectSingle(date);
  }

  public toggleDate(date: ISODate): void {
    if (this.selectedDatesSet.has(date)) {
      this.selectedDatesSet.delete(date);
    } else {
      this.selectedDatesSet.add(date);
      this.anchorDate = date;
    }
  }

  public addDateToSelection(date: ISODate): void {
    this.selectedDatesSet.add(date);
    this.anchorDate = date;
  }

  public selectRange(targetDateOrAnchor: ISODate, targetDate?: ISODate): void {
    const end = targetDate || targetDateOrAnchor;
    const start = targetDate ? targetDateOrAnchor : this.anchorDate;

    if (!start) {
      this.selectSingle(end);
      return;
    }

    const range = getDaysBetween(start, end);
    for (const d of range) {
      this.selectedDatesSet.add(d);
    }
  }

  public setSelection(dates: ISODate[]): void {
    this.selectedDatesSet = new Set(dates);
    if (dates.length > 0) {
      this.anchorDate = dates[dates.length - 1];
    }
  }

  // Smart Selections
  public getMonthDates(year: number, month: number): ISODate[] {
    const dates: ISODate[] = [];
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      dates.push(toISODate(new Date(year, month, day)));
    }
    return dates;
  }

  public selectByDayOfWeek(allDatesInRange: ISODate[], targetDayOfWeek: number): void {
    for (const d of allDatesInRange) {
      if (getDayOfWeek(d) === targetDayOfWeek) {
        this.selectedDatesSet.add(d);
      }
    }
  }

  public selectSaturdays(year: number, month: number): void {
    this.selectByDayOfWeek(this.getMonthDates(year, month), 6);
  }

  public selectWeekendsInRange(allDatesInRange: ISODate[]): void {
    for (const d of allDatesInRange) {
      if (isWeekend(d)) {
        this.selectedDatesSet.add(d);
      }
    }
  }

  public selectWeekends(year: number, month: number): void {
    this.selectWeekendsInRange(this.getMonthDates(year, month));
  }

  public selectByModel(events: Record<string, CalendarEvent>, modelId: string): void {
    for (const evt of Object.values(events)) {
      if (evt.modelId === modelId) {
        this.selectedDatesSet.add(evt.date);
      }
    }
  }

  // Alias for backward compatibility
  public selectByPreset(events: any, modelId: string): void {
    if (events && typeof events === 'object') {
      this.selectByModel(events as Record<string, CalendarEvent>, modelId);
    }
  }
}
