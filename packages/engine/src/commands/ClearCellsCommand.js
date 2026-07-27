export class ClearCellsCommand {
    dates;
    description = 'Limpar Células';
    previousStates = {};
    constructor(dates) {
        this.dates = dates;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        this.previousStates = {};
        for (const date of this.dates) {
            const cell = calendar.cells[date];
            this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
            context.setCellPresetInstances(date, []);
        }
    }
    undo(context) {
        for (const [date, prevInstances] of Object.entries(this.previousStates)) {
            context.setCellPresetInstances(date, prevInstances);
        }
    }
}
