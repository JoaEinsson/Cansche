<template>
  <div class="h-screen w-screen flex flex-col bg-[#08090a] text-[#d0d6e0] overflow-hidden font-sans">
    <!-- Top Bar Navigation -->
    <HeaderBar
      :current-month-label="currentMonthLabel"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :app-version="appVersion"
      :update-status="updateStatus"
      @prev-month="prevMonth"
      @next-month="nextMonth"
      @today="goToToday"
      @undo="handleUndo"
      @redo="handleRedo"
      @open-command-palette="openCommandPalette"
      @open-settings="handleOpenSettings"
      @open-updates="handleOpenUpdates"
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
        @toggle-favorite="handleToggleFavorite"
      />

      <!-- Center: Calendar Grid View (Consolidates all visible layers) -->
      <CalendarGrid
        :current-year="currentYear"
        :current-month="currentMonth"
        :visible-calendars="visibleCalendars"
        :selected-dates="selectedDates"
        :week-starts-on="appSettings.calendar.weekStartsOn"
        :show-weekends="appSettings.calendar.showWeekends"
        :show-week-numbers="appSettings.calendar.showWeekNumbers"
        :density="appSettings.calendar.density"
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
        :has-clipboard="hasClipboard"
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

    <!-- Raycast-style Command Palette (Ctrl+K) -->
    <CommandPalette />

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

    <!-- Auto-Update Notification Modal -->
    <UpdateModal
      :is-open="isUpdateModalOpen"
      :update-info="updateInfo"
      @close="isUpdateModalOpen = false"
      @dismiss="handleDismissUpdate"
      @start-download="handleStartDownloadUpdate"
    />

    <SettingsModal
      :is-open="isSettingsOpen"
      :settings="appSettings"
      :app-version="appVersion"
      :updater-supported="updaterSupported"
      :update-status="updateStatus"
      :update-info="updateInfo"
      :update-error="updateError"
      :current-release="currentRelease"
      :initial-section="settingsSection"
      @close="isSettingsOpen = false"
      @save-settings="handleSaveSettings"
      @check-updates="() => checkForUpdates(true)"
      @start-update="handleStartDownloadUpdate"
      @open-workspace="handleOpenWorkspaceFromSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ISODate, toISODate } from '@cansche/shared';
import { Calendar, Workspace, Model, CalendarEvent, ClipboardData } from '@cansche/domain';
import { CalendarEngine, ApplyModelCommand, ClearCellsCommand, PasteCommand, MoveCommand, ToggleFavoriteCommand, ConstraintValidator, ImportExportService } from '@cansche/engine';
import { CalendarRepository, LocalStorageRepository } from '@cansche/repositories';
import { DesktopPlatformAdapter, UpdateInfo, UpdateStatus, WebNoopUpdaterAdapter } from '@cansche/platform';
import { ApplicationImportExportService, BackupService, NotificationService, UpdateService } from '@cansche/application';
import { InspectorService } from './services/InspectorService';
import { DragService } from './services/DragService';
import { CommandPaletteService } from './services/CommandPaletteService';
import { ModelCategoryService } from './services/ModelCategoryService';
import { TauriUpdaterAdapter } from './services/TauriUpdaterAdapter';
import { AppSettings, AppSettingsService } from './services/AppSettingsService';
import { findBundledRelease } from './services/ChangelogService';
import { getAppVersion, getBundledAppVersion } from './services/AppVersionService';

import HeaderBar from './components/HeaderBar.vue';
import ModelLibrary from './components/ModelLibrary.vue';
import CalendarGrid from './components/CalendarGrid.vue';
import EventInspector from './components/EventInspector.vue';
import SmartSelectionToolbar from './components/SmartSelectionToolbar.vue';
import ModelEditorModal from './components/ModelEditorModal.vue';
import WorkspaceManagerModal from './components/WorkspaceManagerModal.vue';
import UpdateModal from './components/UpdateModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import DragOverlay from './components/DragOverlay.vue';
import CommandPalette from './components/CommandPalette.vue';

// Core Architecture Services Initialization
const repository = new LocalStorageRepository();
const platform = new DesktopPlatformAdapter();
const engine = new CalendarEngine();
const selectionService = engine.selectionService;

const appSettings = ref<AppSettings>(AppSettingsService.load());
const appVersion = ref(getBundledAppVersion());
const updateStatus = ref<UpdateStatus>('idle');
const updateError = ref<string | null>(null);
const isSettingsOpen = ref(false);
const settingsSection = ref<'general' | 'calendar' | 'updates' | 'data' | 'about'>('general');

