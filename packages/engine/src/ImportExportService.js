import { generateId } from '@cansche/shared';
export class ImportExportService {
    static exportCalendar(calendar) {
        const exportFile = {
            format: 'cansche',
            version: 1,
            type: 'calendar',
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                appVersion: '1.0.0',
            },
            data: JSON.parse(JSON.stringify(calendar)),
        };
        return JSON.stringify(exportFile, null, 2);
    }
    static exportWorkspace(workspace) {
        const exportFile = {
            format: 'cansche',
            version: 1,
            type: 'workspace',
            metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                appVersion: '1.0.0',
            },
            data: JSON.parse(JSON.stringify(workspace)),
        };
        return JSON.stringify(exportFile, null, 2);
    }
    static importFile(jsonString) {
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        }
        catch (e) {
            throw new Error('Formato de arquivo JSON inválido.');
        }
        const fileType = parsed.format === 'cansche' ? parsed.type : parsed.calendar ? 'calendar' : 'workspace';
        const rawData = parsed.format === 'cansche' ? parsed.data : parsed.calendar || parsed;
        if (fileType === 'calendar') {
            const importedCal = this.deepCloneCalendar(rawData);
            return { type: 'calendar', data: importedCal };
        }
        else {
            const importedWs = this.deepCloneWorkspace(rawData);
            return { type: 'workspace', data: importedWs };
        }
    }
    static deepCloneCalendar(source) {
        const newCalendarId = generateId('cal');
        const modelIdMap = {};
        const newModels = {};
        const rawModels = source.models || source.presets || {};
        for (const oldModel of Object.values(rawModels)) {
            const newModelId = generateId('model');
            modelIdMap[oldModel.id] = newModelId;
            newModels[newModelId] = {
                ...JSON.parse(JSON.stringify(oldModel)),
                id: newModelId,
            };
        }
        const newEvents = {};
        const rawEvents = source.events || {};
        if (Object.keys(rawEvents).length > 0) {
            for (const oldEvt of Object.values(rawEvents)) {
                const newEvtId = generateId('evt');
                newEvents[newEvtId] = {
                    ...JSON.parse(JSON.stringify(oldEvt)),
                    id: newEvtId,
                    modelId: oldEvt.modelId ? modelIdMap[oldEvt.modelId] || oldEvt.modelId : undefined,
                };
            }
        }
        else if (source.cells) {
            for (const [date, cell] of Object.entries(source.cells)) {
                if (cell && cell.presetInstances) {
                    for (const inst of cell.presetInstances) {
                        const newEvtId = generateId('evt');
                        newEvents[newEvtId] = {
                            id: newEvtId,
                            date,
                            modelId: modelIdMap[inst.presetId] || inst.presetId,
                            source: inst.source || 'model',
                            overrides: inst.overrides ? { ...inst.overrides } : undefined,
                            checklistState: inst.checklistState || [],
                            createdAt: inst.createdAt || new Date().toISOString(),
                        };
                    }
                }
            }
        }
        return {
            id: newCalendarId,
            name: source.name || 'Calendário Importado',
            description: source.description,
            color: source.color || '#5e6ad2',
            order: source.order ?? 0,
            visible: true,
            models: newModels,
            events: newEvents,
        };
    }
    static deepCloneWorkspace(source) {
        const newWsId = generateId('ws');
        const calendarIdMap = {};
        const newCalendars = {};
        for (const oldCal of Object.values(source.calendars || {})) {
            const clonedCal = this.deepCloneCalendar(oldCal);
            calendarIdMap[oldCal.id] = clonedCal.id;
            newCalendars[clonedCal.id] = clonedCal;
        }
        const editingId = calendarIdMap[source.editingCalendarId] || Object.keys(newCalendars)[0] || '';
        const activeIds = (source.activeCalendarIds || []).map((id) => calendarIdMap[id]).filter(Boolean);
        return {
            id: newWsId,
            name: source.name || 'Workspace Importado',
            calendars: newCalendars,
            editingCalendarId: editingId,
            activeCalendarIds: activeIds.length > 0 ? activeIds : [editingId],
        };
    }
}
