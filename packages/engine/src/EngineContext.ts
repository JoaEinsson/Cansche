import { Workspace, Calendar, ClipboardData, CalendarEvent } from '@cansche/domain';
import { ISODate } from '@cansche/shared';

export interface EngineContext {
  getWorkspace(): Workspace;
  setWorkspace(workspace: Workspace): void;
  getActiveCalendar(): Calendar;
  setEventsForDate(date: ISODate, events: CalendarEvent[]): void;
  getClipboard(): ClipboardData | null;
  setClipboard(clipboard: ClipboardData | null): void;
}
