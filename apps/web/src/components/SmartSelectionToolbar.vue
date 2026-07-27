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
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-linear-elevated border border-linear-border px-3 py-1.5 rounded-lg shadow-xl flex items-center space-x-3 text-xs font-medium select-none"
    >
      <!-- Selection Counter -->
      <div class="flex items-center space-x-1.5 border-r border-linear-subtle pr-3">
        <span class="px-1.5 py-0.5 rounded bg-linear-brand font-mono font-bold text-white text-[11px]">
          {{ selectedCount }}
        </span>
        <span class="text-linear-muted text-[11px]">selecionadas</span>
      </div>

      <!-- Smart Selectors -->
      <div class="flex items-center space-x-1 border-r border-linear-subtle pr-3">
        <button
          @click="$emit('select-saturdays')"
          class="px-2 py-1 rounded bg-linear-surface hover:bg-linear-border text-linear-text border border-linear-subtle text-[11px] transition-colors"
          title="Selecionar todos os sábados"
        >
          Sábados
        </button>
        <button
          @click="$emit('select-weekends')"
          class="px-2 py-1 rounded bg-linear-surface hover:bg-linear-border text-linear-text border border-linear-subtle text-[11px] transition-colors"
          title="Selecionar sábados e domingos"
        >
          Finais de Semana
        </button>
      </div>

      <!-- Batch Actions -->
      <div class="flex items-center space-x-1.5">
        <button
          @click="$emit('copy')"
          class="px-2.5 py-1 bg-linear-surface hover:bg-linear-border text-linear-text rounded flex items-center space-x-1 border border-linear-subtle text-[11px] transition-colors"
          title="Copiar células (Ctrl+C)"
        >
          <span>Copiar</span>
          <kbd class="text-[9px] font-mono text-linear-darkMuted">^C</kbd>
        </button>

        <button
          @click="$emit('paste')"
          :disabled="!hasClipboard"
          class="px-2.5 py-1 rounded flex items-center space-x-1 border text-[11px] transition-colors"
          :class="hasClipboard ? 'bg-linear-surface hover:bg-linear-border text-linear-text border-linear-subtle cursor-pointer' : 'opacity-40 text-linear-darkMuted border-transparent cursor-not-allowed'"
          title="Colar células (Ctrl+V)"
        >
          <span>Colar</span>
          <kbd class="text-[9px] font-mono text-linear-darkMuted">^V</kbd>
        </button>

        <button
          @click="$emit('clear-cells')"
          class="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/30 flex items-center space-x-1 text-[11px] transition-colors"
          title="Limpar seleção (Del)"
        >
          <span>Limpar</span>
          <kbd class="text-[9px] font-mono text-red-400/70">Del</kbd>
        </button>

        <button
          @click="$emit('deselect')"
          class="p-1 text-linear-darkMuted hover:text-linear-text rounded hover:bg-linear-surface transition-colors"
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
