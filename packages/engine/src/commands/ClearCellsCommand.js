export class ClearCellsCommand {
    dates;
    description = 'Limpar Eventos';
    previousStates = {};
    constructor(dates) {
        this.dates = dates;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        this.previousStates = {};
        for (const date of this.dates) {
            const currentEvents = Object.values(calendar.events || {}).filter(e => e.date === date);
            this.previousStates[date] = [...currentEvents];
            context.setEventsForDate(date, []);
        }
    }
    undo(context) {
        for (const [date, prevEvents] of Object.entries(this.previousStates)) {
            context.setEventsForDate(date, prevEvents);
        }
    }
}
