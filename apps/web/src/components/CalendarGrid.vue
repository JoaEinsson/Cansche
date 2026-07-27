<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-linear-base p-3 select-none">
    <!-- Days of Week Header -->
    <div class="grid grid-cols-7 gap-1.5 mb-1.5 text-center shrink-0">
      <div
        v-for="dayName in daysOfWeek"
        :key="dayName"
        class="font-mono text-[11px] font-semibold text-linear-darkMuted uppercase tracking-wider py-1 border-b border-linear-subtle"
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
        class="group relative rounded border flex flex-col justify-between p-1.5 transition-all duration-100 cursor-pointer overflow-hidden"
        :class="[
          day.isSelected
            ? '!bg-indigo-950/60 !border-indigo-400 ring-2 ring-indigo-500/80 shadow-lg shadow-indigo-500/20 z-10'
            : day.isCurrentMonth
            ? 'bg-linear-surface border-linear-subtle hover:border-slate-700'
            : 'bg-linear-base/40 border-linear-base/60 text-linear-darkMuted opacity-35',
          day.isToday && !day.isSelected ? 'border-cyan-500/80' : ''
        ]"
      >
        <!-- Top accent bar for selected cells -->
        <div
          v-if="day.isSelected"
          class="absolute top-0 left-0 right-0 h-0.5 bg-indigo-400 shadow-sm"
        ></div>

        <!-- Cell Top Bar: Date Number + Today Indicator -->
        <div class="flex items-center justify-between leading-none mb-1">
          <span
            class="text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors"
            :class="[
              day.isSelected
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : day.isToday
                ? 'bg-cyan-500 text-black font-bold'
                : 'text-linear-muted group-hover:text-linear-text'
            ]"
          >
            {{ day.dayNumber }}
          </span>

          <span v-if="day.isToday" class="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Hoje"></span>
        </div>

        <!-- Cell Preset Instances (Consolidated across visible layers) -->
        <div class="flex-1 flex flex-col gap-1 overflow-hidden justify-start">
          <div
            v-for="inst in day.instances"
            :key="inst.instance.id"
            class="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center justify-between border truncate leading-tight shadow-sm"
            :style="{
              backgroundColor: inst.preset.color + '25',
              borderColor: inst.preset.color + '70',
              color: '#ffffff'
            }"
            :title="getPresetTooltip(inst.preset, inst.instance, inst.calendarName)"
          >
            <div class="flex items-center gap-1.5 truncate min-w-0">
              <!-- Calendar Layer Indicator Dot -->
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :style="{ backgroundColor: inst.calendarColor }"
                :title="'Camada: ' + inst.calendarName"
              ></span>
              <span class="text-[11px] shrink-0 leading-none">{{ inst.preset.emoji }}</span>
              <span class="truncate leading-none font-sans text-white font-medium">{{ inst.preset.name }}</span>
            </div>

            <!-- Optional time badge or checklist indicator -->
            <div class="flex items-center space-x-1 shrink-0 text-[9px] font-mono opacity-90 pl-1">
              <span v-if="getPresetStartTime(inst.preset)" class="text-[9px] text-slate-300">
                {{ getPresetStartTime(inst.preset) }}
              </span>

              <button
                v-if="inst.instance.checklistState && inst.instance.checklistState.length > 0"
                @click.stop="toggleFirstChecklist(day.date, inst.instance)"
                class="text-[9px] font-mono hover:scale-110 transition-transform px-1 rounded bg-black/30"
                :class="isAllCompleted(inst.instance.checklistState) ? 'text-emerald-400 font-bold' : 'text-indigo-300'"
                title="Clique para alternar tarefa concluída neste dia"
              >
                {{ getCompletedCount(inst.instance.checklistState) }}/{{ inst.instance.checklistState.length }} ☑
              </button>
            </div>
          </div>
        </div>

        <!-- Overflow Counter if many instances -->
        <div v-if="day.instances.length > 3" class="text-[9px] font-mono text-linear-darkMuted text-right leading-none pt-0.5">
          +{{ day.instances.length - 3 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ISODate, toISODate } from '@cansche/shared';
import { Calendar, Preset, PresetInstance, ChecklistItem } from '@cansche/domain';

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

function getPresetStartTime(preset: Preset): string | undefined {
  return preset.schedule?.startTime || (preset as any).startTime;
}

function getCompletedCount(checklist: ChecklistItem[]): number {
  return checklist.filter((c) => c.completed).length;
}

function isAllCompleted(checklist: ChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((c) => c.completed);
}

function toggleFirstChecklist(date: ISODate, instance: PresetInstance) {
  if (instance.checklistState && instance.checklistState.length > 0) {
    emit('toggle-checklist', {
      date,
      instanceId: instance.id,
      itemId: instance.checklistState[0].id,
    });
  }
}

function getInstancesForDate(date: ISODate): Array<{ instance: PresetInstance; preset: Preset; calendarName: string; calendarColor: string }> {
  const result: Array<{ instance: PresetInstance; preset: Preset; calendarName: string; calendarColor: string }> = [];

  for (const cal of props.visibleCalendars || []) {
    if (!cal.visible) continue;
    const cell = cal.cells[date];
    if (!cell) continue;

    let rawInstances: PresetInstance[] = [];
    if (Array.isArray(cell.presetInstances)) {
      rawInstances = cell.presetInstances;
    } else if (Array.isArray((cell as any).presetIds)) {
      rawInstances = ((cell as any).presetIds as string[]).map((id, idx) => ({
        id: `${id}_${idx}`,
        presetId: id,
        source: 'preset',
        checklistState: [],
        createdAt: new Date().toISOString(),
      }));
    } else if ((cell as any).presetId) {
      rawInstances = [{
        id: (cell as any).presetId,
        presetId: (cell as any).presetId,
        source: 'preset',
        checklistState: [],
        createdAt: new Date().toISOString(),
      }];
    }

    for (const inst of rawInstances) {
      const parentPreset = cal.presets[inst.presetId];
      if (parentPreset) {
        result.push({
          instance: inst,
          preset: parentPreset,
          calendarName: cal.name,
          calendarColor: cal.color || '#5e6ad2',
        });
      }
    }
  }

  return result;
}

function getPresetTooltip(preset: Preset, instance: PresetInstance, calendarName: string): string {
  const parts = [`[${calendarName}] ${preset.name}`];
  const startTime = preset.schedule?.startTime || (preset as any).startTime;
  const endTime = preset.schedule?.endTime || (preset as any).endTime || '23:59';
  const location = preset.content?.location || (preset as any).location;
  const description = preset.content?.description || (preset as any).description;

  if (startTime) {
    parts.push(`⏰ ${startTime} - ${endTime}`);
  }
  if (location) {
    parts.push(`📍 ${location}`);
  }
  if (instance.checklistState && instance.checklistState.length > 0) {
    parts.push(`Tarefas:`);
    for (const item of instance.checklistState) {
      parts.push(` ${item.completed ? '☑' : '☐'} ${item.text}`);
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
    instances: Array<{ instance: PresetInstance; preset: Preset; calendarName: string; calendarColor: string }>;
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
      instances: getInstancesForDate(iso),
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
      instances: getInstancesForDate(iso),
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
      instances: getInstancesForDate(iso),
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
