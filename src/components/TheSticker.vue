<script setup lang="ts">
import { useRecordStore } from '@/stores/recordStore';
import { useDraggable } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';

const props = defineProps<{
  id: string;
  title: string | null;
  description: string | null;
  position: { x: number; y: number } | null;
}>();

const emit = defineEmits(['play']);

const stickerRef = useTemplateRef<HTMLDivElement>('stickerRef');

const isDragging = ref(false);

const position = computed(() => props.position);

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

// Update the position of the sticker
async function updatePosition(id: string, position: { x: number; y: number }) {
  await useRecordStore().updateRecordPosition(id, position);
}
</script>

<template>
  <div
    :ref="`stickerRef`"
    class="sticker"
    :style="style"
    @click="!isDragging && emit('play')"
  >
    <div>🐧 {{ title }}</div>
    <div style="opacity: 0.5; overflow-y: auto">
      {{ description }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sticker {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  word-break: break-word;
  user-select: none;
  min-width: 100px;
  max-width: 200px;
  max-height: 150px;
  position: fixed;
  z-index: 10;
  padding: 0.5rem 1rem;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.1),
    0px 1px 2px -1px rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  border: #9ca3af4d 1px;
  // background-color: #f9cc9d50;

  &:hover {
    box-shadow: 0px 8px 15px -3px rgba(0, 0, 0, 0.15),
      0px 4px 6px -4px rgba(0, 0, 0, 0);
  }
}
</style>
