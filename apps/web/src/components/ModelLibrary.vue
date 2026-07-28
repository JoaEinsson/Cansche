<template>
  <aside class="w-64 bg-[#0f1011] border-r border-[#23252a] flex flex-col h-full shrink-0 select-none">
    <!-- Workspace Header & Selector -->
    <div class="p-3 border-b border-[#23252a] flex items-center justify-between">
      <button
        @click="$emit('open-workspace-manager')"
        class="bg-[#161718] hover:bg-[#23252a] border border-[#23252a] hover:border-[#383b3f] text-white font-medium px-3 py-1.5 rounded-[6px] text-xs transition-colors cursor-pointer flex items-center space-x-2"
      >
        <span>Workspace</span>
      </button>

      <button
        @click="$emit('open-workspace-manager')"
        class="p-1.5 text-[#8a8f98] hover:text-white hover:bg-[#161718] rounded-[6px] transition-colors"
        title="Gerenciar Camadas & Workspace"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </button>
    </div>

    <!-- Active Layers / Calendars Section -->
    <div class="p-3 border-b border-[#23252a] space-y-2">
      <div class="flex items-center justify-between text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">
        <span>Camadas de Calendário</span>
        <button
          @click="$emit('open-workspace-manager')"
          class="hover:text-white transition-colors lowercase text-[11px]"
        >
          + nova
        </button>
      </div>

      <div class="space-y-1 max-h-36 overflow-y-auto pr-1">
        <div
          v-for="cal in calendars"
          :key="cal.id"
          @click="$emit('select-editing-calendar', cal.id)"
          class="flex items-center justify-between p-2 rounded-[6px] cursor-pointer text-xs transition-all border group"
          :class="cal.id === editingCalendarId
            ? 'bg-[#161718] border-[#383b3f] text-white font-medium'
            : 'border-transparent text-[#8a8f98] hover:bg-[#161718]/60 hover:text-white'"
        >
          <div class="flex items-center space-x-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/40" :style="{ backgroundColor: cal.color }"></span>
            <span class="truncate">{{ cal.name }}</span>
          </div>

          <div class="flex items-center space-x-1">
            <!-- Visibility Eye Toggle -->
            <button
              @click.stop="$emit('toggle-layer-visibility', cal.id)"
              class="p-1 rounded text-[#8a8f98] hover:text-white transition-colors"
              :title="cal.visible ? 'Ocultar camada' : 'Exibir camada'"
            >
              <IconRenderer
                :icon="cal.visible ? 'lucide:Eye' : 'lucide:EyeOff'"
                :size="14"
                :color="cal.visible ? undefined : '#62666d'"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rich Preset Models Library -->
    <div class="flex-1 flex flex-col p-3 min-h-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">Biblioteca de Modelos</span>
        <button
          @click="$emit('open-create-modal')"
          class="bg-white hover:bg-[#e5e5e6] text-[#08090a] font-medium px-2.5 py-1 rounded-[6px] text-xs transition-all cursor-pointer shadow-xs"
        >
          + novo modelo
        </button>
      </div>

      <!-- Models List Cards -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-1">
        <div
          v-for="model in models"
          :key="model.id"
          @pointerdown="onPointerDownModel($event, model)"
          @click="$emit('apply-model', model.id)"
          class="p-2.5 rounded-[8px] bg-[#08090a] border border-[#23252a] hover:border-[#383b3f] transition-all cursor-grab active:cursor-grabbing group shadow-xs hover:shadow-md"
          :class="isDraggingThisModel(model.id) ? 'opacity-35 border-dashed border-[#02b8cc]' : ''"
        >
          <!-- Top Row: Icon, Name & Category Tag -->
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center space-x-2 min-w-0">
              <div class="p-1 rounded bg-[#161718] border border-[#23252a] flex items-center justify-center shrink-0">
                <IconRenderer :icon="model.emoji || 'lucide:Bookmark'" :size="14" :color="model.color" />
              </div>
              <span class="text-xs font-medium text-white truncate group-hover:text-white transition-colors">
                {{ model.name }}
              </span>
            </div>

            <div class="flex items-center space-x-1.5 shrink-0">
              <span
                v-if="model.metadata?.category || (model as any).category"
                class="text-[9px] px-1.5 py-0.2 rounded bg-[#161718] text-[#8a8f98] font-mono border border-[#23252a]"
              >
                {{ model.metadata?.category || (model as any).category }}
              </span>
              <span
                class="w-2.5 h-2.5 rounded-full border border-black/40"
                :style="{ backgroundColor: model.color }"
              ></span>
            </div>
          </div>

          <!-- Middle Row: Time range & Location -->
          <div
            v-if="getModelStartTime(model) || getModelLocation(model)"
            class="flex items-center space-x-2 text-[10px] text-[#8a8f98] font-mono mb-1"
          >
            <span v-if="getModelStartTime(model)" class="flex items-center gap-1">
              <svg class="w-3 h-3 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ getModelStartTime(model) }} - {{ getModelEndTime(model) }}
            </span>

            <span v-if="getModelLocation(model)" class="flex items-center gap-1 truncate text-[#8a8f98]">
              <IconRenderer icon="lucide:MapPin" :size="11" color="#8a8f98" />
              <span class="truncate">{{ getModelLocation(model) }}</span>
            </span>
          </div>

          <!-- Bottom Row: Checklist count & Quick Actions -->
          <div class="flex items-center justify-between text-[10px] text-[#62666d] pt-1 border-t border-[#161718]">
            <span v-if="getChecklistCount(model) > 0">
              ☑ {{ getChecklistCount(model) }} tarefas
            </span>
            <span v-else-if="getModelDescription(model)" class="truncate max-w-[120px]">
              {{ getModelDescription(model) }}
            </span>
            <span v-else class="italic text-[9px] text-[#62666d]">
              Arraste p/ o dia
            </span>

            <div class="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                @click.stop="$emit('edit-model', model)"
                class="p-1 text-[#8a8f98] hover:text-white rounded hover:bg-[#23252a] transition-colors"
                title="Editar Modelo"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="$emit('delete-model', model.id)"
                class="p-1 text-[#8a8f98] hover:text-red-400 rounded hover:bg-[#23252a] transition-colors"
                title="Excluir Modelo"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="models.length === 0" class="text-center py-6 text-xs text-[#62666d]">
          Nenhum modelo neste calendário.<br>Clique em "+ Novo Modelo".
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Model } from '@cansche/domain';
import { DragService } from '@cansche/application';
import IconRenderer from './IconRenderer.vue';

