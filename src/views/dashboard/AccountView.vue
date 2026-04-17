<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { api } from '../../services/api';
import { UserCircle, Mail, Phone, Building2, Shield, Calendar, Wallet } from 'lucide-vue-next';

const authStore = useAuthStore();
const ui = useUiStore();

const editing = ref(false);
const saving = ref(false);
const form = ref({ name: '', phone: '', company: '' });

const openEdit = () => {
  form.value = {
    name: authStore.user?.name || '',
    phone: authStore.user?.phone || '',
    company: authStore.user?.company || '',
  };
  editing.value = true;
};

const saveProfile = async () => {
  saving.value = true;
  try {
    await api.patch('/users/me', {
      name: form.value.name,
      phone: form.value.phone || undefined,
      company: form.value.company || undefined,
    });
    await authStore.fetchProfile();
    editing.value = false;
    ui.toast('Profile updated', 'success');
  } catch (err: any) {
    ui.toast(err.response?.data?.message || 'Failed to update profile', 'error');
  } finally {
    saving.value = false;
  }
};

const roleBadge = (role: string) => {
  const map: Record<string, string> = { admin: 'badge-danger', editor: 'badge-warning', seller: 'badge-info', buyer: 'badge-success' };
  return map[role] || 'badge-info';
};

const statusBadge = (status: string) => {
  if (status === 'active') return 'badge-success';
  if (status === 'pending') return 'badge-warning';
  return 'badge-danger';
};

onMounted(() => {
  authStore.fetchProfile();
});
</script>

<template>
  <div class="animate-fade-in">
    <h1>My Account</h1>
    <p class="text-secondary" style="margin-bottom: 1.5rem;">Your account information and settings.</p>

    <div class="account-grid">
      <!-- Profile Card -->
      <div class="glass-panel profile-card">
        <div class="profile-header">
          <div class="avatar">
            <UserCircle :size="64" />
          </div>
          <div>
            <h2>{{ authStore.user?.name }}</h2>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.35rem;">
              <span :class="['badge', roleBadge(authStore.user?.role || '')]">{{ authStore.user?.role }}</span>
              <span :class="['badge', statusBadge(authStore.user?.status || '')]">{{ authStore.user?.status }}</span>
            </div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row">
            <Mail :size="16" class="info-icon" />
            <span class="info-label">Email</span>
            <span class="info-value">{{ authStore.user?.email }}</span>
            <span v-if="authStore.user?.emailVerified" class="badge badge-success" style="font-size: 0.65rem;">Verified</span>
          </div>

          <div class="info-row">
            <Phone :size="16" class="info-icon" />
            <span class="info-label">Phone</span>
            <span class="info-value">{{ authStore.user?.phone || 'Not set' }}</span>
          </div>

          <div class="info-row">
            <Building2 :size="16" class="info-icon" />
            <span class="info-label">Company</span>
            <span class="info-value">{{ authStore.user?.company || 'Not set' }}</span>
          </div>

          <div class="info-row">
            <Shield :size="16" class="info-icon" />
            <span class="info-label">Role</span>
            <span class="info-value" style="text-transform: capitalize;">{{ authStore.user?.role }}</span>
          </div>

          <div class="info-row">
            <Wallet :size="16" class="info-icon" />
            <span class="info-label">Balance</span>
            <span class="info-value">${{ Number(authStore.user?.balance || 0).toFixed(2) }}</span>
          </div>

          <div class="info-row">
            <Calendar :size="16" class="info-icon" />
            <span class="info-label">Member since</span>
            <span class="info-value">{{ authStore.user?.createdAt ? new Date(authStore.user.createdAt).toLocaleDateString() : '-' }}</span>
          </div>
        </div>

        <div v-if="!editing" style="margin-top: 1.5rem;">
          <button class="btn btn-outline" @click="openEdit">Edit Profile</button>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="editing" class="glass-panel edit-card">
        <h3>Edit Profile</h3>
        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="input-group">
            <label class="input-label">Name</label>
            <input class="input-field" v-model="form.name" required />
          </div>
          <div class="input-group">
            <label class="input-label">Phone</label>
            <input class="input-field" v-model="form.phone" placeholder="Optional" />
          </div>
          <div class="input-group">
            <label class="input-label">Company</label>
            <input class="input-field" v-model="form.company" placeholder="Optional" />
          </div>
          <div class="edit-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="btn btn-outline" @click="editing = false">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Account ID -->
      <div class="glass-panel id-card">
        <h3>Account ID</h3>
        <code class="account-id">{{ authStore.user?.id }}</code>
        <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">Use this ID for support requests.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.profile-card {
  padding: 2rem;
  grid-column: 1 / -1;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.avatar {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.profile-header h2 {
  font-size: 1.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-light);
}

.info-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  min-width: 100px;
}

.info-value {
  color: var(--text-primary);
  font-size: 0.95rem;
  flex: 1;
}

.edit-card {
  padding: 2rem;
}

.edit-card h3 {
  margin-bottom: 1.25rem;
}

.edit-form {
  max-width: 400px;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.id-card {
  padding: 1.5rem;
}

.id-card h3 {
  margin-bottom: 0.75rem;
}

.account-id {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-input);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-sm);
  display: block;
  word-break: break-all;
}

@media (max-width: 768px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
</style>
