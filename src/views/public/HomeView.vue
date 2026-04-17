<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../services/api';
import { ArrowRight, Database, Shield, Zap, Eye } from 'lucide-vue-next';

const router = useRouter();

const recentProducts = ref<any[]>([]);
const loadingProducts = ref(true);

const fetchRecent = async () => {
  try {
    const res = await api.get('/products', { params: { limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' } });
    recentProducts.value = res.data.data || [];
  } catch { recentProducts.value = []; }
  finally { loadingProducts.value = false; }
};

onMounted(fetchRecent);
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero glass-panel animate-fade-in">
      <div class="hero-content">
        <h1 class="hero-title">
          Fuel Your Future with <br />
          <span class="text-gradient">Premium Data</span>
        </h1>
        <p class="hero-subtitle">
          The exclusive marketplace for high-quality datasets, industry reports, and actionable insights. Built for professionals.
        </p>
        <div class="hero-actions">
          <router-link to="/catalog" class="btn btn-primary btn-lg">
            Explore Datasets <ArrowRight :size="20" />
          </router-link>
          <router-link to="/register?role=seller" class="btn btn-outline btn-lg">
            Become a Seller
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features container">
      <div class="feature-card interactive" @click="router.push('/catalog')">
        <div class="feature-icon"><Database :size="32" /></div>
        <h3>Curated Collections</h3>
        <p>Every dataset is manually reviewed by our editors to ensure the highest quality and accuracy.</p>
      </div>
      <div class="feature-card interactive" @click="router.push('/register')">
        <div class="feature-icon"><Shield :size="32" /></div>
        <h3>Secure Transactions</h3>
        <p>Solid refund policies and a claims system protect both buyers and sellers.</p>
      </div>
      <div class="feature-card interactive" @click="router.push('/catalog')">
        <div class="feature-icon"><Zap :size="32" /></div>
        <h3>Instant Access</h3>
        <p>Download your data immediately after purchase. No waiting, no friction.</p>
      </div>
    </section>

    <!-- Recent Products -->
    <section class="recent container">
      <div class="section-header">
        <h2>Recently Published</h2>
        <router-link to="/catalog" class="view-all">
          View all <ArrowRight :size="16" />
        </router-link>
      </div>

      <div v-if="loadingProducts" class="loading-state"><div class="spinner" /></div>

      <div v-else-if="recentProducts.length === 0" class="empty-hint">
        <p class="text-muted">No products available yet. Be the first to publish!</p>
      </div>

      <div v-else class="products-grid">
        <div
          v-for="p in recentProducts"
          :key="p.id"
          class="product-card glass-panel interactive"
          @click="router.push(`/product/${p.id}`)"
        >
          <div class="product-body">
            <span v-if="p.category" class="badge badge-info">{{ p.category.name }}</span>
            <h3 class="product-title">{{ p.title }}</h3>
            <p class="product-desc">{{ p.description?.slice(0, 80) }}{{ p.description?.length > 80 ? '...' : '' }}</p>
          </div>
          <div class="product-footer">
            <span class="product-price">${{ Number(p.price).toFixed(2) }}</span>
            <span class="product-views"><Eye :size="14" /> {{ p.views }}</span>
          </div>
          <div v-if="p.seller" class="product-seller">by {{ p.seller.name }}</div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta container">
      <div class="cta-card glass-panel">
        <h2>Ready to monetize your data?</h2>
        <p class="text-secondary">Join as a seller and reach thousands of data professionals looking for quality datasets.</p>
        <div class="cta-actions">
          <router-link to="/register?role=seller" class="btn btn-primary">
            Start Selling <ArrowRight :size="18" />
          </router-link>
          <router-link to="/catalog" class="btn btn-outline">
            Browse as Buyer
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-bottom: 4rem;
}

.hero {
  margin: 2rem 2rem 0;
  padding: 6rem 2rem;
  text-align: center;
  border-radius: var(--border-radius-lg);
  background: radial-gradient(circle at center, rgba(109, 40, 217, 0.15) 0%, transparent 70%);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* ── Features ── */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 2.5rem;
  border-radius: var(--border-radius-lg);
  backdrop-filter: var(--glass-blur);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.feature-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.feature-icon {
  color: var(--accent-secondary);
  margin-bottom: 1.5rem;
  display: inline-flex;
  padding: 1rem;
  background: rgba(236, 72, 153, 0.1);
  border-radius: var(--border-radius-md);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
}

/* ── Recent Products ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 { font-size: 1.5rem; }

.view-all {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.view-all:hover { text-decoration: underline; }

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-body { flex: 1; }

.product-title {
  font-size: 1.1rem;
  margin: 0.75rem 0 0.5rem;
}

.product-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.product-views {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.product-seller {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.empty-hint { text-align: center; padding: 2rem 0; }
.loading-state { display: flex; justify-content: center; padding: 3rem 0; }

/* ── CTA ── */
.cta-card {
  text-align: center;
  padding: 4rem 2rem;
  border-radius: var(--border-radius-lg);
  background: radial-gradient(circle at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%);
}

.cta-card h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.cta-card p {
  max-width: 500px;
  margin: 0 auto 2rem;
  font-size: 1.05rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-actions { flex-direction: column; }
  .hero { margin: 1rem; padding: 3rem 1rem; }
  .cta-card { padding: 3rem 1.5rem; }
  .cta-card h2 { font-size: 1.5rem; }
  .cta-actions { flex-direction: column; }
}
</style>
