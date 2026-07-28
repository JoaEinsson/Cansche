import { Workspace, Calendar } from '@cansche/domain';
import { StorageAdapter, IndexedDBAdapter } from '@cansche/storage';

export interface CalendarRepository {
  getWorkspace(): Promise<Workspace | null>;
  saveWorkspace(workspace: Workspace): Promise<void>;
  findCalendar(id: string): Promise<Calendar | null>;
  deleteWorkspace(id: string): Promise<void>;
}

export class DefaultCalendarRepository implements CalendarRepository {
  constructor(private storageAdapter: StorageAdapter) {}

  public async getWorkspace(): Promise<Workspace | null> {
    return this.storageAdapter.loadWorkspace();
  }

  public async saveWorkspace(workspace: Workspace): Promise<void> {
    return this.storageAdapter.saveWorkspace(workspace);
  }

  public async findCalendar(id: string): Promise<Calendar | null> {
    const ws = await this.storageAdapter.loadWorkspace();
    if (!ws || !ws.calendars) return null;
    return ws.calendars[id] || null;
  }

  public async deleteWorkspace(id: string): Promise<void> {
    return this.storageAdapter.deleteWorkspace(id);
  }
}

export class LocalStorageRepository implements CalendarRepository {
  private key = 'cansche_workspace_data';

  public async getWorkspace(): Promise<Workspace | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(this.key);
        if (data) return JSON.parse(data);
      }
    } catch (err) {
      console.error('LocalStorageRepository read error:', err);
    }
    return null;
  }

  public async saveWorkspace(workspace: Workspace): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.key, JSON.stringify(workspace));
      }
    } catch (err) {
      console.error('LocalStorageRepository write error:', err);
    }
  }

  public async findCalendar(id: string): Promise<Calendar | null> {
    const ws = await this.getWorkspace();
    if (!ws || !ws.calendars) return null;
    return ws.calendars[id] || null;
  }

  public async deleteWorkspace(id: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.key);
      }
    } catch (err) {
      console.error('LocalStorageRepository delete error:', err);
    }
  }
}
