import { describe, it, expect, beforeEach } from 'vitest';
import { CalendarEngine } from '../src/CalendarEngine';
import { ApplyModelCommand } from '../src/commands/ApplyModelCommand';
import { ImportExportService } from '../src/ImportExportService';
import { CalendarAPI } from '@cansche/api';

describe('Workspace Manager, Layer Composition & CanscheFile Schema', () => {
  let engine: CalendarEngine;
  let api: CalendarAPI;

  beforeEach(() => {
    engine = new CalendarEngine();
    api = new CalendarAPI(engine);
  });

  it('should separate editingCalendarId from activeCalendarIds', () => {
    const calFaculty = engine.createCalendar('📚 Faculdade 2026', '#5e6ad2');
    const calPersonal = engine.createCalendar('🏠 Pessoal', '#10b981');

    expect(api.query('editingCalendarId')).toBe(calPersonal.id);
    expect(api.query('activeCalendarIds')).toContain(calFaculty.id);
    expect(api.query('activeCalendarIds')).toContain(calPersonal.id);

    engine.setEditingCalendar(calFaculty.id);
    expect(api.query('editingCalendarId')).toBe(calFaculty.id);
  });

  it('should deep clone calendar without sharing model or event IDs', () => {
    const workModel = engine.addModel({
      name: 'Aula de Cálculo',
      emoji: '📚',
      color: '#5e6ad2',
    });

    api.execute(new ApplyModelCommand(['2026-08-10'], workModel.id));
    const activeCal = engine.getActiveCalendar();

    const duplicated = engine.duplicateCalendar(activeCal.id);
    expect(duplicated.id).not.toBe(activeCal.id);

    const dupModelId = Object.keys(duplicated.models)[0];
    expect(dupModelId).not.toBe(workModel.id);

    const dupEvt = Object.values(duplicated.events)[0];
    expect(dupEvt.modelId).toBe(dupModelId);
  });

  it('should export and import CanscheFile for both calendar and workspace', () => {
    const cal = engine.getActiveCalendar();
    const calJson = ImportExportService.exportCalendar(cal);
    expect(calJson).toContain('"format": "cansche"');
    expect(calJson).toContain('"type": "calendar"');

    const importedCalRes = engine.importFile(calJson);
    expect(importedCalRes.type).toBe('calendar');

    const wsJson = engine.exportWorkspace();
    expect(wsJson).toContain('"format": "cansche"');
    expect(wsJson).toContain('"type": "workspace"');

    const importedWsRes = engine.importFile(wsJson);
    expect(importedWsRes.type).toBe('workspace');
  });
});
