import Dexie from 'dexie';
class CanscheDexieDatabase extends Dexie {
    workspaces;
    constructor() {
        super('CanscheDatabase');
        this.version(1).stores({
            workspaces: 'id',
        });
    }
}
export class IndexedDBAdapter {
    db;
    constructor() {
        this.db = new CanscheDexieDatabase();
    }
    async saveWorkspace(workspace) {
        await this.db.workspaces.put(workspace);
    }
    async loadWorkspace() {
        const all = await this.db.workspaces.toArray();
        return all.length > 0 ? all[0] : null;
    }
    async deleteWorkspace(id) {
        await this.db.workspaces.delete(id);
    }
}
export class SQLiteStorageAdapter {
    memoryCache = null;
    dbName = 'cansche.db';
    constructor(dbName) {
        if (dbName)
            this.dbName = dbName;
    }
    async saveWorkspace(workspace) {
        this.memoryCache = JSON.parse(JSON.stringify(workspace));
        try {
            if (typeof window !== 'undefined' && window.__TAURI__) {
                await window.__TAURI__.invoke('save_workspace_sqlite', {
                    id: workspace.id,
                    name: workspace.name,
                    data: JSON.stringify(workspace),
                });
            }
        }
        catch {
            // In-memory fallback
        }
    }
    async loadWorkspace() {
        try {
            if (typeof window !== 'undefined' && window.__TAURI__) {
                const jsonStr = await window.__TAURI__.invoke('load_workspace_sqlite');
                if (jsonStr) {
                    const parsed = JSON.parse(jsonStr);
                    this.memoryCache = parsed;
                    return parsed;
                }
            }
        }
        catch {
            // Fallback
        }
        return this.memoryCache;
    }
    async deleteWorkspace(id) {
        this.memoryCache = null;
        try {
            if (typeof window !== 'undefined' && window.__TAURI__) {
                await window.__TAURI__.invoke('delete_workspace_sqlite', { id });
            }
        }
        catch {
            // Fallback
        }
    }
}
export class StorageFactory {
    static createAdapter(type = 'indexeddb') {
        if (type === 'sqlite') {
            return new SQLiteStorageAdapter();
        }
        return new IndexedDBAdapter();
    }
}
