<template>
  <aside
    v-if="isOpen && item"
    class="w-80 bg-[#0f1011] border-l border-[#23252a] flex flex-col h-full shrink-0 select-none p-4 space-y-4 text-xs text-[#d0d6e0] shadow-design-xl z-20 overflow-y-auto animate-in slide-in-from-right duration-200"
  >
    <!-- Top Header: Close Button & Breadcrumb -->
    <div class="flex items-center justify-between border-b border-[#23252a] pb-3">
      <!-- Breadcrumb: Layer -> Model -> Date -->
      <div class="flex items-center space-x-1.5 text-[10px] text-[#8a8f98] font-mono truncate min-w-0 pr-2">
        <span class="truncate text-white font-medium">{{ item.calendarName }}</span>
        <IconRenderer icon="lucide:ChevronRight" :size="10" color="#62666d" />
        <span class="truncate">{{ itemCategory || 'Modelo' }}</span>
        <IconRenderer icon="lucide:ChevronRight" :size="10" color="#62666d" />
        <span class="text-[#e4f222] font-semibold">{{ formattedDate }}</span>
      </div>

      <button
        @click="closeInspector"
        class="p-1 rounded-[6px] text-[#8a8f98] hover:text-white hover:bg-[#161718] transition-colors shrink-0"
        title="Fechar Inspeção"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Title & Icon Card -->
    <div class="flex items-start space-x-3 bg-[#08090a] p-3 rounded-[6px] border border-[#23252a]">
      <div class="p-2 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center shrink-0">
        <IconRenderer :icon="itemIcon" :size="20" :color="itemColor" />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="font-semibold text-sm text-white truncate leading-tight">{{ itemName }}</h3>
        <p v-if="itemCategory" class="text-[10px] text-[#8a8f98] font-mono mt-0.5">
          Categoria: {{ itemCategory }}
        </p>
      </div>
    </div>

    <!-- Details Section: Time & Location -->
    <div class="space-y-2 bg-[#08090a] p-3 rounded-[6px] border border-[#23252a] font-mono text-[11px]">
      <div v-if="itemStartTime" class="flex items-center space-x-2 text-[#d0d6e0]">
        <IconRenderer icon="lucide:Clock" :size="14" color="#8a8f98" />
        <span>{{ itemStartTime }} — {{ itemEndTime }}</span>
      </div>

      <div v-if="itemLocation" class="flex items-center space-x-2 text-[#8a8f98]">
        <IconRenderer icon="lucide:MapPin" :size="14" color="#8a8f98" />
        <span class="truncate">{{ itemLocation }}</span>
      </div>
    </div>

    <!-- Interactive Checklist -->
    <div v-if="hasChecklist" class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-medium text-white uppercase tracking-wider">Tarefas da Data</span>
        <span class="text-[10px] font-mono text-[#8a8f98]">{{ completedCount }}/{{ totalCount }} ({{ progressPercent }}%)</span>
      </div>

      <!-- Progress bar -->
      <div class="w-full h-1.5 bg-[#161718] rounded-full overflow-hidden border border-[#23252a]">
        <div
          class="h-full transition-all duration-300 rounded-full"
          :class="progressPercent === 100 ? 'bg-[#27a644]' : 'bg-[#383b3f]'"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <!-- Checklist Items -->
      <div class="space-y-1.5 pt-1">
        <label
          v-for="chk in item.event.checklistState"
          :key="chk.id"
          :for="'inspector-chk-' + chk.id"
          class="flex items-center space-x-2.5 p-2 rounded-[6px] bg-[#08090a] border border-[#23252a] hover:border-[#383b3f] transition-all cursor-pointer text-xs"
        >
          <input
            :id="'inspector-chk-' + chk.id"
            :name="'inspectorCheck_' + chk.id"
            type="checkbox"
            :checked="chk.completed"
            class="rounded border-[#23252a] bg-[#161718] text-white cursor-pointer"
            @click.stop
            @change="toggleChecklist(chk.id)"
          />
          <span :class="chk.completed ? 'line-through text-[#62666d]' : 'text-white font-medium'">
            {{ chk.text }}
          </span>
        </label>
      </div>
    </div>

    <!-- Notes / Description -->
    <div v-if="itemDescription" class="space-y-1.5">
      <span class="text-[11px] font-medium text-white uppercase tracking-wider">Observações</span>
      <div class="bg-[#08090a] p-3 rounded-[6px] border border-[#23252a] text-[11px] text-[#8a8f98] leading-relaxed whitespace-pre-wrap">
        {{ itemDescription }}
      </div>
    </div>

    <!-- AI Suggestions Slot (Reserved for future AI features) -->
    <div class="p-3 rounded-[6px] bg-[#161718]/60 border border-[#23252a] border-dashed space-y-1 text-center">
      <div class="flex items-center justify-center space-x-1.5 text-xs text-[#8a8f98] font-medium">
        <IconRenderer icon="lucide:Zap" :size="13" color="#8a8f98" />
        <span>Sugestões de IA</span>
      </div>
      <p class="text-[10px] text-[#62666d]">Assistente inteligente de rotina em breve.</p>
    </div>

    <!-- Footer Quick Actions -->
    <div class="pt-2 flex flex-col gap-2 border-t border-[#23252a] mt-auto">
      <button
        v-if="item.model"
        @click="$emit('edit-model', item.model)"
        class="w-full bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] font-medium py-2 rounded-[6px] text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
      >
        <span>Editar Modelo Base</span>
      </button>

      <button
        @click="$emit('delete-event', item.event)"
        class="w-full bg-[#eb5757]/10 hover:bg-[#eb5757]/20 text-[#eb5757] border border-[#eb5757]/30 font-medium py-2 rounded-[6px] text-xs transition-colors cursor-pointer"
      >
        Excluir este Evento
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InspectorService } from '../services/InspectorService';
import IconRenderer from './IconRenderer.vue';

