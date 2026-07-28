import { diffInDays, addDays } from '@cansche/shared';
export class MoveCommand {
    sourceDates;
    targetStartDate;
    description = 'Mover Eventos';
    affectedPreviousStates = {};
    constructor(sourceDates, targetStartDate) {
        this.sourceDates = sourceDates;
        this.targetStartDate = targetStartDate;
    }
    execute(context) {
        if (this.sourceDates.length === 0)
            return;
        const calendar = context.getActiveCalendar();
        const sortedSources = [...this.sourceDates].sort();
        const originDate = sortedSources[0];
        const moves = [];
        for (const srcDate of sortedSources) {
            const offset = diffInDays(originDate, srcDate);
            const targetDate = addDays(this.targetStartDate, offset);
            const dayEvents = Object.values(calendar.events || {}).filter(e => e.date === srcDate);
            moves.push({
                targetDate,
                events: dayEvents.map(e => ({ ...e, date: targetDate })),
            });
        }
        this.affectedPreviousStates = {};
        const allAffected = new Set([...this.sourceDates, ...moves.map((m) => m.targetDate)]);
        for (const date of allAffected) {
            const dayEvents = Object.values(calendar.events || {}).filter(e => e.date === date);
            this.affectedPreviousStates[date] = [...dayEvents];
        }
        for (const srcDate of this.sourceDates) {
            context.setEventsForDate(srcDate, []);
        }
        for (const move of moves) {
            context.setEventsForDate(move.targetDate, move.events);
        }
    }
    undo(context) {
        for (const [date, prevEvents] of Object.entries(this.affectedPreviousStates)) {
            context.setEventsForDate(date, prevEvents);
        }
    }
}
