export class RemoveModelCommand {
    dates;
    modelId;
    description = 'Remover Modelo';
    previousStates = {};
    constructor(dates, modelId) {
        this.dates = dates;
        this.modelId = modelId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        this.previousStates = {};
        for (const date of this.dates) {
            const current = Object.values(calendar.events || {}).filter(e => e.date === date);
            this.previousStates[date] = [...current];
            if (!this.modelId) {
                context.setEventsForDate(date, []);
            }
            else {
                const updated = current.filter((ev) => ev.modelId !== this.modelId);
                context.setEventsForDate(date, updated);
            }
        }
    }
    undo(context) {
        for (const [date, prevEvents] of Object.entries(this.previousStates)) {
            context.setEventsForDate(date, prevEvents);
        }
    }
}
