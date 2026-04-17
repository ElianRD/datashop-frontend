import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const routes: RouteRecordRaw[] = [
  // ── Public ──
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/public/HomeView.vue') },
      { path: 'catalog', name: 'catalog', component: () => import('../views/public/CatalogView.vue') },
      { path: 'product/:id', name: 'product-detail', component: () => import('../views/public/ProductDetailView.vue') },
      { path: 'seller/:id', name: 'seller-profile', component: () => import('../views/public/SellerProfileView.vue') },
    ],
  },

  // ── Auth ──
  {
    path: '/',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: 'login', name: 'login', component: () => import('../views/auth/LoginView.vue'), meta: { guest: true } },
      { path: 'register', name: 'register', component: () => import('../views/auth/RegisterView.vue'), meta: { guest: true } },
      { path: 'verify-email', name: 'verify-email', component: () => import('../views/auth/VerifyEmailView.vue') },
      { path: 'forgot-password', name: 'forgot-password', component: () => import('../views/auth/ForgotPasswordView.vue'), meta: { guest: true } },
    ],
  },

  // ── Dashboard (all roles) ──
  {
    path: '/dashboard',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Shared
      { path: '', name: 'dashboard', component: () => import('../views/dashboard/DashboardView.vue') },

      // Admin
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/AdminUsersView.vue'), meta: { roles: ['admin'] } },
      { path: 'categories', name: 'admin-categories', component: () => import('../views/admin/AdminCategoriesView.vue'), meta: { roles: ['admin'] } },
      { path: 'transactions', name: 'admin-transactions', component: () => import('../views/admin/AdminTransactionsView.vue'), meta: { roles: ['admin'] } },
      { path: 'claims', name: 'admin-claims', component: () => import('../views/admin/AdminClaimsView.vue'), meta: { roles: ['admin', 'editor'] } },
      { path: 'pending', name: 'admin-pending', component: () => import('../views/admin/AdminPendingView.vue'), meta: { roles: ['admin', 'editor'] } },

      // Seller
      { path: 'my-products', name: 'seller-products', component: () => import('../views/seller/SellerProductsView.vue'), meta: { roles: ['seller'] } },
      { path: 'my-products/new', name: 'seller-product-new', component: () => import('../views/seller/SellerProductFormView.vue'), meta: { roles: ['seller'] } },
      { path: 'my-products/:id/edit', name: 'seller-product-edit', component: () => import('../views/seller/SellerProductFormView.vue'), meta: { roles: ['seller'] } },
      { path: 'my-sales', name: 'seller-sales', component: () => import('../views/seller/SellerSalesView.vue'), meta: { roles: ['seller'] } },

      // Buyer
      { path: 'purchases', name: 'buyer-purchases', component: () => import('../views/buyer/BuyerPurchasesView.vue'), meta: { roles: ['buyer'] } },
      { path: 'favorites', name: 'buyer-favorites', component: () => import('../views/buyer/BuyerFavoritesView.vue'), meta: { roles: ['buyer'] } },
      { path: 'balance', name: 'buyer-balance', component: () => import('../views/buyer/BuyerBalanceView.vue'), meta: { roles: ['buyer'] } },
      { path: 'my-claims', name: 'my-claims', component: () => import('../views/dashboard/MyClaimsView.vue') },
      { path: 'notifications', name: 'notifications', component: () => import('../views/dashboard/NotificationsView.vue') },
      { path: 'account', name: 'account', component: () => import('../views/dashboard/AccountView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// ── Navigation Guard ──
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('access_token');

  if (to.meta.guest && token) {
    return next({ name: 'home' });
  }

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  const requiredRoles = to.meta.roles as string[] | undefined;
  if (requiredRoles && token) {
    const authStore = useAuthStore();
    if (!authStore.user) {
      await authStore.fetchProfile();
    }
    if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
      return next({ name: 'dashboard' });
    }
  }

  next();
});

export default router;
