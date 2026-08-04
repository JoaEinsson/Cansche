import { toISODate, getDaysBetween, getDayOfWeek, isWeekend } from '@cansche/shared';
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
    clearSelection() {
        this.clear();
    }
    selectSingle(date) {
        this.selectedDatesSet.clear();
        this.selectedDatesSet.add(date);
        this.anchorDate = date;
    }
    selectSingleDate(date) {
        this.selectSingle(date);
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
    addDateToSelection(date) {
        this.selectedDatesSet.add(date);
        this.anchorDate = date;
    }
    selectRange(targetDateOrAnchor, targetDate) {
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
    setSelection(dates) {
        this.selectedDatesSet = new Set(dates);
        if (dates.length > 0) {
            this.anchorDate = dates[dates.length - 1];
        }
    }
    // Smart Selections
    getMonthDates(year, month) {
        const dates = [];
        const totalDays = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= totalDays; day++) {
            dates.push(toISODate(new Date(year, month, day)));
        }
        return dates;
    }
    selectByDayOfWeek(allDatesInRange, targetDayOfWeek) {
        for (const d of allDatesInRange) {
            if (getDayOfWeek(d) === targetDayOfWeek) {
                this.selectedDatesSet.add(d);
            }
        }
    }
    selectSaturdays(year, month) {
        this.selectByDayOfWeek(this.getMonthDates(year, month), 6);
    }
    selectWeekendsInRange(allDatesInRange) {
        for (const d of allDatesInRange) {
            if (isWeekend(d)) {
                this.selectedDatesSet.add(d);
            }
        }
    }
    selectWeekends(year, month) {
        this.selectWeekendsInRange(this.getMonthDates(year, month));
    }
    selectByModel(events, modelId) {
        for (const evt of Object.values(events)) {
            if (evt.modelId === modelId) {
                this.selectedDatesSet.add(evt.date);
            }
        }
    }
    // Alias for backward compatibility
    selectByPreset(events, modelId) {
        if (events && typeof events === 'object') {
            this.selectByModel(events, modelId);
        }
    }
}