const emit = defineEmits(['toggle-checklist', 'edit-model', 'delete-event']);

const isOpen = computed(() => InspectorService.isOpen.value);
const item = computed(() => InspectorService.activeItem.value);

const itemName = computed(() => item.value?.event?.overrides?.name || item.value?.model?.name || 'Evento');
const itemIcon = computed(() => item.value?.event?.overrides?.emoji || item.value?.model?.emoji || 'lucide:Bookmark');
const itemColor = computed(() => item.value?.event?.overrides?.color || item.value?.model?.color || item.value?.calendarColor || '#6366f1');
const itemCategory = computed(() => item.value?.model?.metadata?.category || (item.value?.model as any)?.category);
const itemStartTime = computed(() => item.value?.event?.overrides?.startTime || item.value?.model?.schedule?.startTime || (item.value?.model as any)?.startTime);
const itemEndTime = computed(() => item.value?.event?.overrides?.endTime || item.value?.model?.schedule?.endTime || (item.value?.model as any)?.endTime || '23:59');
const itemLocation = computed(() => item.value?.event?.overrides?.location || item.value?.model?.content?.location || (item.value?.model as any)?.location);
const itemDescription = computed(() => item.value?.event?.overrides?.description || item.value?.model?.content?.description || (item.value?.model as any)?.description);

const formattedDate = computed(() => {
  if (!item.value?.event?.date) return '';
  const [y, m, d] = item.value.event.date.split('-');
  return `${d}/${m}/${y}`;
});

const hasChecklist = computed(() => !!(item.value?.event?.checklistState && item.value.event.checklistState.length > 0));
const totalCount = computed(() => item.value?.event?.checklistState?.length || 0);
const completedCount = computed(() => item.value?.event?.checklistState?.filter((c) => c.completed).length || 0);
const progressPercent = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

function closeInspector() {
  InspectorService.close();
}

function toggleChecklist(itemId: string) {
  if (item.value?.event?.id) {
    emit('toggle-checklist', {
      eventId: item.value.event.id,
      itemId,
    });
  }
}
</script>