const tauriAdapter = new TauriUpdaterAdapter();
const updaterAdapter = tauriAdapter.isSupported() ? tauriAdapter : new WebNoopUpdaterAdapter();
const updaterSupported = tauriAdapter.isSupported();
const updatePreferences = {
  isAutoCheckEnabled: () => appSettings.value.updates.autoCheckEnabled,
  setAutoCheckEnabled: (enabled: boolean) => {
    appSettings.value = AppSettingsService.save({
      ...appSettings.value,
      updates: { ...appSettings.value.updates, autoCheckEnabled: enabled },
    });
  },
  getDismissedVersion: () => appSettings.value.updates.dismissedVersion,
  dismissVersion: (version: string) => {
    appSettings.value = AppSettingsService.save({
      ...appSettings.value,
      updates: { ...appSettings.value.updates, dismissedVersion: version },
    });
  },
};
const updateService = new UpdateService(updaterAdapter, updatePreferences, getAppVersion);

const importExportService = new ApplicationImportExportService(repository, platform);
const backupService = new BackupService(repository, platform);
const notificationService = new NotificationService(platform);

// Reactive Application State
const workspace = ref(engine.getWorkspace());
const initialCalendarDate = (() => {
  const now = new Date();
  const savedMonth = appSettings.value.general.lastViewedMonth;
  if (!appSettings.value.general.openToToday && savedMonth) {
    const [year, month] = savedMonth.split('-').map(Number);
    if (year && month) return new Date(year, month - 1, 1);
  }
  return now;
})();
const currentYear = ref(initialCalendarDate.getFullYear());
const currentMonth = ref(initialCalendarDate.getMonth());
const selectedDates = ref<ISODate[]>([]);
const clipboardData = ref<ClipboardData | null>(engine.getClipboard());

const isModalOpen = ref(false);
const editingModel = ref<Model | null>(null);
const isWorkspaceManagerOpen = ref(false);

const isUpdateModalOpen = ref(false);
const updateInfo = ref<UpdateInfo | null>(null);

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentMonthLabel = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const currentRelease = computed(() => findBundledRelease(appVersion.value));

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
const hasClipboard = computed(() => {
  if (!clipboardData.value || !clipboardData.value.items) return false;
  return clipboardData.value.items.some((it) => it.events && it.events.length > 0);
});

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
  if (!confirmDestructiveAction('Excluir este calendário e todos os seus eventos?')) return;
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
  const categoryName = modelData.metadata?.category || (modelData as any).category || 'Geral';
  ModelCategoryService.expandCategory(categoryName);

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
  if (!confirmDestructiveAction('Excluir este modelo?')) return;
  engine.deleteModel(modelId);
  syncState();
  autoSave();
}

function handleToggleFavorite(modelId: string) {
  engine.execute(new ToggleFavoriteCommand(modelId));
  syncState();
  autoSave();
}

function handleApplyModel(modelId: string) {
  if (selectedDates.value.length === 0) return;

  const targetModel = models.value.find(m => m.id === modelId);
  if (targetModel) {
    for (const date of selectedDates.value) {
      const validation = ConstraintValidator.validateModelApplication(targetModel, date, engine.getWorkspace());
      if (!validation.valid && validation.message) {
        notificationService.notify('Aviso de Restrição', validation.message);
      }
    }
  }

  engine.execute(new ApplyModelCommand(selectedDates.value, modelId));
  
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
    if (!confirmDestructiveAction('Excluir este evento?')) return;
    engine.removeEvent(evt.id);
    InspectorService.close();
    syncState();
    autoSave();
  }
}

function handleClearCells() {
  if (selectedDates.value.length === 0) return;
  if (!confirmDestructiveAction('Limpar os eventos dos dias selecionados?')) return;
  engine.execute(new ClearCellsCommand(selectedDates.value));
  syncState();
  autoSave();
}

function handleCopy() {
  if (selectedDates.value.length === 0) return;
  const res = engine.clipboardService.copy(selectedDates.value, engine);
  clipboardData.value = res;
  const totalEvts = res.items.reduce((acc, it) => acc + (it.events?.length || 0), 0);
  if (totalEvts > 0) {
    notificationService.notify('Copiado', `${totalEvts} evento(s) copiado(s).`);
  }
  syncState();
}

