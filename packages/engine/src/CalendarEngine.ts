import { Workspace, Calendar, Model, ClipboardData, CalendarEvent } from '@cansche/domain';
import { ISODate, generateId } from '@cansche/shared';
import { EngineContext } from './EngineContext';
import { Observable } from './Observable';
import { HistoryService } from './HistoryService';
import { ClipboardService } from './ClipboardService';
import { ImportExportService } from './ImportExportService';
import { Command } from './Command';

export class CalendarEngine implements EngineContext {
  private workspace: Workspace;
  public onStateChanged = new Observable<Workspace>();
  public historyService = new HistoryService();
  public clipboardService = new ClipboardService();
  private clipboardData: ClipboardData | null = null;

  constructor(initialWorkspace?: Workspace) {
    if (initialWorkspace && initialWorkspace.calendars && Object.keys(initialWorkspace.calendars).length > 0) {
      this.workspace = initialWorkspace;
    } else {
      this.workspace = this.createDefaultWorkspace();
    }
    this.ensureEditingCalendar();
  }

  private createDefaultWorkspace(): Workspace {
    const defaultCalId = `cal-${Date.now()}`;
    return {
      id: `ws-${Date.now()}`,
      name: 'Meu Workspace',
      editingCalendarId: defaultCalId,
      activeCalendarIds: [defaultCalId],
      calendars: {
        [defaultCalId]: {
          id: defaultCalId,
          name: 'Principal',
          color: '#5e6ad2',
          order: 0,
          visible: true,
          models: {},
          events: {},
        },
      },
    };
  }

  private ensureEditingCalendar(): void {
    const calKeys = Object.keys(this.workspace.calendars);
    if (calKeys.length > 0) {
      if (!this.workspace.editingCalendarId || !this.workspace.calendars[this.workspace.editingCalendarId]) {
        this.workspace.editingCalendarId = calKeys[0];
      }
    }
  }

  public getWorkspace(): Workspace {
    return this.workspace;
  }

  public setWorkspace(workspace: Workspace): void {
    this.workspace = workspace;
    this.ensureEditingCalendar();
    this.onStateChanged.notify(this.workspace);
  }

  public getActiveCalendar(): Calendar {
    this.ensureEditingCalendar();
    return this.workspace.calendars[this.workspace.editingCalendarId];
  }

  public setEditingCalendar(calendarId: string): void {
    if (this.workspace.calendars[calendarId]) {
      this.workspace.editingCalendarId = calendarId;
      this.onStateChanged.notify(this.workspace);
    }
  }

  public getCalendarsList(): Calendar[] {
    return Object.values(this.workspace.calendars).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  public toggleLayerVisibility(calendarId: string): void {
    const cal = this.workspace.calendars[calendarId];
    if (cal) {
      cal.visible = !cal.visible;
      this.onStateChanged.notify(this.workspace);
    }
  }

  public createCalendar(name: string, color?: string): Calendar {
    const id = `cal-${Date.now()}`;
    const newCal: Calendar = {
      id,
      name,
      color: color || '#02b8cc',
      visible: true,
      order: Object.keys(this.workspace.calendars).length,
      models: {},
      events: {},
    };
    this.workspace.calendars[id] = newCal;
    this.workspace.editingCalendarId = id;
    this.onStateChanged.notify(this.workspace);
    return newCal;
  }

  public duplicateCalendar(calendarId: string): Calendar | null {
    const source = this.workspace.calendars[calendarId];
    if (!source) return null;

    const copy = ImportExportService.deepCloneCalendar(source);
    copy.name = `${source.name} (Cópia)`;
    copy.order = Object.keys(this.workspace.calendars).length;

    this.workspace.calendars[copy.id] = copy;
    this.workspace.editingCalendarId = copy.id;
    this.onStateChanged.notify(this.workspace);
    return copy;
  }

  public deleteCalendar(calendarId: string): void {
    if (Object.keys(this.workspace.calendars).length <= 1) {
      return;
    }
    delete this.workspace.calendars[calendarId];
    this.ensureEditingCalendar();
    this.onStateChanged.notify(this.workspace);
  }

  public addModel(model: Omit<Model, 'id'>): Model {
    const activeCal = this.getActiveCalendar();
    if (!activeCal.models) activeCal.models = {};

    const id = `model-${Date.now()}`;
    const newModel: Model = { ...model, id };
    activeCal.models[id] = newModel;
    this.onStateChanged.notify(this.workspace);
    return newModel;
  }

  public updateModel(model: Model): void {
    const activeCal = this.getActiveCalendar();
    if (!activeCal.models) activeCal.models = {};
    activeCal.models[model.id] = model;
    this.onStateChanged.notify(this.workspace);
  }

  public deleteModel(modelId: string): void {
    const activeCal = this.getActiveCalendar();
    if (activeCal.models && activeCal.models[modelId]) {
      delete activeCal.models[modelId];
    }
    this.onStateChanged.notify(this.workspace);
  }

  public getModelsList(): Model[] {
    const activeCal = this.getActiveCalendar();
    return Object.values(activeCal.models || {});
  }

  public exportCalendar(calendarId?: string): string {
    const target = calendarId ? this.workspace.calendars[calendarId] : this.getActiveCalendar();
    return ImportExportService.exportCalendar(target);
  }

  public exportWorkspace(): string {
    return ImportExportService.exportWorkspace(this.workspace);
  }

  public importFile(jsonString: string): { type: 'calendar' | 'workspace'; data: Calendar | Workspace } {
    const imported = ImportExportService.importFile(jsonString);
    if (imported.type === 'workspace') {
      this.setWorkspace(imported.data as Workspace);
    } else if (imported.type === 'calendar') {
      const cal = imported.data as Calendar;
      this.workspace.calendars[cal.id] = cal;
      this.workspace.editingCalendarId = cal.id;
      this.ensureEditingCalendar();
      this.onStateChanged.notify(this.workspace);
    }
    return imported;
  }

  // EngineContext Implementation
  public setEventsForDate(date: ISODate, events: CalendarEvent[]): void {
    const calendar = this.getActiveCalendar();
    if (!calendar.events) calendar.events = {};

    const beforeCount = Object.keys(calendar.events).length;
    console.log(`[CANSCHE DIAG] 4. setEventsForDate executado para ${date}. Total eventos no calendário ANTES: ${beforeCount}`);

    for (const [id, evt] of Object.entries(calendar.events)) {
      if (evt.date === date) {
        delete calendar.events[id];
      }
    }

    for (const evt of events) {
      calendar.events[evt.id] = evt;
    }

    const afterCount = Object.keys(calendar.events).length;
    console.log(`[CANSCHE DIAG] 4a. setEventsForDate concluído para ${date}. Total eventos no calendário DEPOIS: ${afterCount}`);
  }

  public removeEvent(eventId: string): void {
    const calendar = this.getActiveCalendar();
    if (calendar.events && calendar.events[eventId]) {
      delete calendar.events[eventId];
      this.onStateChanged.notify(this.workspace);
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

  public canUndo(): boolean {
    return this.historyService.canUndo();
  }

  public canRedo(): boolean {
    return this.historyService.canRedo();
  }
}
