import { Workspace, Calendar } from '@cansche/domain';
import { StorageAdapter } from '@cansche/storage';

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
