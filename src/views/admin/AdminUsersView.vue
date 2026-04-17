<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { DollarSign, X } from 'lucide-vue-next';

const ui = useUiStore();

const users = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const roles = ['buyer', 'seller', 'editor', 'admin'];
const statuses = ['pending', 'active', 'inactive'];

// Balance modal
const balanceModal = ref(false);
const balanceUser = ref<any>(null);
const balanceAmount = ref(0);
const balanceSaving = ref(false);

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await api.get('/users', { params: { page: page.value, limit: 15 } });
    users.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { users.value = []; }
  finally { loading.value = false; }
};

const changeRole = async (id: string, role: string) => {
  await api.patch(`/users/${id}/role`, { role });
  ui.toast(`Role updated to ${role}`, 'success');
  fetchUsers();
};

const changeStatus = async (id: string, status: string) => {
  await api.patch(`/users/${id}/status`, { status });
  ui.toast(`Status updated to ${status}`, 'success');
  fetchUsers();
};

const openBalanceModal = (user: any) => {
  balanceUser.value = user;
  balanceAmount.value = 0;
  balanceModal.value = true;
};

const submitBalance = async () => {
  if (!balanceUser.value || balanceAmount.value === 0) return;
  balanceSaving.value = true;
  try {
    await api.patch(`/users/${balanceUser.value.id}/balance`, { amount: balanceAmount.value });
    ui.toast(`Balance adjusted by $${balanceAmount.value.toFixed(2)} for ${balanceUser.value.name}`, 'success');
    balanceModal.value = false;
    fetchUsers();
  } catch (err: any) {
    ui.toast(err.response?.data?.message || 'Failed to update balance', 'error');
  } finally {
    balanceSaving.value = false;
  }
};

onMounted(fetchUsers);
</script>

<template>
  <div class="animate-fade-in">
    <h1>User Management</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Manage accounts, roles, status, and balance.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else class="table-wrapper glass-panel">
      <table class="data-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Balance</th><th>Joined</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td class="cell-primary">{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select class="mini-select" :value="u.role" @change="changeRole(u.id, ($event.target as HTMLSelectElement).value)">
                <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
              </select>
            </td>
            <td>
              <select class="mini-select" :value="u.status" @change="changeStatus(u.id, ($event.target as HTMLSelectElement).value)">
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
            <td>${{ Number(u.balance || 0).toFixed(2) }}</td>
            <td class="text-muted">{{ new Date(u.createdAt).toLocaleDateString() }}</td>
            <td>
              <button class="icon-action" title="Adjust balance" @click="openBalanceModal(u)">
                <DollarSign :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchUsers()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchUsers()">Next</button>
    </div>
  </div>

  <!-- Balance Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="balanceModal" class="modal-overlay" @click.self="balanceModal = false">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Adjust Balance</h3>
            <button class="modal-close" @click="balanceModal = false"><X :size="18" /></button>
          </div>

          <div class="modal-body">
            <p class="modal-user-name">{{ balanceUser?.name }}</p>
            <p class="modal-user-email">{{ balanceUser?.email }}</p>
            <p class="modal-current">Current balance: <strong>${{ Number(balanceUser?.balance || 0).toFixed(2) }}</strong></p>

            <div class="input-group" style="margin-top: 1rem;">
              <label class="input-label">Amount (use negative to deduct)</label>
              <input class="input-field" type="number" step="0.01" v-model.number="balanceAmount" />
            </div>

            <p v-if="balanceAmount !== 0" class="modal-preview">
              New balance:
              <strong :class="{ 'text-danger': (Number(balanceUser?.balance || 0) + balanceAmount) < 0 }">
                ${{ (Number(balanceUser?.balance || 0) + balanceAmount).toFixed(2) }}
              </strong>
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" :disabled="balanceAmount === 0 || balanceSaving" @click="submitBalance">
              {{ balanceSaving ? 'Saving...' : 'Apply' }}
            </button>
            <button class="btn btn-outline" @click="balanceModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { text-align: left; padding: 0.75rem 1rem; color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
.cell-primary { color: var(--text-primary); font-weight: 500; }
.mini-select { background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: var(--border-radius-sm); padding: 0.3rem 0.5rem; font-size: 0.8rem; font-family: var(--font-sans); cursor: pointer; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }

.icon-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.icon-action:hover { background: var(--bg-input); color: var(--accent-primary); }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 12px);
  width: 100%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 { font-size: 1.05rem; }

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}
.modal-close:hover { color: var(--text-primary); }

.modal-body { padding: 1.5rem; }
.modal-user-name { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
.modal-user-email { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.modal-current { font-size: 0.9rem; color: var(--text-secondary); }
.modal-preview { font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.75rem; }
.text-danger { color: var(--danger); }

.modal-footer {
  display: flex;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal-dialog, .modal-leave-active .modal-dialog { transition: transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-dialog { transform: scale(0.95); }
.modal-leave-to .modal-dialog { transform: scale(0.95); }
</style>
