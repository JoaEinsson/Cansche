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
    console.log('[CANSCHE DIAG] 3. PasteCommand.execute iniciado');
    console.log('[CANSCHE DIAG] 3a. targetStartDate:', this.targetStartDate);
    console.log('[CANSCHE DIAG] 3b. clipboardData:', JSON.stringify(this.clipboardData));

    const calendar = context.getActiveCalendar();
    this.previousStates = {};

    if (!this.clipboardData || !this.clipboardData.items || this.clipboardData.items.length === 0) {
      console.log('[CANSCHE DIAG] 3c. AVISO: clipboardData está nulo ou sem itens. Paste abortado.');
      return;
    }

    for (const item of this.clipboardData.items) {
      if (!item.events || item.events.length === 0) {
        console.log('[CANSCHE DIAG] 3d. Item sem eventos ignorado.');
        continue;
      }

      const targetDate = addDays(this.targetStartDate, item.relativeDayOffset);
      const currentEvents = Object.values(calendar.events || {}).filter((e) => e.date === targetDate);
      console.log(`[CANSCHE DIAG] 3e. Data de destino: ${targetDate}. Eventos atuais nesta data: ${currentEvents.length}`);

      this.previousStates[targetDate] = JSON.parse(JSON.stringify(currentEvents));

      const newEvents: CalendarEvent[] = item.events.map((ev) => ({
        id: generateId('evt'),
        date: targetDate,
        modelId: ev.modelId,
        source: ev.source || 'model',
        overrides: ev.overrides ? JSON.parse(JSON.stringify(ev.overrides)) : undefined,
        checklistState: (ev.checklistState || []).map((chk) => ({
          id: generateId('chk'),
          text: chk.text,
          completed: chk.completed,
        })),
        createdAt: new Date().toISOString(),
      }));

      console.log(`[CANSCHE DIAG] 3f. Novos eventos gerados para ${targetDate}: ${newEvents.length}`, newEvents);
      const mergedEvents = [...currentEvents, ...newEvents];
      console.log(`[CANSCHE DIAG] 3g. Eventos combinados totais para ${targetDate}: ${mergedEvents.length}`);

      context.setEventsForDate(targetDate, mergedEvents);
    }
  }

  public undo(context: EngineContext): void {
    for (const [date, prevEvents] of Object.entries(this.previousStates)) {
      context.setEventsForDate(date, prevEvents);
    }
  }
}
