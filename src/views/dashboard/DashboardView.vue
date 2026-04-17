<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../services/api';
import { Package, ShoppingCart, DollarSign, Users, Eye, TrendingUp } from 'lucide-vue-next';

const authStore = useAuthStore();
const role = computed(() => authStore.user?.role || 'buyer');

const stats = ref<Record<string, any>>({});
const loading = ref(true);

const fetchStats = async () => {
  loading.value = true;
  try {
    if (role.value === 'admin') {
      const [productRes, salesRes, txRes, usersRes] = await Promise.all([
        api.get('/products/stats'),
        api.get('/sales/stats'),
        api.get('/transactions/global-stats'),
        api.get('/users'),
      ]);
      stats.value = {
        products: productRes.data,
        sales: salesRes.data,
        transactions: txRes.data,
        totalUsers: usersRes.data.total,
      };
    } else if (role.value === 'seller') {
      const [productsRes, salesRes, txRes] = await Promise.all([
        api.get('/products/mine', { params: { limit: 1 } }),
        api.get('/sales/my-sales', { params: { limit: 1 } }),
        api.get('/transactions/stats'),
      ]);
      stats.value = {
        totalProducts: productsRes.data.total,
        totalSales: salesRes.data.total,
        transactions: txRes.data,
      };
    } else if (role.value === 'buyer') {
      const [purchasesRes, favsRes, txRes] = await Promise.all([
        api.get('/sales/purchases', { params: { limit: 1 } }),
        api.get('/favorites', { params: { limit: 1 } }),
        api.get('/transactions/stats'),
      ]);
      stats.value = {
        totalPurchases: purchasesRes.data.total,
        totalFavorites: favsRes.data.total,
        transactions: txRes.data,
      };
    }
  } catch {
    /* stats are optional */
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);
</script>

<template>
  <div class="animate-fade-in">
    <h1>Dashboard</h1>
    <p class="text-secondary" style="margin-bottom: 2rem;">
      Welcome back, {{ authStore.user?.name || 'User' }}.
    </p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else class="stats-grid">
      <!-- Admin stats -->
      <template v-if="role === 'admin'">
        <div class="stat-card glass-panel">
          <div class="stat-icon"><Users :size="24" /></div>
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><Package :size="24" /></div>
          <div class="stat-value">{{ stats.products?.totalViews || 0 }}</div>
          <div class="stat-label">Total Views</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><ShoppingCart :size="24" /></div>
          <div class="stat-value">{{ stats.sales?.totalSales || 0 }}</div>
          <div class="stat-label">Total Sales</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><DollarSign :size="24" /></div>
          <div class="stat-value">${{ Number(stats.sales?.totalRevenue || 0).toFixed(2) }}</div>
          <div class="stat-label">Revenue</div>
        </div>
      </template>

      <!-- Seller stats -->
      <template v-if="role === 'seller'">
        <div class="stat-card glass-panel">
          <div class="stat-icon"><Package :size="24" /></div>
          <div class="stat-value">{{ stats.totalProducts || 0 }}</div>
          <div class="stat-label">My Products</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><ShoppingCart :size="24" /></div>
          <div class="stat-value">{{ stats.totalSales || 0 }}</div>
          <div class="stat-label">Sales</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><TrendingUp :size="24" /></div>
          <div class="stat-value">${{ Number(stats.transactions?.purchase?.total || 0).toFixed(2) }}</div>
          <div class="stat-label">Revenue</div>
        </div>
      </template>

      <!-- Buyer stats -->
      <template v-if="role === 'buyer'">
        <div class="stat-card glass-panel">
          <div class="stat-icon"><ShoppingCart :size="24" /></div>
          <div class="stat-value">{{ stats.totalPurchases || 0 }}</div>
          <div class="stat-label">Purchases</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><Eye :size="24" /></div>
          <div class="stat-value">{{ stats.totalFavorites || 0 }}</div>
          <div class="stat-label">Favorites</div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-icon"><DollarSign :size="24" /></div>
          <div class="stat-value">${{ Number(authStore.user?.balance || 0).toFixed(2) }}</div>
          <div class="stat-label">Balance</div>
        </div>
      </template>

      <!-- Editor stats -->
      <template v-if="role === 'editor'">
        <div class="stat-card glass-panel">
          <div class="stat-icon"><Package :size="24" /></div>
          <div class="stat-value">-</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-icon { color: var(--accent-secondary); }
.stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 0.85rem; color: var(--text-muted); }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
</style>
