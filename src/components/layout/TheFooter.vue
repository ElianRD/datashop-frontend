<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <span class="logo-icon">▲</span>
            <span class="logo-text">DataShop</span>
          </div>
          <p class="footer-desc">
            The premium marketplace for digital data, reports, and exclusive insights.
          </p>
        </div>
        
        <div class="footer-links">
          <h4>Explore</h4>
          <ul>
            <li><a href="#">Categories</a></li>
            <li><a href="#">Trending Datasets</a></li>
            <li><a href="#">Top Sellers</a></li>
            <li><a href="#">New Releases</a></li>
          </ul>
        </div>
        
        <div class="footer-links">
          <h4>For Sellers</h4>
          <ul>
            <li><a href="#">Open a Shop</a></li>
            <li><a href="#">Seller Guidelines</a></li>
            <li><a href="#">Payouts</a></li>
          </ul>
        </div>
        
        <div class="footer-links">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Contact Support</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} DataShop. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--bg-secondary);
  padding: 5rem 0 2rem;
  margin-top: 4rem;
  border-top: 1px solid var(--border-color);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.logo-icon {
  color: var(--accent-secondary);
  font-size: 1.5rem;
}

.logo-text {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.footer-desc {
  color: var(--text-secondary);
  max-width: 300px;
}

.footer-links h4 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.footer-links ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.footer-links a {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: var(--accent-secondary);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
