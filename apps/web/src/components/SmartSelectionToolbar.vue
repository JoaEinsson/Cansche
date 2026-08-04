<template>
  <transition
    enter-active-class="transform transition ease-out duration-150"
    enter-from-class="translate-y-8 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition ease-in duration-100"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-8 opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#161718] border border-[#23252a] px-3 py-1.5 rounded-[6px] shadow-design-xl flex items-center space-x-3 text-xs font-medium select-none"
    >
      <!-- Selection Counter -->
      <div class="flex items-center space-x-1.5 border-r border-[#23252a] pr-3">
        <span class="px-1.5 py-0.5 rounded-[4px] bg-[#e5e5e6] font-mono font-semibold text-[#08090a] text-[11px] shadow-xs">
          {{ selectedCount }}
        </span>
        <span class="text-[#8a8f98] text-[11px]">
          {{ selectedCount === 1 ? 'data selecionada' : 'datas selecionadas' }}
        </span>
      </div>

      <!-- Smart Selectors -->
      <div class="flex items-center space-x-1 border-r border-[#23252a] pr-3">
        <button
          @click="$emit('select-saturdays')"
          class="px-2.5 py-1 rounded-[6px] bg-[#0f1011] hover:bg-[#23252a] text-white border border-[#23252a] text-[11px] transition-colors cursor-pointer"
          title="Selecionar todos os sábados"
        >
          Sábados
        </button>
        <button
          @click="$emit('select-weekends')"
          class="px-2.5 py-1 rounded-[6px] bg-[#0f1011] hover:bg-[#23252a] text-white border border-[#23252a] text-[11px] transition-colors cursor-pointer"
          title="Selecionar sábados e domingos"
        >
          Finais de Semana
        </button>
      </div>

      <!-- Batch Actions -->
      <div class="flex items-center space-x-1.5">
        <button
          @click="$emit('copy')"
          class="px-2.5 py-1 bg-[#0f1011] hover:bg-[#23252a] text-white rounded-[6px] flex items-center space-x-1.5 border border-[#23252a] text-[11px] transition-colors cursor-pointer"
          title="Copiar células selecionadas (Ctrl+C)"
        >
          <span>Copiar</span>
          <kbd class="text-[9px] font-mono text-[#62666d] bg-[#08090a] px-1 py-0.2 rounded border border-[#23252a]">Ctrl+C</kbd>
        </button>

        <button
          @click="$emit('paste')"
          :disabled="!hasClipboard"
          class="px-2.5 py-1 rounded-[6px] flex items-center space-x-1.5 border text-[11px] transition-colors"
          :class="hasClipboard ? 'bg-[#0f1011] hover:bg-[#23252a] text-white border-[#23252a] cursor-pointer' : 'opacity-40 text-[#62666d] border-transparent cursor-not-allowed'"
          title="Colar células copiadas (Ctrl+V)"
        >
          <span>Colar</span>
          <kbd class="text-[9px] font-mono text-[#62666d] bg-[#08090a] px-1 py-0.2 rounded border border-[#23252a]">Ctrl+V</kbd>
        </button>

        <button
          @click="$emit('clear-cells')"
          class="px-2.5 py-1 bg-[#eb5757]/10 hover:bg-[#eb5757]/20 text-[#eb5757] rounded-[6px] border border-[#eb5757]/30 flex items-center space-x-1.5 text-[11px] transition-colors cursor-pointer"
          title="Limpar células selecionadas (Del)"
        >
          <span>Limpar</span>
          <kbd class="text-[9px] font-mono text-[#eb5757]/80 bg-[#eb5757]/10 px-1 py-0.2 rounded border border-[#eb5757]/30">Del</kbd>
        </button>

        <button
          @click="$emit('deselect')"
          class="p-1 text-[#62666d] hover:text-white rounded-[6px] hover:bg-[#23252a] transition-colors cursor-pointer"
          title="Deselecionar (Esc)"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  selectedCount: number;
  hasClipboard: boolean;
}>();

defineEmits([
  'select-saturdays',
  'select-weekends',
  'copy',
  'paste',
  'clear-cells',
  'deselect',
]);
</script>
