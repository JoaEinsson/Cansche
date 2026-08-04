<template>
  <span class="inline-flex items-center justify-center shrink-0 leading-none">
    <!-- Built-in Lucide SVGs -->
    <svg
      v-if="effectiveIconName === 'GraduationCap'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'BookOpen'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Briefcase'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Dumbbell'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Code'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Heart'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Coffee'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Pin'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <line x1="12" x2="12" y1="17" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'MapPin'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Star'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Zap'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Clock'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Calendar'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'CalendarDays'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'RefreshCw'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M21 12a9 9 0 0 0-15.3-6.4L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 15.3 6.4L21 16" />
      <path d="M21 21v-5h-5" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Settings' || effectiveIconName === 'SlidersHorizontal'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path v-if="effectiveIconName === 'Settings'" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path v-if="effectiveIconName === 'Settings'" d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V19.6h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7.75v-2h.09A1.7 1.7 0 0 0 9.4 10.94a1.7 1.7 0 0 0-.34-1.88L9 9l1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 13.38 6.4V6.3h2v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.76 9l-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 12H21v2h-.08A1.7 1.7 0 0 0 19.4 15Z" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M21 4H3" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M21 12H3" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M21 20H3" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M14 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M6 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path v-if="effectiveIconName === 'SlidersHorizontal'" d="M14 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Database'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Info'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Minus'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      :style="color ? { color } : undefined"
    >
      <path d="M5 12h14" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Maximize2'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Minimize2'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'X'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      :style="color ? { color } : undefined"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Bookmark'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'FileText'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a1 1 0 0 0 1 1h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'CheckSquare'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Layers'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'ChevronRight'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Eye'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'EyeOff'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Edit2'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>

    <svg
      v-else-if="effectiveIconName === 'Trash2'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>

    <!-- Render Custom Emoji if present and valid -->
    <span v-else-if="isRealEmoji" :style="{ fontSize: size + 'px' }" class="leading-none">
      {{ icon }}
    </span>

    <!-- Default fallback SVG Bookmark icon -->
    <svg
      v-else
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="color ? { color } : undefined"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    icon?: string;
    size?: number;
    color?: string;
  }>(),
  {
    size: 14,
  }
);

const lucideMap: Record<string, string> = {
  '📚': 'GraduationCap',
  '💼': 'Briefcase',
  '🏋️': 'Dumbbell',
  '💻': 'Code',
  '❤️': 'Heart',
  '☕': 'Coffee',
  '📌': 'Pin',
  '⭐': 'Star',
  '⚡': 'Zap',
  '⏰': 'Clock',
  '📅': 'Calendar',
  '📍': 'MapPin',
};

const knownLucideIcons = new Set([
  'GraduationCap',
  'BookOpen',
  'Briefcase',
  'Dumbbell',
  'Code',
  'Heart',
  'Coffee',
  'Pin',
  'MapPin',
  'Star',
  'Zap',
  'Clock',
  'Calendar',
  'CalendarDays',
  'RefreshCw',
  'Settings',
  'SlidersHorizontal',
  'Database',
  'Info',
  'Bookmark',
  'FileText',
  'CheckSquare',
  'Layers',
  'ChevronRight',
  'Eye',
  'EyeOff',
  'Edit2',
  'Trash2',
  'Minus',
  'Maximize2',
  'Minimize2',
  'X',
]);

const effectiveIconName = computed(() => {
  if (!props.icon) return 'Bookmark';
  if (props.icon.startsWith('lucide:')) {
    const name = props.icon.replace('lucide:', '');
    return knownLucideIcons.has(name) ? name : 'Bookmark';
  }
  if (lucideMap[props.icon]) {
    return lucideMap[props.icon];
  }
  if (knownLucideIcons.has(props.icon)) {
    return props.icon;
  }
  return '';
});

const isRealEmoji = computed(() => {
  if (!props.icon || effectiveIconName.value !== '') return false;
  return Array.from(props.icon).some((char) => (char.codePointAt(0) || 0) > 127);
});
</script>
