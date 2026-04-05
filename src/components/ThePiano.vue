<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import keys from '../25key.json';
import * as Tone from 'tone';
import type { RecordedNote } from '@/types';
import { sampler } from '@/sampler';

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

// Register keyboard events
document.addEventListener('keydown', (e) => {
  if (!(e.key in keyMap)) return;

  const note = keyMap[e.key];
  if (note && !activeNotes.value.has(note)) {
    playNote(note);
  }
});
document.addEventListener('keyup', (e) => {
  if (!(e.key in keyMap)) return;

  const note = keyMap[e.key];
  if (note && activeNotes.value.has(note)) {
    releaseNote(note);
  }
});

function playNote(note: string) {
  if (activeNotes.value.has(note)) return;
  activeNotes.value.add(note);
  sampler.triggerAttack(note);

  // recording mode
  if (!props.isRecording) return;
  const hasRecordedNotes = recordedNotes.value.length !== 0;

  // time stamp for starting playing the note
  const startTimeStamp: number = hasRecordedNotes
    ? recordedNotes.value[0].timeStamp
    : 0;

  recordedNotes.value.push({
    id: `${note}-${Date.now()}`,
    name: note,
    duration: Tone.now(),
    timeStamp: Tone.now(),
    startTime: hasRecordedNotes ? Tone.now() - startTimeStamp : startTimeStamp
  });
}

function releaseNote(note: string) {
  if (!activeNotes.value.has(note)) return;
  sampler.triggerRelease(note);
  activeNotes.value.delete(note);

  // recording mode
  if (!props.isRecording) return;

  // find the last matched play mode, because same note can be played and recorded multiple times
  const playedNote = recordedNotes.value
    .slice()
    .reverse()
    .find((recordedNote) => recordedNote.name === note);
  const releasedNote = recordedNotes.value.find(
    (recordedNote) => recordedNote.id === playedNote?.id
  );

  // update the duration of the played note
  if (!releasedNote) return;
  releasedNote.duration = Tone.now() - releasedNote.duration;
}

watch(
  () => props.isRecording,
  (isRecording) => {
    if (isRecording) {
      recordedNotes.value = [];
    } else {
      // Force release any notes still held down to properly calculate their durations
      const currentlyActive = Array.from(activeNotes.value);
      currentlyActive.forEach((note) => {
        releaseNote(note, true); // Force update despite props.isRecording being false
      });
      emit('update:record', recordedNotes.value);
    }
  }
);
function triggerVisualNote(note: string, duration: number) {
  activeNotes.value.add(note);
  setTimeout(() => {
    activeNotes.value.delete(note);
  }, duration * 1000);
}

const keysRef = useTemplateRef<HTMLDivElement>('keysRef');

defineExpose({ triggerVisualNote, keysEl: keysRef });
</script>

<template>
  <div ref="keysRef" class="keys">
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
      :data-key="key.name === 'c3' ? 'c3' : ''"
      @mousedown="playNote(key.name)"
      @mouseup="releaseNote(key.name)"
      @mouseleave="releaseNote(key.name)"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.keys {
  display: flex;
  padding: 2px 0 0 2px;
  overflow: hidden;
  background: var(--penguin-black);
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  user-select: none;
  box-shadow: var(--shadow-md);

  &__white-key {
    display: flex;
    justify-content: center;
    align-items: end;
    float: left;
    position: relative;
    width: 50px;
    height: 180px;
    margin: 0 2px 2px 0;
    background: var(--penguin-white);
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
    transition: transform 0.05s ease, box-shadow 0.05s ease,
      background 0.05s ease;

    &--active {
      background: #eeede9;
      transform: scaleY(0.98);
      transform-origin: top;
      box-shadow: inset 2px 2px 4px rgba(26, 26, 46, 0.15),
        inset -2px 2px 4px rgba(26, 26, 46, 0.15);
    }

    &::after {
      content: attr(data-key);
      justify-self: center;
      text-transform: capitalize;
      font-weight: 500;
      font-size: 0.6875rem;
      color: var(--slate);
      padding-bottom: var(--space-2);
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
      background: linear-gradient(
        180deg,
        #0e0e1e 0%,
        var(--penguin-black) 100%
      );
      border-radius: 0 0 var(--radius-sm) var(--radius-sm);
      box-shadow: 1px 1px 0 #444, 2px 2px 0 #444;
      transition: background 0.05s ease, box-shadow 0.05s ease;
    }

    &--active::after {
      background: linear-gradient(180deg, #1a1a30 0%, #2a2a3e 100%);
      box-shadow: inset 2px 1px 3px rgba(80, 80, 100, 0.5),
        inset -2px 1px 3px rgba(80, 80, 100, 0.5);
    }
  }
}
</style>
