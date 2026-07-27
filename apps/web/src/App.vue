<template>
  <div class="h-screen w-screen flex flex-col bg-linear-base text-linear-text overflow-hidden font-sans">
    <!-- Top Bar Navigation -->
    <HeaderBar
      :current-month-label="currentMonthLabel"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @today="goToToday"
      @undo="handleUndo"
      @redo="handleRedo"
    />

    <!-- Main Workspace Layout -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- Left Sidebar: Layers & Rich Presets Palette -->
      <PresetPalette
        :calendars="allCalendars"
        :editing-calendar-id="editingCalendarId"
        :active-calendar-ids="activeCalendarIds"
        :presets="presets"
        @select-editing-calendar="handleSelectEditingCalendar"
        @toggle-layer-visibility="handleToggleLayerVisibility"
        @open-workspace-manager="isWorkspaceManagerOpen = true"
        @apply-preset="handleApplyPreset"
        @open-create-modal="handleOpenCreateModal"
        @edit-preset="handleEditPreset"
        @delete-preset="handleDeletePreset"
      />

      <!-- Center: Calendar Grid View (Consolidates all visible layers) -->
      <CalendarGrid
        :current-year="currentYear"
        :current-month="currentMonth"
        :visible-calendars="visibleCalendars"
        :selected-dates="selectedDates"
        @select-date="handleDateSelection"
        @toggle-checklist="handleToggleChecklist"
      />

      <!-- Floating Toolbar for Batch Actions -->
      <SmartSelectionToolbar
        :selected-count="selectedDates.length"
        :has-clipboard="!!clipboard"
        @select-saturdays="handleSelectSaturdays"
        @select-weekends="handleSelectWeekends"
        @copy="handleCopy"
        @paste="handlePaste"
        @clear-cells="handleClearCells"
        @deselect="handleDeselect"
      />
    </div>

    <!-- Rich Preset Editor Modal -->
    <PresetEditorModal
      :is-open="isModalOpen"
      :initial-preset="editingPreset"
      @close="isModalOpen = false"
      @save="handleSavePreset"
    />

    <!-- Workspace Manager & Import/Export Modal -->
    <WorkspaceManagerModal
      :is-open="isWorkspaceManagerOpen"
      :calendars="allCalendars"
      :editing-calendar-id="editingCalendarId"
      @close="isWorkspaceManagerOpen = false"
      @create-calendar="handleCreateCalendar"
      @select-editing="handleSelectEditingCalendar"
      @export-calendar="handleExportCalendar"
      @export-workspace="handleExportWorkspace"
      @import-file="handleImportFile"
      @duplicate="handleDuplicateCalendar"
      @delete="handleDeleteCalendar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { CalendarEngine, ApplyPresetCommand, ClearCellsCommand, PasteCommand } from '@cansche/engine';
import { CalendarAPI } from '@cansche/api';
import { IndexedDBAdapter } from '@cansche/storage';
import { ISODate, getDaysBetween, toISODate } from '@cansche/shared';
import { Preset, Calendar, ClipboardData } from '@cansche/domain';

import HeaderBar from './components/HeaderBar.vue';
import PresetPalette from './components/PresetPalette.vue';
import CalendarGrid from './components/CalendarGrid.vue';
import SmartSelectionToolbar from './components/SmartSelectionToolbar.vue';
import PresetEditorModal from './components/PresetEditorModal.vue';
import WorkspaceManagerModal from './components/WorkspaceManagerModal.vue';

const engine = new CalendarEngine();
const api = new CalendarAPI(engine);
const storage = new IndexedDBAdapter();

const currentDate = ref(new Date());
const selectedDates = ref<ISODate[]>([]);
const allCalendars = ref<Calendar[]>([]);
const visibleCalendars = ref<Calendar[]>([]);
const editingCalendarId = ref<string>('');
const activeCalendarIds = ref<string[]>([]);
const presets = ref<Preset[]>([]);
const clipboard = ref<ClipboardData | null>(null);
const canUndo = ref(false);
const canRedo = ref(false);

const isModalOpen = ref(false);
const isWorkspaceManagerOpen = ref(false);
const editingPreset = ref<Preset | null>(null);

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthLabel = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);

function syncState() {
  allCalendars.value = [...api.query('allCalendars')];
  visibleCalendars.value = [...api.query('visibleCalendars')];
  editingCalendarId.value = api.query('editingCalendarId');
  activeCalendarIds.value = [...api.query('activeCalendarIds')];
  presets.value = [...api.query('presets')];
  selectedDates.value = [...api.query('selectedDates')];
  clipboard.value = api.query('clipboard');
  canUndo.value = api.query('canUndo');
  canRedo.value = api.query('canRedo');
}

api.subscribe(() => {
  syncState();
});

// Navigation
function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}
function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}
function goToToday() {
  currentDate.value = new Date();
}

// Workspace Layer Management
function handleSelectEditingCalendar(id: string) {
  engine.setEditingCalendar(id);
  syncState();
  autoSave();
}

function handleToggleLayerVisibility(id: string) {
  engine.toggleCalendarVisibility(id);
  syncState();
  autoSave();
}

function handleCreateCalendar(data: { name: string; color: string }) {
  engine.createCalendar(data.name, data.color);
  syncState();
  autoSave();
}

function handleDuplicateCalendar(id: string) {
  engine.duplicateCalendar(id);
  syncState();
  autoSave();
}

function handleDeleteCalendar(id: string) {
  try {
    engine.deleteCalendar(id);
    syncState();
    autoSave();
  } catch (err: any) {
    alert(err.message || 'Erro ao excluir calendário.');
  }
}

