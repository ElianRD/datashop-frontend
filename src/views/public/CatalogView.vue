<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../services/api';
import { Search, SlidersHorizontal, Eye } from 'lucide-vue-next';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  views: number;
  category?: { name: string };
  seller?: { name: string; id: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const router = useRouter();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(false);

// Filters
const search = ref('');
const categoryId = ref('');
const sortBy = ref('createdAt');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');

let searchTimeout: ReturnType<typeof setTimeout>;

const fetchProducts = async () => {
  loading.value = true;
  try {
    const params: Record<string, string | number> = {
      page: page.value,
      limit: 12,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    };
    if (search.value) params.search = search.value;
    if (categoryId.value) params.categoryId = categoryId.value;

    const res = await api.get('/products', { params });
    products.value = res.data.data;
    total.value = res.data.total;
    totalPages.value = res.data.totalPages;
  } catch {
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data;
  } catch {
    categories.value = [];
  }
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    fetchProducts();
  }, 400);
};

const applyFilter = () => {
  page.value = 1;
  fetchProducts();
};

watch([sortBy, sortOrder, categoryId], applyFilter);

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<template>
  <div class="catalog container animate-fade-in">
    <div class="catalog-header">
      <div>
        <h1>Explore Datasets</h1>
        <p class="text-secondary">{{ total }} products available</p>
      </div>
    </div>

    <!-- Filters bar -->
    <div class="filters glass-panel">
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input
          type="text"
          class="input-field"
          v-model="search"
          placeholder="Search datasets..."
          @input="handleSearch"
        />
      </div>

      <select class="input-field filter-select" v-model="categoryId">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>

      <select class="input-field filter-select" v-model="sortBy">
        <option value="createdAt">Newest</option>
        <option value="price">Price</option>
        <option value="views">Most Viewed</option>
        <option value="title">Name</option>
      </select>

      <button class="btn btn-outline" @click="sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC'">
        <SlidersHorizontal :size="16" />
        {{ sortOrder === 'DESC' ? 'Desc' : 'Asc' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="empty-state glass-panel">
      <p>No datasets found matching your criteria.</p>
    </div>

    <!-- Products grid -->
    <div v-else class="products-grid">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-card glass-panel interactive"
        @click="router.push(`/product/${product.id}`)"
      >
        <div class="product-body">
          <span v-if="product.category" class="badge badge-info">{{ product.category.name }}</span>
          <h3 class="product-title">{{ product.title }}</h3>
          <p class="product-desc">{{ product.description?.slice(0, 100) }}{{ product.description?.length > 100 ? '...' : '' }}</p>
        </div>
        <div class="product-footer">
          <span class="product-price">${{ Number(product.price).toFixed(2) }}</span>
          <span class="product-views"><Eye :size="14" /> {{ product.views }}</span>
        </div>
        <div v-if="product.seller" class="product-seller">
          by {{ product.seller.name }}
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page <= 1" @click="page--; fetchProducts()">Prev</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page >= totalPages" @click="page++; fetchProducts()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.catalog {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.catalog-header {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-box .input-field {
  padding-left: 2.5rem;
}

.filter-select {
  min-width: 140px;
  cursor: pointer;
}

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

.product-body {
  flex: 1;
}

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

.loading-state {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .filters { flex-direction: column; }
  .filter-select { width: 100%; }
}
</style>
