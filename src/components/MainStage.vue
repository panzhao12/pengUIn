<script setup lang="ts">
import { ref } from 'vue';
import TextSticker from './TextSticker.vue';

const count = ref(6);

function call() {
  count.value++;
}
</script>

<template>
  <div v-for="n in 6" :key="n">
    <TextSticker :count="count" @add="call" />
  </div>
</template>
