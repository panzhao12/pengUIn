<script setup lang="ts">
import { useRecordStore } from '@/stores/recordStore';
import { useDraggable } from '@vueuse/core';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

const props = defineProps<{
  id: string;
  title: string | null;
  description: string | null;
  position: { x: number; y: number } | null;
}>();

const emit = defineEmits(['play']);

const stickerRef = useTemplateRef<HTMLDivElement>('stickerRef');

const isDragging = ref(false);
const isPlaying = ref(false);
const isVisible = ref(false);

const position = computed(() => props.position);

// Random slight rotation for personality
const rotation = Math.random() * 5 - 2.5; // -2.5° to 2.5°

// Make the sticker draggable
const { x, y, style } = useDraggable(stickerRef, {
  initialValue: props.position ?? { x: 0, y: 0 },
  preventDefault: true,
  stopPropagation: true,
  onMove: () => {
    isDragging.value = true;
  },
  onEnd: () => {
    // update the position only if the sticker has moved
    if (position.value?.x !== x.value || position.value?.y !== y.value) {
      updatePosition(props.id, { x: x.value, y: y.value });
    }

    // reset the dragging state after a short delay, to prevent click events
    setTimeout(() => {
      isDragging.value = false;
    }, 50);
  }
});

function handlePlay() {
  if (isDragging.value) return;
  isPlaying.value = true;
  emit('play');
  setTimeout(() => {
    isPlaying.value = false;
  }, 400);
}

// Update the position of the sticker
async function updatePosition(id: string, position: { x: number; y: number }) {
  await useRecordStore().updateRecordPosition(id, position);
}

onMounted(() => {
  // Trigger entrance animation
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
});
</script>

<template>
  <div
    :ref="`stickerRef`"
    class="sticker"
    :class="{ 'sticker--visible': isVisible }"
    :style="[style, { '--rotation': rotation + 'deg' }]"
    @click="handlePlay"
  >
    <div class="sticker__title">
      <span
        class="sticker__emoji"
        :class="{ 'sticker__emoji--pulse': isPlaying }"
        >🐧</span
      >
      {{ title }}
    </div>
    <div class="sticker__desc">
      {{ description }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sticker {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  cursor: pointer;
  word-break: break-word;
  user-select: none;
  min-width: 100px;
  max-width: 200px;
  max-height: 150px;
  position: fixed;
  z-index: 10;
  padding: var(--space-3) var(--space-4);
  background: var(--accent-sticker-bg);
  box-shadow: var(--shadow-sticker);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(245, 166, 35, 0.15);
  transform: rotate(var(--rotation)) scale(0);
  opacity: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;

  &--visible {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1);
    animation: sticker-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  &:hover {
    box-shadow: var(--shadow-md);
    transform: rotate(var(--rotation)) translateY(-2px) scale(1.02);
  }

  &__title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    overflow-y: auto;
    line-height: 1.4;
  }

  &__emoji {
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &--pulse {
      animation: emoji-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}

@keyframes sticker-entrance {
  0% {
    opacity: 0;
    transform: rotate(var(--rotation)) scale(0);
  }
  60% {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1);
  }
}

@keyframes emoji-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
