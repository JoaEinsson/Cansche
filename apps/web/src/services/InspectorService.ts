import { reactive, ref } from 'vue';

export interface InspectorItem {
  event: any;
  model?: any;
  calendarName: string;
  calendarColor: string;
}

class InspectorServiceImpl {
  public isOpen = ref(false);
  public activeItem = ref<InspectorItem | null>(null);

  public open(item: InspectorItem): void {
    this.activeItem.value = item;
    this.isOpen.value = true;
  }

  public close(): void {
    this.isOpen.value = false;
    this.activeItem.value = null;
  }

  public toggle(item: InspectorItem): void {
    if (this.isOpen.value && this.activeItem.value?.event?.id === item.event?.id) {
      this.close();
    } else {
      this.open(item);
    }
  }
}

export const InspectorService = new InspectorServiceImpl();
