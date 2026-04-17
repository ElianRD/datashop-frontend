<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { Bell, CheckCheck } from 'lucide-vue-next';

const ui = useUiStore();

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const notifications = ref<Notification[]>([]);
const loading = ref(true);
const page = ref(1);
const totalPages = ref(1);

const fetchNotifications = async () => {
  loading.value = true;
  try {
    const res = await api.get('/notifications', { params: { page: page.value, limit: 20 } });
    notifications.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { notifications.value = []; }
  finally { loading.value = false; }
};

const markAsRead = async (id: string) => {
  await api.patch(`/notifications/${id}/read`);
  const n = notifications.value.find(x => x.id === id);
  if (n) n.read = true;
};

const markAllRead = async () => {
  await api.patch('/notifications/read-all');
  notifications.value.forEach(n => n.read = true);
  ui.toast('All notifications marked as read', 'success');
};

onMounted(fetchNotifications);
</script>

<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1>Notifications</h1>
      <button class="btn btn-outline" @click="markAllRead"><CheckCheck :size="16" /> Mark All Read</button>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="notifications.length === 0" class="empty glass-panel">
      <Bell :size="32" class="text-muted" />
      <p class="text-muted">No notifications yet.</p>
    </div>

    <div v-else class="notif-list">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['notif-item glass-panel', { unread: !n.read }]"
        @click="markAsRead(n.id)"
      >
        <div class="notif-dot" v-if="!n.read" />
        <div class="notif-body">
          <strong>{{ n.title }}</strong>
          <p>{{ n.message }}</p>
          <span class="notif-time">{{ new Date(n.createdAt).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page <= 1" @click="page--; fetchNotifications()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page >= totalPages" @click="page++; fetchNotifications()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.notif-list { display: flex; flex-direction: column; gap: 0.75rem; }
.notif-item { padding: 1.25rem; display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; }
.notif-item.unread { border-left: 3px solid var(--accent-primary); }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); margin-top: 0.5rem; flex-shrink: 0; }
.notif-body strong { color: var(--text-primary); font-size: 0.95rem; }
.notif-body p { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem; }
.notif-time { font-size: 0.75rem; color: var(--text-muted); }
.empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
</style>
