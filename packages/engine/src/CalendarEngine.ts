import { ISODate } from '@cansche/shared';
import { Workspace, Calendar, Model, CalendarEvent } from '@cansche/domain';
import { Observable } from './Observable';
import { HistoryService } from './HistoryService';
import { ClipboardService, ClipboardData } from './ClipboardService';
import { Command } from './Command';
import { EngineContext } from './EngineContext';
import { ImportExportService } from './ImportExportService';

export class CalendarEngine implements EngineContext {
  private workspace: Workspace;
  private historyService: HistoryService;
  public clipboardService: ClipboardService;
  public onStateChanged: Observable<Workspace>;

  private clipboardData: ClipboardData | null = null;

  constructor(initialWorkspace?: Workspace) {
    this.workspace = initialWorkspace || this.createDefaultWorkspace();
    this.historyService = new HistoryService();
    this.clipboardService = new ClipboardService();
    this.onStateChanged = new Observable<Workspace>();

    this.ensureEditingCalendar();
  }

  private createDefaultWorkspace(): Workspace {
    const defaultCalId = 'default-calendar';
    const defaultCal: Calendar = {
      id: defaultCalId,
      name: 'Meu Calendário',
      color: '#02b8cc',
      visible: true,
      order: 0,
      models: {},
      presets: {},
      cells: {},
      events: {},
    };

    return {
      id: 'default-workspace',
      name: 'Workspace Principal',
      editingCalendarId: defaultCalId,
      calendars: {
        [defaultCalId]: defaultCal,
      },
    };
  }

  private ensureEditingCalendar(): void {
    if (!this.workspace.calendars) {
      this.workspace.calendars = {};
    }

    const keys = Object.keys(this.workspace.calendars);
    if (keys.length === 0) {
      const def = this.createDefaultWorkspace();
      this.workspace = def;
      return;
    }

    if (!this.workspace.editingCalendarId || !this.workspace.calendars[this.workspace.editingCalendarId]) {
      this.workspace.editingCalendarId = keys[0];
    }

    for (const cal of Object.values(this.workspace.calendars)) {
      if (!cal.models) cal.models = {};
      if (!cal.events) cal.events = {};
      if ((cal as any).presets) cal.models = { ...cal.models, ...(cal as any).presets };
    }
  }

  public getWorkspace(): Workspace {
    return this.workspace;
  }

  public setWorkspace(ws: Workspace): void {
    this.workspace = ws;
    this.ensureEditingCalendar();
    this.onStateChanged.notify(this.workspace);
  }

  public getActiveCalendar(): Calendar {
    this.ensureEditingCalendar();
    return this.workspace.calendars[this.workspace.editingCalendarId!];
  }

  public getCalendarsList(): Calendar[] {
    return Object.values(this.workspace.calendars || {});
  }

  public setEditingCalendar(calendarId: string): void {
    if (this.workspace.calendars[calendarId]) {
      this.workspace.editingCalendarId = calendarId;
      this.onStateChanged.notify(this.workspace);
    }
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
      presets: {},
      cells: {},
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

    const newId = `cal-${Date.now()}`;
    const copy: Calendar = JSON.parse(JSON.stringify(source));
    copy.id = newId;
    copy.name = `${source.name} (Cópia)`;
    copy.order = Object.keys(this.workspace.calendars).length;

    this.workspace.calendars[newId] = copy;
    this.workspace.editingCalendarId = newId;
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
    if (!activeCal.presets) activeCal.presets = {};
    activeCal.presets[id] = newModel as any;

    this.onStateChanged.notify(this.workspace);
    return newModel;
  }

  public updateModel(model: Model): void {
    const activeCal = this.getActiveCalendar();
    if (!activeCal.models) activeCal.models = {};
    activeCal.models[model.id] = model;
    if (activeCal.presets) activeCal.presets[model.id] = model as any;

    this.onStateChanged.notify(this.workspace);
  }

  public deleteModel(modelId: string): void {
    const activeCal = this.getActiveCalendar();
    if (activeCal.models) delete activeCal.models[modelId];
    if (activeCal.presets) delete activeCal.presets[modelId];

    this.onStateChanged.notify(this.workspace);
  }

  public getModelsList(): Model[] {
    const activeCal = this.getActiveCalendar();
    return Object.values(activeCal.models || activeCal.presets || {});
  }

  public importCalendar(calendar: Calendar): void {
    this.workspace.calendars[calendar.id] = calendar;
    this.workspace.editingCalendarId = calendar.id;
    this.onStateChanged.notify(this.workspace);
  }

  public importWorkspace(ws: Workspace): void {
    this.workspace = ws;
    this.ensureEditingCalendar();
    this.onStateChanged.notify(this.workspace);
  }

  public exportCalendar(calendarId?: string): string {
    const target = calendarId ? this.workspace.calendars[calendarId] : this.getActiveCalendar();
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
