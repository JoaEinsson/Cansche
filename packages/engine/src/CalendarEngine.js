import { generateId } from '@cansche/shared';
import { SelectionService } from '@cansche/selection';
import { HistoryService } from './HistoryService';
import { ClipboardService } from './ClipboardService';
import { Observable } from './Observable';
import { ImportExportService } from './ImportExportService';
export class CalendarEngine {
    workspace;
    clipboardData = null;
    selectionService = new SelectionService();
    historyService = new HistoryService();
    clipboardService = new ClipboardService();
    onStateChanged = new Observable();
    constructor(initialWorkspace) {
        if (initialWorkspace) {
            this.workspace = this.normalizeWorkspace(initialWorkspace);
        }
        else {
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
    normalizeWorkspace(ws) {
        const activeId = ws.editingCalendarId || ws.activeCalendarId || Object.keys(ws.calendars)[0] || '';
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
    getWorkspace() {
        return this.workspace;
    }
    setWorkspace(workspace) {
        this.workspace = this.normalizeWorkspace(workspace);
        this.onStateChanged.notify(this.workspace);
    }
    getActiveCalendar() {
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
    createCalendar(name, color = '#5e6ad2', description) {
        const id = generateId('cal');
        const newOrder = Object.keys(this.workspace.calendars).length;
        const newCal = {
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
    setEditingCalendar(calendarId) {
        if (this.workspace.calendars[calendarId]) {
            this.workspace.editingCalendarId = calendarId;
            this.onStateChanged.notify(this.workspace);
        }
    }
    toggleCalendarVisibility(calendarId) {
        const cal = this.workspace.calendars[calendarId];
        if (cal) {
            cal.visible = !cal.visible;
            const set = new Set(this.workspace.activeCalendarIds);
            if (cal.visible) {
                set.add(calendarId);
            }
            else {
                set.delete(calendarId);
            }
            this.workspace.activeCalendarIds = Array.from(set);
            this.onStateChanged.notify(this.workspace);
        }
    }
    reorderCalendar(calendarId, newOrder) {
        const cal = this.workspace.calendars[calendarId];
        if (cal) {
            cal.order = newOrder;
            this.onStateChanged.notify(this.workspace);
        }
    }
    deleteCalendar(calendarId) {
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
    duplicateCalendar(calendarId) {
        const target = this.workspace.calendars[calendarId];
        if (!target)
            throw new Error('Calendário não encontrado.');
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
    importFile(jsonString) {
        const result = ImportExportService.importFile(jsonString);
        if (result.type === 'calendar') {
            const cal = result.data;
            cal.order = Object.keys(this.workspace.calendars).length;
            this.workspace.calendars[cal.id] = cal;
            this.workspace.editingCalendarId = cal.id;
            if (!this.workspace.activeCalendarIds.includes(cal.id)) {
                this.workspace.activeCalendarIds.push(cal.id);
            }
            this.onStateChanged.notify(this.workspace);
            return { type: 'calendar', id: cal.id };
        }
        else {
            const ws = result.data;
            this.workspace = this.normalizeWorkspace(ws);
            this.onStateChanged.notify(this.workspace);
            return { type: 'workspace', id: ws.id };
        }
    }
    exportCalendar(calendarId) {
        const target = this.workspace.calendars[calendarId];
        if (!target)
            throw new Error('Calendário não encontrado para exportação.');
        return ImportExportService.exportCalendar(target);
    }
    exportWorkspace() {
        return ImportExportService.exportWorkspace(this.workspace);
    }
    // EngineContext Implementation
    setCellPresetInstances(date, instances) {
        const calendar = this.getActiveCalendar();
        if (instances.length === 0) {
            delete calendar.cells[date];
        }
        else {
            calendar.cells[date] = {
                date,
                presetInstances: [...instances],
            };
        }
    }
    toggleChecklistItem(date, instanceId, itemId) {
        const calendar = this.getActiveCalendar();
        const cell = calendar.cells[date];
        if (!cell || !cell.presetInstances)
            return;
        const instance = cell.presetInstances.find((i) => i.id === instanceId);
        if (instance && instance.checklistState) {
            const item = instance.checklistState.find((c) => c.id === itemId);
            if (item) {
                item.completed = !item.completed;
                this.onStateChanged.notify(this.workspace);
            }
        }
    }
    getClipboard() {
        return this.clipboardData;
    }
    setClipboard(clipboard) {
        this.clipboardData = clipboard;
    }
    execute(command) {
        this.historyService.executeCommand(command, this);
        this.onStateChanged.notify(this.workspace);
    }
    undo() {
        const cmd = this.historyService.undo(this);
        if (cmd) {
            this.onStateChanged.notify(this.workspace);
        }
        return cmd;
    }
    redo() {
        const cmd = this.historyService.redo(this);
        if (cmd) {
            this.onStateChanged.notify(this.workspace);
        }
        return cmd;
    }
    addPreset(preset) {
        const newPreset = {
            ...preset,
            id: generateId('preset'),
        };
        const calendar = this.getActiveCalendar();
        calendar.presets[newPreset.id] = newPreset;
        this.onStateChanged.notify(this.workspace);
        return newPreset;
    }
    updatePreset(preset) {
        const calendar = this.getActiveCalendar();
        if (calendar.presets[preset.id]) {
            calendar.presets[preset.id] = { ...preset };
            this.onStateChanged.notify(this.workspace);
        }
    }
    deletePreset(presetId) {
        const calendar = this.getActiveCalendar();
        if (calendar.presets[presetId]) {
            delete calendar.presets[presetId];
            for (const [date, cell] of Object.entries(calendar.cells)) {
                if (cell.presetInstances && cell.presetInstances.some((inst) => inst.presetId === presetId)) {
                    this.setCellPresetInstances(date, cell.presetInstances.filter((inst) => inst.presetId !== presetId));
                }
            }
            this.onStateChanged.notify(this.workspace);
        }
    }
}
