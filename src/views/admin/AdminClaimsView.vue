<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';

const ui = useUiStore();

const authStore = useAuthStore();
const claims = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const respondText = ref('');
const respondingId = ref('');

const fetchClaims = async () => {
  loading.value = true;
  try {
    const endpoint = authStore.user?.role === 'admin' ? '/claims/all' : '/claims/assigned';
    const res = await api.get(endpoint, { params: { page: page.value, limit: 15 } });
    claims.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { claims.value = []; }
  finally { loading.value = false; }
};

const respond = async (id: string) => {
  if (!respondText.value.trim()) return;
  await api.patch(`/claims/${id}/respond`, { response: respondText.value });
  ui.toast('Response sent', 'success');
  respondingId.value = '';
  respondText.value = '';
  fetchClaims();
};

const resolve = async (id: string) => {
  await api.patch(`/claims/${id}/resolve`);
  ui.toast('Claim resolved', 'success');
  fetchClaims();
};

const statusBadge = (s: string) => {
  if (s === 'open') return 'badge-danger';
  if (s === 'in_progress') return 'badge-warning';
  return 'badge-success';
};

onMounted(fetchClaims);
</script>

<template>
  <div class="animate-fade-in">
    <h1>Claims</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Review and resolve disputes.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="claims.length === 0" class="empty glass-panel">
      <p class="text-muted">No claims to review.</p>
    </div>

    <div v-else class="claims-list">
      <div v-for="c in claims" :key="c.id" class="claim-card glass-panel">
        <div class="claim-header">
          <div>
            <strong class="cell-primary">{{ c.claimType }}</strong>
            <span :class="['badge', statusBadge(c.status)]" style="margin-left:0.5rem">{{ c.status }}</span>
          </div>
          <span class="text-muted" style="font-size:0.8rem">{{ new Date(c.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-secondary" style="margin:0.75rem 0;font-size:0.9rem">{{ c.description }}</p>
        <p class="text-muted" style="font-size:0.8rem">By: {{ c.user?.name || c.userId }}</p>

        <div v-if="c.response" class="response-box">
          <strong style="font-size:0.8rem;color:var(--text-muted)">Response:</strong>
          <p style="font-size:0.9rem">{{ c.response }}</p>
        </div>

        <div v-if="c.status !== 'resolved'" class="claim-actions">
          <template v-if="respondingId === c.id">
            <input class="input-field" v-model="respondText" placeholder="Write your response..." style="font-size:0.9rem" />
            <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
              <button class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" @click="respond(c.id)">Send</button>
              <button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem" @click="respondingId=''">Cancel</button>
            </div>
          </template>
          <template v-else>
            <button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem" @click="respondingId=c.id">Respond</button>
            <button class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" @click="resolve(c.id)">Resolve</button>
          </template>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchClaims()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchClaims()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.claims-list { display: flex; flex-direction: column; gap: 1rem; }
.claim-card { padding: 1.5rem; }
.claim-header { display: flex; justify-content: space-between; align-items: center; }
.cell-primary { color: var(--text-primary); }
.response-box { background: var(--bg-input); padding: 0.75rem 1rem; border-radius: var(--border-radius-sm); margin-top: 0.75rem; }
.claim-actions { margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
