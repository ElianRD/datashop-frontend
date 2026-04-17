<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';

const ui = useUiStore();

const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const company = ref('');
const phone = ref('');

const errorMsg = ref('');
const successMsg = ref('');
const isLoading = ref(false);

const handleRegister = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMsg.value = 'Please fill in all required fields';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;
  try {
    await api.post('/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      company: company.value || undefined,
      phone: phone.value || undefined
    });

    successMsg.value = 'Account created! Check your email for the verification code.';
    ui.toast('Account created!', 'success');
    setTimeout(() => {
      router.push({ path: '/verify-email', query: { email: email.value } });
    }, 2000);
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Failed to create account. Email may already be in use.';
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
        <h2>Create an Account</h2>
        <p>Join the premier data marketplace</p>
      </div>

      <div v-if="errorMsg" class="error-alert">
        {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="success-alert">
        {{ successMsg }}
      </div>
      
      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="input-group">
          <label class="input-label">Full Name *</label>
          <input type="text" class="input-field" v-model="name" placeholder="John Doe" required />
        </div>

        <div class="input-group">
          <label class="input-label">Email Address *</label>
          <input type="email" class="input-field" v-model="email" placeholder="you@example.com" required />
        </div>
        
        <div class="input-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label class="input-label">Company (Optional)</label>
            <input type="text" class="input-field" v-model="company" placeholder="Acme Inc." />
          </div>
          <div>
            <label class="input-label">Phone (Optional)</label>
            <input type="tel" class="input-field" v-model="phone" placeholder="+12345678" />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Password *</label>
          <input type="password" class="input-field" v-model="password" placeholder="••••••••" required minlength="6" />
        </div>

        <div class="input-group">
          <label class="input-label">Confirm Password *</label>
          <input type="password" class="input-field" v-model="confirmPassword" placeholder="••••••••" required minlength="6" />
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" :disabled="isLoading">
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>
      
      <div class="auth-footer">
        <p>Already have an account? <RouterLink to="/login" style="color: var(--accent-primary); font-weight: 500;">Sign In</RouterLink></p>
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
  max-width: 500px;
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

.success-alert {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
  text-align: center;
}
</style>
