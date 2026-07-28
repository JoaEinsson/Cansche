import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate } from '@cansche/shared';
import { CalendarEvent } from '@cansche/domain';

export class RemoveModelCommand implements Command {
  public description = 'Remover Modelo';
  private previousStates: Record<ISODate, CalendarEvent[]> = {};

  constructor(
    private dates: ISODate[],
    private modelId?: string
  ) {}

  public execute(context: EngineContext): void {
    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    for (const date of this.dates) {
      const current = Object.values(calendar.events || {}).filter(e => e.date === date);
      this.previousStates[date] = [...current];

      if (!this.modelId) {
        context.setEventsForDate(date, []);
      } else {
        const updated = current.filter((ev) => ev.modelId !== this.modelId);
        context.setEventsForDate(date, updated);
      }
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevEvents] of Object.entries(this.previousStates)) {
      context.setEventsForDate(date, prevEvents);
    }
  }
}
