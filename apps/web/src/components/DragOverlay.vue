<template>
  <Teleport to="body">
    <div
      v-if="dragState.isDragging && dragState.item"
      class="fixed z-50 pointer-events-none transition-transform duration-75 ease-out shadow-2xl flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#161718] border border-white/20 text-white font-medium text-xs backdrop-blur-md"
      :style="{
        left: dragState.currentPos.x + 12 + 'px',
        top: dragState.currentPos.y + 12 + 'px',
      }"
    >
      <!-- Icon -->
      <IconRenderer
        :icon="dragState.item.emoji || 'lucide:Bookmark'"
        :size="14"
        :color="dragState.item.color || '#5e6ad2'"
      />

      <!-- Name & Info -->
      <span class="truncate max-w-[140px] text-xs font-semibold">
        {{ dragState.item.name }}
      </span>

      <!-- Mode Badge (+ for copy) -->
      <span
        v-if="dragState.isCopyMode"
        class="ml-1 text-[10px] font-mono font-bold bg-[#02b8cc] text-black px-1.5 py-0.2 rounded-full flex items-center justify-center shadow-xs"
      >
        + Copiar
      </span>
      <span
        v-else-if="dragState.item.type === 'event'"
        class="ml-1 text-[9px] font-mono text-[#8a8f98] bg-[#23252a] px-1 rounded"
      >
        Mover
      </span>
      <span
        v-else
        class="ml-1 text-[9px] font-mono text-[#8a8f98] bg-[#23252a] px-1 rounded"
      >
        Novo
      </span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DragService } from '@cansche/application';
import IconRenderer from './IconRenderer.vue';

const dragState = computed(() => DragService.state);
</script>
