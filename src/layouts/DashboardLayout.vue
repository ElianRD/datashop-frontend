<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useUiStore } from '../stores/ui.store';
import { api } from '../services/api';
import {
  LayoutDashboard, Package, ShoppingCart, CreditCard, Users,
  FolderTree, AlertTriangle, Clock, Heart, Wallet,
  Bell, UserCircle, LogOut, Menu, X, Sun, Moon, Settings
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const role = computed(() => authStore.user?.role || 'buyer');
const dropdownOpen = ref(false);
const unreadCount = ref(0);

const initials = computed(() => {
  const name = authStore.user?.name || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '??';
});

const fetchUnread = async () => {
  try {
    const res = await api.get('/notifications/unread-count');
    unreadCount.value = res.data?.count ?? 0;
  } catch { /* ignore */ }
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.topbar-user')) {
    dropdownOpen.value = false;
  }
};

const navigateTo = (path: string) => {
  dropdownOpen.value = false;
  router.push(path);
};

onMounted(() => {
  fetchUnread();
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});

const menuItems = computed(() => {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'editor', 'seller', 'buyer'] },
  ];

  if (role.value === 'admin') {
    items.push(
      { to: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
      { to: '/dashboard/categories', label: 'Categories', icon: FolderTree, roles: ['admin'] },
      { to: '/dashboard/pending', label: 'Pending Review', icon: Clock, roles: ['admin'] },
      { to: '/dashboard/transactions', label: 'Transactions', icon: CreditCard, roles: ['admin'] },
      { to: '/dashboard/claims', label: 'Claims', icon: AlertTriangle, roles: ['admin'] },
    );
  }

  if (role.value === 'editor') {
    items.push(
      { to: '/dashboard/pending', label: 'Pending Review', icon: Clock, roles: ['editor'] },
      { to: '/dashboard/claims', label: 'My Claims', icon: AlertTriangle, roles: ['editor'] },
    );
  }

  if (role.value === 'seller') {
    items.push(
      { to: '/dashboard/my-products', label: 'My Products', icon: Package, roles: ['seller'] },
      { to: '/dashboard/my-sales', label: 'Sales History', icon: ShoppingCart, roles: ['seller'] },
      { to: '/dashboard/my-claims', label: 'My Claims', icon: AlertTriangle, roles: ['seller'] },
    );
  }

  if (role.value === 'buyer') {
    items.push(
      { to: '/dashboard/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['buyer'] },
      { to: '/dashboard/favorites', label: 'Favorites', icon: Heart, roles: ['buyer'] },
      { to: '/dashboard/balance', label: 'Balance', icon: Wallet, roles: ['buyer'] },
      { to: '/dashboard/my-claims', label: 'My Claims', icon: AlertTriangle, roles: ['buyer'] },
    );
  }

  items.push(
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'editor', 'seller', 'buyer'] },
    { to: '/dashboard/account', label: 'My Account', icon: UserCircle, roles: ['admin', 'editor', 'seller', 'buyer'] },
  );

  return items;
});

const handleLogout = () => {
  authStore.clearAuth();
  window.location.href = '/';
};
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside :class="['sidebar', { open: uiStore.sidebarOpen }]">
      <div class="sidebar-header">
        <RouterLink to="/" class="sidebar-brand">
          <span class="logo-icon">&#9650;</span>
          <span class="logo-text">DataShop</span>
        </RouterLink>
        <button class="close-btn hidden-desktop" @click="uiStore.toggleSidebar">
          <X :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: route.path === item.to }]"
          @click="uiStore.sidebarOpen = false"
        >
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <span class="sidebar-avatar">{{ initials }}</span>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name">{{ authStore.user?.name || 'User' }}</span>
            <span class="sidebar-user-role">{{ authStore.user?.role || 'buyer' }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="uiStore.sidebarOpen" class="overlay hidden-desktop" @click="uiStore.sidebarOpen = false" />

    <!-- Main -->
    <div class="dashboard-main">
      <header class="dashboard-topbar">
        <button class="menu-toggle hidden-desktop" @click="uiStore.toggleSidebar">
          <Menu :size="22" />
        </button>

        <div class="topbar-actions">
          <button class="topbar-icon-btn" @click="uiStore.toggleTheme" title="Toggle theme">
            <Sun v-if="uiStore.isDark" :size="20" />
            <Moon v-else :size="20" />
          </button>

          <button class="topbar-icon-btn" @click="navigateTo('/dashboard/notifications')" title="Notifications">
            <Bell :size="20" />
            <span v-if="unreadCount > 0" class="notif-dot" />
          </button>

          <div class="topbar-user">
            <button class="avatar-btn" @click="toggleDropdown">
              <span class="avatar-initials">{{ initials }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="dropdownOpen" class="user-dropdown">
                <div class="dropdown-header">
                  <span class="dropdown-name">{{ authStore.user?.name }}</span>
                  <span class="dropdown-email">{{ authStore.user?.email }}</span>
                </div>
                <div class="dropdown-divider" />
                <button class="dropdown-item" @click="navigateTo('/dashboard/account')">
                  <UserCircle :size="16" />
                  <span>Profile</span>
                </button>
                <button class="dropdown-item" @click="navigateTo('/dashboard/notifications')">
                  <Bell :size="16" />
                  <span>Notifications</span>
                  <span v-if="unreadCount > 0" class="dropdown-badge">{{ unreadCount }}</span>
                </button>
                <button class="dropdown-item" @click="navigateTo('/dashboard/account')">
                  <Settings :size="16" />
                  <span>Settings</span>
                </button>
                <div class="dropdown-divider" />
                <button class="dropdown-item dropdown-logout" @click="handleLogout">
                  <LogOut :size="16" />
                  <span>Log out</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <main class="dashboard-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  transition: transform var(--transition-normal);
}

.sidebar-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon { color: var(--accent-secondary); font-size: 1.2rem; }
.logo-text { font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: var(--font-sans);
}

.nav-item:hover { background: var(--bg-input); color: var(--text-primary); }
.nav-item.active { background: rgba(124, 58, 237, 0.12); color: var(--accent-primary); }

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.sidebar-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.sidebar-user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-user-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  font-size: 0.82rem;
  color: var(--accent-primary);
  text-transform: capitalize;
}

/* ── Overlay ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 190;
}

/* ── Main area ── */
.dashboard-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

.dashboard-topbar {
  height: 60px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 50;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  margin-right: auto;
}

/* ── Topbar Actions ── */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.topbar-icon-btn:hover {
  background: var(--bg-input);
  color: var(--text-primary);
}

.notif-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-primary);
  border: 2px solid var(--bg-secondary);
}

/* ── Avatar ── */
.topbar-user {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--text-primary);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.avatar-btn:hover {
  opacity: 0.85;
}

.avatar-initials {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bg-primary);
  letter-spacing: 0.02em;
  font-family: var(--font-sans);
}

/* ── Dropdown ── */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md, 12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 300;
  padding: 0.5rem 0;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dropdown-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dropdown-email {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.35rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-input);
  color: var(--text-primary);
}

.dropdown-logout:hover {
  color: var(--danger);
}

.dropdown-badge {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--accent-primary);
  color: #fff;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* ── Dropdown transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.dashboard-content {
  flex: 1;
  padding: 2rem 1.5rem;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .dashboard-main {
    margin-left: 0;
  }
}
</style>
