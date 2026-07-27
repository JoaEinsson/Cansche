import { getDaysBetween, getDayOfWeek, isWeekend } from '@cansche/shared';
export class SelectionService {
    selectedDatesSet = new Set();
    anchorDate = null;
    getSelectedDates() {
        return Array.from(this.selectedDatesSet).sort();
    }
    isSelected(date) {
        return this.selectedDatesSet.has(date);
    }
    clear() {
        this.selectedDatesSet.clear();
        this.anchorDate = null;
    }
    selectSingle(date) {
        this.selectedDatesSet.clear();
        this.selectedDatesSet.add(date);
        this.anchorDate = date;
    }
    toggleDate(date) {
        if (this.selectedDatesSet.has(date)) {
            this.selectedDatesSet.delete(date);
        }
        else {
            this.selectedDatesSet.add(date);
            this.anchorDate = date;
        }
    }
    selectRange(targetDate) {
        if (!this.anchorDate) {
            this.selectSingle(targetDate);
            return;
        }
        const range = getDaysBetween(this.anchorDate, targetDate);
        for (const d of range) {
            this.selectedDatesSet.add(d);
        }
    }
    setSelection(dates) {
        this.selectedDatesSet = new Set(dates);
        if (dates.length > 0) {
            this.anchorDate = dates[dates.length - 1];
        }
    }
    // Smart Selections
    selectByDayOfWeek(allDatesInRange, targetDayOfWeek) {
        for (const d of allDatesInRange) {
            if (getDayOfWeek(d) === targetDayOfWeek) {
                this.selectedDatesSet.add(d);
            }
        }
    }
    selectWeekendsInRange(allDatesInRange) {
        for (const d of allDatesInRange) {
            if (isWeekend(d)) {
                this.selectedDatesSet.add(d);
            }
        }
    }
    selectByPreset(cells, presetId) {
        for (const [date, cell] of Object.entries(cells)) {
            if (cell.presetInstances && cell.presetInstances.some((inst) => inst.presetId === presetId)) {
                this.selectedDatesSet.add(date);
            }
        }
    }
}
