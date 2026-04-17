<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../services/api';
import { useUiStore } from '../../stores/ui.store';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const ui = useUiStore();

const step = ref<1 | 2>(1);
const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleRequestCode = async () => {
  errorMsg.value = '';
  if (!email.value) {
    errorMsg.value = 'Please enter your email address';
    return;
  }

  isLoading.value = true;
  try {
    await api.post('/auth/forgot-password', { email: email.value });
    step.value = 2;
    ui.toast('If that email is registered, a reset code has been sent.', 'success');
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Something went wrong. Try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  errorMsg.value = '';

  if (!code.value || !newPassword.value || !confirmPassword.value) {
    errorMsg.value = 'Please fill in all fields';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match';
    return;
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters';
    return;
  }

  isLoading.value = true;
  try {
    await api.post('/auth/reset-password', {
      email: email.value,
      code: code.value,
      newPassword: newPassword.value,
    });
    ui.toast('Password reset successfully!', 'success');
    router.push('/login');
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message || 'Invalid or expired code. Try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container animate-fade-in">
    <div class="glass-panel auth-card">
      <!-- Step 1: Request code -->
      <template v-if="step === 1">
        <div class="auth-header">
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a reset code</p>
        </div>

        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>

        <form class="auth-form" @submit.prevent="handleRequestCode">
          <div class="input-group">
            <label class="input-label">Email Address</label>
            <input type="email" class="input-field" v-model="email" placeholder="you@example.com" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" :disabled="isLoading">
            {{ isLoading ? 'Sending...' : 'Send Reset Code' }}
          </button>
        </form>

        <div class="auth-footer">
          <RouterLink to="/login" class="back-link">
            <ArrowLeft :size="16" /> Back to Sign In
          </RouterLink>
        </div>
      </template>

      <!-- Step 2: Enter code + new password -->
      <template v-else>
        <div class="auth-header">
          <h2>Reset Password</h2>
          <p>Enter the 6-digit code sent to <strong>{{ email }}</strong></p>
        </div>

        <div v-if="errorMsg" class="error-alert">{{ errorMsg }}</div>

        <form class="auth-form" @submit.prevent="handleResetPassword">
          <div class="input-group">
            <label class="input-label">Reset Code</label>
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

          <div class="input-group">
            <label class="input-label">New Password</label>
            <input type="password" class="input-field" v-model="newPassword" placeholder="Min. 6 characters" required />
          </div>

          <div class="input-group">
            <label class="input-label">Confirm Password</label>
            <input type="password" class="input-field" v-model="confirmPassword" placeholder="Repeat password" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" :disabled="isLoading">
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 0.75rem;">
            Didn't receive it? <a href="#" style="color: var(--accent-primary); font-weight: 500;" @click.prevent="step = 1">Resend code</a>
          </p>
          <RouterLink to="/login" class="back-link">
            <ArrowLeft :size="16" /> Back to Sign In
          </RouterLink>
        </div>
      </template>
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--accent-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.back-link:hover { text-decoration: underline; }

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
</style>
