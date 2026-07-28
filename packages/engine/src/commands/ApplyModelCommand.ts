import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, generateId } from '@cansche/shared';
import { CalendarEvent, ChecklistItem } from '@cansche/domain';

export class ApplyModelCommand implements Command {
  public description = 'Aplicar Modelo';
  private previousStates: Record<ISODate, CalendarEvent[]> = {};

  constructor(
    private dates: ISODate[],
    private modelId: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    const parentModel = calendar.models ? calendar.models[this.modelId] : undefined;
    this.previousStates = {};

    for (const date of this.dates) {
      const currentEvents = Object.values(calendar.events || {}).filter(e => e.date === date);
      this.previousStates[date] = [...currentEvents];

      const alreadyHas = currentEvents.some((ev) => ev.modelId === this.modelId);
      if (!alreadyHas) {
        const initialChecklist: ChecklistItem[] = (
          parentModel?.content?.checklistTemplate || []
        ).map((text) => ({
          id: generateId('chk'),
          text,
          completed: false,
        }));

        const newEvent: CalendarEvent = {
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

  public undo(context: EngineContext): void {
    for (const [date, prevEvents] of Object.entries(this.previousStates)) {
      context.setEventsForDate(date, prevEvents);
    }
  }
}
