<template>
  <div
    v-if="isOpen"
    class="fixed bottom-4 right-4 z-50 w-80 bg-[#0f1011] border border-[#23252a] rounded-[10px] p-4 shadow-2xl transition-all select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-[#02b8cc] animate-pulse"></span>
        <span class="text-xs font-semibold text-white">Nova Atualização Disponível</span>
      </div>
      <button
        @click="dismiss"
        class="text-[#8a8f98] hover:text-white transition-colors text-xs p-1"
        title="Fechar"
      >
        ✕
      </button>
    </div>

    <!-- Details -->
    <div class="space-y-1 mb-3">
      <div class="text-sm font-bold text-[#02b8cc]">
        Cansche v{{ updateInfo?.latestVersion }}
      </div>
      <p class="text-[11px] text-[#8a8f98] line-clamp-3 leading-relaxed whitespace-pre-wrap">
        {{ updateInfo?.releaseNotes || 'Uma nova versão está disponível para download.' }}
      </p>
    </div>

    <!-- Progress Bar (Downloading state) -->
    <div v-if="isDownloading" class="space-y-1.5 mb-3">
      <div class="flex items-center justify-between text-[10px] text-[#8a8f98] font-mono">
        <span>Baixando atualização...</span>
        <span>{{ downloadPercent }}%</span>
      </div>
      <div class="w-full h-1.5 bg-[#161718] rounded-full overflow-hidden border border-[#23252a]">
        <div
          class="h-full bg-[#02b8cc] transition-all duration-150"
          :style="{ width: `${downloadPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-2 pt-2 border-t border-[#161718]">
      <button
        @click="dismiss"
        :disabled="isDownloading"
        class="px-2.5 py-1 text-xs text-[#8a8f98] hover:text-white rounded-[6px] hover:bg-[#161718] transition-colors cursor-pointer disabled:opacity-50"
      >
        Depois
      </button>
      <button
        @click="startUpdate"
        :disabled="isDownloading"
        class="px-3 py-1 text-xs font-medium bg-[#02b8cc] hover:bg-[#02b8cc]/80 text-[#08090a] rounded-[6px] transition-all cursor-pointer shadow-xs disabled:opacity-50"
      >
        {{ isDownloading ? 'Baixando...' : 'Atualizar e Reiniciar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UpdateInfo } from '@cansche/platform';

const props = defineProps<{
  isOpen: boolean;
  updateInfo: UpdateInfo | null;
}>();

const emit = defineEmits(['close', 'start-download', 'dismiss']);

const isDownloading = ref(false);
const downloadPercent = ref(0);

function dismiss() {
  emit('dismiss');
  emit('close');
}

function startUpdate() {
  isDownloading.value = true;
  downloadPercent.value = 0;
  emit('start-download', (downloaded: number, total: number) => {
    if (total > 0) {
      downloadPercent.value = Math.min(100, Math.round((downloaded / total) * 100));
    }
  });
}
</script>
