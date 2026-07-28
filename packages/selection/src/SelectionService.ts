import { ISODate, getDaysBetween, getDayOfWeek, isWeekend } from '@cansche/shared';
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

  public selectSingle(date: ISODate): void {
    this.selectedDatesSet.clear();
    this.selectedDatesSet.add(date);
    this.anchorDate = date;
  }

  public toggleDate(date: ISODate): void {
    if (this.selectedDatesSet.has(date)) {
      this.selectedDatesSet.delete(date);
    } else {
      this.selectedDatesSet.add(date);
      this.anchorDate = date;
    }
  }

  public selectRange(targetDate: ISODate): void {
    if (!this.anchorDate) {
      this.selectSingle(targetDate);
      return;
    }

    const range = getDaysBetween(this.anchorDate, targetDate);
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
  public selectByDayOfWeek(allDatesInRange: ISODate[], targetDayOfWeek: number): void {
    for (const d of allDatesInRange) {
      if (getDayOfWeek(d) === targetDayOfWeek) {
        this.selectedDatesSet.add(d);
      }
    }
  }

  public selectWeekendsInRange(allDatesInRange: ISODate[]): void {
    for (const d of allDatesInRange) {
      if (isWeekend(d)) {
        this.selectedDatesSet.add(d);
      }
    }
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
