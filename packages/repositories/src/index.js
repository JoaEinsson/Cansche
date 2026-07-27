export class DefaultCalendarRepository {
    storageAdapter;
    constructor(storageAdapter) {
        this.storageAdapter = storageAdapter;
    }
    async getWorkspace() {
        return this.storageAdapter.loadWorkspace();
    }
    async saveWorkspace(workspace) {
        return this.storageAdapter.saveWorkspace(workspace);
    }
    async findCalendar(id) {
        const ws = await this.storageAdapter.loadWorkspace();
        if (!ws || !ws.calendars)
            return null;
        return ws.calendars[id] || null;
    }
    async deleteWorkspace(id) {
        return this.storageAdapter.deleteWorkspace(id);
    }
}
