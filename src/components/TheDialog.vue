<script setup lang="ts">
import type { DialogInput, RecordedNote } from '@/types';
import { computed, ref } from 'vue';

// Define the props
const props = defineProps<{
  recordedNotes: RecordedNote[] | undefined;
}>();

// Define the submit event
const emit = defineEmits<{
  (event: 'submit', data: DialogInput): void;
}>();

// Refs to bind form inputs
const visible = ref(false);
const title = ref('');
const description = ref('');

const isRecordingValid = computed(() => {
  return props.recordedNotes && props.recordedNotes.length > 2;
});

// Function to open the dialog
const open = () => {
  visible.value = true;
};

defineExpose({
  open
});

// Function to close the dialog
const close = () => {
  visible.value = false;
  resetForm();
};

const isShaking = ref(false);

// Function to handle backdrop clicks
const handleBackdropClick = () => {
  if (isRecordingValid.value) {
    // Trigger shake animation
    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 400); // match animation duration
  } else {
    close();
  }
};

// Function to reset the form fields
const resetForm = () => {
  title.value = '';
  description.value = '';
  isShaking.value = false;
};

// Function to handle form submission
const submitForm = () => {
  const data: DialogInput = {
    title: title.value === '' ? '-' : title.value,
    description: description.value
  };
  emit('submit', data);
  close(); // Close dialog after submitting
};
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="dialog-overlay"
      @click.self="handleBackdropClick"
    >
      <div class="dialog" :class="{ 'dialog--shake': isShaking }">
        <h3 v-if="isRecordingValid" class="dialog__header">Perfect! ❤️</h3>
        <div v-else class="dialog__header">
          Play more than 2 notes to save. 🎹
        </div>

        <!-- Form inputs -->
        <template v-if="isRecordingValid">
          <label for="title">Title*</label>
          <input
            v-model="title"
            id="title"
            type="text"
            required
            placeholder="Name your masterpiece"
            @keydown="(event: Event) => event.stopPropagation()"
          />

          <label for="description">Description</label>
          <textarea
            v-model="description"
            id="description"
            placeholder="Say something about it"
            @keydown="(event: Event) => event.stopPropagation()"
          ></textarea>
        </template>

        <!-- Buttons -->
        <div class="button-group">
          <div
            v-if="isRecordingValid"
            class="submit-tooltip-wrapper"
            :data-tooltip="
              !title.trim() ? 'Please name your masterpiece!' : null
            "
          >
            <button
              :disabled="!title.trim()"
              @click="submitForm"
              class="submit-btn"
            >
              Submit
            </button>
          </div>
          <button @click="close" class="cancel-btn">
            {{ isRecordingValid ? 'Cancel' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
<style scoped lang="scss">
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-card);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  width: 320px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
}

label {
  display: block;
  margin-bottom: var(--space-1);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  /* text-transform: uppercase; */
}
.dialog__header {
  margin-bottom: var(--space-4);
  text-align: center;
  font-weight: 700;
  color: var(--text-primary);
  &--warning {
    font-size: 0.875rem;
    color: var(--accent-record);
    font-weight: 500;
  }
}

.dialog--shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  border: 1px solid rgba(229, 57, 53, 0.4);
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}

input,
textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--penguin-white);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
textarea:focus {
  border-color: var(--penguin-black);
  box-shadow: 0 0 0 2px rgba(26, 26, 46, 0.08);
}

input:disabled,
textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  user-select: none;
  margin-top: var(--space-2);
}

.submit-btn,
.cancel-btn {
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.submit-btn {
  background-color: var(--penguin-black);
  border: 2px solid var(--penguin-black);
  color: white;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.85;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background-color: var(--border);
  border-color: var(--border);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background-color: transparent;
  border: 2px solid var(--border);
  color: var(--text-primary);
}

.cancel-btn:hover {
  border-color: var(--penguin-black);
}

.submit-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.submit-tooltip-wrapper[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: var(--penguin-black);
  color: white;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--shadow-md);
  animation: tooltip-fade-in 0.2s ease;
}

.submit-tooltip-wrapper[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  border: 6px solid transparent;
  border-top-color: var(--penguin-black);
  pointer-events: none;
  z-index: 10;
  animation: tooltip-fade-in 0.1s ease;
}

@keyframes tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-active .dialog,
.fade-leave-active .dialog {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .dialog {
  transform: translateY(8px);
}
</style>
