<template>
  <div
    v-if="isOpen && item"
    ref="cardEl"
    class="fixed z-50 w-72 bg-[#0f1011] border border-[#23252a] rounded-[12px] p-3.5 shadow-design-xl text-xs text-[#d0d6e0] space-y-2.5 pointer-events-auto transition-opacity duration-150 animate-in fade-in zoom-in-95"
    :style="cardStyle"
    @mouseenter="$emit('cancel-hide')"
    @mouseleave="$emit('close')"
  >
    <!-- Header: Icon, Name & Layer Badge -->
    <div class="flex items-start justify-between gap-2 border-b border-[#23252a] pb-2.5">
      <div class="flex items-center space-x-2 min-w-0">
        <div class="p-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center shrink-0">
          <IconRenderer :icon="itemIcon" :size="16" :color="itemColor" />
        </div>
        <div class="truncate">
          <h4 class="font-medium text-white text-xs truncate leading-tight">{{ itemName }}</h4>
          <div class="flex items-center space-x-1.5 text-[10px] text-[#8a8f98] font-mono mt-0.5">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.calendarColor }"></span>
            <span class="truncate">{{ item.calendarName }}</span>
          </div>
        </div>
      </div>

      <span
        v-if="itemCategory"
        class="text-[9px] px-1.5 py-0.5 rounded bg-[#161718] text-[#8a8f98] font-mono border border-[#23252a] shrink-0"
      >
        {{ itemCategory }}
      </span>
    </div>

    <!-- Details Grid: Time & Location -->
    <div class="space-y-1.5 font-mono text-[11px]">
      <div v-if="itemStartTime" class="flex items-center space-x-2 text-[#d0d6e0]">
        <IconRenderer icon="lucide:Clock" :size="13" color="#8a8f98" />
        <span>{{ itemStartTime }} — {{ itemEndTime }}</span>
      </div>

      <div v-if="itemLocation" class="flex items-center space-x-2 text-[#8a8f98]">
        <IconRenderer icon="lucide:MapPin" :size="13" color="#8a8f98" />
        <span class="truncate">{{ itemLocation }}</span>
      </div>
    </div>

    <!-- Description -->
    <div v-if="itemDescription" class="text-[11px] text-[#8a8f98] bg-[#08090a] p-2 rounded-[6px] border border-[#161718] leading-relaxed">
      {{ itemDescription }}
    </div>

    <!-- Checklist Progress Bar -->
    <div v-if="hasChecklist" class="space-y-1.5 pt-1 border-t border-[#161718]">
      <div class="flex items-center justify-between text-[10px] text-[#8a8f98]">
        <span class="font-medium text-[#d0d6e0]">Tarefas</span>
        <span class="font-mono text-white font-medium">{{ completedCount }}/{{ totalChecklistCount }} ({{ progressPercent }}%)</span>
      </div>

      <!-- Micro Progress Bar -->
      <div class="w-full h-1.5 bg-[#161718] rounded-full overflow-hidden border border-[#23252a]">
        <div
          class="h-full transition-all duration-300 rounded-full"
          :class="progressPercent === 100 ? 'bg-[#27a644]' : 'bg-[#383b3f]'"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { EventViewItem } from './CalendarEvent.vue';
import IconRenderer from './IconRenderer.vue';

const props = defineProps<{
  isOpen: boolean;
  item: EventViewItem | null;
  anchorEl: HTMLElement | null;
}>();

defineEmits(['close', 'cancel-hide']);

const cardEl = ref<HTMLElement | null>(null);
const topPos = ref(0);
const leftPos = ref(0);

const itemName = computed(() => props.item?.event.overrides?.name || props.item?.model?.name || 'Evento');
const itemIcon = computed(() => props.item?.event.overrides?.emoji || props.item?.model?.emoji || 'lucide:Bookmark');
const itemColor = computed(() => props.item?.event.overrides?.color || props.item?.model?.color || props.item?.calendarColor || '#6366f1');
const itemCategory = computed(() => props.item?.model?.metadata?.category || (props.item?.model as any)?.category);
const itemStartTime = computed(() => props.item?.event.overrides?.startTime || props.item?.model?.schedule?.startTime || (props.item?.model as any)?.startTime);
const itemEndTime = computed(() => props.item?.event.overrides?.endTime || props.item?.model?.schedule?.endTime || (props.item?.model as any)?.endTime || '23:59');
const itemLocation = computed(() => props.item?.event.overrides?.location || props.item?.model?.content?.location || (props.item?.model as any)?.location);
const itemDescription = computed(() => props.item?.event.overrides?.description || props.item?.model?.content?.description || (props.item?.model as any)?.description);

const hasChecklist = computed(() => !!(props.item?.event.checklistState && props.item.event.checklistState.length > 0));
const totalChecklistCount = computed(() => props.item?.event.checklistState?.length || 0);
const completedCount = computed(() => props.item?.event.checklistState?.filter((c) => c.completed).length || 0);
const progressPercent = computed(() => {
  if (!totalChecklistCount.value) return 0;
  return Math.round((completedCount.value / totalChecklistCount.value) * 100);
});

const cardStyle = computed(() => ({
  top: `${topPos.value}px`,
  left: `${leftPos.value}px`,
}));

watch(
  () => [props.isOpen, props.anchorEl],
  async () => {
    if (props.isOpen && props.anchorEl) {
      await nextTick();
      const rect = props.anchorEl.getBoundingClientRect();
      const cardHeight = cardEl.value?.offsetHeight || 180;
      const cardWidth = 288;

      let top = rect.top - cardHeight - 8;
      if (top < 10) {
        top = rect.bottom + 8;
      }

      let left = rect.left;
      if (left + cardWidth > window.innerWidth - 10) {
        left = window.innerWidth - cardWidth - 10;
      }

      topPos.value = top;
      leftPos.value = left;
    }
  },
  { immediate: true }
);
</script>
