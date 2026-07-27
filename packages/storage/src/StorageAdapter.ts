import { Workspace } from '@cansche/domain';

export interface StorageAdapter {
  saveWorkspace(workspace: Workspace): Promise<void>;
  loadWorkspace(id?: string): Promise<Workspace | null>;
  clearWorkspace(id: string): Promise<void>;
}
