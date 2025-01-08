<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string | null;
  description: string | null;
}>();

const emit = defineEmits<{
  (event: 'update:play'): void;
}>();
</script>

<template>
  <div class="sticker" @click="emit('update:play')">
    {{ title }} - {{ description }}
  </div>
</template>

<style lang="scss" scoped>
.sticker {
  cursor: pointer;
}
</style>
