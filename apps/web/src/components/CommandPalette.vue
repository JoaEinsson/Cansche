<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-[15vh] p-4 select-none"
    @click.self="close"
  >
    <div
      class="bg-[#0f1011] border border-[#23252a] rounded-[12px] w-full max-w-xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Command Input Header -->
      <div class="flex items-center px-4 border-b border-[#23252a] bg-[#08090a]">
        <IconRenderer icon="lucide:Zap" :size="16" color="#8a8f98" />
        <label for="command-palette-search" class="sr-only">Pesquisar Comandos e Ações</label>
        <input
          id="command-palette-search"
          name="commandPaletteSearch"
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Digite um comando ou busque ações... (ex: Hoje, Modelo, Backup)"
          class="w-full bg-transparent text-white placeholder-[#62666d] border-none px-3 py-3.5 text-xs focus:outline-none focus:ring-0 font-sans"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="executeSelectedIndex"
          @keydown.esc.prevent="close"
        />
        <span class="text-[10px] font-mono text-[#62666d] bg-[#161718] px-1.5 py-0.5 rounded border border-[#23252a]">
          ESC para sair
        </span>
      </div>

      <!-- Commands Results List -->
      <div class="max-h-80 overflow-y-auto p-2 space-y-1">
        <template v-if="filteredCommands.length > 0">
          <div
            v-for="(cmd, index) in filteredCommands"
            :key="cmd.id"
            @click="executeCommand(cmd)"
            @mouseenter="selectedIndex = index"
            class="flex items-center justify-between px-3 py-2 rounded-[8px] cursor-pointer text-xs transition-colors"
            :class="index === selectedIndex ? 'bg-[#161718] text-white border border-[#383b3f]' : 'text-[#8a8f98] hover:text-white border border-transparent'"
          >
            <div class="flex items-center space-x-2.5 min-w-0">
              <div class="p-1.5 rounded bg-[#08090a] border border-[#23252a] flex items-center justify-center shrink-0">
                <IconRenderer :icon="cmd.icon || 'lucide:Zap'" :size="14" :color="index === selectedIndex ? '#02b8cc' : '#8a8f98'" />
              </div>
              <div class="truncate">
                <div class="font-medium text-white text-xs truncate leading-tight">{{ cmd.title }}</div>
                <div v-if="cmd.subtitle" class="text-[10px] text-[#62666d] truncate mt-0.5 font-mono">{{ cmd.subtitle }}</div>
              </div>
            </div>

            <div class="flex items-center space-x-2 shrink-0">
              <span class="text-[9px] font-mono text-[#62666d] uppercase px-1.5 py-0.2 rounded bg-[#08090a] border border-[#23252a]">
                {{ cmd.category }}
              </span>
              <span v-if="index === selectedIndex" class="text-[10px] font-mono text-[#02b8cc]">
                ↵ Executar
              </span>
            </div>
          </div>
        </template>

        <div v-else class="text-center py-8 text-xs text-[#62666d]">
          Nenhum comando encontrado para "{{ searchQuery }}".
        </div>
      </div>

      <!-- Footer Bar -->
      <div class="px-4 py-2 border-t border-[#23252a] bg-[#08090a] flex items-center justify-between text-[10px] font-mono text-[#62666d]">
        <div class="flex items-center space-x-3">
          <span>↑↓ Navegar</span>
          <span>↵ Confirmar</span>
        </div>
        <span>Cansche Command Palette</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { CommandPaletteService, UICommand } from '@cansche/application';
import IconRenderer from './IconRenderer.vue';

const searchInput = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

const isOpen = computed(() => CommandPaletteService.isOpen.value);
const searchQuery = computed({
  get: () => CommandPaletteService.searchQuery.value,
  set: (val) => (CommandPaletteService.searchQuery.value = val),
});

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return CommandPaletteService.commands;

  return CommandPaletteService.commands.filter((cmd) => {
    const titleMatch = cmd.title.toLowerCase().includes(query);
    const subMatch = cmd.subtitle ? cmd.subtitle.toLowerCase().includes(query) : false;
    const keyMatch = cmd.keywords.some((k) => k.toLowerCase().includes(query));
    return titleMatch || subMatch || keyMatch;
  });
});

watch(isOpen, (open) => {
  if (open) {
    selectedIndex.value = 0;
    nextTick(() => {
      searchInput.value?.focus();
    });
  }
});

watch(filteredCommands, () => {
  selectedIndex.value = 0;
});

function navigateDown() {
  if (filteredCommands.value.length > 0) {
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length;
  }
}

function navigateUp() {
  if (filteredCommands.value.length > 0) {
    selectedIndex.value = (selectedIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length;
  }
}

function close() {
  CommandPaletteService.close();
}

function executeSelectedIndex() {
  const cmd = filteredCommands.value[selectedIndex.value];
  if (cmd) {
    executeCommand(cmd);
  }
}

function executeCommand(cmd: UICommand) {
  close();
  cmd.execute();
}
</script>
