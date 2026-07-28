import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, addDays, generateId } from '@cansche/shared';
import { ClipboardData, CalendarEvent } from '@cansche/domain';

export class PasteCommand implements Command {
  public description = 'Colar Eventos';
  private previousStates: Record<ISODate, CalendarEvent[]> = {};

  constructor(
    private targetStartDate: ISODate,
    private clipboardData: ClipboardData
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    for (const item of this.clipboardData.items) {
      const targetDate = addDays(this.targetStartDate, item.relativeDayOffset);
      const currentEvents = Object.values(calendar.events || {}).filter(e => e.date === targetDate);
      this.previousStates[targetDate] = [...currentEvents];

      const newEvents: CalendarEvent[] = (item.events || []).map((ev) => ({
        id: generateId('evt'),
        date: targetDate,
        modelId: ev.modelId,
        source: ev.source || 'model',
        overrides: ev.overrides ? { ...ev.overrides } : undefined,
        checklistState: (ev.checklistState || []).map((chk) => ({
          id: generateId('chk'),
          text: chk.text,
          completed: chk.completed,
        })),
        createdAt: new Date().toISOString(),
      }));

      context.setEventsForDate(targetDate, newEvents);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevEvents] of Object.entries(this.previousStates)) {
      context.setEventsForDate(date, prevEvents);
    }
  }
}
