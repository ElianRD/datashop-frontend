<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '../../services/api';

const router = useRouter();
const route = useRoute();

const code = ref('');
const email = ref((route.query.email as string) || '');
const errorMsg = ref('');
const successMsg = ref('');
const isLoading = ref(false);

const handleVerify = async () => {
  errorMsg.value = '';
  if (!email.value || !code.value) {
    errorMsg.value = 'Please enter your email and verification code';
    return;
  }

  isLoading.value = true;
  try {
    await api.post('/auth/verify-email', {
      email: email.value,
      code: code.value,
    });
    successMsg.value = 'Email verified successfully! Redirecting to login...';
    setTimeout(() => router.push('/login'), 2500);
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Invalid or expired verification code.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container animate-fade-in">
    <div class="glass-panel auth-card">
      <div class="auth-header">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code we sent to your inbox</p>
      </div>

      <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>
      <div v-if="successMsg" class="success-alert">{{ successMsg }}</div>

      <form class="auth-form" @submit.prevent="handleVerify">
        <div class="input-group" v-if="!route.query.email">
          <label class="input-label">Email Address</label>
          <input type="email" class="input-field" v-model="email" placeholder="you@example.com" required />
        </div>

        <div class="input-group">
          <label class="input-label">Verification Code</label>
          <input
            type="text"
            class="input-field code-input"
            v-model="code"
            placeholder="000000"
            maxlength="6"
            pattern="\d{6}"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" :disabled="isLoading">
          {{ isLoading ? 'Verifying...' : 'Verify Email' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>Didn't receive a code? <a href="#" style="color: var(--accent-primary); font-weight: 500;">Resend</a></p>
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

.auth-header { text-align: center; margin-bottom: 2.5rem; }
.auth-header h2 { font-size: 2rem; margin-bottom: 0.5rem; }
.auth-header p { color: var(--text-secondary); }

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.code-input {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
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
