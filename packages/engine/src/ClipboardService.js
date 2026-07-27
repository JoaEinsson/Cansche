import { diffInDays } from '@cansche/shared';
export class ClipboardService {
    copy(dates, context) {
        if (dates.length === 0) {
            const empty = { items: [] };
            context.setClipboard(empty);
            return empty;
        }
        const sortedDates = [...dates].sort();
        const originDate = sortedDates[0];
        const calendar = context.getActiveCalendar();
        const items = sortedDates.map((d) => {
            const cell = calendar.cells[d];
            return {
                relativeDayOffset: diffInDays(originDate, d),
                presetInstances: cell && cell.presetInstances ? [...cell.presetInstances] : [],
            };
        });
        const clipboardData = {
            items,
            originDate,
        };
        context.setClipboard(clipboardData);
        return clipboardData;
    }
    getClipboard(context) {
        return context.getClipboard();
    }
}
