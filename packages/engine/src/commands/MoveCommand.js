import { diffInDays, addDays } from '@cansche/shared';
export class MoveCommand {
    sourceDates;
    targetStartDate;
    description = 'Mover Células';
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
            const cell = calendar.cells[srcDate];
            moves.push({
                targetDate,
                instances: cell && cell.presetInstances ? [...cell.presetInstances] : [],
            });
        }
        this.affectedPreviousStates = {};
        const allAffected = new Set([...this.sourceDates, ...moves.map((m) => m.targetDate)]);
        for (const date of allAffected) {
            const cell = calendar.cells[date];
            this.affectedPreviousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
        }
        for (const srcDate of this.sourceDates) {
            context.setCellPresetInstances(srcDate, []);
        }
        for (const move of moves) {
            context.setCellPresetInstances(move.targetDate, move.instances);
        }
    }
    undo(context) {
        for (const [date, prevInstances] of Object.entries(this.affectedPreviousStates)) {
            context.setCellPresetInstances(date, prevInstances);
        }
    }
}
