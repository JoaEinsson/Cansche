import { addDays, generateId } from '@cansche/shared';
export class PasteCommand {
    targetStartDate;
    clipboardData;
    description = 'Colar Células';
    previousStates = {};
    constructor(targetStartDate, clipboardData) {
        this.targetStartDate = targetStartDate;
        this.clipboardData = clipboardData;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        this.previousStates = {};
        for (const item of this.clipboardData.items) {
            const targetDate = addDays(this.targetStartDate, item.relativeDayOffset);
            const cell = calendar.cells[targetDate];
            this.previousStates[targetDate] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
            const newInstances = item.presetInstances.map((inst) => ({
                id: generateId('inst'),
                presetId: inst.presetId,
                source: inst.source || 'preset',
                overrides: inst.overrides ? { ...inst.overrides } : undefined,
                checklistState: (inst.checklistState || []).map((chk) => ({
                    id: generateId('chk'),
                    text: chk.text,
                    completed: chk.completed,
                })),
                createdAt: new Date().toISOString(),
            }));
            context.setCellPresetInstances(targetDate, newInstances);
        }
    }
    undo(context) {
        for (const [date, prevInstances] of Object.entries(this.previousStates)) {
            context.setCellPresetInstances(date, prevInstances);
        }
    }
}
