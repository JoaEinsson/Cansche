<template>
  <aside class="w-64 bg-[#08090a] border-r border-[#23252a] flex flex-col h-full shrink-0 select-none p-3 space-y-4">
    <!-- Section 1: Camadas -->
    <div class="space-y-2 border-b border-[#23252a] pb-3">
      <div class="flex items-center justify-between px-1 h-6">
        <span class="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider leading-none">
          Camadas
        </span>
        <button
          @click="$emit('open-workspace-manager')"
          class="px-2 py-0.5 bg-white hover:bg-[#e5e5e6] text-[#08090a] rounded-[6px] text-[10px] font-medium transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          title="Gerenciar Workspace"
        >
          Workspace
        </button>
      </div>

      <!-- Layers List -->
      <div class="space-y-1 max-h-36 overflow-y-auto pr-0.5">
        <div
          v-for="cal in sortedCalendars"
          :key="cal.id"
          @click="$emit('select-editing-calendar', cal.id)"
          class="group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] border transition-all cursor-pointer text-xs"
          :class="cal.id === editingCalendarId ? 'bg-[#161718] border-[#383b3f] text-white font-medium shadow-xs' : 'bg-transparent border-transparent hover:bg-[#0f1011] text-[#8a8f98]'"
        >
          <div class="flex items-center space-x-2 truncate">
            <!-- Layer Color Dot -->
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/40"
              :style="{ backgroundColor: cal.color }"
            ></span>
            <span class="truncate">{{ cal.name }}</span>
            <span v-if="cal.id === editingCalendarId" class="text-[9px] text-[#8a8f98] font-mono shrink-0">
              [Edição]
            </span>
          </div>

          <!-- Minimal Lucide Eye / EyeOff Icon Toggle -->
          <button
            @click.stop="$emit('toggle-layer-visibility', cal.id)"
            class="p-1 rounded text-[#62666d] hover:text-white transition-colors shrink-0"
            :title="isLayerActive(cal.id) ? 'Ocultar Camada' : 'Exibir Camada'"
          >
            <IconRenderer
              :icon="isLayerActive(cal.id) ? 'lucide:Eye' : 'lucide:EyeOff'"
              :size="14"
              :color="isLayerActive(cal.id) ? '#ffffff' : '#62666d'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Section 2: Biblioteca de Modelos -->
    <div class="flex-1 flex flex-col min-h-0 space-y-2">
      <div class="flex items-center justify-between px-1 h-6">
        <div class="flex items-center space-x-1.5 min-w-0">
          <span class="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider leading-none">
            Modelos
          </span>
          <span class="text-[10px] font-mono text-[#62666d]">({{ models.length }})</span>
        </div>
        <button
          @click="$emit('open-create-modal')"
          class="px-2.5 py-1 bg-white hover:bg-[#e5e5e6] text-[#08090a] rounded-[6px] text-[11px] font-medium flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          title="Criar Novo Modelo"
        >
          <span>+ Novo Modelo</span>
        </button>
      </div>

      <!-- Models Cards List -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-0.5">
        <div
          v-for="model in models"
          :key="model.id"
          @click="$emit('apply-model', model.id)"
          class="group relative flex flex-col p-2.5 rounded-[8px] border border-[#23252a] bg-[#0f1011] hover:bg-[#161718] hover:border-[#383b3f] transition-all cursor-pointer shadow-xs"
        >
          <!-- Top Row: Icon, Name, Category & Color -->
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center space-x-2 min-w-0">
              <IconRenderer :icon="model.emoji" :size="15" :color="model.color" />
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
              Modelo
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

const sortedCalendars = computed(() => {
  return [...props.calendars].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

function isLayerActive(id: string): boolean {
  return (props.activeCalendarIds || []).includes(id);
}

function getModelStartTime(model: Model): string | undefined {
  return model.schedule?.startTime || (model as any).startTime;
}

function getModelEndTime(model: Model): string | undefined {
  return model.schedule?.endTime || (model as any).endTime || '23:59';
}

function getModelLocation(model: Model): string | undefined {
  return model.content?.location || (model as any).location;
}

function getModelDescription(model: Model): string | undefined {
  return model.content?.description || (model as any).description;
}

function getChecklistCount(model: Model): number {
  if (model.content?.checklistTemplate) return model.content.checklistTemplate.length;
  if ((model as any).checklist) return (model as any).checklist.length;
  return 0;
}
</script>
