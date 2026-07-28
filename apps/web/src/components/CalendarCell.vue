<template>
  <div
    @pointerdown="onPointerDownCell"
    @mouseenter="onMouseEnterCell"
    class="relative flex flex-col h-full border rounded-[8px] p-1.5 transition-all select-none overflow-hidden group min-h-0"
    :class="[
      day.isCurrentMonth ? 'text-white border-[#23252a] bg-[#0f1011]' : 'text-[#62666d] border-[#161718] bg-[#08090a]/60 opacity-40',
      day.isToday ? 'border-[#02b8cc]/60 shadow-xs shadow-[#02b8cc]/20' : '',
      day.isSelected ? 'ring-2 ring-white border-transparent bg-[#161718] opacity-100' : 'hover:border-[#383b3f]',
      isDropTarget ? 'ring-2 ring-[#02b8cc] bg-[#02b8cc]/10 border-[#02b8cc] opacity-100' : ''
    ]"
  >
    <!-- Top Row: Day Number & Badge Indicators -->
    <div class="flex items-center justify-between mb-1 shrink-0">
      <span
        class="text-xs font-mono font-medium px-1 py-0.2 rounded transition-colors"
        :class="day.isToday ? 'bg-[#02b8cc] text-[#08090a] font-bold' : (day.isCurrentMonth ? 'text-[#8a8f98] group-hover:text-white' : 'text-[#4e525a]')"
      >
        {{ day.dayNumber }}
      </span>

      <div class="flex items-center space-x-1">
        <!-- Overflow Badge if more than 3 events -->
        <button
          v-if="overflowCount > 0"
          @click.stop="$emit('open-overflow', { day, anchorEl: $el })"
          class="text-[9px] font-mono px-1 rounded bg-[#161718] hover:bg-[#23252a] text-[#02b8cc] border border-[#23252a] transition-colors"
        >
          +{{ overflowCount }}
        </button>
      </div>
    </div>

    <!-- Events Container -->
    <div class="flex-1 flex flex-col space-y-1 overflow-hidden min-h-0">
      <!-- Drag Ghost Placeholder Preview -->
      <div
        v-if="isDropTarget && dragGhostItem"
        class="px-1.5 py-0.5 rounded-[4px] border border-dashed border-[#02b8cc] bg-[#02b8cc]/20 text-[#02b8cc] text-[11px] font-mono flex items-center space-x-1 animate-pulse"
      >
        <span>+ {{ dragGhostItem.name }}</span>
      </div>

      <!-- Rendered Events (Max 3 visible before overflow) -->
      <CalendarEvent
        v-for="item in visibleEvents"
        :key="item.event.id"
        :item="item"
        @select-event="$emit('select-event', $event)"
        @hover-event="$emit('hover-event', $event)"
        @unhover-event="$emit('unhover-event')"
        @edit-event="$emit('edit-event', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ISODate } from '@cansche/shared';
import { DragService } from '../services/DragService';
import CalendarEvent, { EventViewItem } from './CalendarEvent.vue';

export interface CalendarDayView {
  date: ISODate;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: EventViewItem[];
}

const props = defineProps<{
  day: CalendarDayView;
}>();

const emit = defineEmits([
  'select-date',
  'hover-event',
  'unhover-event',
  'select-event',
  'edit-event',
  'toggle-checklist',
  'open-overflow',
]);

const MAX_VISIBLE_EVENTS = 3;

const visibleEvents = computed(() => {
  return (props.day.events || []).slice(0, MAX_VISIBLE_EVENTS);
});

const overflowCount = computed(() => {
  const total = props.day.events?.length || 0;
  return total > MAX_VISIBLE_EVENTS ? total - MAX_VISIBLE_EVENTS : 0;
});

const isDropTarget = computed(() => {
  const st = DragService.state;
  return st.isDragging && st.hoverDate === props.day.date;
});

const dragGhostItem = computed(() => {
  return DragService.state.item;
});

function onPointerDownCell(event: PointerEvent) {
  const target = event.target as HTMLElement;
  if (target.closest('button')) return;

  emit('select-date', {
    date: props.day.date,
    ctrlKey: event.ctrlKey || event.metaKey,
    shiftKey: event.shiftKey,
    isDrag: false,
  });
}

function onMouseEnterCell() {
  DragService.setHoverDate(props.day.date);
}
</script>
