import { Workspace, Calendar, ClipboardData, PresetInstance } from '@cansche/domain';
import { ISODate } from '@cansche/shared';

export interface EngineContext {
  getWorkspace(): Workspace;
  setWorkspace(workspace: Workspace): void;
  getActiveCalendar(): Calendar;
  setCellPresetInstances(date: ISODate, instances: PresetInstance[]): void;
  getClipboard(): ClipboardData | null;
  setClipboard(clipboard: ClipboardData | null): void;
}
