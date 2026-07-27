<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
    <div class="bg-[#14151a] border border-[#2a2b36] rounded-xl p-5 w-full max-w-lg shadow-2xl space-y-4 text-xs">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#22232a] pb-3">
        <div>
          <h3 class="font-semibold text-sm text-white tracking-tight">Meus Calendários / Camadas</h3>
          <p class="text-[11px] text-slate-400">Gerencie projetos, exporte backups e importe arquivos .cansche.json</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-between bg-[#0b0c0e] p-2 rounded-lg border border-[#22232a]">
        <button
          @click="showCreateForm = !showCreateForm"
          class="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#4f5bc4] text-white rounded font-medium flex items-center gap-1 transition-colors"
        >
          <span>+ Criar Calendário</span>
        </button>

        <label class="px-3 py-1.5 bg-[#1c1d24] hover:bg-[#272832] text-slate-200 rounded font-medium flex items-center gap-1 cursor-pointer transition-colors border border-[#2a2b36]">
          <span>📥 Importar (.cansche.json)</span>
          <input type="file" accept=".json" class="hidden" @change="handleFileImport" />
        </label>
      </div>

      <!-- Inline Create Form -->
      <div v-if="showCreateForm" class="p-3 bg-[#0b0c0e] border border-[#2a2b36] rounded-lg space-y-3">
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="text-slate-400 block mb-1">Nome do Calendário</label>
            <input
              v-model="newCalName"
              type="text"
              placeholder="ex: 📚 Faculdade 2026, 💼 Trabalho"
              class="w-full bg-[#14151a] text-white placeholder-slate-500 border border-[#2a2b36] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
            />
          </div>
          <div>
            <label class="text-slate-400 block mb-1">Cor da Camada</label>
            <input
              v-model="newCalColor"
              type="color"
              class="w-full h-8 bg-[#14151a] border border-[#2a2b36] rounded p-0.5 cursor-pointer"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button @click="showCreateForm = false" class="px-2.5 py-1 bg-[#1c1d24] text-slate-400 rounded">Cancelar</button>
          <button @click="createCalendar" class="px-3 py-1 bg-[#5e6ad2] text-white rounded font-medium">Salvar</button>
        </div>
      </div>

      <!-- Calendars List -->
      <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="cal in calendars"
          :key="cal.id"
          class="flex items-center justify-between p-3 rounded-lg border transition-all"
          :class="cal.id === activeCalendarId ? 'bg-[#1c1d24] border-[#5e6ad2]' : 'bg-[#0b0c0e] border-[#22232a] hover:border-[#2a2b36]'"
        >
          <div class="flex items-center space-x-3 min-w-0">
            <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cal.color }"></span>
            <div class="truncate">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-white truncate">{{ cal.name }}</span>
                <span v-if="cal.id === activeCalendarId" class="text-[9px] px-1.5 py-0.2 bg-[#5e6ad2]/20 text-[#5e6ad2] rounded border border-[#5e6ad2]/40 font-mono">
                  Ativo
                </span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono">
                {{ Object.keys(cal.presets).length }} templates • {{ Object.keys(cal.cells).length }} datas preenchidas
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-1.5 shrink-0">
            <button
              v-if="cal.id !== activeCalendarId"
              @click="$emit('select-active', cal.id)"
              class="px-2 py-1 bg-[#1c1d24] hover:bg-[#272832] text-slate-200 rounded border border-[#2a2b36] text-[11px]"
            >
              Ativar
            </button>
            
            <button
              @click="$emit('export-json', cal.id)"
              class="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#272832]"
              title="Exportar como JSON (.cansche.json)"
            >
              📥
            </button>
            <button
              @click="$emit('duplicate', cal.id)"
              class="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#272832]"
              title="Duplicar Calendário"
            >
              📋
            </button>
            <button
              v-if="calendars.length > 1"
              @click="$emit('delete', cal.id)"
              class="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-[#272832]"
              title="Excluir Calendário"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2 border-t border-[#22232a]">
        <button @click="$emit('close')" class="px-4 py-1.5 bg-[#1c1d24] hover:bg-[#272832] text-white rounded font-medium">
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Calendar } from '@cansche/domain';

const props = defineProps<{
  isOpen: boolean;
  calendars: Calendar[];
  activeCalendarId: string;
}>();

const emit = defineEmits([
  'close',
  'create-calendar',
  'select-active',
  'export-json',
  'import-json',
  'duplicate',
  'delete',
]);

const showCreateForm = ref(false);
const newCalName = ref('');
const newCalColor = ref('#5e6ad2');

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
      emit('import-json', content);
      target.value = '';
    }
  };
  reader.readAsText(file);
}
</script>
