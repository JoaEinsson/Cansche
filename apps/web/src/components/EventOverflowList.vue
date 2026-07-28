<template>
  <div
    v-if="isOpen && day"
    ref="popoverEl"
    class="fixed z-40 w-64 bg-[#0f1011] border border-[#23252a] rounded-[10px] p-3 shadow-2xl shadow-black/90 text-xs text-[#d0d6e0] space-y-2 animate-in fade-in zoom-in-95"
    :style="popoverStyle"
  >
    <!-- Header: Day Title & Close -->
    <div class="flex items-center justify-between border-b border-[#23252a] pb-2">
      <div class="flex items-center space-x-1.5 font-mono">
        <span class="font-bold text-white text-xs">{{ formattedDate }}</span>
        <span class="text-[10px] text-[#8a8f98]">({{ day.events.length }} eventos)</span>
      </div>
      <button
        @click="$emit('close')"
        class="text-[#8a8f98] hover:text-white p-0.5 rounded hover:bg-[#161718]"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Events List -->
    <div class="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
      <CalendarEvent
        v-for="item in day.events"
        :key="item.event.id"
        :item="item"
        @hover-event="$emit('hover-event', $event)"
        @unhover-event="$emit('unhover-event')"
        @select-event="onSelectEvent(item)"
        @edit-event="$emit('edit-event', $event)"
        @toggle-checklist="$emit('toggle-checklist', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import CalendarEvent, { EventViewItem } from './CalendarEvent.vue';
import { CalendarDayView } from './CalendarCell.vue';

const props = defineProps<{
  isOpen: boolean;
  day: CalendarDayView | null;
  anchorEl: HTMLElement | null;
}>();

const emit = defineEmits([
  'close',
  'hover-event',
  'unhover-event',
  'select-event',
  'edit-event',
  'toggle-checklist',
]);

const popoverEl = ref<HTMLElement | null>(null);
const topPos = ref(0);
const leftPos = ref(0);

const formattedDate = computed(() => {
  if (!props.day?.date) return '';
  const [y, m, d] = props.day.date.split('-');
  return `${d}/${m}/${y}`;
});

const popoverStyle = computed(() => ({
  top: `${topPos.value}px`,
  left: `${leftPos.value}px`,
}));

function onSelectEvent(item: EventViewItem) {
  emit('select-event', item);
  emit('close');
}

watch(
  () => [props.isOpen, props.anchorEl],
  async () => {
    if (props.isOpen && props.anchorEl) {
      await nextTick();
      const rect = props.anchorEl.getBoundingClientRect();
      const height = popoverEl.value?.offsetHeight || 200;
      const width = 256;

      let top = rect.top - height - 6;
      if (top < 10) {
        top = rect.bottom + 6;
      }

      let left = rect.left - 20;
      if (left + width > window.innerWidth - 10) {
        left = window.innerWidth - width - 10;
      }

      topPos.value = top;
      leftPos.value = left;
    }
  },
  { immediate: true }
);
</script>
