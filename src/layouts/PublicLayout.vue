<script setup lang="ts">
import TheNavbar from '../components/layout/TheNavbar.vue';
import TheFooter from '../components/layout/TheFooter.vue';
</script>

<template>
  <div class="public-layout">
    <TheNavbar />
    <main class="public-main">
      <router-view />
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-main {
  flex: 1;
  padding-top: var(--navbar-height);
}
</style>
