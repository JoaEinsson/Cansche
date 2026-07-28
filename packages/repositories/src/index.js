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
export class LocalStorageRepository {
    key = 'cansche_workspace_data';
    async getWorkspace() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const data = localStorage.getItem(this.key);
                if (data)
                    return JSON.parse(data);
            }
        }
        catch (err) {
            console.error('LocalStorageRepository read error:', err);
        }
        return null;
    }
    async saveWorkspace(workspace) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(this.key, JSON.stringify(workspace));
            }
        }
        catch (err) {
            console.error('LocalStorageRepository write error:', err);
        }
    }
    async findCalendar(id) {
        const ws = await this.getWorkspace();
        if (!ws || !ws.calendars)
            return null;
        return ws.calendars[id] || null;
    }
    async deleteWorkspace(id) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(this.key);
            }
        }
        catch (err) {
            console.error('LocalStorageRepository delete error:', err);
        }
    }
}
