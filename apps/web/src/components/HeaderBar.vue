<template>
  <header class="h-11 px-4 bg-[#08090a] border-b border-[#23252a] flex items-center justify-between shrink-0 select-none text-xs font-medium text-[#d0d6e0]">
    <!-- Left: Brand & Active Workspace -->
    <div class="flex items-center space-x-3">
      <div class="w-5 h-5 rounded-[4px] bg-white flex items-center justify-center font-bold text-[11px] text-[#08090a] tracking-tighter shadow-xs">
        C
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-semibold text-white tracking-tight">Cansche</span>
        <span class="text-[#62666d]">/</span>
        <span class="text-[#8a8f98] font-normal">Meu Calendário</span>
      </div>
    </div>

    <!-- Center: Month Navigation & Command Palette Trigger -->
    <div class="flex items-center space-x-3">
      <div class="flex items-center space-x-2 bg-[#0f1011] px-2 py-1 rounded-[6px] border border-[#23252a]">
        <button
          @click="$emit('prev-month')"
          class="p-1 text-[#8a8f98] hover:text-white hover:bg-[#161718] rounded transition-colors"
          title="Mês Anterior"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="font-semibold text-xs min-w-[120px] text-center text-white uppercase tracking-wide font-mono">
          {{ currentMonthLabel }}
        </span>

        <button
          @click="$emit('next-month')"
          class="p-1 text-[#8a8f98] hover:text-white hover:bg-[#161718] rounded transition-colors"
          title="Próximo Mês"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          @click="$emit('today')"
          class="px-2 py-0.5 text-[11px] font-medium text-[#d0d6e0] hover:text-white bg-[#161718] hover:bg-[#23252a] rounded transition-colors border border-[#23252a]"
        >
          Hoje
        </button>
      </div>

      <!-- Command Palette Ctrl+K Quick Trigger -->
      <button
        @click="$emit('open-command-palette')"
        class="bg-[#0f1011] hover:bg-[#161718] text-[#8a8f98] hover:text-white border border-[#23252a] hover:border-[#383b3f] px-3 py-1.5 rounded-[6px] flex items-center space-x-2 text-xs transition-colors cursor-pointer"
        title="Abrir Barra de Comandos (Ctrl+K)"
      >
        <IconRenderer icon="lucide:Zap" :size="13" color="#02b8cc" />
        <span>Comandos</span>
        <kbd class="text-[9px] font-mono text-[#62666d] bg-[#161718] px-1 rounded border border-[#23252a]">Ctrl+K</kbd>
      </button>
    </div>

    <!-- Right: History Commands -->
    <div class="flex items-center space-x-1.5">
      <button
        @click="$emit('undo')"
        :disabled="!canUndo"
        class="px-2.5 py-1 rounded-[6px] text-[11px] font-medium flex items-center space-x-1 transition-all"
        :class="canUndo ? 'bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] cursor-pointer' : 'opacity-40 text-[#62666d] cursor-not-allowed border border-transparent'"
        title="Desfazer (Ctrl+Z)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Desfazer</span>
        <kbd class="text-[9px] font-mono text-[#62666d]">^Z</kbd>
      </button>

      <button
        @click="$emit('redo')"
        :disabled="!canRedo"
        class="px-2.5 py-1 rounded-[6px] text-[11px] font-medium flex items-center space-x-1 transition-all"
        :class="canRedo ? 'bg-[#161718] hover:bg-[#23252a] text-white border border-[#23252a] cursor-pointer' : 'opacity-40 text-[#62666d] cursor-not-allowed border border-transparent'"
        title="Refazer (Ctrl+Y)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
        <span>Refazer</span>
        <kbd class="text-[9px] font-mono text-[#62666d]">^Y</kbd>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import IconRenderer from './IconRenderer.vue';

defineProps<{
  currentMonthLabel: string;
  canUndo: boolean;
  canRedo: boolean;
}>();

defineEmits(['prev-month', 'next-month', 'today', 'undo', 'redo', 'open-command-palette']);
</script>
