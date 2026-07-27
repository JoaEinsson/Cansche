import Dexie, { Table } from 'dexie';
import { Workspace } from '@cansche/domain';
import { StorageAdapter } from './StorageAdapter';

export class CanscheDatabase extends Dexie {
  workspaces!: Table<Workspace, string>;

  constructor() {
    super('CanscheDatabase');
    this.version(1).stores({
      workspaces: 'id',
    });
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private db = new CanscheDatabase();

  public async saveWorkspace(workspace: Workspace): Promise<void> {
    await this.db.workspaces.put(workspace);
  }

  public async loadWorkspace(id?: string): Promise<Workspace | null> {
    if (id) {
      const ws = await this.db.workspaces.get(id);
      return ws || null;
    }
    const all = await this.db.workspaces.toArray();
    return all.length > 0 ? all[0] : null;
  }

  public async clearWorkspace(id: string): Promise<void> {
    await this.db.workspaces.delete(id);
  }
}
