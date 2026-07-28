<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
    <div class="bg-[#0f1011] border border-[#23252a] rounded-[12px] p-6 w-full max-w-lg shadow-2xl shadow-black/90 space-y-5 text-xs text-[#d0d6e0]">
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-[#23252a] pb-4">
        <div>
          <h3 class="font-medium text-base text-white tracking-tight">Gerenciador do Workspace</h3>
          <p class="text-xs text-[#8a8f98] mt-0.5">Gerencie projetos, exporte backups e importe arquivos .cansche</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-[#8a8f98] hover:text-white p-1 rounded-[6px] hover:bg-[#161718] transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Top Action Grid Buttons -->
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="showCreateForm = !showCreateForm"
          class="bg-white hover:bg-[#e5e5e6] text-[#08090a] font-medium py-2.5 px-3 rounded-[6px] flex flex-col items-center justify-center text-center transition-all cursor-pointer leading-tight shadow-xs"
        >
          <span class="text-xs font-semibold">+ Novo</span>
          <span class="text-xs">Calendário</span>
        </button>

        <label for="ws-file-import" class="bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-white font-medium py-2.5 px-3 rounded-[6px] flex flex-col items-center justify-center text-center cursor-pointer transition-all leading-tight">
          <div class="flex items-center gap-1.5 text-xs font-medium">
            <svg class="w-3.5 h-3.5 text-[#8a8f98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Importar</span>
          </div>
          <span class="text-[11px] text-[#8a8f98] font-mono mt-0.5">(.cansche)</span>
          <input id="ws-file-import" name="fileImport" type="file" accept=".json,.cansche" class="hidden" @change="handleFileImport" />
        </label>

        <button
          @click="$emit('export-workspace')"
          class="bg-[#161718] hover:bg-[#23252a] border border-[#23252a] text-white font-medium py-2.5 px-3 rounded-[6px] flex flex-col items-center justify-center text-center transition-all leading-tight cursor-pointer"
        >
          <div class="flex items-center gap-1.5 text-xs font-medium">
            <svg class="w-3.5 h-3.5 text-[#8a8f98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Backup</span>
          </div>
          <span class="text-[11px] text-[#8a8f98] mt-0.5">Workspace</span>
        </button>
      </div>

      <!-- Inline Create Form -->
      <div v-if="showCreateForm" class="p-3.5 bg-[#161718] border border-[#23252a] rounded-[12px] space-y-3">
        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label for="new-cal-name" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Nome do Calendário</label>
            <input
              id="new-cal-name"
              name="newCalendarName"
              v-model="newCalName"
              type="text"
              placeholder="ex: 📚 Faculdade 2026"
              class="w-full bg-[#08090a] text-white placeholder-[#62666d] border border-[#23252a] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label for="new-cal-color" class="text-[#d0d6e0] font-medium block mb-1 text-[11px]">Cor da Camada</label>
            <input
              id="new-cal-color"
              name="newCalendarColor"
              v-model="newCalColor"
              type="color"
              class="w-full h-8 bg-[#08090a] border border-[#23252a] rounded-[6px] p-0.5 cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button @click="showCreateForm = false" class="px-3 py-1.5 bg-[#23252a] hover:bg-[#383b3f] text-[#d0d6e0] rounded-[6px] text-xs font-medium">Cancelar</button>
          <button @click="createCalendar" class="px-4 py-1.5 bg-white hover:bg-[#e5e5e6] text-[#08090a] rounded-[6px] text-xs font-medium">Salvar</button>
        </div>
      </div>

      <!-- Calendars List Cards -->
      <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="cal in sortedCalendars"
          :key="cal.id"
          class="flex items-center justify-between p-3.5 rounded-[12px] border transition-all"
          :class="cal.id === editingCalendarId
            ? 'bg-[#161718] border-[#383b3f] shadow-xs'
            : 'bg-[#0f1011] border-[#23252a] hover:border-[#383b3f]'"
        >
          <div class="flex items-center space-x-3 min-w-0">
            <span class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/40" :style="{ backgroundColor: cal.color }"></span>
            <div class="truncate">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-white text-xs truncate">{{ cal.name }}</span>
                <span v-if="cal.id === editingCalendarId" class="text-[10px] px-2 py-0.5 bg-[#23252a] text-[#8a8f98] rounded-[4px] border border-[#383b3f] font-mono font-medium">
                  Em Edição
                </span>
              </div>
              <div class="text-[11px] text-[#8a8f98] font-mono mt-0.5">
                {{ Object.keys(cal.models || (cal as any).presets || {}).length }} modelos • {{ Object.keys(cal.events || {}).length }} eventos
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 shrink-0">
            <button
              v-if="cal.id !== editingCalendarId"
              @click="$emit('select-editing', cal.id)"
              class="px-3.5 py-1.5 bg-[#23252a] hover:bg-[#383b3f] text-white text-xs rounded-[6px] font-medium border border-[#383b3f] transition-colors"
            >
              Editar
            </button>
            
            <button
              @click="$emit('export-calendar', cal.id)"
              class="p-1.5 text-[#8a8f98] hover:text-white hover:bg-[#23252a] rounded-[6px] transition-colors"
              title="Exportar Calendário (.cansche.json)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            <button
              @click="$emit('duplicate', cal.id)"
              class="p-1.5 text-[#8a8f98] hover:text-white hover:bg-[#23252a] rounded-[6px] transition-colors"
              title="Duplicar Calendário"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            <button
              v-if="calendars.length > 1"
              @click="$emit('delete', cal.id)"
              class="p-1.5 text-[#8a8f98] hover:text-red-400 hover:bg-[#23252a] rounded-[6px] transition-colors"
              title="Excluir Calendário"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Button -->
      <div class="flex justify-end pt-3 border-t border-[#23252a]">
        <button
          @click="$emit('close')"
          class="bg-[#23252a] hover:bg-[#383b3f] text-white font-medium text-xs px-5 py-2 rounded-[6px] border border-[#383b3f] transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Calendar } from '@cansche/domain';

const props = defineProps<{
  isOpen: boolean;
  calendars: Calendar[];
  editingCalendarId: string;
}>();

const emit = defineEmits([
  'close',
  'create-calendar',
  'select-editing',
  'export-calendar',
  'export-workspace',
  'import-file',
  'duplicate',
  'delete',
]);

const showCreateForm = ref(false);
const newCalName = ref('');
const newCalColor = ref('#5e6ad2');

const sortedCalendars = computed(() => {
  return [...props.calendars].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

function createCalendar() {
  if (!newCalName.value.trim()) return;
  emit('create-calendar', {
    name: newCalName.value.trim(),
    color: newCalColor.value,
  });
  newCalName.value = '';
  showCreateForm.value = false;
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    if (content) {
      emit('import-file', content);
      target.value = '';
    }
  };
  reader.readAsText(file);
}
</script>
