import { reactive } from 'vue';

export interface DragItemModel {
  type: 'model';
  modelId: string;
  name: string;
  emoji?: string;
  color?: string;
  startTime?: string;
}

export interface DragItemEvent {
  type: 'event';
  eventId: string;
  sourceDate: string;
  name: string;
  emoji?: string;
  color?: string;
  startTime?: string;
}

export type DragPayload = DragItemModel | DragItemEvent;

export interface DragState {
  isDragging: boolean;
  potentialDrag: boolean;
  item: DragPayload | null;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
  hoverDate: string | null;
  isCopyMode: boolean;
}

class DragServiceImpl {
  public state = reactive<DragState>({
    isDragging: false,
    potentialDrag: false,
    item: null,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    hoverDate: null,
    isCopyMode: false,
  });

  private threshold = 6;

  public startPotentialDrag(item: DragPayload, event: PointerEvent): void {
    this.state.potentialDrag = true;
    this.state.isDragging = false;
    this.state.item = item;
    this.state.startPos = { x: event.clientX, y: event.clientY };
    this.state.currentPos = { x: event.clientX, y: event.clientY };
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
      const dist = Math.hypot(dx, dy);

      if (dist >= this.threshold) {
        this.state.isDragging = true;
        this.state.potentialDrag = false;
      }
    }
  }

  public setHoverDate(date: string | null): void {
    if (this.state.isDragging) {
      this.state.hoverDate = date;
    }
  }

  public setCopyMode(isCopy: boolean): void {
    if (this.state.isDragging) {
      this.state.isCopyMode = isCopy;
    }
  }

  public cancelDrag(): void {
    this.state.isDragging = false;
    this.state.potentialDrag = false;
    this.state.item = null;
    this.state.hoverDate = null;
    this.state.isCopyMode = false;
  }

  public endDrag(): { item: DragPayload; hoverDate: string; isCopyMode: boolean } | null {
    if (!this.state.isDragging || !this.state.item || !this.state.hoverDate) {
      const isDrag = this.state.isDragging;
      this.cancelDrag();
      return null;
    }

    const result = {
      item: this.state.item,
      hoverDate: this.state.hoverDate,
      isCopyMode: this.state.isCopyMode,
    };

    this.cancelDrag();
    return result;
  }
}

export const DragService = new DragServiceImpl();
