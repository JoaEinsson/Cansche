<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
    <div class="bg-[#0f1011] border border-[#23252a] rounded-[12px] p-6 w-full max-w-md shadow-design-xl space-y-4 text-xs text-[#d0d6e0]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#23252a] pb-4">
        <div class="flex items-center space-x-2.5">
          <div class="p-2 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center">
            <IconRenderer :icon="form.emoji || 'lucide:Bookmark'" :size="18" :color="form.color || '#ffffff'" />
          </div>
          <div>
            <h3 class="font-medium text-sm text-white tracking-tight">
              {{ isEditing ? 'Editar Modelo' : 'Criar Novo Modelo' }}
            </h3>
            <p class="text-[11px] text-[#8a8f98]">Configure as propriedades do modelo reutilizável</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          aria-label="Fechar"
          class="text-[#8a8f98] hover:text-white p-1 rounded-[6px] hover:bg-[#161718] transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Grid -->
      <div class="space-y-3.5">
        <!-- Name & Category -->
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label for="model-name" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Nome do Modelo *</label>
            <input
              id="model-name"
              name="modelName"
              v-model="form.name"
              type="text"
              placeholder="ex: Aula Faculdade, Trabalho Remoto"
              class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-[#e4f222]"
            />
          </div>
          <div>
            <label for="model-category" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Categoria</label>
            <input
              id="model-category"
              name="modelCategory"
              v-model="form.category"
              type="text"
              placeholder="ex: Estudo"
              class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-[#e4f222]"
            />
          </div>
        </div>

        <!-- Icon & Color Picker -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[#d0d6e0] font-medium block text-[11px]">Ícone</span>
            <button
              type="button"
              @click="showEmojiOption = !showEmojiOption"
              class="text-[10px] text-[#8a8f98] hover:text-white transition-colors font-mono"
            >
              {{ showEmojiOption ? '— Ocultar Emoji' : '+ Emoji' }}
            </button>
          </div>

          <!-- Lucide Icon Picker Grid -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="iconName in presetIcons"
              :key="iconName"
              type="button"
              @click="selectLucideIcon(iconName)"
              class="p-2 rounded-[6px] border transition-all cursor-pointer flex items-center justify-center"
              :class="form.emoji === 'lucide:' + iconName ? 'bg-[#161718] border-[#e4f222] text-white shadow-xs' : 'bg-[#08090a] border-[#23252a] text-[#8a8f98] hover:border-[#383b3f] hover:text-white'"
            >
              <IconRenderer :icon="'lucide:' + iconName" :size="16" :color="form.emoji === 'lucide:' + iconName ? form.color : undefined" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <!-- Hidden / Collapsible Emoji Field -->
            <div>
              <div v-if="showEmojiOption" class="space-y-1">
                <label for="custom-emoji-input" class="text-[#8a8f98] font-medium block text-[10px]">Emoji</label>
                <input
                  id="custom-emoji-input"
                  name="customEmoji"
                  v-model="customEmoji"
                  type="text"
                  placeholder="ex: 🚀"
                  @input="onCustomEmojiInput"
                  class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#e4f222] font-mono"
                />
              </div>
            </div>
            <div>
              <label for="model-color" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Cor do Modelo</label>
              <input
                id="model-color"
                name="modelColor"
                v-model="form.color"
                type="color"
                class="w-full h-8 bg-[#08090a] border border-[#23252a] rounded-[6px] p-0.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Time Range & Location -->
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label for="model-start-time" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Início</label>
            <input
              id="model-start-time"
              name="startTime"
              v-model="form.startTime"
              type="time"
              class="w-full bg-[#08090a] text-white border border-[#23252a] rounded-[6px] px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#e4f222]"
            />
          </div>
          <div>
            <label for="model-end-time" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Término</label>
            <input
              id="model-end-time"
              name="endTime"
              v-model="form.endTime"
              type="time"
              class="w-full bg-[#08090a] text-white border border-[#23252a] rounded-[6px] px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#e4f222]"
            />
          </div>
          <div>
            <label for="model-location" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Local</label>
            <input
              id="model-location"
              name="location"
              v-model="form.location"
              type="text"
              placeholder="ex: Campus"
              class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-[#e4f222]"
            />
          </div>
        </div>

        <!-- Checklist Template -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-[#d0d6e0] font-medium text-[11px]">Checklist Padrão (Tarefas)</span>
            <button @click="addChecklistItem" type="button" class="text-[11px] text-white hover:underline font-medium">+ Adicionar Item</button>
          </div>
          
          <div class="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            <div
              v-for="(item, index) in form.checklistTemplate"
              :key="index"
              class="flex items-center space-x-2"
            >
              <label :for="'checklist-item-' + index" class="sr-only">Tarefa {{ index + 1 }}</label>
              <input
                :id="'checklist-item-' + index"
                :name="'checklistItem_' + index"
                v-model="form.checklistTemplate[index]"
                type="text"
                placeholder="ex: Revisar conteúdo da aula"
                class="flex-1 bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-2.5 py-1 text-xs focus:outline-none focus:border-[#e4f222]"
              />
              <button @click="removeChecklistItem(index)" type="button" class="p-1 text-[#62666d] hover:text-[#eb5757]">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Notes / Description -->
        <div>
          <label for="model-description" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Observações / Descrição</label>
          <textarea
            id="model-description"
            name="description"
            v-model="form.description"
            rows="2"
            placeholder="Instruções padrão para este modelo..."
            class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] p-2.5 text-xs focus:outline-none focus:border-[#e4f222] resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="flex justify-end space-x-2.5 pt-3 border-t border-[#23252a]">
        <button
          @click="$emit('close')"
          class="bg-[#23252a] hover:bg-[#383b3f] text-white font-medium text-xs px-4 py-2 rounded-[6px] border border-[#383b3f] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="save"
          class="bg-[#e4f222] hover:bg-[#cbd922] text-[#08090a] font-medium text-xs px-5 py-2 rounded-[6px] transition-all shadow-xs cursor-pointer"
        >
          {{ isEditing ? 'Salvar Alterações' : 'Criar Modelo' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Model } from '@cansche/domain';
import IconRenderer from './IconRenderer.vue';

const props = defineProps<{
  isOpen: boolean;
  initialModel?: Model | null;
}>();

const emit = defineEmits(['close', 'save']);

const presetIcons = [
  'GraduationCap',
  'BookOpen',
  'Briefcase',
  'Dumbbell',
  'Code',
  'Heart',
  'Coffee',
  'Pin',
  'Star',
  'Zap',
  'Clock',
  'Calendar',
  'Bookmark',
];

const isEditing = ref(false);
const showEmojiOption = ref(false);
const customEmoji = ref('');

const form = ref<{
  id?: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  checklistTemplate: string[];
}>({
  name: '',
  emoji: 'lucide:GraduationCap',
  color: '#6366f1',
  category: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  checklistTemplate: [],
});

watch(
  () => props.initialModel,
  (model) => {
    if (model) {
      isEditing.value = true;
      const isEmoji = !!(model.emoji && !model.emoji.startsWith('lucide:'));
      showEmojiOption.value = isEmoji;
      customEmoji.value = isEmoji ? model.emoji : '';
      form.value = {
        id: model.id,
        name: model.name || '',
        emoji: model.emoji || 'lucide:Bookmark',
        color: model.color || '#6366f1',
        category: model.metadata?.category || (model as any).category || '',
        startTime: model.schedule?.startTime || (model as any).startTime || '',
        endTime: model.schedule?.endTime || (model as any).endTime || '',
        location: model.content?.location || (model as any).location || '',
        description: model.content?.description || (model as any).description || '',
        checklistTemplate: model.content?.checklistTemplate
          ? [...model.content.checklistTemplate]
          : (model as any).checklist
          ? [...(model as any).checklist]
          : [],
      };
    } else {
      isEditing.value = false;
      showEmojiOption.value = false;
      customEmoji.value = '';
      form.value = {
        id: undefined,
        name: '',
        emoji: 'lucide:GraduationCap',
        color: '#6366f1',
        category: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        checklistTemplate: [],
      };
    }
  },
  { immediate: true }
);

function selectLucideIcon(iconName: string) {
  form.value.emoji = 'lucide:' + iconName;
  customEmoji.value = '';
}

function onCustomEmojiInput() {
  if (customEmoji.value.trim()) {
    form.value.emoji = customEmoji.value.trim();
  }
}

function addChecklistItem() {
  form.value.checklistTemplate.push('');
}

function removeChecklistItem(index: number) {
  form.value.checklistTemplate.splice(index, 1);
}

function save() {
  if (!form.value.name.trim()) {
    alert('Por favor, preencha o Nome do Modelo.');
    return;
  }

  const modelData: Model = {
    id: form.value.id || '',
    name: form.value.name.trim(),
    emoji: form.value.emoji || 'lucide:Bookmark',
    color: form.value.color || '#6366f1',
    schedule: {
      startTime: form.value.startTime || undefined,
      endTime: form.value.endTime || undefined,
    },
    metadata: {
      category: form.value.category || undefined,
    },
    content: {
      location: form.value.location || undefined,
      description: form.value.description || undefined,
      checklistTemplate: form.value.checklistTemplate.filter((i) => i.trim() !== ''),
    },
  };

  emit('save', modelData);
}
</script>
