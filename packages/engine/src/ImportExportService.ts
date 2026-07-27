import { Calendar, Workspace, CanscheFile, Preset, CellMap } from '@cansche/domain';
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

    // Support both standardized CanscheFile wrapper and legacy plain json
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
    const presetIdMap: Record<string, string> = {};
    const newPresets: Record<string, Preset> = {};

    for (const oldPreset of Object.values(source.presets || {})) {
      const newPresetId = generateId('preset');
      presetIdMap[oldPreset.id] = newPresetId;
      newPresets[newPresetId] = {
        ...JSON.parse(JSON.stringify(oldPreset)),
        id: newPresetId,
      };
    }

    const newCells: CellMap = {};
    for (const [date, cell] of Object.entries(source.cells || {})) {
      if (cell && cell.presetInstances) {
        newCells[date] = {
          date,
          presetInstances: cell.presetInstances.map((inst) => ({
            ...JSON.parse(JSON.stringify(inst)),
            id: generateId('inst'),
            presetId: presetIdMap[inst.presetId] || inst.presetId,
          })),
        };
      }
    }

    return {
      id: newCalendarId,
      name: source.name || 'Calendário Importado',
      description: source.description,
      color: source.color || '#5e6ad2',
      order: source.order ?? 0,
      visible: true,
      presets: newPresets,
      cells: newCells,
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
