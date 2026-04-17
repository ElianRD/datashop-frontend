<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { useRouter } from 'vue-router';
import { Heart } from 'lucide-vue-next';

const ui = useUiStore();

const router = useRouter();
const favorites = ref<any[]>([]);
const page = ref(1);
const totalPages = ref(1);
const loading = ref(true);

const fetchFavorites = async () => {
  loading.value = true;
  try {
    const res = await api.get('/favorites', { params: { page: page.value, limit: 20 } });
    favorites.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch { favorites.value = []; }
  finally { loading.value = false; }
};

const removeFavorite = async (productId: string) => {
  await api.post(`/favorites/${productId}`);
  favorites.value = favorites.value.filter(f => (f.productId || f.product?.id) !== productId);
  ui.toast('Removed from favorites', 'success');
};

onMounted(fetchFavorites);
</script>

<template>
  <div class="animate-fade-in">
    <h1>My Favorites</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">Products you've saved for later.</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="favorites.length === 0" class="empty glass-panel">
      <Heart :size="32" class="text-muted" />
      <p class="text-muted">No favorites yet. Browse the catalog and save products you like.</p>
    </div>

    <div v-else class="favorites-grid">
      <div v-for="f in favorites" :key="f.id" class="fav-card glass-panel">
        <div class="fav-info" @click="router.push({ name: 'product-detail', params: { id: f.productId || f.product?.id } })">
          <strong class="cell-primary">{{ f.product?.title || 'Product' }}</strong>
          <p class="text-muted" style="font-size:0.85rem;margin-top:0.25rem">${{ Number(f.product?.price || 0).toFixed(2) }}</p>
        </div>
        <button class="icon-action danger" title="Remove from favorites" @click.stop="removeFavorite(f.productId || f.product?.id)">
          <Heart :size="16" fill="currentColor" />
        </button>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button class="btn btn-outline" :disabled="page<=1" @click="page--;fetchFavorites()">Prev</button>
      <span class="text-secondary" style="font-size:0.9rem">{{ page }}/{{ totalPages }}</span>
      <button class="btn btn-outline" :disabled="page>=totalPages" @click="page++;fetchFavorites()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.favorites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.fav-card { padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; }
.fav-info { cursor: pointer; flex: 1; min-width: 0; }
.fav-info:hover .cell-primary { color: var(--accent-primary); }
.cell-primary { color: var(--text-primary); transition: color 0.2s; }
.icon-action { background: none; border: none; color: var(--danger); cursor: pointer; padding: 0.4rem; border-radius: var(--border-radius-sm); flex-shrink: 0; }
.icon-action:hover { background: rgba(239, 68, 68, 0.1); }
.empty { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem 2rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
</style>