function handleExportCalendar(id: string) {
  const jsonStr = engine.exportCalendar(id);
  const targetCal = allCalendars.value.find((c) => c.id === id);
  const fileName = `${(targetCal?.name || 'calendar').toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
  downloadFile(jsonStr, fileName);
}

function handleExportWorkspace() {
  const jsonStr = engine.exportWorkspace();
  const ws = api.query('workspace');
  const fileName = `${(ws?.name || 'workspace').toLowerCase().replace(/\s+/g, '-')}.cansche.json`;
  downloadFile(jsonStr, fileName);
}

function downloadFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImportFile(jsonString: string) {
  try {
    const res = engine.importFile(jsonString);
    syncState();
    autoSave();
    alert(`Sucesso! ${res.type === 'calendar' ? 'Calendário' : 'Workspace'} importado.`);
  } catch (err: any) {
    alert(err.message || 'Falha ao importar o arquivo .cansche');
  }
}

// Selection Handlers
function handleDateSelection(payload: { date: ISODate; ctrlKey: boolean; shiftKey: boolean; isDrag: boolean }) {
  if (payload.shiftKey) {
    engine.selectionService.selectRange(payload.date);
  } else if (payload.ctrlKey || payload.isDrag) {
    engine.selectionService.toggleDate(payload.date);
  } else {
    engine.selectionService.selectSingle(payload.date);
  }
  syncState();
}

function handleDeselect() {
  engine.selectionService.clear();
  syncState();
}

function getVisibleDatesForCurrentMonth(): ISODate[] {
  const start = new Date(currentYear.value, currentMonth.value, 1);
  const end = new Date(currentYear.value, currentMonth.value + 1, 0);
  return getDaysBetween(toISODate(start), toISODate(end));
}

function handleSelectSaturdays() {
  const visible = getVisibleDatesForCurrentMonth();
  engine.selectionService.selectByDayOfWeek(visible, 6);
  syncState();
}

function handleSelectWeekends() {
  const visible = getVisibleDatesForCurrentMonth();
  engine.selectionService.selectWeekendsInRange(visible);
  syncState();
}

// Preset Modal & Actions
function handleOpenCreateModal() {
  editingPreset.value = null;
  isModalOpen.value = true;
}

function handleEditPreset(preset: Preset) {
  editingPreset.value = preset;
  isModalOpen.value = true;
}

function handleSavePreset(presetData: Preset) {
  if (presetData.id) {
    engine.updatePreset(presetData);
  } else {
    engine.addPreset(presetData);
  }
  syncState();
  autoSave();
  isModalOpen.value = false;
}

function handleDeletePreset(presetId: string) {
  engine.deletePreset(presetId);
  syncState();
  autoSave();
}

function handleApplyPreset(presetId: string) {
  if (selectedDates.value.length === 0) return;
  api.execute(new ApplyPresetCommand(selectedDates.value, presetId));
  syncState();
  autoSave();
}

function handleToggleChecklist(payload: { date: ISODate; instanceId: string; itemId: string }) {
  engine.toggleChecklistItem(payload.date, payload.instanceId, payload.itemId);
  syncState();
  autoSave();
}

function handleClearCells() {
  if (selectedDates.value.length === 0) return;
  api.execute(new ClearCellsCommand(selectedDates.value));
  syncState();
  autoSave();
}

function handleCopy() {
  if (selectedDates.value.length === 0) return;
  engine.clipboardService.copy(selectedDates.value, engine);
  syncState();
}

function handlePaste() {
  const clip = api.query('clipboard');
  if (!clip || selectedDates.value.length === 0) return;
  const targetDate = selectedDates.value[0];
  api.execute(new PasteCommand(targetDate, clip));
  syncState();
  autoSave();
}

function handleUndo() {
  api.undo();
  syncState();
  autoSave();
}

function handleRedo() {
  api.redo();
  syncState();
  autoSave();
}

async function autoSave() {
  try {
    await storage.saveWorkspace(api.query('workspace'));
  } catch (err) {
    console.error('AutoSave failed:', err);
  }
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  const isCtrl = event.ctrlKey || event.metaKey;

  if (isCtrl && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    handleUndo();
  } else if (isCtrl && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    handleRedo();
  } else if (isCtrl && event.key.toLowerCase() === 'c') {
    event.preventDefault();
    handleCopy();
  } else if (isCtrl && event.key.toLowerCase() === 'v') {
    event.preventDefault();
    handlePaste();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    handleClearCells();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    handleDeselect();
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);

  const saved = await storage.loadWorkspace();
  if (saved && saved.calendars && (saved.editingCalendarId || (saved as any).activeCalendarId)) {
    engine.setWorkspace(saved);
  }

  const activeCal = engine.getActiveCalendar();
  if (Object.keys(activeCal.presets).length === 0) {
    engine.addPreset({
      name: 'Aula Faculdade',
      emoji: '📚',
      color: '#5e6ad2',
      schedule: { startTime: '19:00', endTime: '22:30' },
      metadata: { category: 'Estudo' },
      content: {
        location: 'Campus Central',
        description: 'Levar notebook e caderno para aula presencial.',
        checklistTemplate: ['Revisar material da aula', 'Resolver exercícios']
      }
    });

    engine.addPreset({
      name: 'Trabalho Remoto',
      emoji: '💼',
      color: '#3b82f6',
      schedule: { startTime: '08:00', endTime: '17:00' },
      metadata: { category: 'Trabalho' },
      content: {
        location: 'Home Office',
        checklistTemplate: ['Daily meeting 09h', 'Code review']
      }
    });

    engine.addPreset({
      name: 'Treino Academia',
      emoji: '🏋️',
      color: '#10b981',
      schedule: { startTime: '07:00', endTime: '08:00' },
      metadata: { category: 'Saúde' },
      content: { location: 'SmartFit' }
    });

    await autoSave();
  }

  syncState();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
