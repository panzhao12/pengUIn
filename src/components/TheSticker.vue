<script setup lang="ts">
import { useRecordStore } from '@/stores/recordStore';
import { useDraggable, useEventListener } from '@vueuse/core';
import { useTemplateRef } from 'vue';

const props = defineProps<{
  id: string;
  title: string | null;
  description: string | null;
  position: { x: number; y: number };
}>();

const emit = defineEmits<{
  play: void;
}>();

const stickerRef = useTemplateRef<HTMLDivElement>('stickerRef');

// Make the sticker draggable
const { x, y, style } = useDraggable(stickerRef, {
  initialValue: props.position
});

// Listen for the mouseup event to emit the final position
useEventListener(stickerRef, 'mouseup', () => {
  updatePosition(props.id, { x: x.value, y: y.value });
  console.log('mouseup', x.value, y.value);
});

// Update the position of the sticker
async function updatePosition(id: string, position: { x: number; y: number }) {
  await useRecordStore().updateRecordPosition(id, position);
}
</script>

<template>
  <div :ref="`stickerRef`" class="sticker" :style="style" @click="emit('play')">
    {{ title }} - {{ description }}
  </div>
</template>

<style lang="scss" scoped>
.sticker {
  cursor: pointer;
  display: inline-block;
  user-select: none;
  position: fixed;
  z-index: 10;
}
</style>
