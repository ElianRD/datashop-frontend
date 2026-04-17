<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { api } from '../../services/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const ui = useUiStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  if (!email.value || !password.value) {
    errorMsg.value = 'Please fill in all fields';
    return;
  }
  
  isLoading.value = true;
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });
    
    authStore.setAuth(response.data.accessToken, response.data.user);
    ui.toast(`Welcome back, ${response.data.user.name}!`, 'success');
    const redirect = (route.query.redirect as string) || '/dashboard';
    router.push(redirect);
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Failed to sign in. Please check your credentials.';
    ui.toast(errorMsg.value, 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container animate-fade-in">
    <div class="glass-panel auth-card">
      <div class="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access your digital assets</p>
      </div>
      
      <div v-if="errorMsg" class="error-alert">
        {{ errorMsg }}
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label class="input-label">Email Address</label>
          <input type="email" class="input-field" v-model="email" placeholder="you@example.com" required />
        </div>
        
        <div class="input-group">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label class="input-label">Password</label>
            <RouterLink to="/forgot-password" style="font-size: 0.85rem; color: var(--accent-secondary);">Forgot?</RouterLink>
          </div>
          <input type="password" class="input-field" v-model="password" placeholder="••••••••" required />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Don't have an account? <RouterLink to="/register" style="color: var(--accent-primary); font-weight: 500;">Join Now</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 300px);
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: var(--text-secondary);
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  text-align: center;
}
</style>
