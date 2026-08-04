<template>
  <aside class="w-64 bg-linear-surface border-r border-linear-subtle flex flex-col h-full shrink-0 select-none p-3 space-y-4">
    <!-- Section 1: Camadas Visíveis (Layers) -->
    <div class="space-y-2 border-b border-[#23252a] pb-3">
      <div class="flex items-center justify-between px-1">
        <span class="text-[11px] font-semibold text-linear-muted uppercase tracking-wider">
          Camadas (Layers)
        </span>
        <button
          @click="$emit('open-workspace-manager')"
          class="text-[10px] text-[#e4f222] hover:underline font-mono"
          title="Gerenciar Workspace"
        >
          ⚙️ Workspace
        </button>
      </div>

      <!-- Layers List -->
      <div class="space-y-1 max-h-36 overflow-y-auto pr-0.5">
        <div
          v-for="cal in sortedCalendars"
          :key="cal.id"
          @click="$emit('select-editing-calendar', cal.id)"
          class="group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] border transition-all cursor-pointer text-xs"
          :class="cal.id === editingCalendarId ? 'bg-[#161718] border-[#e4f222] text-white font-medium shadow-xs' : 'bg-transparent border-transparent hover:bg-[#0f1011] text-[#8a8f98]'"
        >
          <div class="flex items-center space-x-2 truncate">
            <!-- Layer Color Dot -->
            <span
              class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/40"
              :style="{ backgroundColor: cal.color }"
            ></span>
            <span class="truncate">{{ cal.name }}</span>
            <span v-if="cal.id === editingCalendarId" class="text-[9px] text-[#e4f222] font-mono shrink-0">
              [Edição]
            </span>
          </div>

          <!-- Layer Visibility Toggle Eye Icon -->
          <button
            @click.stop="$emit('toggle-layer-visibility', cal.id)"
            class="p-1 rounded-[6px] text-[#62666d] hover:text-white transition-colors shrink-0"
            :title="isLayerActive(cal.id) ? 'Ocultar Camada' : 'Exibir Camada'"
          >
            <span v-if="isLayerActive(cal.id)" class="text-xs">👁️</span>
            <span v-else class="text-xs opacity-40">🙈</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Section 2: Biblioteca de Presets do Calendário em Edição -->
    <div class="flex-1 flex flex-col min-h-0 space-y-2">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center space-x-1.5">
          <span class="text-[11px] font-semibold text-linear-muted uppercase tracking-wider">
            Presets (Edição)
          </span>
          <span class="text-[10px] font-mono text-linear-darkMuted">({{ presets.length }})</span>
        </div>
        <button
          @click="$emit('open-create-modal')"
          class="px-2.5 py-1 bg-[#e4f222] hover:bg-[#cbd922] text-[#08090a] rounded-[6px] text-[11px] font-medium flex items-center gap-1 transition-colors shadow-xs"
          title="Criar Novo Template de Preset"
        >
          <span>+ Novo</span>
        </button>
      </div>

      <!-- Presets Cards List -->
      <div class="flex-1 overflow-y-auto space-y-2 pr-0.5">
        <div
          v-for="preset in presets"
          :key="preset.id"
          @click="$emit('apply-preset', preset.id)"
          class="group relative flex flex-col p-2.5 rounded-[6px] border border-[#23252a] bg-[#0f1011] hover:bg-[#161718] hover:border-[#383b3f] transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
        >
          <!-- Top Row: Emoji, Name, Category & Color -->
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="text-base shrink-0 leading-none">{{ preset.emoji }}</span>
              <span class="text-xs font-semibold text-white truncate group-hover:text-[#e4f222] transition-colors">
                {{ preset.name }}
              </span>
            </div>

            <div class="flex items-center space-x-1.5 shrink-0">
              <span
                v-if="preset.metadata?.category || preset.category"
                class="text-[9px] px-1.5 py-0.2 rounded-[4px] bg-[#23252a] text-[#d0d6e0] font-mono"
              >
                {{ preset.metadata?.category || preset.category }}
              </span>
              <span
                class="w-2.5 h-2.5 rounded-full border border-black/40"
                :style="{ backgroundColor: preset.color }"
              ></span>
            </div>
          </div>

          <!-- Middle Row: Time range & Location -->
          <div
            v-if="getPresetStartTime(preset) || getPresetLocation(preset)"
            class="flex items-center space-x-2 text-[10px] text-[#8a8f98] font-mono mb-1"
          >
            <span v-if="getPresetStartTime(preset)" class="flex items-center gap-1">
              <svg class="w-3 h-3 text-[#62666d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ getPresetStartTime(preset) }} - {{ getPresetEndTime(preset) }}
            </span>

            <span v-if="getPresetLocation(preset)" class="truncate text-[#8a8f98]">
              📍 {{ getPresetLocation(preset) }}
            </span>
          </div>

          <!-- Bottom Row: Checklist count & Quick Actions -->
          <div class="flex items-center justify-between text-[10px] text-[#62666d] pt-1 border-t border-[#23252a]">
            <span v-if="getChecklistCount(preset) > 0">
              ☑ {{ getChecklistCount(preset) }} tarefas
            </span>
            <span v-else-if="getPresetDescription(preset)" class="truncate max-w-[120px]">
              {{ getPresetDescription(preset) }}
            </span>
            <span v-else class="italic text-[9px] text-[#62666d]">
              Template
            </span>

            <div class="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
              <button
                @click.stop="$emit('edit-preset', preset)"
                class="p-1 text-[#8a8f98] hover:text-white rounded-[6px] hover:bg-[#383b3f] transition-colors"
                title="Editar Template"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click.stop="$emit('delete-preset', preset.id)"
                class="p-1 text-[#8a8f98] hover:text-[#eb5757] rounded-[6px] hover:bg-[#383b3f] transition-colors"
                title="Excluir Template"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-if="presets.length === 0" class="text-center py-6 text-xs text-linear-darkMuted">
          Nenhum template neste calendário.<br>Clique em "+ Novo".
        </div>
      </div>
    </div>

    <!-- Shortcut Hint Footer -->
    <div class="p-2.5 rounded-[6px] bg-[#08090a] border border-[#23252a] text-[10px] text-[#8a8f98] space-y-1">
      <div class="font-semibold text-[#d0d6e0] flex items-center gap-1">
        <span>👁️ Visão Composta de Camadas:</span>
      </div>
      <div>• `activeCalendarIds`: Camadas visíveis.</div>
      <div>• `editingCalendarId`: Camada recebendo edições.</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Preset } from '@cansche/domain';

const props = defineProps<{
  calendars: Calendar[];
  editingCalendarId: string;
  activeCalendarIds: string[];
  presets: Preset[];
}>();

defineEmits([
  'select-editing-calendar',
  'toggle-layer-visibility',
  'open-workspace-manager',
  'apply-preset',
  'open-create-modal',
  'edit-preset',
  'delete-preset',
]);

const sortedCalendars = computed(() => {
  return [...props.calendars].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

function isLayerActive(id: string): boolean {
  return (props.activeCalendarIds || []).includes(id);
}

function getPresetStartTime(preset: Preset): string | undefined {
  return preset.schedule?.startTime || (preset as any).startTime;
}

function getPresetEndTime(preset: Preset): string | undefined {
  return preset.schedule?.endTime || (preset as any).endTime || '23:59';
}

function getPresetLocation(preset: Preset): string | undefined {
  return preset.content?.location || (preset as any).location;
}

function getPresetDescription(preset: Preset): string | undefined {
  return preset.content?.description || (preset as any).description;
}

function getChecklistCount(preset: Preset): number {
  if (preset.content?.checklistTemplate) return preset.content.checklistTemplate.length;
  if ((preset as any).checklist) return (preset as any).checklist.length;
  return 0;
}
</script>
