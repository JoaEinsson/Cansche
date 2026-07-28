import { CalendarEngine, Command } from '@cansche/engine';
import { Workspace, Calendar, Model, CalendarEvent, ClipboardData } from '@cansche/domain';
import { ISODate } from '@cansche/shared';

export interface CalendarQueryMap {
  workspace: Workspace;
  activeCalendar: Calendar;
  allCalendars: Calendar[];
  visibleCalendars: Calendar[];
  editingCalendarId: string;
  activeCalendarIds: string[];
  models: Model[];
  presets: Model[];
  selectedDates: ISODate[];
  events: Record<string, CalendarEvent>;
  clipboard: ClipboardData | null;
  canUndo: boolean;
  canRedo: boolean;
}

export type QueryType = keyof CalendarQueryMap;

export class CalendarAPI {
  constructor(private engine: CalendarEngine) {}

  public execute(command: Command): void {
    this.engine.execute(command);
  }

  public undo(): void {
    this.engine.undo();
  }

  public redo(): void {
    this.engine.redo();
  }

  public query<K extends QueryType>(queryType: K): CalendarQueryMap[K] {
    switch (queryType) {
      case 'workspace':
        return this.engine.getWorkspace() as CalendarQueryMap[K];
      case 'activeCalendar':
        return this.engine.getActiveCalendar() as CalendarQueryMap[K];
      case 'allCalendars': {
        const cals = Object.values(this.engine.getWorkspace().calendars);
        return cals.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as CalendarQueryMap[K];
      }
      case 'visibleCalendars': {
        const ws = this.engine.getWorkspace();
        const activeSet = new Set(ws.activeCalendarIds || []);
        const visible = Object.values(ws.calendars).filter(c => activeSet.has(c.id) || c.visible);
        return visible.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) as CalendarQueryMap[K];
      }
      case 'editingCalendarId':
        return this.engine.getWorkspace().editingCalendarId as CalendarQueryMap[K];
      case 'activeCalendarIds':
        return (this.engine.getWorkspace().activeCalendarIds || []) as CalendarQueryMap[K];
      case 'models':
      case 'presets':
        return Object.values(this.engine.getActiveCalendar().models || {}) as CalendarQueryMap[K];
      case 'selectedDates':
        return this.engine.selectionService.getSelectedDates() as CalendarQueryMap[K];
      case 'events':
        return (this.engine.getActiveCalendar().events || {}) as CalendarQueryMap[K];
      case 'clipboard':
        return this.engine.getClipboard() as CalendarQueryMap[K];
      case 'canUndo':
        return this.engine.historyService.canUndo() as CalendarQueryMap[K];
      case 'canRedo':
        return this.engine.historyService.canRedo() as CalendarQueryMap[K];
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }
  }

  public subscribe(listener: (workspace: Workspace) => void): () => void {
    return this.engine.onStateChanged.subscribe(listener);
  }

  public getEngine(): CalendarEngine {
    return this.engine;
  }
}
