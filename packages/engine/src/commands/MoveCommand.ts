import { Command } from '../Command';
import { EngineContext } from '../EngineContext';
import { ISODate, diffInDays, addDays } from '@cansche/shared';
import { CalendarEvent } from '@cansche/domain';

export class MoveCommand implements Command {
  public description = 'Mover Eventos';
  private affectedPreviousStates: Record<ISODate, CalendarEvent[]> = {};

  constructor(
    private sourceDates: ISODate[],
    private targetStartDate: ISODate
  ) {}

  public execute(context: EngineContext): void {
    if (this.sourceDates.length === 0) return;

    const calendar = context.getActiveCalendar();
    const sortedSources = [...this.sourceDates].sort();
    const originDate = sortedSources[0];

    const moves: Array<{ targetDate: ISODate; events: CalendarEvent[] }> = [];

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

  public undo(context: EngineContext): void {
    for (const [date, prevEvents] of Object.entries(this.affectedPreviousStates)) {
      context.setEventsForDate(date, prevEvents);
    }
  }
}
