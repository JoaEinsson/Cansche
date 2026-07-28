import { ref, readonly } from 'vue';

export interface InspectorState<T = any> {
  isOpen: boolean;
  activeItem: T | null;
}

const state = ref<InspectorState>({
  isOpen: false,
  activeItem: null,
});

export const InspectorService = {
  get state() {
    return readonly(state.value);
  },
  get isOpen() {
    return state.value.isOpen;
  },
  get activeItem() {
    return state.value.activeItem;
  },
  open(item: any) {
    state.value = {
      isOpen: true,
      activeItem: item,
    };
  },
  close() {
    state.value = {
      isOpen: false,
      activeItem: null,
    };
  },
  toggle(item: any) {
    if (state.value.isOpen && state.value.activeItem?.event?.id === item?.event?.id) {
      this.close();
    } else {
      this.open(item);
    }
  },
};
