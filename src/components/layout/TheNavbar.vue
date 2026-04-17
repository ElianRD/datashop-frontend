<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Search, Menu, X, UserCircle, Sun, Moon, LayoutDashboard } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth.store'
import { useUiStore } from '../../stores/ui.store'
import { useRouter } from 'vue-router'

const isScrolled = ref(false)
const mobileOpen = ref(false)
const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

const handleLogout = () => {
  authStore.clearAuth()
  mobileOpen.value = false
  router.push('/')
}

const navigate = (path: string) => {
  mobileOpen.value = false
  router.push(path)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="['navbar-wrapper', { scrolled: isScrolled }]">
    <div class="container navbar">
      <div class="navbar-brand">
        <RouterLink to="/" class="logo interactive">
          <span class="logo-icon">▲</span>
          <span class="logo-text">DataShop</span>
        </RouterLink>
      </div>

      <div class="navbar-center hidden-mobile">
        <nav class="nav-links">
          <RouterLink to="/catalog" class="nav-link">Explore</RouterLink>
          <RouterLink to="/catalog" class="nav-link">Categories</RouterLink>
        </nav>
      </div>

      <div class="navbar-actions">
        <button class="icon-btn interactive" @click="uiStore.toggleTheme" :title="uiStore.isDark ? 'Light mode' : 'Dark mode'">
          <Sun v-if="uiStore.isDark" :size="20" />
          <Moon v-else :size="20" />
        </button>
        <button class="icon-btn interactive" title="Search" @click="navigate('/catalog')">
          <Search :size="20" />
        </button>

        <div class="auth-buttons hidden-mobile">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/login" class="btn btn-outline">Sign In</RouterLink>
            <RouterLink to="/register" class="btn btn-primary">Join Now</RouterLink>
          </template>
          <template v-else>
            <button class="btn btn-outline interactive" @click="navigate('/dashboard')" style="padding: 0.5rem 1rem;">
              <LayoutDashboard :size="18" style="margin-right: 0.4rem;" />
              Dashboard
            </button>
          </template>
        </div>

        <button class="menu-btn hidden-desktop icon-btn interactive" @click="mobileOpen = !mobileOpen">
          <X v-if="mobileOpen" :size="24" />
          <Menu v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-nav">
        <nav class="mobile-nav-links">
          <RouterLink to="/catalog" class="mobile-link" @click="mobileOpen = false">Explore</RouterLink>
          <RouterLink to="/catalog" class="mobile-link" @click="mobileOpen = false">Categories</RouterLink>
        </nav>
        <div class="mobile-divider" />
        <div class="mobile-auth">
          <template v-if="!authStore.isAuthenticated">
            <button class="btn btn-outline" style="width: 100%;" @click="navigate('/login')">Sign In</button>
            <button class="btn btn-primary" style="width: 100%;" @click="navigate('/register')">Join Now</button>
          </template>
          <template v-else>
            <button class="btn btn-outline" style="width: 100%;" @click="navigate('/dashboard')">
              <LayoutDashboard :size="18" /> Dashboard
            </button>
            <button class="btn btn-outline" style="width: 100%; border: none; color: var(--text-secondary);" @click="handleLogout">Log out</button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: all var(--transition-normal);
  padding: 1.5rem 0;
}

.navbar-wrapper.scrolled {
  padding: 1rem 0;
  background: var(--bg-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  color: var(--accent-secondary);
  font-size: 1.5rem;
}

.logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--text-primary);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.icon-btn:hover {
  background: var(--border-light);
  color: var(--accent-secondary);
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
  margin-left: 0.5rem;
}

.menu-btn {
  display: none;
}

/* ── Mobile Menu ── */
.mobile-nav {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-link {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 1rem;
}

.mobile-link:hover { background: var(--bg-input); color: var(--text-primary); }

.mobile-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.mobile-auth {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: all 0.2s ease;
}

.mobile-menu-enter-from, .mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .hidden-mobile { display: none !important; }
  .hidden-desktop { display: flex !important; }
}
</style>
