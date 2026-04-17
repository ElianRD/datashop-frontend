<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const purchases = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const fetchPurchases = async () => {
  loading.value = true;
  try {
    const res = await api.get('/sales/purchases', { params: { page: page.value, limit: 20 } });
    purchases.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { purchases.value = []; }
  finally { loading.value = false; }
};

onMounted(fetchPurchases);
</script>

<template>
  <div class="animate-fade-in">
    <h1>My Purchases</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Products you've bought.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="purchases.length === 0" class="empty glass-panel">
      <p class="text-muted">No purchases yet. Browse the <a @click="router.push({ name: 'catalog' })" class="link">catalog</a> to find products.</p>
    </div>

    <div v-else class="purchases-list">
      <div v-for="p in purchases" :key="p.id" class="purchase-card glass-panel" @click="router.push({ name: 'product-detail', params: { id: p.productId } })">
        <div class="purchase-info">
          <strong class="cell-primary">{{ p.product?.title || 'Product' }}</strong>
          <p class="text-secondary" style="font-size:0.85rem;margin-top:0.25rem">
            Seller: {{ p.product?.seller?.name || p.sellerId }}
          </p>
        </div>
        <div class="purchase-meta">
          <span class="price">${{ Number(p.amount).toFixed(2) }}</span>
          <span class="text-muted" style="font-size:0.8rem">{{ new Date(p.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchPurchases()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchPurchases()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.purchases-list { display: flex; flex-direction: column; gap: 0.75rem; }
.purchase-card { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: border-color 0.2s; }
.purchase-card:hover { border-color: var(--accent-primary); }
.purchase-info { flex: 1; min-width: 0; }
.cell-primary { color: var(--text-primary); }
.purchase-meta { text-align: right; flex-shrink: 0; margin-left: 1rem; }
.price { color: var(--accent-primary); font-weight: 600; font-size: 1.1rem; display: block; }
.link { color: var(--accent-primary); cursor: pointer; text-decoration: underline; }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
