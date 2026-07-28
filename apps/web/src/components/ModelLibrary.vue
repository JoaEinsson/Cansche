<template>
  <aside class="w-64 bg-[#0f1011] border-r border-[#23252a] flex flex-col h-full shrink-0 select-none">
    <!-- Top Workspace Header -->
    <div class="p-3 border-b border-[#23252a] flex items-center justify-between">
      <button
        @click="$emit('open-workspace-manager')"
        class="bg-white hover:bg-[#e5e5e6] text-[#08090a] font-medium px-3 py-1.5 rounded-[6px] text-xs transition-all shadow-xs cursor-pointer"
      >
        Workspace
      </button>

      <button
        @click="$emit('open-workspace-manager')"
        class="p-1.5 text-[#8a8f98] hover:text-white hover:bg-[#161718] rounded-[6px] transition-colors"
        title="Gerenciar Workspace"
      >
        <IconRenderer icon="lucide:Layers" :size="15" color="#8a8f98" />
      </button>
    </div>

    <!-- Active Layers Section -->
    <div class="p-3 border-b border-[#23252a] space-y-2">
      <div class="flex items-center justify-between text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">
        <span>CAMADAS</span>
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

    <!-- Models Library Section -->
    <div class="flex-1 flex flex-col p-3 min-h-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider">MODELOS</span>
        <button
          @click="$emit('open-create-modal')"
          class="bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] hover:border-[#383b3f] font-medium px-2.5 py-1 rounded-[6px] text-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          + Novo Modelo
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
              <IconRenderer icon="lucide:Clock" :size="11" color="#62666d" />
              {{ getModelStartTime(model) }} - {{ getModelEndTime(model) }}
            </span>

            <span v-if="getModelLocation(model)" class="flex items-center gap-1 truncate text-[#8a8f98]">
              <IconRenderer icon="lucide:MapPin" :size="11" color="#8a8f98" />
              <span class="truncate">{{ getModelLocation(model) }}</span>
            </span>
          </div>

          <!-- Bottom Row: Checklist count & Quick Actions -->
          <div class="flex items-center justify-between text-[10px] text-[#62666d] pt-1 border-t border-[#161718]">
            <span v-if="getChecklistCount(model) > 0" class="flex items-center gap-1">
              <IconRenderer icon="lucide:CheckSquare" :size="10" color="#62666d" />
              <span>{{ getChecklistCount(model) }} tarefas</span>
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
                <IconRenderer icon="lucide:Edit2" :size="12" color="#8a8f98" />
              </button>
              <button
                @click.stop="$emit('delete-model', model.id)"
                class="p-1 text-[#8a8f98] hover:text-red-400 rounded hover:bg-[#23252a] transition-colors"
                title="Excluir Modelo"
              >
                <IconRenderer icon="lucide:Trash2" :size="12" color="#8a8f98" />
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
