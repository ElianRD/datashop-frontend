import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

let toastId = 0;

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false);
  const loading = ref(false);
  const toasts = ref<Toast[]>([]);

  const toast = (message: string, type: Toast['type'] = 'success', duration = 5000) => {
    const id = ++toastId;
    toasts.value.push({ id, message, type, duration });
  };

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = ref(saved ? saved === 'dark' : prefersDark);

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light');
    applyTheme();
  }, { immediate: true });

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  return { sidebarOpen, loading, isDark, toasts, toggleSidebar, toggleTheme, toast, removeToast };
});
