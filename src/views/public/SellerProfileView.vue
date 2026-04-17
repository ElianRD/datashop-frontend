<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { api } from '../../services/api';
import { UserCircle, Users, Package, Eye, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ui = useUiStore();

const seller = ref<any>(null);
const products = ref<any[]>([]);
const followerCount = ref(0);
const isFollowing = ref(false);
const loading = ref(true);

const fetchSeller = async () => {
  try {
    const res = await api.get(`/sellers/${route.params.id}`);
    seller.value = res.data;
    followerCount.value = res.data.followerCount || 0;
  } catch { seller.value = null; }
};

const fetchSellerProducts = async () => {
  try {
    const res = await api.get('/products', { params: { sellerId: route.params.id, limit: 20 } });
    const data = res.data;
    products.value = Array.isArray(data) ? data : data.data || [];
  } catch { products.value = []; }
};

const checkFollowing = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const res = await api.get(`/followers/check/${route.params.id}`);
    isFollowing.value = res.data === true;
  } catch { /* ignore */ }
};

const toggleFollow = async () => {
  if (!authStore.isAuthenticated) return router.push('/login');
  try {
    const res = await api.post(`/followers/${route.params.id}`);
    isFollowing.value = res.data.following;
    followerCount.value += isFollowing.value ? 1 : -1;
    ui.toast(isFollowing.value ? 'Following seller' : 'Unfollowed seller', 'success');
  } catch { /* ignore */ }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchSeller(), fetchSellerProducts(), checkFollowing()]);
  loading.value = false;
});
</script>

<template>
  <div class="container seller-page animate-fade-in">
    <button class="back-link" @click="router.back()">
      <ArrowLeft :size="18" /> Back
    </button>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="!seller" class="empty-state glass-panel">
      <p>Seller not found.</p>
    </div>

    <template v-else>
      <!-- Profile header -->
      <div class="profile-header glass-panel">
        <div class="profile-info">
          <UserCircle :size="64" class="profile-avatar" />
          <div>
            <h1>{{ seller.name }}</h1>
            <p v-if="seller.company" class="text-secondary">{{ seller.company }}</p>
            <div class="profile-stats">
              <span><Users :size="14" /> {{ followerCount }} followers</span>
              <span><Package :size="14" /> {{ products.length }} products</span>
            </div>
          </div>
        </div>
        <button
          v-if="authStore.user?.id !== seller.id"
          :class="['btn', isFollowing ? 'btn-outline' : 'btn-primary']"
          @click="toggleFollow"
        >
          {{ isFollowing ? 'Unfollow' : 'Follow' }}
        </button>
      </div>

      <!-- Products -->
      <section class="seller-products">
        <h2>Products</h2>
        <div v-if="products.length === 0" class="text-muted" style="padding: 2rem 0;">
          This seller hasn't published any products yet.
        </div>
        <div v-else class="products-grid">
          <div
            v-for="p in products"
            :key="p.id"
            class="product-card glass-panel interactive"
            @click="router.push(`/product/${p.id}`)"
          >
            <span v-if="p.category" class="badge badge-info">{{ p.category.name }}</span>
            <h3>{{ p.title }}</h3>
            <p class="text-secondary" style="font-size: 0.85rem; margin: 0.5rem 0;">
              {{ p.description?.slice(0, 80) }}{{ p.description?.length > 80 ? '...' : '' }}
            </p>
            <div class="card-footer">
              <span class="card-price">${{ Number(p.price).toFixed(2) }}</span>
              <span class="card-views"><Eye :size="14" /> {{ p.views }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.seller-page { padding: 2rem 1.5rem 4rem; }

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

.profile-header {
  padding: 2rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar { color: var(--text-muted); }
.profile-info h1 { margin-bottom: 0.25rem; }

.profile-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.profile-stats span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.seller-products { margin-top: 2rem; }
.seller-products h2 { margin-bottom: 1.5rem; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  padding: 1.5rem;
  cursor: pointer;
}

.product-card h3 { margin-top: 0.75rem; font-size: 1.05rem; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.card-price { font-weight: 700; color: var(--text-primary); font-size: 1.1rem; }

.card-views {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }

@media (max-width: 768px) {
  .profile-header { flex-direction: column; gap: 1.5rem; text-align: center; }
  .profile-info { flex-direction: column; }
  .profile-stats { justify-content: center; }
}
</style>
