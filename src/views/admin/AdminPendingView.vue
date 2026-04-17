<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { Check, X } from 'lucide-vue-next';

const ui = useUiStore();

const products = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const rejectingId = ref('');
const rejectComment = ref('');

const fetchPending = async () => {
  loading.value = true;
  try {
    const res = await api.get('/products/pending', { params: { page: page.value, limit: 15 } });
    products.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { products.value = []; }
  finally { loading.value = false; }
};

const approve = async (id: string) => {
  await api.patch(`/products/${id}/approve`);
  ui.toast('Product approved', 'success');
  fetchPending();
};

const reject = async (id: string) => {
  if (!rejectComment.value.trim()) return;
  await api.patch(`/products/${id}/reject`, { comment: rejectComment.value });
  ui.toast('Product rejected', 'warning');
  rejectingId.value = '';
  rejectComment.value = '';
  fetchPending();
};

onMounted(fetchPending);
</script>

<template>
  <div class="animate-fade-in">
    <h1>Pending Review</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Approve or reject product submissions.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="products.length === 0" class="empty glass-panel">
      <p class="text-muted">No products pending review.</p>
    </div>

    <div v-else class="pending-list">
      <div v-for="p in products" :key="p.id" class="pending-card glass-panel">
        <div class="pending-header">
          <div>
            <strong class="cell-primary">{{ p.title }}</strong>
            <span class="text-muted" style="font-size:0.8rem;margin-left:0.5rem">${{ Number(p.price).toFixed(2) }}</span>
          </div>
          <span class="text-muted" style="font-size:0.8rem">{{ new Date(p.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-secondary desc">{{ p.description }}</p>
        <div class="pending-meta">
          <span class="text-muted" style="font-size:0.8rem">Seller: {{ p.seller?.name || p.sellerId }}</span>
          <span v-if="p.category" class="badge badge-info">{{ p.category.name }}</span>
        </div>

        <div v-if="rejectingId === p.id" class="reject-form">
          <input class="input-field" v-model="rejectComment" placeholder="Reason for rejection..." style="font-size:0.9rem" />
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button class="btn btn-danger" style="padding:0.4rem 1rem;font-size:0.85rem" @click="reject(p.id)">Confirm Reject</button>
            <button class="btn btn-outline" style="padding:0.4rem 1rem;font-size:0.85rem" @click="rejectingId=''">Cancel</button>
          </div>
        </div>

        <div v-else class="pending-actions">
          <button class="btn btn-primary" style="padding:0.4rem 1rem;font-size:0.85rem" @click="approve(p.id)">
            <Check :size="14" /> Approve
          </button>
          <button class="btn btn-danger" style="padding:0.4rem 1rem;font-size:0.85rem" @click="rejectingId=p.id">
            <X :size="14" /> Reject
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchPending()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchPending()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.pending-list { display: flex; flex-direction: column; gap: 1rem; }
.pending-card { padding: 1.5rem; }
.pending-header { display: flex; justify-content: space-between; align-items: center; }
.cell-primary { color: var(--text-primary); }
.desc { margin: 0.75rem 0; font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pending-meta { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.pending-actions { display: flex; gap: 0.5rem; }
.reject-form { margin-top: 1rem; }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
