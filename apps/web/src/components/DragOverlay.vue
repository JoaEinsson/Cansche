<template>
  <Teleport to="body">
    <div
      v-if="state.isDragging && state.item"
      class="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 select-none"
      :style="{
        left: state.currentPos.x + 'px',
        top: state.currentPos.y + 'px',
      }"
    >
      <div
        class="flex items-center space-x-2 px-3 py-1.5 rounded-[8px] bg-[#08090a]/90 border border-[#02b8cc] text-white shadow-2xl backdrop-blur-xs text-xs animate-in zoom-in-95 duration-100 font-sans"
      >
        <div class="p-1 rounded bg-[#161718] border border-[#23252a] flex items-center justify-center shrink-0">
          <IconRenderer :icon="state.item.emoji || 'lucide:Bookmark'" :size="14" :color="state.item.color || '#02b8cc'" />
        </div>
        <span class="font-medium truncate max-w-xs">{{ state.item.name }}</span>
        
        <span v-if="state.isCopyMode" class="text-[10px] font-mono font-bold bg-[#02b8cc] text-[#08090a] px-1.5 py-0.2 rounded">
          + Copiar
        </span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DragService } from '../services/DragService';
import IconRenderer from './IconRenderer.vue';

const state = computed(() => DragService.state);
</script>
