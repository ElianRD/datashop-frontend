<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { Wallet } from 'lucide-vue-next';

const ui = useUiStore();

const authStore = useAuthStore();
const balance = ref(0);
const depositAmount = ref<number>(10);
const depositing = ref(false);
const depositResult = ref<{ invoiceId: string; paymentUrl: string; message: string } | null>(null);
const error = ref('');

const transactions = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loadingTx = ref(true);

const fetchBalance = async () => {
  await authStore.fetchProfile();
  balance.value = Number((authStore.user as any)?.balance || 0);
};

const fetchTransactions = async () => {
  loadingTx.value = true;
  try {
    const res = await api.get('/transactions', { params: { page: page.value, limit: 10 } });
    transactions.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { transactions.value = []; }
  finally { loadingTx.value = false; }
};

const deposit = async () => {
  if (depositAmount.value < 1) {
    error.value = 'Minimum deposit is $1.00';
    return;
  }
  error.value = '';
  depositing.value = true;
  depositResult.value = null;
  try {
    const res = await api.post('/payments/deposit', {
      amount: depositAmount.value,
      currency: 'LTCT',
    });
    depositResult.value = res.data;
    ui.toast('Deposit invoice created', 'info');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Deposit failed';
    ui.toast(error.value, 'error');
  } finally { depositing.value = false; }
};

const simulatePayment = async () => {
  if (!depositResult.value) return;
  try {
    await api.get(`/payments/mock-pay/${depositResult.value.invoiceId}`);
    depositResult.value = null;
    ui.toast('Payment confirmed! Balance updated.', 'success');
    fetchBalance();
    fetchTransactions();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Simulation failed';
    ui.toast(error.value, 'error');
  }
};

const badgeClass = (type: string) => {
  if (type === 'deposit') return 'badge-success';
  if (type === 'purchase') return 'badge-info';
  return 'badge-warning';
};

onMounted(() => {
  fetchBalance();
  fetchTransactions();
});
</script>

<template>
  <div class="animate-fade-in">
    <h1>Balance</h1>

    <div class="balance-hero glass-panel">
      <Wallet :size="28" class="text-muted" />
      <div class="balance-amount">${{ balance.toFixed(2) }}</div>
      <p class="text-muted">Available balance</p>
    </div>

    <div class="deposit-section glass-panel">
      <h3>Add Funds</h3>
      <p class="text-secondary" style="font-size:0.85rem;margin-bottom:1rem">Deposit via CoinPayments (mock mode).</p>

      <div v-if="error" class="error-banner">{{ error }}</div>

      <div v-if="depositResult" class="result-box">
        <p style="font-size:0.9rem"><strong>Invoice:</strong> {{ depositResult.invoiceId }}</p>
        <p class="text-secondary" style="font-size:0.85rem;margin-top:0.25rem">{{ depositResult.message }}</p>
        <button class="btn btn-primary" style="margin-top:0.75rem" @click="simulatePayment">Simulate Payment</button>
      </div>

      <form v-else @submit.prevent="deposit" class="deposit-form">
        <div class="input-group">
          <label class="input-label">Amount (USD)</label>
          <input class="input-field" type="number" min="1" step="0.01" v-model.number="depositAmount" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="depositing">
          {{ depositing ? 'Processing...' : 'Create Deposit' }}
        </button>
      </form>
    </div>

    <div class="tx-section">
      <h3>Transaction History</h3>

      <div v-if="loadingTx" class="loading-state"><div class="spinner" /></div>

      <div v-else-if="transactions.length === 0" class="empty">
        <p class="text-muted">No transactions yet.</p>
      </div>

      <div v-else class="table-wrapper glass-panel">
        <table class="data-table">
          <thead>
            <tr><th>Type</th><th>Amount</th><th>Status</th><th>Description</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in transactions" :key="t.id">
              <td><span :class="['badge', badgeClass(t.type)]">{{ t.type }}</span></td>
              <td class="cell-primary">${{ Number(t.amount).toFixed(2) }}</td>
              <td><span :class="['badge', t.status === 'completed' ? 'badge-success' : 'badge-warning']">{{ t.status }}</span></td>
              <td class="text-secondary" style="font-size:0.85rem;max-width:200px;overflow:hidden;text-overflow:ellipsis">{{ t.description || '-' }}</td>
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
  </div>
</template>

<style scoped>
.balance-hero { display: flex; flex-direction: column; align-items: center; padding: 2.5rem; margin-bottom: 1.5rem; text-align: center; }
.balance-amount { font-size: 2.5rem; font-weight: 700; color: var(--accent-primary); margin: 0.5rem 0; }

.deposit-section { padding: 1.5rem; margin-bottom: 2rem; }
.deposit-section h3 { margin-bottom: 0.5rem; }
.deposit-form { display: flex; align-items: flex-end; gap: 1rem; max-width: 400px; }
.deposit-form .input-group { flex: 1; }
.result-box { background: var(--bg-input); padding: 1rem; border-radius: var(--border-radius-sm); }
.error-banner { background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.75rem 1rem; border-radius: var(--border-radius-sm); margin-bottom: 1rem; font-size: 0.9rem; }

.tx-section { margin-top: 1rem; }
.tx-section h3 { margin-bottom: 1rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
.cell-primary { color: var(--text-primary); font-weight: 500; }
.empty { padding: 2rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 3rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
