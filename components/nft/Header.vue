<template>
  <nav
    class="nft-hs-header-container"
    :class="{
      'nft-hs-dark-mode': isDarkMode,
      'nft-hs-light-mode': !isDarkMode,
    }"
  >
    <div class="nft-hs-header-content">
      <div class="nft-hs-header-brand" href="#">Scrolly's Workshop</div>
      <div class="nft-hs-header-links d-none d-xl-flex">
        <NuxtLink class="nft-hs-header-link" to="/nft">
          <span class="emoji-wrapper">
            <span class="emoji">🏠</span>
            <span class="text">Home</span>
          </span>
        </NuxtLink>
        <NuxtLink class="nft-hs-header-link" to="/nft/latest">
          <span class="emoji-wrapper">
            <span class="emoji">🔍</span>
            <span class="text">Explorer</span>
          </span>
        </NuxtLink>
        <NuxtLink class="nft-hs-header-link" to="/nft/swiper">
          <span class="emoji-wrapper">
            <span class="emoji">🌟</span>
            <span class="text">Discovery</span>
          </span>
        </NuxtLink>
        <NuxtLink class="nft-hs-header-link" to="/nft/mynfts">
          <span class="emoji-wrapper">
            <span class="emoji">🖼️</span>
            <span class="text">My Gallery</span>
          </span>
        </NuxtLink>
        <NuxtLink class="nft-hs-header-link" to="/nft/create">
          <span class="emoji-wrapper">
            <span class="emoji">🎨</span>
            <span class="text">Create</span>
          </span>
        </NuxtLink>
      </div>
    </div>
    <div class="nft-hs-header-mobile-nav d-xl-none">
      <NuxtLink class="nft-hs-header-mobile-link" to="/nft">
        <span class="emoji">🏠</span>
        <span>Home</span>
      </NuxtLink>
      <NuxtLink class="nft-hs-header-mobile-link" to="/nft/latest">
        <span class="emoji">🔍</span>
        <span>Explorer</span>
      </NuxtLink>
      <div class="nft-hs-header-add-button-wrapper">
        <NuxtLink class="nft-hs-header-add-button" to="/nft/create">
          <i class="bi bi-plus"></i>
          <span class="text">Create</span>
        </NuxtLink>
      </div>
      <NuxtLink class="nft-hs-header-mobile-link" to="/nft/swiper">
        <span class="emoji">🌟</span>
        <span>Discovery</span>
      </NuxtLink>
      <NuxtLink class="nft-hs-header-mobile-link" to="/nft/mynfts">
        <span class="emoji">🖼️</span>
        <span>My NFTs</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script>
import { computed } from "vue";
import { useThemeStore } from "~/store/theme";

export default {
  name: "Header",
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    return { isDarkMode };
  },
};
</script>

<style scoped>
@import "animate.css";

.nft-hs-header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 20px;
}

.nft-hs-header-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}

.nft-hs-header-brand {
  font-weight: bold;
  font-size: 1.75rem;
  text-decoration: none;
  color: white;
  text-align: left;
}

.nft-hs-header-links {
  display: flex;
  gap: 15px;
  margin-left: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 30px;
  padding: 5px;
}

.nft-hs-header-link {
  font-size: 1.1rem;
  transition: color 0.3s ease;
  text-decoration: none;
  position: relative;
  display: flex;
  align-items: center;
}

.emoji-wrapper {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.emoji {
  display: inline-block;
  transition: transform 0.5s ease;
  font-size: 1.5em;
  margin-right: 10px;
}

.text {
  display: inline-block;
  transform: translateX(-10px);
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
  white-space: nowrap;
  color: white;
}

.nft-hs-header-link:hover .emoji {
  transform: translateX(-5px);
}

.nft-hs-header-link:hover .text {
  opacity: 1;
  transform: translateX(0);
}

/* Set header links to always be white in desktop view */
@media (min-width: 992px) {
  .nft-hs-header-brand,
  .nft-hs-header-link {
    color: #fff !important; /* White color for visibility */
  }
}

.nft-hs-header-link:hover {
  color: #aaa !important; /* Light gray color on hover */
}

.nft-hs-header-add-button-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px;
}

.nft-hs-header-add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--button-background-color);
  color: var(--button-text-color);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 2rem;
  text-decoration: none;
  position: relative;
}

.nft-hs-header-add-button .text {
  display: none;
}

.nft-hs-header-add-button:hover .text {
  display: inline-block;
  margin-left: 10px;
  position: absolute;
  left: 100%;
  white-space: nowrap;
}

/* Mobile navigation styles */
.nft-hs-header-mobile-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: var(--background-color);
  border-top: 1px solid var(--border-color);
  padding: 10px 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999; /* Increase z-index to ensure it is above all other elements */
}

.nft-hs-header-mobile-nav .nft-hs-header-mobile-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.9rem;
}

.nft-hs-header-mobile-nav .nft-hs-header-mobile-link i {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.nft-hs-header-mobile-nav .nft-hs-header-mobile-link .emoji {
  margin-right: 5px;
}

/* Set mobile links to always be white in dark mode */
.nft-hs-dark-mode .nft-hs-header-mobile-link,
.nft-hs-dark-mode .nft-hs-header-mobile-link i,
.nft-hs-dark-mode .nft-hs-header-mobile-link span {
  color: #fff !important; /* White color for visibility */
}

.nft-hs-header-mobile-nav .nft-hs-header-mobile-link:hover {
  color: #aaa !important; /* Light gray color on hover */
}

/* Ensure hover effect in dark mode for mobile links */
.nft-hs-dark-mode .nft-hs-header-mobile-link:hover,
.nft-hs-dark-mode .nft-hs-header-mobile-link:hover i,
.nft-hs-dark-mode .nft-hs-header-mobile-link:hover span {
  color: #aaa !important; /* Light gray color on hover */
}

@media (min-width: 1199px) {
  .nft-hs-header-mobile-nav {
    display: none;
  }
}

.nft-hs-light-mode {
  --background-color: #ffffff;
  --border-color: #ccc;
  --button-background-color: #007bff;
  --button-text-color: #fff;
}

.nft-hs-dark-mode {
  --background-color: #2c2c2c;
  --border-color: #555;
  --button-background-color: #ff4c4c;
  --button-text-color: #fff;
}
</style>
