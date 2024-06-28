<template>
  <div class="social-links">
    <a href="https://github.com/ScrollyXYZ" target="_blank" class="social-link">
      <i class="fab fa-github"></i>
    </a>
    <a href="https://x.com/scrollyxyz" target="_blank" class="social-link">
      <i class="fab fa-x-twitter"></i>
    </a>
    <a href="https://t.me/ScrollyTheMap" target="_blank" class="social-link">
      <i class="fab fa-telegram"></i>
    </a>
  </div>
</template>

<script>
export default {
  name: "SocialLinks",
};
</script>

<style scoped>
.social-links {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 1000;
}

.social-link {
  color: var(--primary-color);
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-link:hover {
  color: #fff;
}
</style>
