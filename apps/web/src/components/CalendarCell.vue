<template>
  <div
    @pointerdown="onPointerDownCell"
    @mouseenter="onMouseEnterCell"
    class="relative flex flex-col h-full border rounded-[6px] transition-all select-none overflow-hidden group min-h-0"
    :class="[
      density === 'compact' ? 'p-1' : 'p-1.5',
      day.isCurrentMonth ? 'text-white border-[#23252a] bg-[#0f1011]' : 'text-[#62666d] border-[#161718] bg-[#08090a]/60 opacity-40',
      day.isToday ? 'border-[#e4f222]/80 shadow-xs shadow-[#e4f222]/20' : '',
      day.isSelected ? 'ring-1 ring-[#e4f222] border-[#e4f222] bg-[#e4f222]/10 opacity-100' : 'hover:border-[#383b3f]',
      isDropTarget ? 'ring-2 ring-[#e4f222] bg-[#e4f222]/20 border-[#e4f222] opacity-100' : ''
    ]"
  >
    <!-- Top Row: Day Number & Indicators (Today Dot & Overflow Badge) -->
    <div class="flex items-center justify-between mb-1 shrink-0">
      <span
        class="text-xs font-mono font-medium px-1 py-0.2 rounded transition-colors"
        :class="day.isToday ? 'bg-[#e4f222] text-[#08090a] font-semibold' : (day.isCurrentMonth ? 'text-[#8a8f98] group-hover:text-white' : 'text-[#62666d]')"
      >
        {{ day.dayNumber }}
      </span>

      <div class="flex items-center space-x-1.5">
        <span
          v-if="showWeekNumbers && isWeekStart"
          class="text-[9px] font-mono text-[#62666d]"
          :title="`Semana ${weekNumber}`"
        >
          S{{ weekNumber }}
        </span>

        <!-- Today Cyan Dot Indicator -->
        <span
          v-if="day.isToday"
          class="w-2 h-2 rounded-full bg-[#e4f222] shadow-xs shadow-[#e4f222]/80 shrink-0"
          title="Hoje"
        ></span>

        <!-- Overflow Badge if more than 3 events -->
        <button
          v-if="overflowCount > 0"
          @click.stop="$emit('open-overflow', { day, anchorEl: $el })"
          class="text-[9px] font-mono px-1 rounded bg-[#161718] hover:bg-[#23252a] text-[#e4f222] border border-[#23252a] transition-colors"
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
        class="px-1.5 py-0.5 rounded-[4px] border border-dashed border-[#e4f222] bg-[#e4f222]/20 text-[#e4f222] text-[11px] font-mono flex items-center space-x-1 animate-pulse"
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
  density: 'compact' | 'comfortable';
  weekStartsOn: 0 | 1;
  showWeekNumbers: boolean;
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

const isWeekStart = computed(() => new Date(`${props.day.date}T00:00:00`).getDay() === props.weekStartsOn);
const weekNumber = computed(() => {
  const date = new Date(`${props.day.date}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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

function onMouseEnterCell(event: MouseEvent) {
  DragService.setHoverDate(props.day.date);

  // If mouse button is down and not dragging a model/event, paint-select cell
  if (event.buttons === 1 && !DragService.state.isDragging) {
    emit('select-date', {
      date: props.day.date,
      ctrlKey: false,
      shiftKey: false,
      isDrag: true,
    });
  }
}
</script>
