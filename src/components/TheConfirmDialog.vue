<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const title = ref('');
const recordId = ref<number | null>(null);

const emit = defineEmits<{
  (event: 'confirm', id: number): void;
}>();

// Function to open the dialog
const open = (id: number, recordTitle: string | null) => {
  recordId.value = id;
  title.value = recordTitle && recordTitle !== '-' ? recordTitle : 'Untitled';
  visible.value = true;
};

defineExpose({
  open
});

// Function to close the dialog
const close = () => {
  visible.value = false;
  recordId.value = null;
};

// Function to confirm action
const confirm = () => {
  if (recordId.value !== null) {
    emit('confirm', recordId.value);
  }
  close();
};
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog">
        <h3 class="dialog__header">Delete Recording</h3>

        <p class="dialog__text">
          Are you sure you want to delete the recording
          <strong>"{{ title }}"</strong>? <br /><br />
        </p>

        <!-- Buttons -->
        <div class="button-group">
          <button @click="confirm" class="submit-btn delete-btn">Delete</button>
          <button @click="close" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
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
  width: 360px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
}
.dialog__header {
  margin-bottom: var(--space-4);
  /* text-align: center; */
  font-weight: 700;
  color: var(--text-primary);
}

.dialog__text {
  /* text-align: center; */
  /* margin-bottom: var(--space-5); */
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  user-select: none;
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

.submit-btn.delete-btn {
  background-color: #e53935;
  border-color: #e53935;
}

.submit-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

.cancel-btn {
  background-color: transparent;
  border: 2px solid var(--border);
  color: var(--text-primary);
}

.cancel-btn:hover {
  border-color: var(--penguin-black);
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
