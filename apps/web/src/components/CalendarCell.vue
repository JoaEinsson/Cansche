<template>
  <div
    @mousedown="onMouseDown"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    class="group/cell relative rounded-[8px] border flex flex-col justify-between p-1.5 transition-all duration-150 cursor-pointer overflow-hidden select-none hover:scale-[1.01]"
    :class="[
      isHoverTarget
        ? '!border-[#02b8cc] !bg-[#02b8cc]/10 ring-2 ring-[#02b8cc]/40 z-20'
        : day.isSelected
        ? '!bg-[#161718] !border-white ring-1 ring-white/40 shadow-md z-10'
        : day.isCurrentMonth
        ? 'bg-[#0f1011] border-[#23252a] hover:border-[#383b3f]'
        : 'bg-[#08090a]/50 border-[#161718] text-[#62666d] opacity-40',
      day.isToday && !day.isSelected && !isHoverTarget ? 'border-[#02b8cc]/80' : ''
    ]"
  >
    <!-- Top accent bar for selected cells -->
    <div
      v-if="day.isSelected && !isHoverTarget"
      class="absolute top-0 left-0 right-0 h-0.5 bg-white shadow-xs"
    ></div>

    <!-- Cell Top Bar: Date Number + Today Indicator -->
    <div class="flex items-center justify-between leading-none mb-1">
      <span
        class="text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors"
        :class="[
          day.isSelected
            ? 'bg-white text-[#08090a] font-bold shadow-xs'
            : day.isToday
            ? 'bg-[#02b8cc] text-black font-bold'
            : 'text-[#8a8f98] group-hover/cell:text-white'
        ]"
      >
        {{ day.dayNumber }}
      </span>

      <span v-if="day.isToday" class="w-1.5 h-1.5 rounded-full bg-[#02b8cc]" title="Hoje"></span>
    </div>

    <!-- Events List (Delegated to CalendarEvent.vue) -->
    <div class="flex-1 flex flex-col gap-1 overflow-hidden justify-start">
      <CalendarEvent
        v-for="item in visibleEvents"
        :key="item.event.id"
        :item="item"
        @hover-event="$emit('hover-event', $event)"
        @unhover-event="$emit('unhover-event')"
        @select-event="$emit('select-event', $event)"
        @edit-event="$emit('edit-event', $event)"
        @toggle-checklist="$emit('toggle-checklist', $event)"
      />

      <!-- Ghost Preview Placeholder for Drag & Drop Target -->
      <div
        v-if="draggedItem"
        class="h-[24px] px-2 py-0.5 rounded-[6px] text-[11px] font-medium flex items-center justify-between border border-dashed border-[#02b8cc] bg-[#02b8cc]/20 text-white animate-pulse"
      >
        <div class="flex items-center gap-1.5 truncate">
          <IconRenderer :icon="draggedItem.emoji || 'lucide:Bookmark'" :size="12" :color="draggedItem.color || '#02b8cc'" />
          <span class="truncate font-sans text-[11px] font-medium">{{ draggedItem.name }}</span>
        </div>
        <span v-if="DragService.state.isCopyMode" class="text-[9px] font-mono font-bold bg-[#02b8cc] text-black px-1 rounded">+</span>
      </div>
    </div>

    <!-- Overflow Counter Button (+N mais) -->
    <button
      v-if="overflowCount > 0"
      @click.stop="$emit('open-overflow', { day, anchorEl: $event.currentTarget })"
      class="text-[9px] font-mono text-[#8a8f98] hover:text-white hover:bg-[#23252a] px-1.5 py-0.5 rounded text-right leading-none transition-colors self-end mt-0.5 cursor-pointer"
    >
      +{{ overflowCount }} mais
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ISODate } from '@cansche/shared';
import { DragService } from '@cansche/application';
import CalendarEvent, { EventViewItem } from './CalendarEvent.vue';
import IconRenderer from './IconRenderer.vue';

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
  maxVisibleEvents?: number;
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

const maxEvents = computed(() => props.maxVisibleEvents || 3);

const visibleEvents = computed(() => {
  return props.day.events.slice(0, maxEvents.value);
});

const overflowCount = computed(() => {
  return Math.max(0, props.day.events.length - maxEvents.value);
});

const isHoverTarget = computed(() => {
  const st = DragService.state;
  return st.isDragging && st.hoverDate === props.day.date;
});

const draggedItem = computed(() => {
  const st = DragService.state;
  return st.isDragging && st.hoverDate === props.day.date ? st.item : null;
});

function onMouseDown(event: MouseEvent) {
  if (DragService.state.isDragging) return;
  emit('select-date', {
    date: props.day.date,
    ctrlKey: event.ctrlKey || event.metaKey,
    shiftKey: event.shiftKey,
    isDrag: false,
  });
}

function onMouseEnter() {
  if (DragService.state.isDragging) {
    DragService.setHoverDate(props.day.date);
    return;
  }
  emit('select-date', {
    date: props.day.date,
    ctrlKey: true,
    shiftKey: false,
    isDrag: true,
  });
}

function onMouseLeave() {
  if (DragService.state.isDragging && DragService.state.hoverDate === props.day.date) {
    DragService.setHoverDate(null);
  }
}
</script>
