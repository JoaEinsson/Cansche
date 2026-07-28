<template>
  <div
    @pointerdown="onPointerDown"
    @click.stop="$emit('select-event', item)"
    @mouseenter="$emit('hover-event', { item, anchorEl: $el })"
    @mouseleave="$emit('unhover-event')"
    class="group relative flex items-center justify-between px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium leading-tight cursor-grab active:cursor-grabbing select-none transition-all border shadow-2xs"
    :class="isBeingDragged ? 'opacity-35 border-dashed border-[#02b8cc]' : ''"
    :style="pillStyle"
  >
    <!-- Left: Event Emoji / Icon & Title -->
    <div class="flex items-center space-x-1 min-w-0 flex-1">
      <IconRenderer :icon="itemIcon" :size="12" :color="itemColor" />
      <span class="truncate text-white text-[11px] font-sans">
        {{ itemTitle }}
      </span>
    </div>

    <!-- Right: Status Indicators (Checklist progress or Time) -->
    <div class="flex items-center space-x-1 shrink-0 ml-1 text-[9px] font-mono opacity-80">
      <span v-if="hasChecklist" class="flex items-center space-x-0.5 bg-black/40 px-1 py-0.2 rounded">
        <span>{{ completedChecklistCount }}/{{ totalChecklistCount }}</span>
      </span>
      <span v-else-if="itemStartTime" class="text-white/70">
        {{ itemStartTime }}
      </span>

      <!-- Action buttons on hover -->
      <div class="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity ml-0.5">
        <button
          v-if="item.model"
          @click.stop="$emit('edit-event', item)"
          class="p-0.5 hover:text-white rounded hover:bg-black/40 transition-colors"
          title="Editar Modelo"
        >
          <IconRenderer icon="lucide:Edit2" :size="10" color="#ffffff" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Model, CalendarEvent as DomainEvent } from '@cansche/domain';
import { DragService } from '../services/DragService';
import IconRenderer from './IconRenderer.vue';

export interface EventViewItem {
  event: DomainEvent;
  model?: Model;
  calendarName: string;
  calendarColor: string;
}

const props = defineProps<{
  item: EventViewItem;
}>();

const emit = defineEmits(['select-event', 'hover-event', 'unhover-event', 'edit-event']);

const itemTitle = computed(() => {
  return props.item.event.overrides?.name || props.item.model?.name || 'Evento sem título';
});

const itemIcon = computed(() => {
  return props.item.event.overrides?.emoji || props.item.model?.emoji || 'lucide:Bookmark';
});

const itemColor = computed(() => {
  return props.item.event.overrides?.color || props.item.model?.color || props.item.calendarColor || '#5e6ad2';
});

const itemStartTime = computed(() => {
  return props.item.event.overrides?.startTime || props.item.model?.schedule?.startTime || (props.item.model as any)?.startTime || '';
});

const hasChecklist = computed(() => {
  return props.item.event.checklistState && props.item.event.checklistState.length > 0;
});

const totalChecklistCount = computed(() => props.item.event.checklistState?.length || 0);
const completedChecklistCount = computed(() => props.item.event.checklistState?.filter(c => c.completed).length || 0);

const isBeingDragged = computed(() => {
  const st = DragService.state;
  return st.isDragging && st.item?.type === 'event' && st.item.eventId === props.item.event.id;
});

const pillStyle = computed(() => {
  const baseColor = itemColor.value;
  return {
    backgroundColor: `${baseColor}22`, // 13% opacity background
    borderColor: `${baseColor}55`,     // 33% opacity border
    color: '#ffffff',
  };
});

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return;
  const target = event.target as HTMLElement;
  if (target.closest('button')) return;

  event.stopPropagation();
  DragService.startPotentialDrag({
    type: 'event',
    eventId: props.item.event.id,
    sourceDate: props.item.event.date,
    name: itemTitle.value,
    emoji: itemIcon.value,
    color: itemColor.value,
  }, event);
}
</script>
