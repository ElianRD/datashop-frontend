<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { Plus, X } from 'lucide-vue-next';

const ui = useUiStore();

const claims = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const showForm = ref(false);
const saving = ref(false);
const form = ref({
  claimType: '',
  description: '',
  productId: '',
  saleId: '',
});

const claimTypes = [
  'Product not delivered',
  'Product not as described',
  'Payment issue',
  'Account problem',
  'Other',
];

const statusBadge = (s: string) => {
  if (s === 'open') return 'badge-danger';
  if (s === 'in_progress') return 'badge-warning';
  return 'badge-success';
};

const statusLabel = (s: string) => {
  if (s === 'open') return 'Open';
  if (s === 'in_progress') return 'In Progress';
  return 'Resolved';
};

const fetchClaims = async () => {
  loading.value = true;
  try {
    const res = await api.get('/claims/my', { params: { page: page.value, limit: 10 } });
    claims.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { claims.value = []; }
  finally { loading.value = false; }
};

const openForm = () => {
  form.value = { claimType: '', description: '', productId: '', saleId: '' };
  showForm.value = true;
};

const submitClaim = async () => {
  if (!form.value.claimType || form.value.description.length < 10) {
    ui.toast('Please select a type and write at least 10 characters', 'error');
    return;
  }
  saving.value = true;
  try {
    const payload: any = {
      claimType: form.value.claimType,
      description: form.value.description,
    };
    if (form.value.productId) payload.productId = form.value.productId;
    if (form.value.saleId) payload.saleId = form.value.saleId;

    await api.post('/claims', payload);
    ui.toast('Claim submitted successfully', 'success');
    showForm.value = false;
    fetchClaims();
  } catch (err: any) {
    const msg = err.response?.data?.message;
    ui.toast(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to submit claim', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(fetchClaims);
</script>

<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <div>
        <h1>My Claims</h1>
        <p class="text-secondary">Submit and track your disputes or issues.</p>
      </div>
      <button class="btn btn-primary" @click="openForm">
        <Plus :size="18" /> New Claim
      </button>
    </div>

    <!-- New Claim Form -->
    <Transition name="slide">
      <div v-if="showForm" class="glass-panel form-card">
        <div class="form-header">
          <h3>Submit a Claim</h3>
          <button class="close-btn" @click="showForm = false"><X :size="18" /></button>
        </div>

        <form @submit.prevent="submitClaim">
          <div class="input-group">
            <label class="input-label">Claim Type *</label>
            <select class="input-field" v-model="form.claimType" required>
              <option value="" disabled>Select a type...</option>
              <option v-for="t in claimTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="input-group">
            <label class="input-label">Description *</label>
            <textarea
              class="input-field textarea"
              v-model="form.description"
              placeholder="Describe your issue in detail (min 10 characters)..."
              rows="4"
              required
            />
          </div>

          <div class="form-row">
            <div class="input-group">
              <label class="input-label">Product ID <span class="text-muted">(optional)</span></label>
              <input class="input-field" v-model="form.productId" placeholder="UUID of the product" />
            </div>
            <div class="input-group">
              <label class="input-label">Sale ID <span class="text-muted">(optional)</span></label>
              <input class="input-field" v-model="form.saleId" placeholder="UUID of the sale" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Submitting...' : 'Submit Claim' }}
            </button>
            <button type="button" class="btn btn-outline" @click="showForm = false">Cancel</button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Claims List -->
    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="claims.length === 0 && !showForm" class="empty glass-panel">
      <p class="text-muted">You haven't submitted any claims yet.</p>
    </div>

    <div v-else class="claims-list">
      <div v-for="c in claims" :key="c.id" class="claim-card glass-panel">
        <div class="claim-top">
          <div class="claim-top-left">
            <strong>{{ c.claimType }}</strong>
            <span :class="['badge', statusBadge(c.status)]">{{ statusLabel(c.status) }}</span>
          </div>
          <span class="text-muted claim-date">{{ new Date(c.createdAt).toLocaleDateString() }}</span>
        </div>

        <p class="claim-desc">{{ c.description }}</p>

        <div v-if="c.product" class="claim-ref">
          Product: <strong>{{ c.product.title }}</strong>
        </div>

        <div v-if="c.response" class="response-box">
          <span class="response-label">Response from support:</span>
          <p>{{ c.response }}</p>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page <= 1" @click="page--; fetchClaims()">Prev</button>
      <span class="text-secondary" style="font-size: 0.9rem">{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page >= totalPages" @click="page++; fetchClaims()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-header h1 { margin-bottom: 0.25rem; }

/* ── Form ── */
.form-card {
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.form-header h3 { font-size: 1.05rem; }

.close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.textarea {
  resize: vertical;
  min-height: 100px;
  font-family: var(--font-sans);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* ── Claims List ── */
.claims-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.claim-card { padding: 1.5rem; }

.claim-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.claim-top-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.claim-top-left strong {
  color: var(--text-primary);
  font-size: 0.95rem;
}

.claim-date { font-size: 0.8rem; }

.claim-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.claim-ref {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.response-box {
  background: var(--bg-input);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  margin-top: 0.75rem;
}

.response-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.response-box p {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-top: 0.35rem;
  line-height: 1.5;
}

.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }

/* ── Slide transition ── */
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 600px) {
  .page-header { flex-direction: column; gap: 1rem; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
