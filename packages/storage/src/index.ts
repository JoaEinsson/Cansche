import { Workspace } from '@cansche/domain';
import Dexie, { Table } from 'dexie';

export interface StorageAdapter {
  saveWorkspace(workspace: Workspace): Promise<void>;
  loadWorkspace(): Promise<Workspace | null>;
  deleteWorkspace(id: string): Promise<void>;
}

class CanscheDexieDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;

  constructor() {
    super('CanscheDatabase');
    this.version(1).stores({
      workspaces: 'id',
    });
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private db: CanscheDexieDatabase;

  constructor() {
    this.db = new CanscheDexieDatabase();
  }

  public async saveWorkspace(workspace: Workspace): Promise<void> {
    await this.db.workspaces.put(workspace);
  }

  public async loadWorkspace(): Promise<Workspace | null> {
    const all = await this.db.workspaces.toArray();
    return all.length > 0 ? all[0] : null;
  }

  public async deleteWorkspace(id: string): Promise<void> {
    await this.db.workspaces.delete(id);
  }
}

export class SQLiteStorageAdapter implements StorageAdapter {
  private memoryCache: Workspace | null = null;
  private dbName: string = 'cansche.db';

  constructor(dbName?: string) {
    if (dbName) this.dbName = dbName;
  }

  public async saveWorkspace(workspace: Workspace): Promise<void> {
    this.memoryCache = JSON.parse(JSON.stringify(workspace));
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        await invoke('save_workspace_sqlite', {
          id: workspace.id,
          name: workspace.name,
          data: JSON.stringify(workspace),
        });
      }
    } catch {
      // In-memory fallback
    }
  }

  public async loadWorkspace(): Promise<Workspace | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        const jsonStr = await invoke<string | null>('load_workspace_sqlite');
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr) as Workspace;
          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return this.memoryCache;
  }

  public async deleteWorkspace(id: string): Promise<void> {
    this.memoryCache = null;
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api');
        await invoke('delete_workspace_sqlite', { id });
      }
    } catch {
      // Fallback
    }
  }
}

export class StorageFactory {
  public static createAdapter(type: 'indexeddb' | 'sqlite' = 'indexeddb'): StorageAdapter {
    if (type === 'sqlite') {
      return new SQLiteStorageAdapter();
    }
    return new IndexedDBAdapter();
  }
}
