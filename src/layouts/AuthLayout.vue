<script setup lang="ts">
import TheNavbar from '../components/layout/TheNavbar.vue';
</script>

<template>
  <div class="auth-layout">
    <TheNavbar />
    <main class="auth-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(236, 72, 153, 0.06) 0%, transparent 60%),
    var(--bg-primary);
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--navbar-height);
}
</style>
