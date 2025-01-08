<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ThePiano from './ThePiano.vue';
import type { DialogInput, NoteRecord, RecordedNote } from '@/types';
import { useRecordStore } from '@/stores/recordStore';
import TheSticker from './TheSticker.vue';
import { sampler } from '@/sampler';
import * as Tone from 'tone';
import TheDialog from './TheDialog.vue';

const isRecording = ref(false);

const recordStore = useRecordStore();

// All records
const records = computed(() => recordStore.records);

const recordedNotes = ref<RecordedNote[]>();

const penguin = ref<HTMLImageElement>();

// Indicates the current jump position, used for the animation
const currentY = ref(0);

onMounted(() => {
  recordStore.getAllRecords();
});

function toggleRecord() {
  if (isRecording.value) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

function startAnimation() {
  isRecording.value = true;
  currentY.value = 0;
}

function stopAnimation() {
  isRecording.value = false;

  if (!penguin.value) return;

  // extract the Y-axis translation (translateY) from the matrix and update the currentY value
  const computedStyle = window.getComputedStyle(penguin.value);
  const matrix = new DOMMatrix(computedStyle.transform);
  currentY.value = matrix.m42;

  // update the current translateY value
  penguin.value.style.transform = `translateY(${currentY.value}px)`;

  // ensure the code runs in the next animation frame for smooth transition
  requestAnimationFrame(() => {
    if (!penguin.value) return;
    penguin.value.style.transform = 'translateY(0)';
  });
}

function openSaveDialog(notes: RecordedNote[]) {
  recordedNotes.value = notes;
  dialog.value?.open();
}

function playRecord(noteRecord: NoteRecord | undefined) {
  const notes = noteRecord?.record;
  if (!notes) return;

  for (const note of notes) {
    sampler.triggerAttackRelease(
      note.name,
      note.duration,
      Tone.now() + note.startTime
    );
  }
}

// Reference to dialog component
const dialog = ref<InstanceType<typeof TheDialog>>();

// Handle form submission from the dialog
async function handleFormSubmit(input: DialogInput) {
  // do not save if there are less than 2 notes
  if (!recordedNotes.value || recordedNotes.value.length <= 2) return;

  await recordStore.saveRecord(input, recordedNotes.value);
}
</script>

<template>
  <div style="margin: auto">
    <div v-for="[id, record] of records" :key="id">
      <TheSticker
        :title="record.title"
        :description="record.description"
        @update:play="playRecord(record)"
      />
    </div>

    <div class="penguin">
      <img
        ref="penguin"
        :class="isRecording ? 'penguin-jump' : ''"
        src="/p.png"
        alt="pengUIn"
        draggable="false"
        @click="toggleRecord"
      />
    </div>

    <ThePiano
      :is-recording="isRecording"
      @update:record="(recordedNotes) => openSaveDialog(recordedNotes)"
    />

    <TheDialog style="z-index: 12" ref="dialog" @submit="handleFormSubmit">
      <h2>Enter information</h2>
    </TheDialog>
  </div>
</template>

<style scoped lang="scss">
.penguin {
  display: flex;
  justify-content: center;

  & img {
    width: 10rem;
    cursor: pointer;
    transition: transform 0.3s ease-out;
  }
}

.penguin-jump {
  animation: jump 1s ease-in-out infinite;
}

@keyframes jump {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}
</style>
