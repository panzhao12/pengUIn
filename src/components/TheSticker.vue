<script setup lang="ts">
import { useRecordStore } from '@/stores/recordStore';
import { useDraggable, useWindowSize } from '@vueuse/core';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

type ForbiddenZone = { type: 'rect'; el: Element; expand?: number };

const props = defineProps<{
  id: number;
  title: string | null;
  description: string | null;
  position: { x: number; y: number } | null;
  isActive?: boolean;
  isPaused?: boolean;
  getForbiddenZones?: () => ForbiddenZone[];
}>();

const emit = defineEmits(['play', 'pause', 'delete', 'forbidden']);

const stickerRef = useTemplateRef<HTMLDivElement>('stickerRef');

const isDragging = ref(false);
const isPlaying = ref(false);
const isVisible = ref(false);
const isInForbiddenZone = ref(false);
const isBouncing = ref(false);

const { width, height } = useWindowSize();

const position = computed(() => props.position);

// Random slight rotation for personality
const rotation = Math.random() * 5 - 2.5; // -2.5° to 2.5°

let startX = 0;
let startY = 0;

// Local refs for percentage-based tracking
const xPercent = ref(props.position?.x ?? 0);
const yPercent = ref(props.position?.y ?? 0);

// Helper to check if incoming coordinate is pixel or percentage
// If > 100, we assume it's an old pixel value
function isPixel(val: number) {
  return Math.abs(val) > 100;
}

function getInitialPx() {
  const pos = props.position ?? { x: 0, y: 0 };
  return {
    x: isPixel(pos.x) ? pos.x : (pos.x / 100) * width.value,
    y: isPixel(pos.y) ? pos.y : (pos.y / 100) * height.value
  };
}

const { x, y, style } = useDraggable(stickerRef, {
  initialValue: getInitialPx(),
  preventDefault: true,
  stopPropagation: true,
  onStart: (pos, event) => {
    startX = event.clientX;
    startY = event.clientY;
    isDragging.value = false;
  },
  onMove: (pos, event) => {
    if (
      Math.abs(event.clientX - startX) > 1 ||
      Math.abs(event.clientY - startY) > 1
    ) {
      isDragging.value = true;
    }

    // Check forbidden zone overlap – shape-accurate
    if (isDragging.value && stickerRef.value && props.getForbiddenZones) {
      const stickerRect = stickerRef.value.getBoundingClientRect();
      const zones = props.getForbiddenZones();

      let overlaps = false;
      let overlayRect:
        | { x: number; y: number; width: number; height: number }
        | undefined;

      for (const zone of zones) {
        const rect = zone.el.getBoundingClientRect();
        const expand = zone.expand || 0;

        const hit =
          stickerRect.right > rect.left - expand &&
          stickerRect.left < rect.right + expand &&
          stickerRect.bottom > rect.top - expand &&
          stickerRect.top < rect.bottom + expand;

        if (hit) {
          overlaps = true;
          overlayRect = {
            x: rect.x - expand,
            y: rect.y - expand,
            width: rect.width + expand * 2,
            height: rect.height + expand * 2
          };
          break;
        }
      }

      if (overlaps !== isInForbiddenZone.value) {
        isInForbiddenZone.value = overlaps;
        emit('forbidden', overlaps, overlayRect);
      }
    }
  },
  onEnd: () => {
    // If dropped in a forbidden zone, bounce back
    if (isInForbiddenZone.value && position.value) {
      isBouncing.value = true;
      const originalPx = getInitialPx();
      x.value = originalPx.x;
      y.value = originalPx.y;
      xPercent.value = position.value.x;
      yPercent.value = position.value.y;
      isInForbiddenZone.value = false;
      emit('forbidden', false);
      setTimeout(() => {
        isBouncing.value = false;
      }, 350);
    } else if (isDragging.value) {
      const newXPercent = (x.value / width.value) * 100;
      const newYPercent = (y.value / height.value) * 100;

      // Check if we actually moved from the database value
      const diffX = Math.abs((props.position?.x ?? 0) - newXPercent);
      const diffY = Math.abs((props.position?.y ?? 0) - newYPercent);

      if (diffX > 0.1 || diffY > 0.1) {
        xPercent.value = newXPercent;
        yPercent.value = newYPercent;
        updatePosition(props.id, { x: newXPercent, y: newYPercent });
      }
    } else if (!isDragging.value && position.value) {
      // Snap visually back to current percentage location
      const targetX = (xPercent.value / 100) * width.value;
      const targetY = (yPercent.value / 100) * height.value;
      if (
        Math.abs(x.value - targetX) > 0.5 ||
        Math.abs(y.value - targetY) > 0.5
      ) {
        x.value = targetX;
        y.value = targetY;
      }
    }

    isInForbiddenZone.value = false;
    emit('forbidden', false);

    setTimeout(() => {
      isDragging.value = false;
    }, 50);
  }
});

