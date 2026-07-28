<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-[#08090a] p-3 select-none">
    <!-- Days of Week Header -->
    <div class="grid grid-cols-7 gap-1.5 mb-1.5 text-center shrink-0">
      <div
        v-for="dayName in daysOfWeek"
        :key="dayName"
        class="font-mono text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider py-1 border-b border-[#23252a]"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- High-Density Monthly Grid -->
    <div
      class="flex-1 grid grid-cols-7 gap-1.5 auto-rows-fr overflow-hidden"
      @mouseleave="onMouseLeave"
    >
      <div
        v-for="day in calendarDays"
        :key="day.date"
        @mousedown="onMouseDown(day.date, $event)"
        @mouseenter="onMouseEnter(day.date)"
        @mouseup="onMouseUp"
        class="group relative rounded-[8px] border flex flex-col justify-between p-1.5 transition-all duration-100 cursor-pointer overflow-hidden"
        :class="[
          day.isSelected
            ? '!bg-[#161718] !border-white ring-1 ring-white/40 shadow-md z-10'
            : day.isCurrentMonth
            ? 'bg-[#0f1011] border-[#23252a] hover:border-[#383b3f]'
            : 'bg-[#08090a]/50 border-[#161718] text-[#62666d] opacity-40',
          day.isToday && !day.isSelected ? 'border-[#02b8cc]/80' : ''
        ]"
      >
        <!-- Top accent bar for selected cells -->
        <div
          v-if="day.isSelected"
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
                : 'text-[#8a8f98] group-hover:text-white'
            ]"
          >
            {{ day.dayNumber }}
          </span>

          <span v-if="day.isToday" class="w-1.5 h-1.5 rounded-full bg-[#02b8cc]" title="Hoje"></span>
        </div>

        <!-- Cell Events (Consolidated across visible layers) -->
        <div class="flex-1 flex flex-col gap-1 overflow-hidden justify-start">
          <div
            v-for="item in day.events"
            :key="item.event.id"
            class="px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium flex items-center justify-between border truncate leading-tight shadow-xs"
            :style="{
              backgroundColor: getEventColor(item) + '25',
              borderColor: getEventColor(item) + '70',
              color: '#ffffff'
            }"
            :title="getEventTooltip(item)"
          >
            <div class="flex items-center gap-1.5 truncate min-w-0">
              <!-- Calendar Layer Indicator Dot -->
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :style="{ backgroundColor: item.calendarColor }"
                :title="'Camada: ' + item.calendarName"
              ></span>
              <IconRenderer :icon="getEventEmoji(item)" :size="13" :color="getEventColor(item)" />
              <span class="truncate leading-none font-sans text-white font-medium">{{ getEventName(item) }}</span>
            </div>

            <!-- Optional time badge or checklist indicator -->
            <div class="flex items-center space-x-1 shrink-0 text-[9px] font-mono opacity-90 pl-1">
              <span v-if="getEventStartTime(item)" class="text-[9px] text-slate-300">
                {{ getEventStartTime(item) }}
              </span>

              <button
                v-if="item.event.checklistState && item.event.checklistState.length > 0"
                @click.stop="toggleFirstChecklist(item.event)"
                class="text-[9px] font-mono hover:scale-110 transition-transform px-1 rounded bg-black/40 text-white"
                :class="isAllCompleted(item.event.checklistState) ? 'text-emerald-400 font-bold' : 'text-slate-300'"
                title="Clique para alternar tarefa concluída neste dia"
              >
                {{ getCompletedCount(item.event.checklistState) }}/{{ item.event.checklistState.length }} ☑
              </button>
            </div>
          </div>
        </div>

        <!-- Overflow Counter if many events -->
        <div v-if="day.events.length > 3" class="text-[9px] font-mono text-[#62666d] text-right leading-none pt-0.5">
          +{{ day.events.length - 3 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ISODate, toISODate } from '@cansche/shared';
import { Calendar, Model, CalendarEvent, ChecklistItem } from '@cansche/domain';
import IconRenderer from './IconRenderer.vue';

const props = defineProps<{
  currentYear: number;
  currentMonth: number;
  visibleCalendars: Calendar[];
  selectedDates: ISODate[];
}>();

const emit = defineEmits(['select-date', 'toggle-checklist']);

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const isDragging = ref(false);

const selectedSet = computed(() => new Set(props.selectedDates));
const todayISO = toISODate(new Date());

function getCompletedCount(checklist: ChecklistItem[]): number {
  return checklist.filter((c) => c.completed).length;
}

function isAllCompleted(checklist: ChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((c) => c.completed);
}

function toggleFirstChecklist(event: CalendarEvent) {
  if (event.checklistState && event.checklistState.length > 0) {
    emit('toggle-checklist', {
      eventId: event.id,
      itemId: event.checklistState[0].id,
    });
  }
}

interface EventViewItem {
  event: CalendarEvent;
  model?: Model;
  calendarName: string;
  calendarColor: string;
}

function getEventsForDate(date: ISODate): EventViewItem[] {
  const result: EventViewItem[] = [];

  for (const cal of props.visibleCalendars || []) {
    if (!cal.visible) continue;

    const eventsList: CalendarEvent[] = [];
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

function getEventName(item: EventViewItem): string {
  return item.event.overrides?.name || item.model?.name || 'Evento';
}

function getEventEmoji(item: EventViewItem): string {
  return item.event.overrides?.emoji || item.model?.emoji || 'lucide:Bookmark';
}

function getEventColor(item: EventViewItem): string {
  return item.event.overrides?.color || item.model?.color || item.calendarColor || '#5e6ad2';
}

function getEventStartTime(item: EventViewItem): string | undefined {
  return item.event.overrides?.startTime || item.model?.schedule?.startTime || (item.model as any)?.startTime;
}

function getEventTooltip(item: EventViewItem): string {
  const parts = [`[${item.calendarName}] ${getEventName(item)}`];
  const startTime = getEventStartTime(item);
  const endTime = item.event.overrides?.endTime || item.model?.schedule?.endTime || (item.model as any)?.endTime || '23:59';
  const location = item.event.overrides?.location || item.model?.content?.location || (item.model as any)?.location;
  const description = item.event.overrides?.description || item.model?.content?.description || (item.model as any)?.description;

  if (startTime) {
    parts.push(`⏰ ${startTime} - ${endTime}`);
  }
  if (location) {
    parts.push(`📍 ${location}`);
  }
  if (item.event.checklistState && item.event.checklistState.length > 0) {
    parts.push(`Tarefas:`);
    for (const chk of item.event.checklistState) {
      parts.push(` ${chk.completed ? '☑' : '☐'} ${chk.text}`);
    }
  } else if (description) {
    parts.push(`📝 ${description}`);
  }
  return parts.join('\n');
}

const calendarDays = computed(() => {
  const year = props.currentYear;
  const month = props.currentMonth;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const days: Array<{
    date: ISODate;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    events: EventViewItem[];
  }> = [];

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

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const iso = toISODate(d);
    days.push({
      date: iso,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: iso === todayISO,
      isSelected: selectedSet.value.has(iso),
      events: getEventsForDate(iso),
    });
  }

  const remainingCells = (7 - (days.length % 7)) % 7;
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

  return days;
});

function onMouseDown(date: ISODate, event: MouseEvent) {
  isDragging.value = true;
  emit('select-date', {
    date,
    ctrlKey: event.ctrlKey || event.metaKey,
    shiftKey: event.shiftKey,
    isDrag: false,
  });
}

function onMouseEnter(date: ISODate) {
  if (isDragging.value) {
    emit('select-date', {
      date,
      ctrlKey: true,
      shiftKey: false,
      isDrag: true,
    });
  }
}

function onMouseUp() {
  isDragging.value = false;
}

function onMouseLeave() {
  isDragging.value = false;
}
</script>
