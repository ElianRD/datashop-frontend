import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  company?: string;
  balance?: number;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isSeller = computed(() => user.value?.role === 'seller');

  const setAuth = (newToken: string, userData: User) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('access_token', newToken);
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
  };

  const fetchProfile = async () => {
    if (!token.value) return;
    try {
      const response = await api.get('/users/me');
      user.value = response.data;
    } catch (error) {
      clearAuth();
    }
  };

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isSeller,
    setAuth,
    clearAuth,
    fetchProfile
  };
});
