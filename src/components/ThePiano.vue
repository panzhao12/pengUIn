<script setup lang="ts">
import { ref, watch } from 'vue';
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
      :data-key="key.name === 'c3' ? 'c3' : ''"
      @mousedown="playNote(key.name)"
      @mouseup="releaseNote(key.name)"
      @mouseleave="releaseNote(key.name)"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.keys {
  // z-index: 1;
  display: flex;
  padding: 2px 0 0 2px;
  overflow: hidden;
  background: #000;
  border-radius: 0 0 4px 4px;
  user-select: none;

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

    &--active::after {
      background-color: rgb(36, 33, 33);
      box-shadow: inset 3px 2px 3px rgb(58, 58, 58),
        inset -3px 2px 3px rgb(58, 58, 58);
    }
  }
}
</style>
