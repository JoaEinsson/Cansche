<template>
  <div
    class="h-8 shrink-0 bg-[#08090a] border-b border-[#23252a] flex items-center justify-between select-none text-[#8a8f98]"
    data-tauri-drag-region
    @dblclick="toggleMaximize"
  >
    <div class="flex items-center gap-2 pl-3 text-[11px] font-medium text-[#d0d6e0]" data-tauri-drag-region>
      <span class="w-4 h-4 rounded-[3px] bg-white flex items-center justify-center font-bold text-[9px] text-[#08090a] tracking-tighter">
        C
      </span>
      <span>Cansche</span>
    </div>

    <div v-if="isTauri" class="h-full flex items-stretch" @mousedown.stop @dblclick.stop>
      <button
        type="button"
        class="w-11 h-full flex items-center justify-center hover:bg-[#161718] hover:text-white transition-colors"
        title="Minimizar"
        aria-label="Minimizar janela"
        @click.stop="minimize"
      >
        <IconRenderer icon="lucide:Minus" :size="13" />
      </button>

      <button
        type="button"
        class="w-11 h-full flex items-center justify-center hover:bg-[#161718] hover:text-white transition-colors"
        :title="isMaximized ? 'Restaurar' : 'Maximizar'"
        :aria-label="isMaximized ? 'Restaurar janela' : 'Maximizar janela'"
        @click.stop="toggleMaximize"
      >
        <IconRenderer :icon="isMaximized ? 'lucide:Minimize2' : 'lucide:Maximize2'" :size="12" />
      </button>

      <button
        type="button"
        class="w-11 h-full flex items-center justify-center hover:bg-[#c42b2b] hover:text-white transition-colors"
        title="Fechar"
        aria-label="Fechar janela"
        @click.stop="close"
      >
        <IconRenderer icon="lucide:X" :size="13" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import IconRenderer from './IconRenderer.vue';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
const isMaximized = ref(false);
let appWindow: ReturnType<typeof getCurrentWindow> | null = null;

function getAppWindow() {
  if (!isTauri) return null;
  appWindow ??= getCurrentWindow();
  return appWindow;
}

async function refreshMaximizedState() {
  const currentWindow = getAppWindow();
  if (!currentWindow) return;

  try {
    isMaximized.value = await currentWindow.isMaximized();
  } catch {
    isMaximized.value = false;
  }
}

async function minimize() {
  await getAppWindow()?.minimize();
}

async function toggleMaximize() {
  const currentWindow = getAppWindow();
  if (!currentWindow) return;

  await currentWindow.toggleMaximize();
  await refreshMaximizedState();
}

async function close() {
  await getAppWindow()?.close();
}

onMounted(() => {
  void refreshMaximizedState();
});
</script>
