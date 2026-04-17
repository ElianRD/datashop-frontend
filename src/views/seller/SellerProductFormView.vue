<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { useRouter, useRoute } from 'vue-router';
import { Upload, X, FileText, Image } from 'lucide-vue-next';

const ui = useUiStore();
const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const saving = ref(false);
const categories = ref<any[]>([]);

const form = ref({
  title: '',
  description: '',
  price: 0,
  fileUrl: '',
  previewUrl: '',
  categoryId: '',
});

const fileUploading = ref(false);
const previewUploading = ref(false);
const fileName = ref('');
const previewName = ref('');

const errors = ref<Record<string, string>>({});

const validate = () => {
  errors.value = {};
  if (form.value.title.length < 3) errors.value.title = 'Title must be at least 3 characters';
  if (form.value.description.length < 10) errors.value.description = 'Description must be at least 10 characters';
  if (form.value.price < 0.01) errors.value.price = 'Price must be at least $0.01';
  return Object.keys(errors.value).length === 0;
};

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch { categories.value = []; }
};

const fetchProduct = async () => {
  if (!isEdit.value) return;
  loading.value = true;
  try {
    const res = await api.get(`/products/detail/${route.params.id}`);
    const p = res.data;
    form.value = {
      title: p.title,
      description: p.description,
      price: Number(p.price),
      fileUrl: p.fileUrl || '',
      previewUrl: p.previewUrl || '',
      categoryId: p.categoryId || '',
    };
    if (p.fileUrl) fileName.value = p.fileUrl.split('/').pop() || 'Uploaded file';
    if (p.previewUrl) previewName.value = p.previewUrl.split('/').pop() || 'Uploaded preview';
  } catch {
    router.push({ name: 'seller-products' });
  } finally { loading.value = false; }
};

const uploadFile = async (file: File, type: 'file' | 'preview') => {
  const formData = new FormData();
  formData.append('file', file);

  if (type === 'file') fileUploading.value = true;
  else previewUploading.value = true;

  try {
    const res = await api.post('/uploads', formData, {
      headers: { 'Content-Type': undefined as any },
    });

    if (type === 'file') {
      form.value.fileUrl = res.data.url;
      fileName.value = file.name;
    } else {
      form.value.previewUrl = res.data.url;
      previewName.value = file.name;
    }
    ui.toast(`${type === 'file' ? 'File' : 'Preview'} uploaded`, 'success');
  } catch (err: any) {
    ui.toast(err.response?.data?.message || 'Upload failed', 'error');
  } finally {
    if (type === 'file') fileUploading.value = false;
    else previewUploading.value = false;
  }
};

const onFileChange = (e: Event, type: 'file' | 'preview') => {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) {
    uploadFile(input.files[0], type);
  }
};

const onDrop = (e: DragEvent, type: 'file' | 'preview') => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file) uploadFile(file, type);
};

const clearUpload = (type: 'file' | 'preview') => {
  if (type === 'file') {
    form.value.fileUrl = '';
    fileName.value = '';
  } else {
    form.value.previewUrl = '';
    previewName.value = '';
  }
};

const save = async () => {
  if (!validate()) return;
  saving.value = true;
  try {
    const payload: any = {
      title: form.value.title,
      description: form.value.description,
      price: form.value.price,
    };
    if (form.value.fileUrl) payload.fileUrl = form.value.fileUrl;
    if (form.value.previewUrl) payload.previewUrl = form.value.previewUrl;
    if (form.value.categoryId) payload.categoryId = form.value.categoryId;

    if (isEdit.value) {
      await api.patch(`/products/${route.params.id}`, payload);
      ui.toast('Product updated', 'success');
    } else {
      await api.post('/products', payload);
      ui.toast('Product created', 'success');
    }
    router.push({ name: 'seller-products' });
  } catch (err: any) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) {
      errors.value.server = msg.join(', ');
    } else {
      errors.value.server = msg || 'Failed to save product';
    }
  } finally { saving.value = false; }
};

onMounted(() => {
  fetchCategories();
  fetchProduct();
});
</script>

