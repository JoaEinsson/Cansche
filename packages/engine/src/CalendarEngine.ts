import { Workspace, Calendar, ClipboardData, Model, CalendarEvent } from '@cansche/domain';
import { generateId, ISODate } from '@cansche/shared';
import { SelectionService } from '@cansche/selection';
import { EngineContext } from './EngineContext';
import { Command } from './Command';
import { HistoryService } from './HistoryService';
import { ClipboardService } from './ClipboardService';
import { Observable } from './Observable';
import { ImportExportService } from './ImportExportService';

export class CalendarEngine implements EngineContext {
  private workspace: Workspace;
  private clipboardData: ClipboardData | null = null;

  public readonly selectionService = new SelectionService();
  public readonly historyService = new HistoryService();
  public readonly clipboardService = new ClipboardService();

  public readonly onStateChanged = new Observable<Workspace>();

  constructor(initialWorkspace?: Workspace) {
    if (initialWorkspace) {
      this.workspace = this.normalizeWorkspace(initialWorkspace);
    } else {
      const defaultCalId = generateId('cal');
      this.workspace = {
        id: generateId('ws'),
        name: 'Default Workspace',
        editingCalendarId: defaultCalId,
        activeCalendarIds: [defaultCalId],
        calendars: {
          [defaultCalId]: {
            id: defaultCalId,
            name: 'Meu Calendário',
            color: '#5e6ad2',
            order: 0,
            visible: true,
            models: {},
            events: {},
          },
        },
      };
    }
  }

  private normalizeWorkspace(ws: Workspace): Workspace {
    const activeId = ws.editingCalendarId || (ws as any).activeCalendarId || Object.keys(ws.calendars)[0] || '';
    const activeIds = Array.isArray(ws.activeCalendarIds)
      ? ws.activeCalendarIds
      : Object.values(ws.calendars).filter(c => c.visible).map(c => c.id);

    let idx = 0;
    for (const cal of Object.values(ws.calendars)) {
      if (cal.order === undefined) {
        cal.order = idx++;
      }
      if (!cal.models) cal.models = (cal as any).presets || {};
      if (!cal.events) cal.events = {};
    }

    return {
      id: ws.id || generateId('ws'),
      name: ws.name || 'Default Workspace',
      editingCalendarId: activeId,
      activeCalendarIds: activeIds.length > 0 ? activeIds : [activeId],
      calendars: ws.calendars || {},
    };
  }

  public getWorkspace(): Workspace {
    return this.workspace;
  }

  public setWorkspace(workspace: Workspace): void {
    this.workspace = this.normalizeWorkspace(workspace);
    this.onStateChanged.notify(this.workspace);
  }

  public getActiveCalendar(): Calendar {
    const calendar = this.workspace.calendars[this.workspace.editingCalendarId];
    if (!calendar) {
      const firstCal = Object.values(this.workspace.calendars)[0];
      if (firstCal) {
        this.workspace.editingCalendarId = firstCal.id;
        return firstCal;
      }
      throw new Error(`Nenhum calendário ativo encontrado.`);
    }
    return calendar;
  }

  // Workspace & Layer Management
  public createCalendar(name: string, color: string = '#5e6ad2', description?: string): Calendar {
    const id = generateId('cal');
    const newOrder = Object.keys(this.workspace.calendars).length;
    const newCal: Calendar = {
      id,
      name,
      description,
      color,
      order: newOrder,
      visible: true,
      models: {},
      events: {},
    };
    this.workspace.calendars[id] = newCal;
    this.workspace.editingCalendarId = id;
    if (!this.workspace.activeCalendarIds.includes(id)) {
      this.workspace.activeCalendarIds.push(id);
    }
    this.onStateChanged.notify(this.workspace);
    return newCal;
  }

  public setEditingCalendar(calendarId: string): void {
    if (this.workspace.calendars[calendarId]) {
      this.workspace.editingCalendarId = calendarId;
      this.onStateChanged.notify(this.workspace);
    }
  }

  public toggleCalendarVisibility(calendarId: string): void {
    const cal = this.workspace.calendars[calendarId];
    if (cal) {
      cal.visible = !cal.visible;
      const set = new Set(this.workspace.activeCalendarIds);
      if (cal.visible) {
        set.add(calendarId);
      } else {
        set.delete(calendarId);
      }
      this.workspace.activeCalendarIds = Array.from(set);
      this.onStateChanged.notify(this.workspace);
    }
  }

  public reorderCalendar(calendarId: string, newOrder: number): void {
    const cal = this.workspace.calendars[calendarId];
    if (cal) {
      cal.order = newOrder;
      this.onStateChanged.notify(this.workspace);
    }
  }

  public deleteCalendar(calendarId: string): void {
    const calendars = this.workspace.calendars;
    if (Object.keys(calendars).length <= 1) {
      throw new Error('Não é possível excluir o único calendário do Workspace.');
    }
    if (calendars[calendarId]) {
      delete calendars[calendarId];
      this.workspace.activeCalendarIds = this.workspace.activeCalendarIds.filter(id => id !== calendarId);

      if (this.workspace.editingCalendarId === calendarId) {
        this.workspace.editingCalendarId = Object.keys(calendars)[0];
      }
      this.onStateChanged.notify(this.workspace);
    }
  }

