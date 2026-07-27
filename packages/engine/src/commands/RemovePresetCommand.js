export class RemovePresetCommand {
    dates;
    presetId;
    description = 'Remover Preset';
    previousStates = {};
    constructor(dates, presetId) {
        this.dates = dates;
        this.presetId = presetId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        this.previousStates = {};
        for (const date of this.dates) {
            const cell = calendar.cells[date];
            this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
            if (!this.presetId) {
                context.setCellPresetInstances(date, []);
            }
            else {
                const current = cell && cell.presetInstances ? cell.presetInstances : [];
                const updated = current.filter((inst) => inst.presetId !== this.presetId);
                context.setCellPresetInstances(date, updated);
            }
        }
    }
    undo(context) {
        for (const [date, prevInstances] of Object.entries(this.previousStates)) {
            context.setCellPresetInstances(date, prevInstances);
        }
    }
}
