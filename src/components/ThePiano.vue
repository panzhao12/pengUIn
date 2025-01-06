<script setup lang="ts">
import { ref, watch } from 'vue';
import keys from '../25key.json';
import * as Tone from 'tone';
import type { RecordedNote } from '@/types';

const props = defineProps<{
  isRecording: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:record', recordedNotes: RecordedNote[]): void;
}>();

const keyMap: { [key: string]: string } = {
  z: 'c2',
  s: 'c#2',
  x: 'd2',
  d: 'd#2',
  c: 'e2',
  v: 'f2',
  g: 'f#2',
  b: 'g2',
  h: 'g#2',
  n: 'a2',
  j: 'a#2',
  m: 'b2',
  q: 'c3',
  2: 'c#3',
  w: 'd3',
  3: 'd#3',
  e: 'e3',
  r: 'f3',
  5: 'f#3',
  t: 'g3',
  6: 'g#3',
  y: 'a3',
  7: 'a#3',
  u: 'b3'
};

const activeNotes = ref(new Set<string>());

const recordedNotes = ref<RecordedNote[]>([]);

// Initiate the piano sampler
const sampler = new Tone.Sampler({
  urls: {
    A0: 'A0.mp3',
    C1: 'C1.mp3',
    'D#1': 'Ds1.mp3',
    'F#1': 'Fs1.mp3',
    A1: 'A1.mp3',
    C2: 'C2.mp3',
    'D#2': 'Ds2.mp3',
    'F#2': 'Fs2.mp3',
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
    'D#6': 'Ds6.mp3',
    'F#6': 'Fs6.mp3',
    A6: 'A6.mp3',
    C7: 'C7.mp3',
    'D#7': 'Ds7.mp3',
    'F#7': 'Fs7.mp3',
    A7: 'A7.mp3',
    C8: 'C8.mp3'
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/'
}).toDestination();

// Register keyboard events
document.addEventListener('keydown', (e) => {
  if (!(e.key in keyMap)) return;

  const note = keyMap[e.key];
  if (note && !activeNotes.value.has(note)) {
    activeNotes.value.add(note);
    playNote(note);
  }
});
document.addEventListener('keyup', (e) => {
  if (!(e.key in keyMap)) return;

  const note = keyMap[e.key];
  if (note && activeNotes.value.has(note)) {
    activeNotes.value.delete(note);
    releaseNote(note);
  }
});

function playNote(note: string) {
  sampler.triggerAttack(note);

  if (!props.isRecording) return;

  const hasRecordedNotes = recordedNotes.value.length !== 0;

  // time stamp for starting playing the note
  const startTimeStamp: number = hasRecordedNotes
    ? recordedNotes.value[0].timeStamp
    : 0;

  recordedNotes.value.push({
    note,
    duration: Tone.now(),
    timeStamp: Tone.now(),
    startTime: hasRecordedNotes ? Tone.now() - startTimeStamp : startTimeStamp
  });
}

function releaseNote(note: string) {
  sampler.triggerRelease(note);
}

function replay() {
  const data = localStorage.getItem('recordedNotes');
  if (data) {
    const recordedNotes = JSON.parse(data);
    for (const recordedNote of recordedNotes) {
      sampler.triggerAttackRelease(
        recordedNote.note,
        recordedNote.duration,
        Tone.now() + recordedNote.startTime
      );
    }
  }
}

watch(
  () => props.isRecording,
  (isRecording) => {
    if (isRecording) {
      recordedNotes.value = [];
    } else {
      emit('update:record', recordedNotes.value);
    }
  }
);
</script>

<template>
  <div class="keys">
    <div
      v-for="(key, index) in keys"
      :key="index"
      :class="[
        key.type === 0 ? `keys__white-key` : `keys__black-key`,
        activeNotes.has(key.name)
          ? key.type === 0
            ? 'keys__white-key--active'
            : 'keys__black-key--active'
          : ''
      ]"
      :data-key="key.name"
      @mousedown="playNote(key.name)"
      @mouseup="releaseNote(key.name)"
    ></div>
  </div>

  <button @click="replay">Replay</button>
</template>

<style scoped lang="scss">
.keys {
  z-index: 1; //TODO
  display: flex;
  padding: 2px 0 0 2px;
  overflow: hidden;
  background: #000;
  border-radius: 0 0 4px 4px;

  &__white-key {
    display: flex;
    justify-content: center;
    align-items: end;
    float: left;
    position: relative;
    width: 50px;
    height: 180px;
    margin: 0 2px 2px 0;
    background: #fff;
    border-radius: 0 0 4px 4px;

    &:active {
      background: #f4f3f3;
      box-shadow: inset 3px 2px 3px #999, inset -3px 2px 3px #999;
    }

    &--active {
      background: #f4f3f3;
      box-shadow: inset 3px 2px 3px #999, inset -3px 2px 3px #999;
    }

    &::after {
      content: attr(data-key);
      justify-self: center;
      text-transform: capitalize;
      font-weight: 500;
    }
  }

  &__black-key {
    width: 0;
    margin: 0;
    z-index: 2;
    left: -20px;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      display: block;
      width: 32px;
      height: 117px;
      background: #000;
      border-radius: 0 0 4px 4px;
      box-shadow: 1px 1px 0 #555, 2px 2px 0 #555;
    }

    &:active::after {
      background-color: rgb(36, 33, 33);
      box-shadow: inset 3px 2px 3px rgb(58, 58, 58),
        inset -3px 2px 3px rgb(58, 58, 58);
    }

    &--active::after {
      background-color: rgb(36, 33, 33);
      box-shadow: inset 3px 2px 3px rgb(58, 58, 58),
        inset -3px 2px 3px rgb(58, 58, 58);
    }
  }
}
</style>
