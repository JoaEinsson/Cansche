import { Calendar, Workspace, CanscheFile, Model, CalendarEvent } from '@cansche/domain';
import { generateId } from '@cansche/shared';

export class ImportExportService {
  public static exportCalendar(calendar: Calendar): string {
    const exportFile: CanscheFile = {
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

  public static exportWorkspace(workspace: Workspace): string {
    const exportFile: CanscheFile = {
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

  public static importFile(jsonString: string): { type: 'calendar' | 'workspace'; data: Calendar | Workspace } {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Formato de arquivo JSON inválido.');
    }

    const fileType = parsed.format === 'cansche' ? parsed.type : parsed.calendar ? 'calendar' : 'workspace';
    const rawData = parsed.format === 'cansche' ? parsed.data : parsed.calendar || parsed;

    if (fileType === 'calendar') {
      const importedCal = this.deepCloneCalendar(rawData);
      return { type: 'calendar', data: importedCal };
    } else {
      const importedWs = this.deepCloneWorkspace(rawData);
      return { type: 'workspace', data: importedWs };
    }
  }

  public static deepCloneCalendar(source: Calendar): Calendar {
    const newCalendarId = generateId('cal');
    const modelIdMap: Record<string, string> = {};
    const newModels: Record<string, Model> = {};

    const rawModels = source.models || (source as any).presets || {};
    for (const oldModel of Object.values(rawModels)) {
      const newModelId = generateId('model');
      modelIdMap[(oldModel as any).id] = newModelId;
      newModels[newModelId] = {
        ...JSON.parse(JSON.stringify(oldModel)),
        id: newModelId,
      };
    }

    const newEvents: Record<string, CalendarEvent> = {};
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
    } else if ((source as any).cells) {
      for (const [date, cell] of Object.entries((source as any).cells as Record<string, any>)) {
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

  public static deepCloneWorkspace(source: Workspace): Workspace {
    const newWsId = generateId('ws');
    const calendarIdMap: Record<string, string> = {};
    const newCalendars: Record<string, Calendar> = {};

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
