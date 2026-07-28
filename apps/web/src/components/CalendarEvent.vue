<template>
  <div
    ref="eventEl"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @pointerdown="onPointerDown"
    @click.stop="onClick"
    @dblclick.stop="onDblClick"
    class="group/event relative h-[24px] px-2 py-0.5 rounded-[6px] text-[11px] font-medium flex items-center justify-between border cursor-pointer select-none transition-all duration-150 shadow-xs overflow-hidden hover:brightness-110 hover:border-white/40"
    :class="isDraggingThisEvent ? 'opacity-35 border-dashed border-[#02b8cc]' : ''"
    :style="{
      backgroundColor: itemColor + '20',
      borderColor: itemColor + '50',
      color: '#ffffff'
    }"
    :title="itemTooltip"
  >
    <!-- Left: Layer dot + Icon + Name -->
    <div class="flex items-center gap-1.5 truncate min-w-0 flex-1">
      <span
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :style="{ backgroundColor: item.calendarColor }"
        :title="'Camada: ' + item.calendarName"
      ></span>
      <IconRenderer :icon="itemIcon" :size="12" :color="itemColor" />
      <span class="truncate leading-none font-sans text-white font-medium text-[11px]">
        {{ itemName }}
      </span>
    </div>

    <!-- Right: Micro-indicators -->
    <div class="flex items-center space-x-1.5 shrink-0 text-[10px] text-[#8a8f98] pl-1 font-mono">
      <!-- Time indicator -->
      <span v-if="itemStartTime" class="flex items-center gap-0.5 text-slate-300 text-[10px]" title="Horário configurado">
        <span>{{ itemStartTime }}</span>
      </span>

      <!-- Location indicator -->
      <span v-if="itemLocation" class="flex items-center text-[#8a8f98]" title="Possui localização">
        <IconRenderer icon="lucide:MapPin" :size="10" color="#8a8f98" />
      </span>

      <!-- Checklist indicator -->
      <button
        v-if="hasChecklist"
        @click.stop="$emit('toggle-checklist', { eventId: item.event.id, itemId: item.event.checklistState[0]?.id })"
        class="flex items-center gap-0.5 px-1 py-0.2 rounded bg-black/40 hover:bg-black/70 text-[9px] transition-colors"
        :class="isAllCompleted ? 'text-emerald-400 font-bold' : 'text-slate-300'"
        title="Progresso de tarefas"
      >
        <IconRenderer icon="lucide:CheckSquare" :size="9" :color="isAllCompleted ? '#34d399' : '#94a3b8'" />
        <span>{{ completedCount }}/{{ item.event.checklistState.length }}</span>
      </button>

      <!-- Description indicator -->
      <span v-if="hasDescription" class="flex items-center text-[#8a8f98]" title="Possui observações">
        <IconRenderer icon="lucide:FileText" :size="10" color="#8a8f98" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Model, CalendarEvent as DomainEvent } from '@cansche/domain';
import { DragService } from '@cansche/application';
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

const emit = defineEmits([
  'hover-event',
  'unhover-event',
  'select-event',
  'edit-event',
  'toggle-checklist',
]);

const eventEl = ref<HTMLElement | null>(null);

let hoverTimer: number | null = null;
let hideTimer: number | null = null;

const itemName = computed(() => {
  return props.item.event.overrides?.name || props.item.model?.name || 'Evento';
});

const itemIcon = computed(() => {
  return props.item.event.overrides?.emoji || props.item.model?.emoji || 'lucide:Bookmark';
});

const itemColor = computed(() => {
  return props.item.event.overrides?.color || props.item.model?.color || props.item.calendarColor || '#5e6ad2';
});

const itemStartTime = computed(() => {
  return props.item.event.overrides?.startTime || props.item.model?.schedule?.startTime || (props.item.model as any)?.startTime;
});

const itemLocation = computed(() => {
  return props.item.event.overrides?.location || props.item.model?.content?.location || (props.item.model as any)?.location;
});

const hasDescription = computed(() => {
  return !!(props.item.event.overrides?.description || props.item.model?.content?.description || (props.item.model as any)?.description);
});

const hasChecklist = computed(() => {
  return props.item.event.checklistState && props.item.event.checklistState.length > 0;
});

const completedCount = computed(() => {
  if (!props.item.event.checklistState) return 0;
  return props.item.event.checklistState.filter((c) => c.completed).length;
});

const isAllCompleted = computed(() => {
  if (!hasChecklist.value) return false;
  return props.item.event.checklistState.every((c) => c.completed);
});

const isDraggingThisEvent = computed(() => {
  const st = DragService.state;
  return st.isDragging && st.item?.type === 'event' && st.item.eventId === props.item.event.id;
});

const itemTooltip = computed(() => {
  const parts = [`[${props.item.calendarName}] ${itemName.value}`];
  if (itemStartTime.value) parts.push(`⏰ ${itemStartTime.value}`);
  if (itemLocation.value) parts.push(`📍 ${itemLocation.value}`);
  return parts.join(' • ');
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
    name: itemName.value,
    emoji: itemIcon.value,
    color: itemColor.value,
    startTime: itemStartTime.value,
  }, event);
}

function onMouseEnter() {
  if (DragService.state.isDragging) return;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  hoverTimer = window.setTimeout(() => {
    if (eventEl.value && !DragService.state.isDragging) {
      emit('hover-event', {
        item: props.item,
        anchorEl: eventEl.value,
      });
    }
  }, 200);
}

function onMouseLeave() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  hideTimer = window.setTimeout(() => {
    emit('unhover-event');
  }, 150);
}

function onClick() {
  if (DragService.state.isDragging) return;
  if (hoverTimer) clearTimeout(hoverTimer);
  emit('select-event', props.item);
}

function onDblClick() {
  if (DragService.state.isDragging) return;
  if (hoverTimer) clearTimeout(hoverTimer);
  emit('edit-event', props.item);
}
</script>
