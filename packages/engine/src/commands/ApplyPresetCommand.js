import { generateId } from '@cansche/shared';
export class ApplyPresetCommand {
    dates;
    presetId;
    description = 'Aplicar Preset';
    previousStates = {};
    constructor(dates, presetId) {
        this.dates = dates;
        this.presetId = presetId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        const parentPreset = calendar.presets[this.presetId];
        this.previousStates = {};
        for (const date of this.dates) {
            const cell = calendar.cells[date];
            this.previousStates[date] = cell && cell.presetInstances ? [...cell.presetInstances] : [];
            const currentInstances = cell && cell.presetInstances ? [...cell.presetInstances] : [];
            const alreadyHas = currentInstances.some((inst) => inst.presetId === this.presetId);
            if (!alreadyHas) {
                // Instantiate checklist items from template
                const initialChecklist = (parentPreset?.content?.checklistTemplate || []).map((text) => ({
                    id: generateId('chk'),
                    text,
                    completed: false,
                }));
                currentInstances.push({
                    id: generateId('inst'),
                    presetId: this.presetId,
                    source: 'preset',
                    checklistState: initialChecklist,
                    createdAt: new Date().toISOString(),
                });
            }
            context.setCellPresetInstances(date, currentInstances);
        }
    }
    undo(context) {
        for (const [date, prevInstances] of Object.entries(this.previousStates)) {
            context.setCellPresetInstances(date, prevInstances);
        }
    }
}
