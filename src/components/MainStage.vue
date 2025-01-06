<script setup lang="ts">
import { ref } from 'vue';
import ThePiano from './ThePiano.vue';
import type { RecordedNote } from '@/types';

const isRecording = ref(false);

function toggleRecording() {
  isRecording.value = !isRecording.value;
}

function saveRecording(recordedNotes: RecordedNote[]) {
  localStorage.setItem('recordedNotes', JSON.stringify(recordedNotes));
}
</script>

<template>
  <div style="margin: auto">
    <div class="penguin">
      <img
        src="/p.png"
        :style="{ backgroundColor: isRecording ? 'red' : '' }"
        alt="pengUIn"
        @click="toggleRecording"
      />
    </div>
    <div>
      <ThePiano
        :is-recording="isRecording"
        @update:record="(recordedNotes) => saveRecording(recordedNotes)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.penguin {
  display: flex;
  justify-content: center;

  & img {
    width: 10rem;
    cursor: pointer;
  }
}
</style>
