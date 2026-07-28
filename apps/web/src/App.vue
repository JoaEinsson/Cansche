<template>
  <div class="h-screen w-screen flex flex-col bg-[#08090a] text-[#d0d6e0] overflow-hidden font-sans">
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
      <!-- Left Sidebar: Layers & Rich Models Library -->
      <ModelLibrary
        :calendars="allCalendars"
        :editing-calendar-id="editingCalendarId"
        :active-calendar-ids="activeCalendarIds"
        :models="models"
        @select-editing-calendar="handleSelectEditingCalendar"
        @toggle-layer-visibility="handleToggleLayerVisibility"
        @open-workspace-manager="isWorkspaceManagerOpen = true"
        @apply-model="handleApplyModel"
        @open-create-modal="handleOpenCreateModal"
        @edit-model="handleEditModel"
        @delete-model="handleDeleteModel"
      />

      <!-- Center: Calendar Grid View (Consolidates all visible layers) -->
      <CalendarGrid
        :current-year="currentYear"
        :current-month="currentMonth"
        :visible-calendars="visibleCalendars"
        :selected-dates="selectedDates"
        @select-date="handleDateSelection"
        @toggle-checklist="handleToggleChecklist"
        @edit-model="handleEditModel"
        @deselect="handleDeselect"
      />

      <!-- Right Sidebar: Event Inspector -->
      <EventInspector
        @toggle-checklist="handleToggleChecklist"
        @edit-model="handleEditModel"
        @delete-event="handleDeleteEvent"
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

    <!-- Drag & Drop Floating Overlay -->
    <DragOverlay />

    <!-- Rich Model Editor Modal -->
    <ModelEditorModal
      :is-open="isModalOpen"
      :initial-model="editingModel"
      @close="isModalOpen = false"
      @save="handleSaveModel"
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
import { ISODate, toISODate } from '@cansche/shared';
import { Calendar, Model, CalendarEvent } from '@cansche/domain';
import { CalendarEngine, ApplyModelCommand, ClearCellsCommand, PasteCommand, MoveCommand } from '@cansche/engine';
import { SelectionService } from '@cansche/selection';
import { CalendarRepository, LocalStorageRepository } from '@cansche/repositories';
import { DesktopPlatformAdapter } from '@cansche/platform';
import { ApplicationImportExportService, BackupService, NotificationService, InspectorService, DragService } from '@cansche/application';

import HeaderBar from './components/HeaderBar.vue';
import ModelLibrary from './components/ModelLibrary.vue';
import CalendarGrid from './components/CalendarGrid.vue';
import EventInspector from './components/EventInspector.vue';
import SmartSelectionToolbar from './components/SmartSelectionToolbar.vue';
import ModelEditorModal from './components/ModelEditorModal.vue';
import WorkspaceManagerModal from './components/WorkspaceManagerModal.vue';
import DragOverlay from './components/DragOverlay.vue';

// Core Architecture Services Initialization
const repository = new LocalStorageRepository();
const platform = new DesktopPlatformAdapter();
const engine = new CalendarEngine();
const selectionService = new SelectionService();

const importExportService = new ApplicationImportExportService(repository, platform);
const backupService = new BackupService(repository, platform);
const notificationService = new NotificationService(platform);

// Reactive Application State
const workspace = ref(engine.getWorkspace());
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDates = ref<ISODate[]>([]);

