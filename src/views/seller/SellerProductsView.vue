<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { useRouter } from 'vue-router';
import { Plus, Pencil, Trash2, Send } from 'lucide-vue-next';

const ui = useUiStore();

const router = useRouter();
const products = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);
const statusFilter = ref('');

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params: any = { page: page.value, limit: 15 };
    if (statusFilter.value) params.status = statusFilter.value;
    const res = await api.get('/products/my', { params });
    products.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { products.value = []; }
  finally { loading.value = false; }
};

const submitForReview = async (id: string) => {
  await api.patch(`/products/${id}/submit`);
  ui.toast('Product submitted for review', 'info');
  fetchProducts();
};

const remove = async (id: string) => {
  if (!confirm('Delete this product?')) return;
  await api.delete(`/products/${id}`);
  ui.toast('Product deleted', 'success');
  fetchProducts();
};

const statusBadge = (s: string) => {
  if (s === 'approved') return 'badge-success';
  if (s === 'pending') return 'badge-warning';
  if (s === 'rejected') return 'badge-danger';
  return 'badge-info';
};

onMounted(fetchProducts);
</script>

<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1>My Products</h1>
      <button class="btn btn-primary" @click="router.push({ name: 'seller-product-new' })">
        <Plus :size="16" /> New Product
      </button>
    </div>

    <div class="filters">
      <select class="input-field filter-select" v-model="statusFilter" @change="page=1;fetchProducts()">
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="products.length === 0" class="empty glass-panel">
      <p class="text-muted">No products yet. Create your first one!</p>
    </div>

    <div v-else class="products-grid">
      <div v-for="p in products" :key="p.id" class="product-card glass-panel">
        <div class="product-info">
          <strong class="cell-primary">{{ p.title }}</strong>
          <span :class="['badge', statusBadge(p.status)]" style="margin-left:0.5rem">{{ p.status }}</span>
          <p class="text-secondary" style="font-size:0.85rem;margin-top:0.35rem">${{ Number(p.price).toFixed(2) }}</p>
          <p class="text-muted desc">{{ p.description }}</p>
          <p v-if="p.rejectionComment" class="rejection-note">
            <strong>Rejection:</strong> {{ p.rejectionComment }}
          </p>
        </div>
        <div class="product-actions">
          <button v-if="p.status === 'draft' || p.status === 'rejected'" class="icon-action" title="Submit for review" @click="submitForReview(p.id)">
            <Send :size="14" />
          </button>
          <button class="icon-action" title="Edit" @click="router.push({ name: 'seller-product-edit', params: { id: p.id } })">
            <Pencil :size="14" />
          </button>
          <button class="icon-action danger" title="Delete" @click="remove(p.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchProducts()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchProducts()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.filters { margin-bottom: 1.5rem; }
.filter-select { max-width: 200px; }
.products-grid { display: flex; flex-direction: column; gap: 1rem; }
.product-card { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; }
.product-info { flex: 1; min-width: 0; }
.cell-primary { color: var(--text-primary); }
.desc { font-size: 0.85rem; margin-top: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rejection-note { font-size: 0.8rem; color: var(--danger); margin-top: 0.5rem; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--border-radius-sm); }
.product-actions { display: flex; gap: 0.5rem; flex-shrink: 0; margin-left: 1rem; }
.icon-action { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.3rem; border-radius: var(--border-radius-sm); }
.icon-action:hover { color: var(--text-primary); background: var(--bg-input); }
.icon-action.danger:hover { color: var(--danger); }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
