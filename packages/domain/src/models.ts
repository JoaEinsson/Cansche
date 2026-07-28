import { ISODate } from '@cansche/shared';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Model {
  id: string;
  name: string;
  emoji: string;
  color: string;
  schedule?: {
    startTime?: string; // e.g. "19:00"
    endTime?: string;   // e.g. "22:30"
    timezone?: string;
  };
  metadata?: {
    category?: string;
    tags?: string[];
  };
  content?: {
    description?: string;
    location?: string;
    checklistTemplate?: string[]; // e.g. ["Revisar matéria", "Fazer exercícios"]
  };
}

export interface EventOverrides {
  name?: string;
  emoji?: string;
  color?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  date: ISODate;
  modelId?: string; // null/undefined for standalone events
  source: 'model' | 'manual' | 'google';
  overrides?: EventOverrides;
  checklistState: ChecklistItem[];
  createdAt: string;
  modifiedAt?: string;
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  visible: boolean;
  models: Record<string, Model>;
  events: Record<string, CalendarEvent>;
}

export interface Workspace {
  id: string;
  name: string;
  calendars: Record<string, Calendar>;
  editingCalendarId: string;
  activeCalendarIds: string[];
}

export interface ClipboardItem {
  relativeDayOffset: number;
  events: CalendarEvent[];
}

export interface ClipboardData {
  items: ClipboardItem[];
  originDate?: ISODate;
}

export interface CanscheFile {
  format: 'cansche';
  version: 1;
  type: 'calendar' | 'workspace';
  metadata: {
    createdAt: string;
    updatedAt: string;
    appVersion: string;
  };
  data: Calendar | Workspace;
}