const props = defineProps<{
  calendars: Calendar[];
  editingCalendarId: string;
  activeCalendarIds: string[];
  models: Model[];
}>();

defineEmits([
  'select-editing-calendar',
  'toggle-layer-visibility',
  'open-workspace-manager',
  'apply-model',
  'open-create-modal',
  'edit-model',
  'delete-model',
]);

function onPointerDownModel(event: PointerEvent, model: Model) {
  if (event.button !== 0) return;
  const target = event.target as HTMLElement;
  if (target.closest('button')) return;

  DragService.startPotentialDrag({
    type: 'model',
    modelId: model.id,
    name: model.name,
    emoji: model.emoji,
    color: model.color,
    startTime: model.schedule?.startTime || (model as any).startTime,
  }, event);
}

function isDraggingThisModel(modelId: string): boolean {
  const st = DragService.state;
  return st.isDragging && st.item?.type === 'model' && st.item.modelId === modelId;
}

function getModelStartTime(m: Model): string {
  return m.schedule?.startTime || (m as any).startTime || '';
}

function getModelEndTime(m: Model): string {
  return m.schedule?.endTime || (m as any).endTime || '';
}

function getModelLocation(m: Model): string {
  return m.content?.location || (m as any).location || '';
}

function getModelDescription(m: Model): string {
  return m.content?.description || (m as any).description || '';
}

function getChecklistCount(m: Model): number {
  return m.content?.checklistTemplate?.length || (m as any).checklist?.length || 0;
}
</script>