  public duplicateCalendar(calendarId: string): Calendar {
    const target = this.workspace.calendars[calendarId];
    if (!target) throw new Error('Calendário não encontrado.');

    const duplicated = ImportExportService.deepCloneCalendar(target);
    duplicated.name = `${target.name} (Cópia)`;
    duplicated.order = Object.keys(this.workspace.calendars).length;

    this.workspace.calendars[duplicated.id] = duplicated;
    if (!this.workspace.activeCalendarIds.includes(duplicated.id)) {
      this.workspace.activeCalendarIds.push(duplicated.id);
    }
    this.onStateChanged.notify(this.workspace);
    return duplicated;
  }

  public importFile(jsonString: string): { type: 'calendar' | 'workspace'; id: string } {
    const result = ImportExportService.importFile(jsonString);
    if (result.type === 'calendar') {
      const cal = result.data as Calendar;
      cal.order = Object.keys(this.workspace.calendars).length;
      this.workspace.calendars[cal.id] = cal;
      this.workspace.editingCalendarId = cal.id;
      if (!this.workspace.activeCalendarIds.includes(cal.id)) {
        this.workspace.activeCalendarIds.push(cal.id);
      }
      this.onStateChanged.notify(this.workspace);
      return { type: 'calendar', id: cal.id };
    } else {
      const ws = result.data as Workspace;
      this.workspace = this.normalizeWorkspace(ws);
      this.onStateChanged.notify(this.workspace);
      return { type: 'workspace', id: ws.id };
    }
  }

  public exportCalendar(calendarId: string): string {
    const target = this.workspace.calendars[calendarId];
    if (!target) throw new Error('Calendário não encontrado para exportação.');
    return ImportExportService.exportCalendar(target);
  }

  public exportWorkspace(): string {
    return ImportExportService.exportWorkspace(this.workspace);
  }

  // EngineContext Implementation
  public setEventsForDate(date: ISODate, events: CalendarEvent[]): void {
    const calendar = this.getActiveCalendar();
    if (!calendar.events) calendar.events = {};

    for (const [id, evt] of Object.entries(calendar.events)) {
      if (evt.date === date) {
        delete calendar.events[id];
      }
    }

    for (const evt of events) {
      calendar.events[evt.id] = evt;
    }
  }

  public toggleChecklistItem(eventId: string, itemId: string): void {
    const calendar = this.getActiveCalendar();
    const event = calendar.events ? calendar.events[eventId] : undefined;
    if (event && event.checklistState) {
      const item = event.checklistState.find((c) => c.id === itemId);
      if (item) {
        item.completed = !item.completed;
        this.onStateChanged.notify(this.workspace);
      }
    }
  }

  public getClipboard(): ClipboardData | null {
    return this.clipboardData;
  }

  public setClipboard(clipboard: ClipboardData | null): void {
    this.clipboardData = clipboard;
  }

  public execute(command: Command): void {
    this.historyService.executeCommand(command, this);
    this.onStateChanged.notify(this.workspace);
  }

  public undo(): Command | null {
    const cmd = this.historyService.undo(this);
    if (cmd) {
      this.onStateChanged.notify(this.workspace);
    }
    return cmd;
  }

  public redo(): Command | null {
    const cmd = this.historyService.redo(this);
    if (cmd) {
      this.onStateChanged.notify(this.workspace);
    }
    return cmd;
  }

  public addModel(model: Omit<Model, 'id'>): Model {
    const newModel: Model = {
      ...model,
      id: generateId('model'),
    };
    const calendar = this.getActiveCalendar();
    console.log('[DEBUG 3 Engine] addModel ANTES:', Object.keys(calendar.models || {}));
    if (!calendar.models) calendar.models = {};
    calendar.models[newModel.id] = newModel;
    console.log('[DEBUG 3 Engine] addModel DEPOIS:', Object.keys(calendar.models));
    this.onStateChanged.notify(this.workspace);
    return newModel;
  }

  public updateModel(model: Model): void {
    const calendar = this.getActiveCalendar();
    if (calendar.models && calendar.models[model.id]) {
      calendar.models[model.id] = { ...model };
      this.onStateChanged.notify(this.workspace);
    }
  }

  public deleteModel(modelId: string): void {
    const calendar = this.getActiveCalendar();
    if (calendar.models && calendar.models[modelId]) {
      delete calendar.models[modelId];
      if (calendar.events) {
        for (const [evtId, evt] of Object.entries(calendar.events)) {
          if (evt.modelId === modelId) {
            delete calendar.events[evtId];
          }
        }
      }
      this.onStateChanged.notify(this.workspace);
    }
  }

  public addPreset(model: Omit<Model, 'id'>): Model {
    return this.addModel(model);
  }
  public updatePreset(model: Model): void {
    this.updateModel(model);
  }
  public deletePreset(modelId: string): void {
    this.deleteModel(modelId);
  }
}