<template>
  <div class="animate-fade-in">
    <h1>{{ isEdit ? 'Edit Product' : 'New Product' }}</h1>
    <p class="text-secondary" style="margin-bottom:1.5rem">{{ isEdit ? 'Update your product details.' : 'List a new digital product for sale.' }}</p>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>

    <form v-else class="glass-panel form-panel" @submit.prevent="save">
      <div v-if="errors.server" class="error-banner">{{ errors.server }}</div>

      <div class="input-group">
        <label class="input-label">Title *</label>
        <input class="input-field" v-model="form.title" placeholder="Product title" />
        <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
      </div>

      <div class="input-group">
        <label class="input-label">Description *</label>
        <textarea class="input-field textarea" v-model="form.description" placeholder="Describe your product in detail..." rows="4" />
        <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label class="input-label">Price (USD) *</label>
          <input class="input-field" type="number" step="0.01" min="0.01" v-model.number="form.price" />
          <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
        </div>

        <div class="input-group">
          <label class="input-label">Category</label>
          <select class="input-field" v-model="form.categoryId">
            <option value="">No category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <!-- Product File Upload -->
      <div class="input-group">
        <label class="input-label">Product File</label>
        <div v-if="form.fileUrl" class="uploaded-file">
          <FileText :size="18" />
          <span class="uploaded-name">{{ fileName }}</span>
          <button type="button" class="clear-btn" @click="clearUpload('file')"><X :size="16" /></button>
        </div>
        <label
          v-else
          class="drop-zone"
          :class="{ uploading: fileUploading }"
          @dragover.prevent
          @drop="onDrop($event, 'file')"
        >
          <input type="file" class="file-input" @change="onFileChange($event, 'file')" :disabled="fileUploading" />
          <div v-if="fileUploading" class="drop-zone-content">
            <div class="spinner spinner-sm" />
            <span>Uploading...</span>
          </div>
          <div v-else class="drop-zone-content">
            <Upload :size="24" />
            <span>Drop file here or <strong>click to browse</strong></span>
            <span class="drop-hint">Max 50 MB — PDF, ZIP, CSV, XLSX, JSON, etc.</span>
          </div>
        </label>
      </div>

      <!-- Preview Image Upload -->
      <div class="input-group">
        <label class="input-label">Preview Image</label>
        <div v-if="form.previewUrl" class="uploaded-file has-preview">
          <img :src="'http://localhost:3000' + form.previewUrl" alt="preview" class="preview-thumb" />
          <span class="uploaded-name">{{ previewName }}</span>
          <button type="button" class="clear-btn" @click="clearUpload('preview')"><X :size="16" /></button>
        </div>
        <label
          v-else
          class="drop-zone"
          :class="{ uploading: previewUploading }"
          @dragover.prevent
          @drop="onDrop($event, 'preview')"
        >
          <input type="file" accept="image/*" class="file-input" @change="onFileChange($event, 'preview')" :disabled="previewUploading" />
          <div v-if="previewUploading" class="drop-zone-content">
            <div class="spinner spinner-sm" />
            <span>Uploading...</span>
          </div>
          <div v-else class="drop-zone-content">
            <Image :size="24" />
            <span>Drop image here or <strong>click to browse</strong></span>
            <span class="drop-hint">JPG, PNG, GIF, WebP</span>
          </div>
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
        </button>
        <button type="button" class="btn btn-outline" @click="router.push({ name: 'seller-products' })">Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-panel { padding: 2rem; max-width: 640px; }
.textarea { resize: vertical; min-height: 100px; font-family: var(--font-sans); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
.field-error { font-size: 0.8rem; color: var(--danger); margin-top: 0.25rem; }
.error-banner { background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 0.75rem 1rem; border-radius: var(--border-radius-sm); margin-bottom: 1rem; font-size: 0.9rem; }
.loading-state { display: flex; justify-content: center; padding: 4rem 0; }

/* ── Drop Zone ── */
.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--bg-input);
}

.drop-zone:hover {
  border-color: var(--accent-primary);
  background: rgba(124, 58, 237, 0.05);
}

.drop-zone.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
}

.drop-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* ── Uploaded File ── */
.uploaded-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.uploaded-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.clear-btn:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.preview-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
