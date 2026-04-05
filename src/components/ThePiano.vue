<script setup lang="ts">
import { ref, useTemplateRef, watch, onMounted, onUnmounted } from 'vue';
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

const octaveOffset = ref(0);
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getShiftedNote = (note: string) => {
  const match = note.match(/^([a-g]#?)(\d)$/);
  if (!match) return note;
  const [_, name, octave] = match;
  const newOctave = parseInt(octave) + octaveOffset.value;
  return `${name}${newOctave}`;
};

const activeNotes = ref(new Set<string>());

const recordedNotes = ref<RecordedNote[]>([]);

const handleKeyDown = (e: KeyboardEvent) => {
  if (!(e.key in keyMap)) return;
  const baseNote = keyMap[e.key];
  const shiftedNote = getShiftedNote(baseNote);
  if (shiftedNote && !activeNotes.value.has(shiftedNote)) {
    playNote(shiftedNote);
  }
};

const handleKeyUp = (e: KeyboardEvent) => {
  if (!(e.key in keyMap)) return;
  const baseNote = keyMap[e.key];
  const shiftedNote = getShiftedNote(baseNote);
  if (shiftedNote && activeNotes.value.has(shiftedNote)) {
    releaseNote(shiftedNote);
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keyup', handleKeyUp);
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

function releaseNote(note: string, force = false) {
  if (!activeNotes.value.has(note)) return;
  sampler.triggerRelease(note);
  activeNotes.value.delete(note);

  // recording mode
  if (!props.isRecording && !force) return;

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

const shiftOctave = (delta: number) => {
  const newOffset = octaveOffset.value + delta;

  // Release all active notes to prevent sticking
  activeNotes.value.forEach((note) => {
    sampler.triggerRelease(note);
  });
  activeNotes.value.clear();

  // Limit range (-1 to +4)
  if (newOffset >= -1 && newOffset <= 4) {
    octaveOffset.value = newOffset;
  }
};

defineExpose({ triggerVisualNote, keysEl: keysRef });
</script>

<template>
  <div class="piano-layout" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Left spacer to balance it -->
    <div class="octave-panel-wrapper left">
      <div class="octave-sidebar spacer"></div>
    </div>

    <div ref="keysRef" class="keys-container">
      <div class="keys">
        <div
          v-for="(key, index) in keys"
          :key="index"
          :class="[
            key.type === 0 ? `keys__white-key` : `keys__black-key`,
            activeNotes.has(getShiftedNote(key.name))
              ? key.type === 0
                ? 'keys__white-key--active'
                : 'keys__black-key--active'
              : ''
          ]"
          :data-key="
            key.name.startsWith('c') && key.type === 0
              ? getShiftedNote(key.name)
              : ''
          "
          @mousedown="playNote(getShiftedNote(key.name))"
          @mouseup="releaseNote(getShiftedNote(key.name))"
          @mouseleave="releaseNote(getShiftedNote(key.name))"
        ></div>
      </div>

      <!-- Collapse toggle button attached to the right side of keys -->
      <button
        class="collapse-trigger"
        @click="toggleCollapse"
        :title="isCollapsed ? 'Show Octave Controls' : 'Hide Octave Controls'"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline
            :points="isCollapsed ? '13 17 18 12 13 7' : '11 17 6 12 11 7'"
          ></polyline>
          <polyline
            :points="isCollapsed ? '6 17 11 12 6 7' : '18 17 13 12 18 7'"
          ></polyline>
        </svg>
      </button>
    </div>

    <div class="octave-panel-wrapper right">
      <div class="octave-sidebar panel">
        <button
          class="panel-btn"
          @click="shiftOctave(1)"
          :disabled="octaveOffset >= 4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>

        <div class="panel-info">
          <span class="panel-label">OCTAVE</span>
          <span class="panel-value">{{ octaveOffset }}</span>
        </div>

        <button
          class="panel-btn"
          @click="shiftOctave(-1)"
          :disabled="octaveOffset <= -1"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.piano-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  width: 100%;
}

.keys-container {
  position: relative;
  display: flex;
  align-items: center;
}

.collapse-trigger {
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: var(--penguin-black);
  border: none;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  color: var(--penguin-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.3;

  &:hover {
    opacity: 1;
    right: -28px;
    width: 28px;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.is-collapsed .collapse-trigger {
  opacity: 0.1;
  &:hover {
    opacity: 1;
  }
}

.octave-panel-wrapper {
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  width: 130px; /* Panel (90) + Gap (40 approx from space-6) */
  opacity: 1;

  &.left {
    pointer-events: none;
  }
}

.is-collapsed .octave-panel-wrapper {
  width: 0;
  opacity: 0;
}

.octave-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  min-width: 90px;
  white-space: nowrap;
}

.panel-btn {
  background: transparent;
  border: none;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--penguin-black);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;

  svg {
    width: 32px;
    height: 32px;
  }

  &:hover:not(:disabled) {
    opacity: 0.8;
    background: rgba(0, 0, 0, 0.05);
    border-radius: var(--radius-sm);
  }

  &:active:not(:disabled) {
    transform: scale(0.9);
  }

  &:disabled {
    opacity: 0.15;
    cursor: not-allowed;
  }
}

.panel-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.panel-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--penguin-black);
  opacity: 0.9;
}

.panel-value {
  font-size: 2rem;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  color: var(--penguin-black);
  line-height: 1;
}

.keys {
  display: flex;
  padding: 2px 0 0 2px;
  overflow: hidden;
  background: var(--penguin-black);
  border-radius: var(--radius-sm);
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