const isModalOpen = ref(false);
const editingModel = ref<Model | null>(null);
const isWorkspaceManagerOpen = ref(false);

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentMonthLabel = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const allCalendars = computed(() => {
  if (!workspace.value?.calendars) return [];
  return Object.values(workspace.value.calendars).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

const editingCalendarId = computed(() => {
  return workspace.value.editingCalendarId;
});

const activeCalendarIds = computed(() => {
  return allCalendars.value.filter(c => c.visible).map(c => c.id);
});

const visibleCalendars = computed(() => {
  return allCalendars.value.filter(c => c.visible);
});

const models = computed(() => {
  const ws = workspace.value;
  if (!ws || !ws.editingCalendarId || !ws.calendars) return [];
  const activeCal = ws.calendars[ws.editingCalendarId];
  if (!activeCal) return [];
  return Object.values(activeCal.models || (activeCal as any).presets || {});
});

const canUndo = computed(() => engine.canUndo());
const canRedo = computed(() => engine.canRedo());
const clipboard = computed(() => engine.getClipboard());

function syncState() {
  workspace.value = { ...engine.getWorkspace() };
}

function handleSelectEditingCalendar(calendarId: string) {
  engine.setEditingCalendar(calendarId);
  syncState();
  autoSave();
}

function handleToggleLayerVisibility(calendarId: string) {
  engine.toggleLayerVisibility(calendarId);
  syncState();
  autoSave();
}

function handleCreateCalendar(payload: { name: string; color?: string }) {
  engine.createCalendar(payload.name, payload.color);
  syncState();
  autoSave();
}

function handleDuplicateCalendar(calendarId: string) {
  engine.duplicateCalendar(calendarId);
  syncState();
  autoSave();
}

function handleDeleteCalendar(calendarId: string) {
  engine.deleteCalendar(calendarId);
  syncState();
  autoSave();
}

function handleDateSelection(payload: { date: ISODate; ctrlKey: boolean; shiftKey: boolean; isDrag: boolean }) {
  if (payload.ctrlKey) {
    selectionService.toggleDate(payload.date);
  } else if (payload.shiftKey && selectedDates.value.length > 0) {
    selectionService.selectRange(payload.date);
  } else {
    if (!payload.isDrag) {
      selectionService.selectSingleDate(payload.date);
    } else {
      selectionService.addDateToSelection(payload.date);
    }
  }
  selectedDates.value = [...selectionService.getSelectedDates()];
}

function handleSelectSaturdays() {
  selectionService.selectSaturdays(currentYear.value, currentMonth.value);
  selectedDates.value = [...selectionService.getSelectedDates()];
}

function handleSelectWeekends() {
  selectionService.selectWeekends(currentYear.value, currentMonth.value);
  selectedDates.value = [...selectionService.getSelectedDates()];
}

function handleDeselect() {
  selectionService.clearSelection();
  selectedDates.value = [];
}

function handleOpenCreateModal() {
  editingModel.value = null;
  isModalOpen.value = true;
}

function handleEditModel(model: Model) {
  editingModel.value = model;
  isModalOpen.value = true;
}

function handleSaveModel(modelData: Model) {
  if (modelData.id) {
    engine.updateModel(modelData);
  } else {
    engine.addModel(modelData);
  }
  syncState();
  autoSave();
  isModalOpen.value = false;
}

function handleDeleteModel(modelId: string) {
  engine.deleteModel(modelId);
  syncState();
  autoSave();
}

function handleApplyModel(modelId: string) {
  if (selectedDates.value.length === 0) return;
  engine.execute(new ApplyModelCommand(selectedDates.value, modelId));
  
  const targetModel = models.value.find(m => m.id === modelId);
  if (targetModel) {
    notificationService.notifyPresetEvent(
      targetModel.name,
      targetModel.schedule?.startTime,
      targetModel.content?.location
    );
  }

  syncState();
  autoSave();
}

function handleToggleChecklist(payload: { eventId?: string; instanceId?: string; itemId: string }) {
  const targetId = payload.eventId || payload.instanceId;
  if (targetId) {
    engine.toggleChecklistItem(targetId, payload.itemId);
    syncState();
    autoSave();
  }
}

function handleDeleteEvent(evt: CalendarEvent) {
  if (evt && evt.id) {
    engine.removeEvent(evt.id);
    InspectorService.close();
    syncState();
    autoSave();
  }
}

function handleClearCells() {
  if (selectedDates.value.length === 0) return;
  engine.execute(new ClearCellsCommand(selectedDates.value));
  syncState();
  autoSave();
}

function handleCopy() {
  if (selectedDates.value.length === 0) return;
  engine.clipboardService.copy(selectedDates.value, engine);
  syncState();
}

function handlePaste() {
  const clip = engine.getClipboard();
  if (!clip || selectedDates.value.length === 0) return;
  const targetDate = selectedDates.value[0];
  engine.execute(new PasteCommand(targetDate, clip));
  syncState();
  autoSave();
}

function handleUndo() {
  engine.undo();
  syncState();
  autoSave();
}

function handleRedo() {
  engine.redo();
  syncState();
  autoSave();
}

async function autoSave() {
  try {
    await repository.saveWorkspace(engine.getWorkspace());
  } catch (err) {
    console.error('AutoSave failed:', err);
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function goToToday() {
  const now = new Date();
  currentYear.value = now.getFullYear();
  currentMonth.value = now.getMonth();
  const today = toISODate(now);
  selectionService.selectSingleDate(today);
  selectedDates.value = [today];
}

async function handleExportCalendar(calendarId: string) {
  const cal = engine.getCalendarsList().find(c => c.id === calendarId);
  if (cal) {
    await importExportService.exportCalendarFile(cal);
  }
}

async function handleExportWorkspace() {
  await importExportService.exportWorkspaceFile(engine.getWorkspace());
}

async function handleImportFile(content: string) {
  const res = engine.exportWorkspace(); // test
  syncState();
  autoSave();
}

function handlePointerMove(event: PointerEvent) {
  DragService.updatePosition(event);
}

function handlePointerUp(event: PointerEvent) {
  const result = DragService.endDrag();
  if (result) {
    const { item, hoverDate, isCopyMode } = result;

    if (item.type === 'model') {
      engine.execute(new ApplyModelCommand([hoverDate], item.modelId));
      const targetModel = models.value.find((m) => m.id === item.modelId);
      if (targetModel) {
        notificationService.notifyPresetEvent(
          targetModel.name,
          targetModel.schedule?.startTime,
          targetModel.content?.location
        );
      }
    } else if (item.type === 'event') {
      if (isCopyMode) {
        const activeCal = engine.getActiveCalendar();
        const sourceEvt = activeCal.events ? activeCal.events[item.eventId] : undefined;
        if (sourceEvt && sourceEvt.modelId) {
          engine.execute(new ApplyModelCommand([hoverDate], sourceEvt.modelId));
        }
      } else {
        if (item.sourceDate !== hoverDate) {
          engine.execute(new MoveCommand([item.sourceDate], hoverDate));
        }
      }
    }

    syncState();
    autoSave();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (DragService.state.isDragging) {
    if (event.key === 'Escape') {
      DragService.cancelDrag();
      return;
    }
  }

  const target = event.target as HTMLElement | null;
  const isTextInput = target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );

  if (isTextInput) {
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
  } else if (isCtrl && event.key.toLowerCase() === 's') {
    event.preventDefault();
    handleExportWorkspace();
  } else if (isCtrl && event.key.toLowerCase() === 'n') {
    event.preventDefault();
    handleOpenCreateModal();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    handleClearCells();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    handleDeselect();
  }
}

onMounted(async () => {
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('keydown', handleKeyDown);

  const saved = await repository.getWorkspace();
  if (saved && saved.calendars && (saved.editingCalendarId || (saved as any).activeCalendarId)) {
    engine.setWorkspace(saved);
  }

  const activeCal = engine.getActiveCalendar();
  if (!activeCal.models || Object.keys(activeCal.models).length === 0) {
    engine.addModel({
      name: 'Aula Faculdade',
      emoji: 'lucide:GraduationCap',
      color: '#5e6ad2',
      schedule: { startTime: '19:00', endTime: '22:30' },
      metadata: { category: 'Estudo' },
      content: {
        location: 'Campus Central',
        description: 'Levar notebook e caderno para aula presencial.',
        checklistTemplate: ['Revisar material da aula', 'Resolver exercícios']
      }
    });

    engine.addModel({
      name: 'Trabalho Remoto',
      emoji: 'lucide:Briefcase',
      color: '#3b82f6',
      schedule: { startTime: '08:00', endTime: '17:00' },
      metadata: { category: 'Trabalho' },
      content: {
        location: 'Home Office',
        checklistTemplate: ['Daily meeting 09h', 'Code review']
      }
    });

    engine.addModel({
      name: 'Treino Academia',
      emoji: 'lucide:Dumbbell',
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
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