function handlePaste() {
  const clip = clipboardData.value || engine.getClipboard();
  if (!clip || !clip.items || clip.items.length === 0 || selectedDates.value.length === 0) return;
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

function confirmDestructiveAction(message: string): boolean {
  if (!appSettings.value.general.confirmDestructiveActions) return true;
  return typeof window === 'undefined' || window.confirm(message);
}

function handleRedo() {
  engine.redo();
  syncState();
  autoSave();
}

function openCommandPalette() {
  CommandPaletteService.open();
}

async function legacyCheckForUpdates(isManual = false) {
  const res = await updateService.checkForUpdates(isManual);
  if (res.hasUpdate) {
    updateInfo.value = res;
    isUpdateModalOpen.value = true;
  } else if (isManual) {
    notificationService.notify('Cansche Atualizado', 'Sua aplicação já está na versão mais recente!');
  }
}

async function checkForUpdates(isManual = false) {
  if (!updaterSupported) {
    updateStatus.value = 'unsupported';
    if (isManual) {
      notificationService.notify('Atualizações indisponíveis', 'O atualizador funciona somente no Cansche Desktop.');
    }
    return;
  }

  updateStatus.value = 'checking';
  updateError.value = null;

  try {
    const result = await updateService.checkForUpdates(isManual);
    updateInfo.value = result;

    if (result.hasUpdate) {
      updateStatus.value = 'available';
      isUpdateModalOpen.value = true;
    } else {
      updateStatus.value = 'up-to-date';
      if (isManual) {
        notificationService.notify('Cansche atualizado', `Você já está usando a versão ${result.currentVersion}.`);
      }
    }
  } catch (error) {
    updateStatus.value = 'error';
    updateError.value = error instanceof Error ? error.message : 'Não foi possível verificar atualizações.';
    if (isManual) notificationService.notify('Erro ao verificar atualizações', updateError.value);
  }
}

function handleOpenSettings() {
  settingsSection.value = 'general';
  isSettingsOpen.value = true;
}

function handleOpenUpdates() {
  settingsSection.value = 'updates';
  isSettingsOpen.value = true;
}

function handleSaveSettings(settings: AppSettings) {
  appSettings.value = AppSettingsService.save(settings);
}

function handleOpenWorkspaceFromSettings() {
  isSettingsOpen.value = false;
  isWorkspaceManagerOpen.value = true;
}

function handleDismissUpdate() {
  if (updateInfo.value?.latestVersion) {
    updateService.dismissVersion(updateInfo.value.latestVersion);
  }
  isUpdateModalOpen.value = false;
}

async function legacyHandleStartDownloadUpdate(onProgress: (downloaded: number, total: number) => void) {
  try {
    await updateService.downloadAndInstall(onProgress);
  } catch (err) {
    console.error('Failed to download update:', err);
    notificationService.notify('Erro ao Atualizar', 'Falha ao baixar atualização. Tente novamente mais tarde.');
  }
}

async function handleStartDownloadUpdate(onProgress: (downloaded: number, total: number) => void) {
  updateStatus.value = 'downloading';
  updateError.value = null;

  try {
    await updateService.downloadAndInstall(onProgress);
    updateStatus.value = 'installing';
  } catch (error) {
    updateStatus.value = 'error';
    updateError.value = error instanceof Error ? error.message : 'Falha ao baixar a atualização.';
    notificationService.notify('Erro ao atualizar', updateError.value);
  }
}

function registerSystemCommands() {
  CommandPaletteService.setCommands([
    {
      id: 'open-settings',
      title: 'Abrir Configurações',
      subtitle: 'Gerenciar preferências do aplicativo (Ctrl+,)',
      keywords: ['configuracoes', 'preferencias', 'settings', 'ajustes'],
      icon: 'lucide:Settings',
      category: 'Sistema',
      execute: () => handleOpenSettings(),
    },
    {
      id: 'check-updates',
      title: 'Verificar Atualizações',
      subtitle: 'Procurar por novas versões do Cansche Desktop',
      keywords: ['atualizacao', 'update', 'versao', 'novo'],
      icon: 'lucide:RefreshCw',
      category: 'Sistema',
      execute: () => checkForUpdates(true),
    },
    {
      id: 'go-today',
      title: 'Ir para Hoje',
      subtitle: 'Navegar para a data atual no calendário',
      keywords: ['hoje', 'today', 'agora', 'data'],
      icon: 'lucide:Calendar',
      category: 'Navegação',
      execute: () => goToToday(),
    },
    {
      id: 'copy-cells',
      title: 'Copiar Células Selecionadas (Ctrl+C)',
      subtitle: 'Copiar o conteúdo dos dias selecionados',
      keywords: ['copiar', 'ctrl+c', 'copy'],
      icon: 'lucide:FileText',
      category: 'Ações',
      execute: () => handleCopy(),
    },
    {
      id: 'paste-cells',
      title: 'Colar Células Copiadas (Ctrl+V)',
      subtitle: 'Colar o conteúdo copiado na data selecionada',
      keywords: ['colar', 'ctrl+v', 'paste'],
      icon: 'lucide:FileText',
      category: 'Ações',
      execute: () => handlePaste(),
    },
    {
      id: 'create-model',
      title: 'Criar Novo Modelo',
      subtitle: 'Abrir formulário de criação de modelo',
      keywords: ['novo', 'criar', 'modelo', 'adicionar'],
      icon: 'lucide:Bookmark',
      category: 'Ações',
      execute: () => handleOpenCreateModal(),
    },
    {
      id: 'manage-workspace',
      title: 'Gerenciar Workspace e Camadas',
      subtitle: 'Criar calendários, exportar backups e importar arquivos',
      keywords: ['workspace', 'camada', 'backup', 'importar', 'exportar'],
      icon: 'lucide:Layers',
      category: 'Workspace',
      execute: () => (isWorkspaceManagerOpen.value = true),
    },
    {
      id: 'export-workspace',
      title: 'Exportar Backup do Workspace (.cansche)',
      subtitle: 'Salvar arquivo de backup completo',
      keywords: ['exportar', 'backup', 'salvar', 'download'],
      icon: 'lucide:FileText',
      category: 'Workspace',
      execute: () => handleExportWorkspace(),
    },
    {
      id: 'select-saturdays',
      title: 'Selecionar Todos os Sábados',
      subtitle: 'Selecionar rapidamente todos os sábados do mês',
      keywords: ['sabado', 'sábados', 'fim de semana', 'selecionar'],
      icon: 'lucide:CheckSquare',
      category: 'Filtros',
      execute: () => handleSelectSaturdays(),
    },
    {
      id: 'select-weekends',
      title: 'Selecionar Finais de Semana',
      subtitle: 'Selecionar sábados e domingos do mês atual',
      keywords: ['fim de semana', 'finais de semana', 'sabado', 'domingo'],
      icon: 'lucide:CheckSquare',
      category: 'Filtros',
      execute: () => handleSelectWeekends(),
    },
    {
      id: 'clear-selection',
      title: 'Deselecionar Tudo / Limpar Seleção',
      subtitle: 'Limpar a seleção ativa de células no calendário',
      keywords: ['deselecionar', 'limpar', 'esc', 'cancelar'],
      icon: 'lucide:EyeOff',
      category: 'Ações',
      execute: () => handleDeselect(),
    },
  ]);
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
  persistViewedMonth();
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  persistViewedMonth();
}

function persistViewedMonth() {
  const month = String(currentMonth.value + 1).padStart(2, '0');
  appSettings.value = AppSettingsService.save({
    ...appSettings.value,
    general: { ...appSettings.value.general, lastViewedMonth: `${currentYear.value}-${month}` },
  });
}

function goToToday() {
  const now = new Date();
  currentYear.value = now.getFullYear();
  currentMonth.value = now.getMonth();
  persistViewedMonth();
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
  try {
    const imported = ImportExportService.importFile(content);
    if (imported) {
      if (imported.type === 'workspace') {
        engine.setWorkspace(imported.data as Workspace);
      } else if (imported.type === 'calendar') {
        const cal = imported.data as Calendar;
        const ws = engine.getWorkspace();
        ws.calendars[cal.id] = cal;
        ws.editingCalendarId = cal.id;
        engine.setWorkspace(ws);
      }
      syncState();
      await autoSave();
      notificationService.notify('Importação Concluída', 'Arquivo .cansche carregado com sucesso!');
    }
  } catch (err) {
    console.error('Failed to import file:', err);
    notificationService.notify('Erro ao Importar', 'Formato de arquivo .cansche inválido.');
  }
}

function handlePointerMove(event: PointerEvent) {
  DragService.updatePosition(event);
}

function handlePointerUp(event: PointerEvent) {
  const result = DragService.endDrag();
  if (result) {
    const { item, hoverDate, isCopyMode } = result;

    if (item.type === 'model') {
      const targetModel = models.value.find((m) => m.id === item.modelId);
      if (targetModel) {
        const validation = ConstraintValidator.validateModelApplication(targetModel, hoverDate, engine.getWorkspace());
        if (!validation.valid && validation.message) {
          notificationService.notify('Aviso de Restrição', validation.message);
        }
      }

      engine.execute(new ApplyModelCommand([hoverDate], item.modelId));
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
  const isCtrl = event.ctrlKey || event.metaKey;

  // Global Ctrl+K Command Palette Trigger
  if (isCtrl && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    CommandPaletteService.toggle();
    return;
  }

  if (isCtrl && event.key === ',') {
    event.preventDefault();
    handleOpenSettings();
    return;
  }

  if (CommandPaletteService.isOpen.value) {
    return;
  }

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

  registerSystemCommands();

  appVersion.value = await getAppVersion();
  updateStatus.value = updaterSupported ? 'idle' : 'unsupported';

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
      favorite: true,
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

  // Check for updates silently on startup only when enabled in Settings.
  if (appSettings.value.updates.autoCheckEnabled && updaterSupported) {
    void checkForUpdates(false);
  }
});

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerUp);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