// Update percentages whenever a real drag finishes
watch([x, y], () => {
  if (isDragging.value && width.value > 0 && height.value > 0) {
    xPercent.value = (x.value / width.value) * 100;
    yPercent.value = (y.value / height.value) * 100;
  }
});

// Sync visual pixel position whenever the window resizes to maintain the percentage
watch([width, height], () => {
  if (!isDragging.value && width.value > 0 && height.value > 0) {
    x.value = (xPercent.value / 100) * width.value;
    y.value = (yPercent.value / 100) * height.value;
  }
});

// Reactively update local percentages if the database/parent sends new ones
watch(
  () => props.position,
  (newPos) => {
    if (newPos && !isDragging.value) {
      xPercent.value = newPos.x;
      yPercent.value = newPos.y;

      // Also update pixels immediately
      if (width.value > 0 && height.value > 0) {
        x.value = isPixel(newPos.x) ? newPos.x : (newPos.x / 100) * width.value;
        y.value = isPixel(newPos.y)
          ? newPos.y
          : (newPos.y / 100) * height.value;
      }
    }
  },
  { deep: true }
);

function handlePlay() {
  if (isDragging.value) return;
  isPlaying.value = true;
  emit('play');
  setTimeout(() => {
    isPlaying.value = false;
  }, 400);
}

function handleTogglePlayback() {
  if (isDragging.value) return;

  if (props.isActive) {
    if (props.isPaused) {
      emit('play');
    } else {
      emit('pause');
    }
  } else {
    handlePlay();
  }
}

function handleDelete() {
  if (isDragging.value) return;
  emit('delete');
}

// Update the position of the sticker
async function updatePosition(id: number, position: { x: number; y: number }) {
  await useRecordStore().updateRecordPosition(id, position);
}

onMounted(() => {
  if (props.position) {
    const initial = getInitialPx();
    x.value = initial.x;
    y.value = initial.y;
    xPercent.value = isPixel(props.position.x)
      ? (props.position.x / width.value) * 100
      : props.position.x;
    yPercent.value = isPixel(props.position.y)
      ? (props.position.y / height.value) * 100
      : props.position.y;
  }
  // Trigger entrance animation
  requestAnimationFrame(() => {
    isVisible.value = true;
  });
});
</script>

