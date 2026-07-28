import { Observable } from './Observable';
import { HistoryService } from './HistoryService';
import { ClipboardService } from './ClipboardService';
import { ImportExportService } from './ImportExportService';
export class CalendarEngine {
    workspace;
    onStateChanged = new Observable();
    historyService = new HistoryService();
    clipboardService = new ClipboardService();
    clipboardData = null;
    constructor(initialWorkspace) {
        if (initialWorkspace && initialWorkspace.calendars && Object.keys(initialWorkspace.calendars).length > 0) {
            this.workspace = initialWorkspace;
        }
        else {
            this.workspace = this.createDefaultWorkspace();
        }
        this.ensureEditingCalendar();
    }
    createDefaultWorkspace() {
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
    ensureEditingCalendar() {
        const calKeys = Object.keys(this.workspace.calendars);
        if (calKeys.length > 0) {
            if (!this.workspace.editingCalendarId || !this.workspace.calendars[this.workspace.editingCalendarId]) {
                this.workspace.editingCalendarId = calKeys[0];
            }
        }
    }
    getWorkspace() {
        return this.workspace;
    }
    setWorkspace(workspace) {
        this.workspace = workspace;
        this.ensureEditingCalendar();
        this.onStateChanged.notify(this.workspace);
    }
    getActiveCalendar() {
        this.ensureEditingCalendar();
        return this.workspace.calendars[this.workspace.editingCalendarId];
    }
    setEditingCalendar(calendarId) {
        if (this.workspace.calendars[calendarId]) {
            this.workspace.editingCalendarId = calendarId;
            this.onStateChanged.notify(this.workspace);
        }
    }
    getCalendarsList() {
        return Object.values(this.workspace.calendars).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    toggleLayerVisibility(calendarId) {
        const cal = this.workspace.calendars[calendarId];
        if (cal) {
            cal.visible = !cal.visible;
            this.onStateChanged.notify(this.workspace);
        }
    }
    createCalendar(name, color) {
        const id = `cal-${Date.now()}`;
        const newCal = {
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
    duplicateCalendar(calendarId) {
        const source = this.workspace.calendars[calendarId];
        if (!source)
            return null;
        const newId = `cal-${Date.now()}`;
        const copy = JSON.parse(JSON.stringify(source));
        copy.id = newId;
        copy.name = `${source.name} (Cópia)`;
        copy.order = Object.keys(this.workspace.calendars).length;
        this.workspace.calendars[newId] = copy;
        this.workspace.editingCalendarId = newId;
        this.onStateChanged.notify(this.workspace);
        return copy;
    }
    deleteCalendar(calendarId) {
        if (Object.keys(this.workspace.calendars).length <= 1) {
            return;
        }
        delete this.workspace.calendars[calendarId];
        this.ensureEditingCalendar();
        this.onStateChanged.notify(this.workspace);
    }
    addModel(model) {
        const activeCal = this.getActiveCalendar();
        if (!activeCal.models)
            activeCal.models = {};
        const id = `model-${Date.now()}`;
        const newModel = { ...model, id };
        activeCal.models[id] = newModel;
        this.onStateChanged.notify(this.workspace);
        return newModel;
    }
    updateModel(model) {
        const activeCal = this.getActiveCalendar();
        if (!activeCal.models)
            activeCal.models = {};
        activeCal.models[model.id] = model;
        this.onStateChanged.notify(this.workspace);
    }
    deleteModel(modelId) {
        const activeCal = this.getActiveCalendar();
        if (activeCal.models && activeCal.models[modelId]) {
            delete activeCal.models[modelId];
        }
        this.onStateChanged.notify(this.workspace);
    }
    getModelsList() {
        const activeCal = this.getActiveCalendar();
        return Object.values(activeCal.models || {});
    }
    exportCalendar(calendarId) {
        const target = calendarId ? this.workspace.calendars[calendarId] : this.getActiveCalendar();
        return ImportExportService.exportCalendar(target);
    }
    exportWorkspace() {
        return ImportExportService.exportWorkspace(this.workspace);
    }
    // EngineContext Implementation
    setEventsForDate(date, events) {
        const calendar = this.getActiveCalendar();
        if (!calendar.events)
            calendar.events = {};
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
    removeEvent(eventId) {
        const calendar = this.getActiveCalendar();
        if (calendar.events && calendar.events[eventId]) {
            delete calendar.events[eventId];
            this.onStateChanged.notify(this.workspace);
        }
    }
    toggleChecklistItem(eventId, itemId) {
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
    canUndo() {
        return this.historyService.canUndo();
    }
    canRedo() {
        return this.historyService.canRedo();
    }
}
