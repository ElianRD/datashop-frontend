<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { api } from '../../services/api';
import { Eye, ShoppingCart, Heart, UserCircle, ArrowLeft, AlertTriangle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ui = useUiStore();

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  views: number;
  publishedAt: string;
  category?: { name: string };
  seller?: { id: string; name: string; company: string };
}

const product = ref<Product | null>(null);
const loading = ref(true);
const purchasing = ref(false);
const isFavorited = ref(false);
const hasPurchased = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const showConfirm = ref(false);

const fetchProduct = async () => {
  loading.value = true;
  try {
    const res = await api.get(`/products/detail/${route.params.id}`);
    product.value = res.data;
  } catch {
    product.value = null;
  } finally {
    loading.value = false;
  }
};

const checkOwnership = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const res = await api.get(`/sales/check/${route.params.id}`);
    hasPurchased.value = res.data === true || res.data?.purchased === true;
  } catch { /* ignore */ }
};

const checkFavorite = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const res = await api.get(`/favorites/check/${route.params.id}`);
    isFavorited.value = res.data === true || res.data?.favorited === true;
  } catch { /* ignore */ }
};

const askPurchase = () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  showConfirm.value = true;
};

const confirmPurchase = async () => {
  showConfirm.value = false;
  errorMsg.value = '';
  purchasing.value = true;
  try {
    await api.post('/sales', { productId: route.params.id });
    successMsg.value = 'Purchase successful!';
    hasPurchased.value = true;
    ui.toast('Purchase successful!', 'success');
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Purchase failed.';
    ui.toast(errorMsg.value, 'error');
  } finally {
    purchasing.value = false;
  }
};

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  try {
    const res = await api.post(`/favorites/${route.params.id}`);
    isFavorited.value = res.data.favorited;
    ui.toast(isFavorited.value ? 'Added to favorites' : 'Removed from favorites', 'success');
  } catch { /* ignore */ }
};

onMounted(() => {
  fetchProduct();
  checkOwnership();
  checkFavorite();
});
</script>

<template>
  <div class="container detail-page animate-fade-in">
    <button class="back-link" @click="router.back()">
      <ArrowLeft :size="18" /> Back
    </button>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="!product" class="empty-state glass-panel">
      <p>Product not found.</p>
    </div>

    <div v-else class="detail-grid">
      <!-- Main content -->
      <div class="detail-main glass-panel">
        <div class="detail-header">
          <span v-if="product.category" class="badge badge-info">{{ product.category.name }}</span>
          <h1>{{ product.title }}</h1>
          <div class="detail-meta">
            <span><Eye :size="14" /> {{ product.views }} views</span>
            <span v-if="product.publishedAt">Published {{ new Date(product.publishedAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <div class="detail-body">
          <p>{{ product.description }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="detail-sidebar">
        <div class="glass-panel price-card">
          <div class="price">${{ Number(product.price).toFixed(2) }}</div>

          <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
          <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

          <button
            v-if="!hasPurchased"
            class="btn btn-primary"
            style="width: 100%;"
            :disabled="purchasing"
            @click="askPurchase"
          >
            <ShoppingCart :size="18" />
            {{ purchasing ? 'Processing...' : 'Buy Now' }}
          </button>
          <div v-else class="purchased-badge">
            <span class="badge badge-success">Purchased</span>
          </div>

          <button class="btn btn-outline" style="width: 100%; margin-top: 0.75rem;" @click="toggleFavorite">
            <Heart :size="18" :fill="isFavorited ? 'currentColor' : 'none'" />
            {{ isFavorited ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>
        </div>

        <!-- Seller info -->
        <div v-if="product.seller" class="glass-panel seller-card" @click="router.push(`/seller/${product.seller.id}`)">
          <div class="seller-info">
            <UserCircle :size="36" />
            <div>
              <strong>{{ product.seller.name }}</strong>
              <p v-if="product.seller.company" class="text-muted" style="font-size: 0.85rem;">{{ product.seller.company }}</p>
            </div>
          </div>
          <span style="font-size: 0.8rem; color: var(--accent-primary);">View Profile &rarr;</span>
        </div>
      </aside>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirm" class="confirm-overlay" @click.self="showConfirm = false">
        <div class="confirm-dialog">
          <div class="confirm-icon">
            <AlertTriangle :size="32" />
          </div>
          <h3>Confirm Purchase</h3>
          <p class="confirm-product">{{ product?.title }}</p>
          <p class="confirm-price">${{ Number(product?.price || 0).toFixed(2) }}</p>
          <p class="confirm-text">This amount will be deducted from your balance. This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn btn-primary" @click="confirmPurchase">
              <ShoppingCart :size="16" /> Confirm Purchase
            </button>
            <button class="btn btn-outline" @click="showConfirm = false">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.detail-page { padding: 2rem 1.5rem 4rem; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.back-link:hover { color: var(--text-primary); }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

.detail-main { padding: 2.5rem; }

.detail-header { margin-bottom: 2rem; }
.detail-header h1 { margin: 0.75rem 0 0.5rem; font-size: 2rem; }

.detail-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.detail-body p {
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
}

.price-card { padding: 2rem; }
.price {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.purchased-badge { text-align: center; padding: 0.5rem 0; }

.seller-card {
  padding: 1.25rem;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
}

.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  padding: 0.6rem 0.75rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
  font-size: 0.85rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  text-align: center;
}

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  padding: 0.6rem 0.75rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1rem;
  font-size: 0.85rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
  text-align: center;
}

/* ── Confirm Modal ── */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.confirm-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 12px);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.confirm-icon {
  color: var(--warning, #f59e0b);
  margin-bottom: 0.75rem;
}

.confirm-dialog h3 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.confirm-product {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.confirm-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 0.75rem;
}

.confirm-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.confirm-actions .btn { width: 100%; justify-content: center; }

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .confirm-dialog,
.modal-leave-active .confirm-dialog {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-dialog {
  transform: scale(0.95);
}

.modal-leave-to .confirm-dialog {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
