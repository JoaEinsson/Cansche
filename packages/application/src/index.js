import { ImportExportService as EngineImportExport } from '@cansche/engine';
export class ApplicationImportExportService {
    repository;
    platform;
    constructor(repository, platform) {
        this.repository = repository;
        this.platform = platform;
    }
    async exportCalendarFile(calendar) {
        const jsonContent = EngineImportExport.exportCalendar(calendar);
        const filename = `${calendar.name.toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
        await this.platform.saveFile(filename, jsonContent);
    }
    async exportWorkspaceFile(workspace) {
        const jsonContent = EngineImportExport.exportWorkspace(workspace);
        const filename = `${workspace.name.toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
        await this.platform.saveFile(filename, jsonContent);
    }
    async importFileFromPlatform() {
        const content = await this.platform.openFile(['json', 'cansche']);
        if (!content)
            return null;
        return EngineImportExport.importFile(content);
    }
}
export class BackupService {
    repository;
    platform;
    constructor(repository, platform) {
        this.repository = repository;
        this.platform = platform;
    }
    async createBackup() {
        const ws = await this.repository.getWorkspace();
        if (!ws)
            return;
        const json = EngineImportExport.exportWorkspace(ws);
        const dateStr = new Date().toISOString().split('T')[0];
        await this.platform.saveFile(`cansche-backup-${dateStr}.cansche.json`, json);
    }
}
export class NotificationService {
    platform;
    constructor(platform) {
        this.platform = platform;
    }
    async notify(title, body) {
        await this.platform.showNotification(title, body);
    }
    async notifyPresetEvent(presetName, startTime, location) {
        const bodyParts = [];
        if (startTime)
            bodyParts.push(`Horário: ${startTime}`);
        if (location)
            bodyParts.push(`Local: ${location}`);
        await this.notify(`Compromisso: ${presetName}`, bodyParts.join(' • ') || 'Lembrete do Cansche Desktop');
    }
}
