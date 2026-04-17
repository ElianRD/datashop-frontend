<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { Plus, Pencil, Trash2 } from 'lucide-vue-next';

const ui = useUiStore();

interface Category { id: string; name: string; slug: string; description: string; parentId: string | null; }

const categories = ref<Category[]>([]);
const loading = ref(true);
const showForm = ref(false);
const editing = ref<Category | null>(null);

const form = ref({ name: '', description: '', parentId: '' });

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch { categories.value = []; }
  finally { loading.value = false; }
};

const openCreate = () => { editing.value = null; form.value = { name: '', description: '', parentId: '' }; showForm.value = true; };
const openEdit = (cat: Category) => { editing.value = cat; form.value = { name: cat.name, description: cat.description, parentId: cat.parentId || '' }; showForm.value = true; };

const save = async () => {
  const payload: any = { name: form.value.name, description: form.value.description };
  if (form.value.parentId) payload.parentId = form.value.parentId;

  if (editing.value) {
    await api.patch(`/categories/${editing.value.id}`, payload);
    ui.toast('Category updated', 'success');
  } else {
    await api.post('/categories', payload);
    ui.toast('Category created', 'success');
  }
  showForm.value = false;
  fetchCategories();
};

const remove = async (id: string) => {
  if (!confirm('Delete this category?')) return;
  await api.delete(`/categories/${id}`);
  ui.toast('Category deleted', 'success');
  fetchCategories();
};

onMounted(fetchCategories);
</script>

<template>
  <div class="animate-fade-in">
    <div class="page-header">
      <h1>Categories</h1>
      <button class="btn btn-primary" @click="openCreate"><Plus :size="16" /> New Category</button>
    </div>

    <!-- Inline form -->
    <div v-if="showForm" class="glass-panel form-panel">
      <h3>{{ editing ? 'Edit Category' : 'New Category' }}</h3>
      <form @submit.prevent="save" class="inline-form">
        <div class="input-group">
          <label class="input-label">Name</label>
          <input class="input-field" v-model="form.name" required />
        </div>
        <div class="input-group">
          <label class="input-label">Description</label>
          <input class="input-field" v-model="form.description" />
        </div>
        <div class="input-group">
          <label class="input-label">Parent Category</label>
          <select class="input-field" v-model="form.parentId">
            <option value="">None (root)</option>
            <option v-for="c in categories" :key="c.id" :value="c.id" :disabled="c.id === editing?.id">{{ c.name }}</option>
          </select>
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:0.5rem">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-outline" @click="showForm=false">Cancel</button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <div v-else-if="categories.length === 0" class="empty glass-panel">
      <p class="text-muted">No categories yet. Create one to get started.</p>
    </div>

    <div v-else class="cat-grid">
      <div v-for="cat in categories" :key="cat.id" class="cat-card glass-panel">
        <div>
          <strong class="cell-primary">{{ cat.name }}</strong>
          <p class="text-muted" style="font-size:0.85rem">{{ cat.slug }}</p>
          <p class="text-secondary" style="font-size:0.85rem;margin-top:0.25rem">{{ cat.description }}</p>
        </div>
        <div class="cat-actions">
          <button class="icon-action" @click="openEdit(cat)"><Pencil :size="14" /></button>
          <button class="icon-action danger" @click="remove(cat.id)"><Trash2 :size="14" /></button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.form-panel { padding: 1.5rem; margin-bottom: 1.5rem; }
.form-panel h3 { margin-bottom: 1rem; }
.inline-form { max-width: 500px; }
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.cat-card { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; }
.cell-primary { color: var(--text-primary); }
.cat-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.icon-action { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.3rem; border-radius: var(--border-radius-sm); }
.icon-action:hover { color: var(--text-primary); background: var(--bg-input); }
.icon-action.danger:hover { color: var(--danger); }
.empty { padding: 3rem; text-align: center; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }
</style>
