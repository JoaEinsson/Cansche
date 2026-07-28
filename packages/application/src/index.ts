import { Calendar, Workspace } from '@cansche/domain';
import { ImportExportService as EngineImportExport } from '@cansche/engine';
import { PlatformAdapter } from '@cansche/platform';
import { CalendarRepository } from '@cansche/repositories';

export class ApplicationImportExportService {
  constructor(
    private repository: CalendarRepository,
    private platform: PlatformAdapter
  ) {}

  public async exportCalendarFile(calendar: Calendar): Promise<void> {
    const jsonContent = EngineImportExport.exportCalendar(calendar);
    const filename = `${calendar.name.toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
    await this.platform.saveFile(filename, jsonContent);
  }

  public async exportWorkspaceFile(workspace: Workspace): Promise<void> {
    const jsonContent = EngineImportExport.exportWorkspace(workspace);
    const filename = `${workspace.name.toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
    await this.platform.saveFile(filename, jsonContent);
  }

  public async importFileFromPlatform(): Promise<{ type: 'calendar' | 'workspace'; data: Calendar | Workspace } | null> {
    const content = await this.platform.openFile(['json', 'cansche']);
    if (!content) return null;
    return EngineImportExport.importFile(content);
  }
}

export class BackupService {
  constructor(
    private repository: CalendarRepository,
    private platform: PlatformAdapter
  ) {}

  public async createBackup(): Promise<void> {
    const ws = await this.repository.getWorkspace();
    if (!ws) return;
    const json = EngineImportExport.exportWorkspace(ws);
    const dateStr = new Date().toISOString().split('T')[0];
    await this.platform.saveFile(`cansche-backup-${dateStr}.cansche.json`, json);
  }
}

export class NotificationService {
  constructor(private platform: PlatformAdapter) {}

  public async notify(title: string, body: string): Promise<void> {
    await this.platform.showNotification(title, body);
  }

  public async notifyPresetEvent(presetName: string, startTime?: string, location?: string): Promise<void> {
    const bodyParts: string[] = [];
    if (startTime) bodyParts.push(`Horário: ${startTime}`);
    if (location) bodyParts.push(`Local: ${location}`);
    await this.notify(`Compromisso: ${presetName}`, bodyParts.join(' • ') || 'Lembrete do Cansche Desktop');
  }
}
