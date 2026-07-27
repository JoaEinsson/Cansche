<template>
  <header class="h-11 px-4 bg-linear-surface border-b border-linear-subtle flex items-center justify-between shrink-0 select-none text-xs font-medium text-linear-text">
    <!-- Left: Brand & Active Workspace -->
    <div class="flex items-center space-x-3">
      <div class="w-5 h-5 rounded bg-linear-brand flex items-center justify-center font-bold text-[11px] text-white tracking-tighter">
        C
      </div>
      <div class="flex items-center space-x-2">
        <span class="font-semibold text-slate-100 tracking-tight">Cansche</span>
        <span class="text-linear-darkMuted">/</span>
        <span class="text-linear-muted font-normal">Meu Calendário</span>
      </div>
    </div>

    <!-- Center: Month Navigation -->
    <div class="flex items-center space-x-2 bg-linear-base px-2 py-1 rounded-md border border-linear-subtle">
      <button
        @click="$emit('prev-month')"
        class="p-1 text-linear-muted hover:text-linear-text hover:bg-linear-elevated rounded transition-colors"
        title="Mês Anterior"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span class="font-semibold text-xs min-w-[120px] text-center text-slate-200 uppercase tracking-wide font-mono">
        {{ currentMonthLabel }}
      </span>

      <button
        @click="$emit('next-month')"
        class="p-1 text-linear-muted hover:text-linear-text hover:bg-linear-elevated rounded transition-colors"
        title="Próximo Mês"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        @click="$emit('today')"
        class="px-2 py-0.5 text-[11px] font-medium text-linear-muted hover:text-linear-text bg-linear-elevated hover:bg-slate-800 rounded transition-colors border border-linear-subtle"
      >
        Hoje
      </button>
    </div>

    <!-- Right: History Commands -->
    <div class="flex items-center space-x-1.5">
      <button
        @click="$emit('undo')"
        :disabled="!canUndo"
        class="px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-all"
        :class="canUndo ? 'bg-linear-elevated hover:bg-slate-800 text-linear-text border border-linear-subtle cursor-pointer' : 'opacity-40 text-linear-darkMuted cursor-not-allowed'"
        title="Desfazer (Ctrl+Z)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Desfazer</span>
        <kbd class="text-[9px] font-mono text-linear-darkMuted">^Z</kbd>
      </button>

      <button
        @click="$emit('redo')"
        :disabled="!canRedo"
        class="px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-all"
        :class="canRedo ? 'bg-linear-elevated hover:bg-slate-800 text-linear-text border border-linear-subtle cursor-pointer' : 'opacity-40 text-linear-darkMuted cursor-not-allowed'"
        title="Refazer (Ctrl+Y)"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
        <span>Refazer</span>
        <kbd class="text-[9px] font-mono text-linear-darkMuted">^Y</kbd>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  currentMonthLabel: string;
  canUndo: boolean;
  canRedo: boolean;
}>();

defineEmits(['prev-month', 'next-month', 'today', 'undo', 'redo']);
</script>
