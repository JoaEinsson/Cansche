import { generateId } from '@cansche/shared';
export class ApplyModelCommand {
    dates;
    modelId;
    description = 'Aplicar Modelo';
    previousStates = {};
    constructor(dates, modelId) {
        this.dates = dates;
        this.modelId = modelId;
    }
    execute(context) {
        const calendar = context.getActiveCalendar();
        const parentModel = calendar.models ? calendar.models[this.modelId] : undefined;
        this.previousStates = {};
        for (const date of this.dates) {
            const currentEvents = Object.values(calendar.events || {}).filter(e => e.date === date);
            this.previousStates[date] = [...currentEvents];
            const alreadyHas = currentEvents.some((ev) => ev.modelId === this.modelId);
            if (!alreadyHas) {
                const initialChecklist = (parentModel?.content?.checklistTemplate || []).map((text) => ({
                    id: generateId('chk'),
                    text,
                    completed: false,
                }));
                const newEvent = {
                    id: generateId('evt'),
                    date,
                    modelId: this.modelId,
                    source: 'model',
                    checklistState: initialChecklist,
                    createdAt: new Date().toISOString(),
                };
                currentEvents.push(newEvent);
            }
            context.setEventsForDate(date, currentEvents);
        }
    }
    undo(context) {
        for (const [date, prevEvents] of Object.entries(this.previousStates)) {
            context.setEventsForDate(date, prevEvents);
        }
    }
}
