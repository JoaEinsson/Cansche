import { Workspace, Calendar, ClipboardData, Preset, PresetInstance } from '@cansche/domain';
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
            presets: {},
            cells: {},
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

    // Ensure all calendars have an order property
    let idx = 0;
    for (const cal of Object.values(ws.calendars)) {
      if (cal.order === undefined) {
        cal.order = idx++;
      }
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
      presets: {},
      cells: {},
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
  public setCellPresetInstances(date: ISODate, instances: PresetInstance[]): void {
    const calendar = this.getActiveCalendar();
    if (instances.length === 0) {
      delete calendar.cells[date];
    } else {
      calendar.cells[date] = {
        date,
        presetInstances: [...instances],
      };
    }
  }

  public toggleChecklistItem(date: ISODate, instanceId: string, itemId: string): void {
    const calendar = this.getActiveCalendar();
    const cell = calendar.cells[date];
    if (!cell || !cell.presetInstances) return;

    const instance = cell.presetInstances.find((i) => i.id === instanceId);
    if (instance && instance.checklistState) {
      const item = instance.checklistState.find((c) => c.id === itemId);
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

  public addPreset(preset: Omit<Preset, 'id'>): Preset {
    const newPreset: Preset = {
      ...preset,
      id: generateId('preset'),
    };
    const calendar = this.getActiveCalendar();
    calendar.presets[newPreset.id] = newPreset;
    this.onStateChanged.notify(this.workspace);
    return newPreset;
  }

  public updatePreset(preset: Preset): void {
    const calendar = this.getActiveCalendar();
    if (calendar.presets[preset.id]) {
      calendar.presets[preset.id] = { ...preset };
      this.onStateChanged.notify(this.workspace);
    }
  }

  public deletePreset(presetId: string): void {
    const calendar = this.getActiveCalendar();
    if (calendar.presets[presetId]) {
      delete calendar.presets[presetId];
      for (const [date, cell] of Object.entries(calendar.cells)) {
        if (cell.presetInstances && cell.presetInstances.some((inst) => inst.presetId === presetId)) {
          this.setCellPresetInstances(
            date,
            cell.presetInstances.filter((inst) => inst.presetId !== presetId)
          );
        }
      }
      this.onStateChanged.notify(this.workspace);
    }
  }
}
