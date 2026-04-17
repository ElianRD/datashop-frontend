<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

const sales = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const fetchSales = async () => {
  loading.value = true;
  try {
    const res = await api.get('/sales/my-sales', { params: { page: page.value, limit: 20 } });
    sales.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { sales.value = []; }
  finally { loading.value = false; }
};

const badgeClass = (s: string) => {
  if (s === 'completed') return 'badge-success';
  if (s === 'pending') return 'badge-warning';
  return 'badge-info';
};

onMounted(fetchSales);
</script>

<template>
  <div class="animate-fade-in">
    <h1>Sales History</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Track your product sales.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="sales.length === 0" class="empty glass-panel">
      <p class="text-muted">No sales yet.</p>
    </div>

    <div v-else class="table-wrapper glass-panel">
      <table class="data-table">
        <thead>
          <tr><th>Product</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in sales" :key="s.id">
            <td class="cell-primary">{{ s.product?.title || s.productId }}</td>
            <td>{{ s.buyer?.name || s.buyerId }}</td>
            <td>${{ Number(s.amount).toFixed(2) }}</td>
            <td><span :class="['badge', badgeClass(s.status)]">{{ s.status }}</span></td>
            <td class="text-muted">{{ new Date(s.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchSales()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchSales()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
.cell-primary { color: var(--text-primary); font-weight: 500; }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
