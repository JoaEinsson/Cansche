import { reactive } from 'vue';
import { ISODate } from '@cansche/shared';

export interface DraggedModelItem {
  type: 'model';
  modelId: string;
  name: string;
  emoji?: string;
  color?: string;
  startTime?: string;
}

export interface DraggedEventItem {
  type: 'event';
  eventId: string;
  sourceDate: ISODate;
  name: string;
  emoji?: string;
  color?: string;
}

export type DraggedItem = DraggedModelItem | DraggedEventItem;

export interface DragState {
  isDragging: boolean;
  potentialDrag: boolean;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  item: DraggedItem | null;
  hoverDate: ISODate | null;
  isCopyMode: boolean;
}

const DRAG_THRESHOLD_PX = 6;

class DragServiceImpl {
  public state = reactive<DragState>({
    isDragging: false,
    potentialDrag: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    item: null,
    hoverDate: null,
    isCopyMode: false,
  });

  public startPotentialDrag(item: DraggedItem, event: PointerEvent): void {
    this.state.potentialDrag = true;
    this.state.isDragging = false;
    this.state.startPos = { x: event.clientX, y: event.clientY };
    this.state.currentPos = { x: event.clientX, y: event.clientY };
    this.state.item = item;
    this.state.hoverDate = null;
    this.state.isCopyMode = event.ctrlKey || event.metaKey;
  }

  public updatePosition(event: PointerEvent): void {
    if (!this.state.potentialDrag && !this.state.isDragging) return;

    this.state.currentPos = { x: event.clientX, y: event.clientY };
    this.state.isCopyMode = event.ctrlKey || event.metaKey;

    if (this.state.potentialDrag && !this.state.isDragging) {
      const dx = event.clientX - this.state.startPos.x;
      const dy = event.clientY - this.state.startPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= DRAG_THRESHOLD_PX) {
        this.state.isDragging = true;
        this.state.potentialDrag = false;
      }
    }
  }

  public setHoverDate(date: ISODate | null): void {
    if (this.state.isDragging) {
      this.state.hoverDate = date;
    }
  }

  public endDrag(): { item: DraggedItem; hoverDate: ISODate; isCopyMode: boolean } | null {
    const wasDragging = this.state.isDragging;
    const item = this.state.item;
    const hoverDate = this.state.hoverDate;
    const isCopyMode = this.state.isCopyMode;

    this.reset();

    if (wasDragging && item && hoverDate) {
      return { item, hoverDate, isCopyMode };
    }
    return null;
  }

  public cancelDrag(): void {
    this.reset();
  }

  private reset(): void {
    this.state.isDragging = false;
    this.state.potentialDrag = false;
    this.state.startPos = { x: 0, y: 0 };
    this.state.currentPos = { x: 0, y: 0 };
    this.state.item = null;
    this.state.hoverDate = null;
    this.state.isCopyMode = false;
  }
}

export const DragService = new DragServiceImpl();
