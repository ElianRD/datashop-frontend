<script setup lang="ts">
import { reactive, watch, onUnmounted } from 'vue';
import { useUiStore, type Toast } from '../../stores/ui.store';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next';

const uiStore = useUiStore();

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };

interface TimerState {
  remaining: number;
  duration: number;
  paused: boolean;
  lastTick: number;
  progress: number;
}

const timers = reactive<Map<number, TimerState>>(new Map());

let rafId: number | null = null;

const tick = () => {
  const now = performance.now();
  const expired: number[] = [];

  timers.forEach((state, id) => {
    if (state.paused) {
      state.lastTick = now;
      return;
    }
    const delta = now - state.lastTick;
    state.lastTick = now;
    state.remaining -= delta;
    state.progress = Math.max(0, state.remaining / state.duration);

    if (state.remaining <= 0) {
      expired.push(id);
    }
  });

  expired.forEach(id => {
    timers.delete(id);
    uiStore.removeToast(id);
  });

  if (timers.size > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
};

const startLoop = () => {
  if (rafId === null && timers.size > 0) {
    rafId = requestAnimationFrame(tick);
  }
};

watch(() => uiStore.toasts.length, () => {
  // Add timers for new toasts
  for (const t of uiStore.toasts) {
    if (!timers.has(t.id)) {
      timers.set(t.id, {
        remaining: t.duration,
        duration: t.duration,
        paused: false,
        lastTick: performance.now(),
        progress: 1,
      });
    }
  }
  // Remove timers for removed toasts
  const ids = new Set(uiStore.toasts.map(t => t.id));
  timers.forEach((_, id) => {
    if (!ids.has(id)) timers.delete(id);
  });
  startLoop();
}, { immediate: true });

const pause = (id: number) => {
  const state = timers.get(id);
  if (state) state.paused = true;
};

const resume = (id: number) => {
  const state = timers.get(id);
  if (state) {
    state.paused = false;
    state.lastTick = performance.now();
  }
  startLoop();
};

const dismiss = (id: number) => {
  timers.delete(id);
  uiStore.removeToast(id);
};

const getProgress = (id: number) => {
  return timers.get(id)?.progress ?? 0;
};

const progressColor = (type: Toast['type']) => {
  const map = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--accent-primary)' };
  return map[type];
};

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" v-if="uiStore.toasts.length">
      <TransitionGroup name="toast">
        <div
          v-for="t in uiStore.toasts"
          :key="t.id"
          :class="['toast-item', `toast-${t.type}`]"
          @mouseenter="pause(t.id)"
          @mouseleave="resume(t.id)"
        >
          <div class="toast-body">
            <component :is="icons[t.type]" :size="18" class="toast-icon" />
            <span class="toast-msg">{{ t.message }}</span>
            <button class="toast-close" @click="dismiss(t.id)">
              <X :size="14" />
            </button>
          </div>
          <div class="toast-progress-track">
            <div
              class="toast-progress-bar"
              :style="{ width: (getProgress(t.id) * 100) + '%', background: progressColor(t.type) }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 400px;
}

.toast-item {
  border-radius: var(--border-radius-md);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  overflow: hidden;
}

.toast-body {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
}

.toast-icon { flex-shrink: 0; }
.toast-msg { flex: 1; line-height: 1.4; }

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.15rem;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
  display: flex;
}

.toast-close:hover { color: var(--text-primary); }

.toast-progress-track {
  height: 3px;
  background: var(--border-light);
}

.toast-progress-bar {
  height: 100%;
  transition: none;
}

.toast-success { border-left: 3px solid var(--success); }
.toast-success .toast-icon { color: var(--success); }

.toast-error { border-left: 3px solid var(--danger); }
.toast-error .toast-icon { color: var(--danger); }

.toast-warning { border-left: 3px solid var(--warning); }
.toast-warning .toast-icon { color: var(--warning); }

.toast-info { border-left: 3px solid var(--accent-primary); }
.toast-info .toast-icon { color: var(--accent-primary); }

/* Transitions */
.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastOut 0.25s ease forwards; }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(30px); }
}

@media (max-width: 480px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}
</style>
