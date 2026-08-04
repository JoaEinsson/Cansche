<template>
  <div
    class="flex-1 flex flex-col h-full overflow-hidden bg-[#08090a] p-3 select-none outline-none"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <!-- Days of Week Header -->
    <div class="grid gap-1.5 mb-1.5 text-center shrink-0" :class="showWeekends ? 'grid-cols-7' : 'grid-cols-5'">
      <div
        v-for="dayName in daysOfWeek"
        :key="dayName.day"
        class="font-mono text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider py-1 border-b border-[#23252a]"
      >
        {{ dayName.label }}
      </div>
    </div>

    <!-- High-Density Monthly Grid (Delegated to CalendarCell.vue) -->
    <div
      class="flex-1 grid auto-rows-fr overflow-hidden"
      :class="[showWeekends ? 'grid-cols-7' : 'grid-cols-5', density === 'compact' ? 'gap-1' : 'gap-1.5']"
      @mouseleave="onMouseLeaveGrid"
      @mouseup="stopDragging"
    >
      <CalendarCell
        v-for="day in calendarDays"
        :key="day.date"
        :day="day"
        :density="density"
        :week-starts-on="weekStartsOn"
        :show-week-numbers="showWeekNumbers"
        @select-date="onSelectDate"
        @hover-event="onHoverEvent"
        @unhover-event="onUnhoverEvent"
        @select-event="onSelectEvent"
        @edit-event="onEditEvent"
        @toggle-checklist="$emit('toggle-checklist', $event)"
        @open-overflow="onOpenOverflow"
      />
    </div>

    <!-- Floating Event Hover Preview Card -->
    <EventHoverCard
      :is-open="hoverCardState.isOpen"
      :item="hoverCardState.item"
      :anchor-el="hoverCardState.anchorEl"
      @close="hoverCardState.isOpen = false"
      @cancel-hide="cancelHoverCardHide"
    />

    <!-- Floating Overflow Popover List (+N mais) -->
    <EventOverflowList
      :is-open="overflowState.isOpen"
      :day="overflowState.day"
      :anchor-el="overflowState.anchorEl"
      @close="overflowState.isOpen = false"
      @hover-event="onHoverEvent"
      @unhover-event="onUnhoverEvent"
      @select-event="onSelectEvent"
      @edit-event="onEditEvent"
      @toggle-checklist="$emit('toggle-checklist', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ISODate, toISODate } from '@cansche/shared';
import { Calendar, Model, CalendarEvent as DomainEvent } from '@cansche/domain';
import { InspectorService } from '../services/InspectorService';
import CalendarCell, { CalendarDayView } from './CalendarCell.vue';
import { EventViewItem } from './CalendarEvent.vue';
import EventHoverCard from './EventHoverCard.vue';
import EventOverflowList from './EventOverflowList.vue';

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  visibleCalendars: Calendar[];
  selectedDates: ISODate[];
  weekStartsOn: 0 | 1;
  showWeekends: boolean;
  showWeekNumbers: boolean;
  density: 'compact' | 'comfortable';
}>();

const emit = defineEmits(['select-date', 'toggle-checklist', 'edit-model', 'deselect']);

const baseDaysOfWeek = [
  { day: 0, label: 'Dom' },
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
];
const daysOfWeek = computed(() => {
  const ordered = props.weekStartsOn === 1
    ? [...baseDaysOfWeek.slice(1), baseDaysOfWeek[0]]
    : baseDaysOfWeek;
  return props.showWeekends ? ordered : ordered.filter((item) => item.day !== 0 && item.day !== 6);
});
const isDragging = ref(false);

function stopDragging() {
  isDragging.value = false;
}

onMounted(() => {
  window.addEventListener('mouseup', stopDragging);
});

onUnmounted(() => {
  window.removeEventListener('mouseup', stopDragging);
});

const hoverCardState = ref<{
  isOpen: boolean;
  item: EventViewItem | null;
  anchorEl: HTMLElement | null;
}>({
  isOpen: false,
  item: null,
  anchorEl: null,
});

const overflowState = ref<{
  isOpen: boolean;
  day: CalendarDayView | null;
  anchorEl: HTMLElement | null;
}>({
  isOpen: false,
  day: null,
  anchorEl: null,
});

const selectedSet = computed(() => new Set(props.selectedDates));
const todayISO = toISODate(new Date());