<template>
  <div
    :ref="`stickerRef`"
    class="sticker"
    :class="{
      'sticker--visible': isVisible,
      'sticker--active': isActive,
      'sticker--playing': isActive && !isPaused,
      'sticker--paused': isActive && isPaused,
      'sticker--forbidden': isInForbiddenZone && isDragging,
      'sticker--bouncing': isBouncing
    }"
    :style="[style, { '--rotation': rotation + 'deg' }]"
    @click="handleTogglePlayback"
  >
    <div class="sticker__title">
      <div class="sticker__icon-wrapper" @click.stop="handleTogglePlayback">
        <span
          v-if="!isActive"
          class="sticker__emoji"
          :class="{ 'sticker__emoji--pulse': isPlaying }"
          >🐧</span
        >
        <div v-else class="sticker__playback-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              opacity="0.4"
            />
            <template v-if="!isPaused">
              <rect x="8.5" y="8" width="2.5" height="8" rx="1" />
              <rect x="13" y="8" width="2.5" height="8" rx="1" />
            </template>
            <path v-else d="M9.5 7.5v9l7-4.5-7-4.5z" />
          </svg>
        </div>
      </div>
      <span v-if="title" class="sticker__title-text" :title="title">
        {{ title }}
      </span>
      <button
        class="sticker__delete-btn"
        @click.stop="handleDelete"
        title="Delete"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="sticker__desc">
      {{ description }}
    </div>

    <!-- Musical Aura: Floating Notes -->
    <div v-if="isActive && !isPaused" class="sticker__notes">
      <span class="note-particle p1">♪</span>
      <span class="note-particle p2">♫</span>
      <span class="note-particle p3">♬</span>
      <span class="note-particle p4">♪</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sticker {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  cursor: pointer;
  word-break: break-word;
  user-select: none;
  min-width: 100px;
  max-width: 200px;
  max-height: 150px;
  position: fixed;
  z-index: 10;
  padding: var(--space-3) var(--space-4);
  background: var(--accent-sticker-bg);
  box-shadow: var(--shadow-sticker);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(245, 166, 35, 0.15);
  transform: rotate(var(--rotation)) scale(0);
  opacity: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease,
    border-color 0.2s ease;

  &--visible {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1);
    // animation: sticker-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  &:hover {
    box-shadow: var(--shadow-md);
    transform: rotate(var(--rotation)) translateY(-2px) scale(1.02);
  }

  &--active,
  &--active:hover {
    box-shadow: 0 4px 12px rgba(26, 26, 46, 0.1), var(--shadow-md);
    transform: rotate(var(--rotation)) translateY(-2px) scale(1.02);
  }

  &--paused {
    border-color: var(--slate);
    border-width: 1.5px;
    opacity: 0.9;
  }

  // Highlight for playback (Static Arctic Noir)
  &.sticker--playing {
    border-color: var(--penguin-black);
    border-width: 1.5px;
    box-shadow: 0 8px 24px rgba(26, 26, 46, 0.2), var(--shadow-md);
  }

  &--forbidden {
    cursor: not-allowed;
    border-color: rgba(229, 57, 53, 0.5);
    box-shadow: 0 0 0 2px rgba(229, 57, 53, 0.3), var(--shadow-md);
  }

  &--bouncing {
    // animation: bounce-back 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  &__title-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
    border-radius: var(--radius-full);
    transition: background 0.2s ease, transform 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      transform: scale(1.1);
    }
  }

  &__playback-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    animation: icon-entrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__delete {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--slate-light);
    color: white;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    opacity: 1;
    z-index: 10;
    transition: all 0.2s ease;

    &:hover {
      background: var(--accent-record);
      transform: scale(1.1);
    }
  }

  &__delete-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    opacity: 0;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: auto;

    &:hover {
      background: var(--accent-record-soft);
      color: var(--accent-record);
      transform: scale(1.1);
    }
  }

  &:hover &__delete-btn {
    opacity: 1;
  }

  &__desc {
    font-size: 0.75rem;
    color: var(--text-secondary);
    overflow-y: auto;
    line-height: 1.4;
  }

  &__emoji {
    display: inline-block;
    font-size: 1.25rem;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &--pulse {
      animation: emoji-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}

@keyframes sticker-entrance {
  0% {
    opacity: 0;
    transform: rotate(var(--rotation)) scale(0);
  }
  60% {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: rotate(var(--rotation)) scale(1);
  }
}

@keyframes emoji-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes icon-entrance {
  from {
    transform: scale(0.5) rotate(-45deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.sticker__notes {
  position: absolute;
  top: -20px;
  left: 0;
  width: 100%;
  height: 40px;
  pointer-events: none;
}

.note-particle {
  position: absolute;
  font-size: 1.25rem;
  color: var(--penguin-black);
  opacity: 0;
  bottom: 0;
}

.p1 {
  left: 10%;
  animation: float-note 2s ease-out infinite;
}
.p2 {
  left: 40%;
  animation: float-note 2.5s ease-out 0.5s infinite;
}
.p3 {
  left: 70%;
  animation: float-note 2.2s ease-out 1s infinite;
}
.p4 {
  left: 85%;
  animation: float-note 2.8s ease-out 0.2s infinite;
}

@keyframes float-note {
  0% {
    transform: translateY(0) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-60px) rotate(20deg) scale(1.2);
    opacity: 0;
  }
}

@keyframes bounce-back {
  0% {
    transform: rotate(var(--rotation)) scale(0.95);
  }
  50% {
    transform: rotate(var(--rotation)) scale(1.05);
  }
  100% {
    transform: rotate(var(--rotation)) scale(1);
  }
}
</style>
