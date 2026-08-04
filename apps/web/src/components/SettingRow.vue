<template>
  <div class="flex items-center justify-between gap-6 p-4 rounded-[8px] border border-[#23252a] bg-[#08090a]">
    <div>
      <div class="text-xs font-medium text-white">{{ title }}</div>
      <div class="text-[11px] text-[#8a8f98] mt-1">{{ description }}</div>
    </div>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>