function getEventsForDate(date: ISODate): EventViewItem[] {
  const result: EventViewItem[] = [];

  for (const cal of props.visibleCalendars || []) {
    if (!cal.visible) continue;

    const eventsList: DomainEvent[] = [];
    if (cal.events) {
      for (const evt of Object.values(cal.events)) {
        if (evt.date === date) eventsList.push(evt);
      }
    } else if ((cal as any).cells && (cal as any).cells[date]) {
      const cell = (cal as any).cells[date];
      if (cell && cell.presetInstances) {
        for (const inst of cell.presetInstances) {
          eventsList.push({
            id: inst.id,
            date,
            modelId: inst.presetId,
            source: inst.source || 'model',
            overrides: inst.overrides,
            checklistState: inst.checklistState || [],
            createdAt: inst.createdAt || new Date().toISOString(),
          });
        }
      }
    }

    for (const evt of eventsList) {
      const parentModel = evt.modelId ? (cal.models ? cal.models[evt.modelId] : (cal as any).presets?.[evt.modelId]) : undefined;
      result.push({
        event: evt,
        model: parentModel,
        calendarName: cal.name,
        calendarColor: cal.color || '#5e6ad2',
      });
    }
  }

  return result;
}

const calendarDays = computed(() => {
  const year = props.currentYear;
  const month = props.currentMonth;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = (firstDayOfMonth.getDay() - props.weekStartsOn + 7) % 7;
  const totalDays = lastDayOfMonth.getDate();

  const days: CalendarDayView[] = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const iso = toISODate(d);
    days.push({
      date: iso,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: iso === todayISO,
      isSelected: selectedSet.value.has(iso),
      events: getEventsForDate(iso),
    });
  }

  let totalEventsInGrid = 0;
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const iso = toISODate(d);
    const evts = getEventsForDate(iso);
    totalEventsInGrid += evts.length;
    days.push({
      date: iso,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      isSelected: selectedSet.value.has(iso),
      events: evts,
    });
  }

  const columnCount = props.showWeekends ? 7 : 5;
  const remainingCells = (columnCount - (days.length % columnCount)) % columnCount;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const iso = toISODate(d);
    days.push({
      date: iso,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: iso === todayISO,
      isSelected: selectedSet.value.has(iso),
      events: getEventsForDate(iso),
    });
  }

  const visibleDays = props.showWeekends
    ? days
    : days.filter((day) => {
        const weekday = new Date(`${day.date}T00:00:00`).getDay();
        return weekday !== 0 && weekday !== 6;
      });

  console.log(`[CANSCHE DIAG] 6. CalendarGrid re-calculou calendarDays. Total dias: ${visibleDays.length}. Total eventos renderizados no mês: ${totalEventsInGrid}`);
  return visibleDays;
});

function onSelectDate(payload: { date: ISODate; ctrlKey: boolean; shiftKey: boolean; isDrag: boolean }) {
  if (payload.isDrag && !isDragging.value) return;
  if (!payload.isDrag) isDragging.value = true;

  emit('select-date', payload);
}

function onMouseLeaveGrid() {
  isDragging.value = false;
  hoverCardState.value.isOpen = false;
}

function onHoverEvent(payload: { item: EventViewItem; anchorEl: HTMLElement }) {
  hoverCardState.value = {
    isOpen: true,
    item: payload.item,
    anchorEl: payload.anchorEl,
  };
}

function onUnhoverEvent() {
  hoverCardState.value.isOpen = false;
}

function cancelHoverCardHide() {
  // Keeps card open when mouse enters hover card
}

function onSelectEvent(item: EventViewItem) {
  hoverCardState.value.isOpen = false;
  overflowState.value.isOpen = false;
  InspectorService.open(item);
}

function onEditEvent(item: EventViewItem) {
  hoverCardState.value.isOpen = false;
  overflowState.value.isOpen = false;
  if (item.model) {
    emit('edit-model', item.model);
  }
}

function onOpenOverflow(payload: { day: CalendarDayView; anchorEl: HTMLElement }) {
  overflowState.value = {
    isOpen: true,
    day: payload.day,
    anchorEl: payload.anchorEl,
  };
}

// Keyboard Navigation & Shortcuts
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    hoverCardState.value.isOpen = false;
    overflowState.value.isOpen = false;
    InspectorService.close();
    emit('deselect');
  }
}
</script>
