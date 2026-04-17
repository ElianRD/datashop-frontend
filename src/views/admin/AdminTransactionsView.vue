<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';

const transactions = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const res = await api.get('/transactions/all', { params: { page: page.value, limit: 20 } });
    transactions.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { transactions.value = []; }
  finally { loading.value = false; }
};

const badgeClass = (type: string) => {
  if (type === 'deposit') return 'badge-success';
  if (type === 'purchase') return 'badge-info';
  return 'badge-warning';
};

onMounted(fetchTransactions);
</script>

<template>
  <div class="animate-fade-in">
    <h1>All Transactions</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Platform-wide transaction history.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else class="table-wrapper glass-panel">
      <table class="data-table">
        <thead>
          <tr><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th><th>Date</th></tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id">
            <td class="cell-primary">{{ t.user?.name || t.userId }}</td>
            <td><span :class="['badge', badgeClass(t.type)]">{{ t.type }}</span></td>
            <td>${{ Number(t.amount).toFixed(2) }}</td>
            <td><span :class="['badge', t.status === 'completed' ? 'badge-success' : 'badge-warning']">{{ t.status }}</span></td>
            <td class="text-muted" style="font-size:0.8rem;max-width:120px;overflow:hidden;text-overflow:ellipsis">{{ t.reference || '-' }}</td>
            <td class="text-muted">{{ new Date(t.createdAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchTransactions()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchTransactions()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
.cell-primary { color: var(--text-primary); font-weight: 500; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
