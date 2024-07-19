<template>
  <div
    :class="{
      'dark-mode': isDarkMode,
      'light-mode': !isDarkMode,
    }"
  >
    <div v-if="showTopMenu" class="hub-social-nav-container">
      <div class="hub-selection-header">
        <div class="hub-welcome-message">💬 Welcome to the Hub</div>
        <p>Select a discussion room:</p>
      </div>
      <div class="hub-nav-bar d-none d-xl-flex">
        <ul class="hub-nav">
          <li class="hub-nav-item">
            <NuxtLink
              to="/"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-border-0"
              :class="$route.path === '/' ? 'hub-active' : ''"
            >
              🗨️ General discussion
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/equilibre-memes"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="
                $route.path.startsWith('/equilibre-memes') ? 'hub-active' : ''
              "
            >
              🎉 Equilibre meme contest
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/memes-images"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="
                $route.path.startsWith('/memes-images') ? 'hub-active' : ''
              "
            >
              📸 Share images & NFTs
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/shill"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="$route.path.startsWith('/shill') ? 'hub-active' : ''"
            >
              🚀 Shill & discuss projects
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/notifications"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="
                $route.path.startsWith('/notifications') ? 'hub-active' : ''
              "
            >
              🔔
              <span
                class="hub-badge"
                v-if="
                  !notificationsStore.getLoadingNotifications &&
                  notificationsStore.getUnreadNotificationsCount > 0
                "
              >
                {{ notificationsStore.getUnreadNotificationsCount }}
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
    <!-- Mobile Navigation -->
    <div v-if="showTopMenu" class="hub-mobile-nav d-xl-none">
      <button @click="openModal" class="hub-mobile-nav-button">
        📑 Select Channel
      </button>
      <NuxtLink class="hub-mobile-nav-button" to="/profile"> 👤 </NuxtLink>
      <NuxtLink class="hub-mobile-nav-button" to="/notifications">
        🔔
        <span
          class="hub-badge"
          v-if="
            !notificationsStore.getLoadingNotifications &&
            notificationsStore.getUnreadNotificationsCount > 0
          "
        >
          {{ notificationsStore.getUnreadNotificationsCount }}
        </span>
      </NuxtLink>
    </div>
    <div v-if="isModalOpen" class="hub-modal">
      <div class="hub-modal-content">
        <span @click="closeModal" class="hub-modal-close">&times;</span>
        <div class="hub-modal-title">Select a Discussion Room</div>
        <ul class="hub-nav">
          <li class="hub-nav-item">
            <NuxtLink
              to="/"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="$route.path === '/' ? 'hub-active' : ''"
              @click="closeModal"
            >
              🗨️ General discussion
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/equilibre-memes"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="
                $route.path.startsWith('/equilibre-memes') ? 'hub-active' : ''
              "
              @click="closeModal"
            >
              🎉 Equilibre meme contest
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/memes-images"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="
                $route.path.startsWith('/memes-images') ? 'hub-active' : ''
              "
              @click="closeModal"
            >
              📸 Share images & NFTs
            </NuxtLink>
          </li>
          <li class="hub-nav-item">
            <NuxtLink
              to="/shill"
              class="hub-list-group-item hub-cursor-pointer hub-hover-color hub-bg-light hub-border-0"
              :class="$route.path.startsWith('/shill') ? 'hub-active' : ''"
              @click="closeModal"
            >
              🚀 Shill & discuss projects
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useNotificationsStore } from "~/store/notifications";
import { useThemeStore } from "~/store/theme";

export default {
  name: "HubSocialNav",
  setup() {
    const notificationsStore = useNotificationsStore();
    const themeStore = useThemeStore();
    const isModalOpen = ref(false);
    const route = useRoute();

    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const showTopMenu = computed(() => {
      const paths = [
        "/",
        "/equilibre-memes",
        "/memes-images",
        "/shill",
        "/memes-contest",
      ];
      return paths.includes(route.path);
    });

    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      notificationsStore,
      isModalOpen,
      openModal,
      closeModal,
      showTopMenu,
      route,
      isDarkMode,
    };
  },
};
</script>
<style scoped>
.hub-social-nav-container {
  width: 100%;
  margin: 0 auto;
  padding: 1em;
  background-color: #f8f9fa; /* light mode background */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark-mode .hub-social-nav-container {
  background-color: #2c2c2c; /* dark mode background */
}

.hub-selection-header {
  text-align: center;
  margin-bottom: 1em;
}

.hub-welcome-message {
  margin: 0;
  font-size: 1.5em;
  color: #000; /* light mode text color */
}

.dark-mode .hub-welcome-message {
  color: #ddd; /* dark mode text color */
}

.hub-selection-header p {
  margin: 0;
  font-size: 1em;
  color: #6c757d; /* light mode text color */
}

.dark-mode .hub-selection-header p {
  color: #bbb; /* dark mode text color */
}

.hub-nav-bar {
  display: flex;
  justify-content: center;
}

.hub-nav {
  list-style-type: none;
  padding-left: 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hub-nav-item {
  margin-bottom: 0;
}

.hub-list-group-item {
  padding: 10px 15px;
  border-radius: 5px;
  transition:
    background-color 0.3s,
    color 0.3s;
  display: flex;
  align-items: center;
  font-size: 1.1em;
  background-color: #fff; /* light mode item background */
  color: #000; /* light mode item text color */
}

.hub-list-group-item:hover {
  background-color: #e9ecef; /* light mode hover background */
}

.dark-mode .hub-list-group-item {
  background-color: #444; /* dark mode item background */
  color: #fff; /* dark mode item text color */
}

.dark-mode .hub-list-group-item:hover {
  background-color: #555; /* dark mode hover background */
}

.hub-active {
  background-color: #007bff; /* light mode active background */
  color: #fff !important; /* light mode active text color */
  font-weight: bold;
}

.dark-mode .hub-active {
  background-color: #0056b3; /* dark mode active background */
  color: #fff !important; /* dark mode active text color */
  font-weight: bold;
}

.hub-cursor-pointer {
  cursor: pointer;
}

.hub-hover-color {
  transition: background-color 0.3s ease;
}

.hub-bg-light {
  background-color: #fff; /* light mode item background */
}

.dark-mode .hub-bg-light {
  background-color: #444; /* dark mode item background */
}

.hub-border-0 {
  border: none;
}

.hub-badge {
  background-color: red;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8em;
  margin-left: 5px;
}

.hub-modal {
  position: fixed;
  z-index: 10000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.hub-modal-content {
  background-color: #fefefe; /* light mode modal background */
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 8px;
  color: #000; /* light mode modal text color */
}

.dark-mode .hub-modal-content {
  background-color: #333; /* dark mode modal background */
  color: #fff; /* dark mode modal text color */
}

.hub-modal-close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.hub-modal-close:hover,
.hub-modal-close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.hub-modal-title {
  font-size: 1.5em;
  margin-bottom: 1em;
  color: #000; /* light mode modal title color */
}

.dark-mode .hub-modal-title {
  color: #ddd; /* dark mode modal title color */
}

/* Mobile Navigation */
.hub-mobile-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #f8f9fa; /* light mode mobile nav background */
  border-top: 1px solid #ccc;
  padding: 20px 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.dark-mode .hub-mobile-nav {
  background: #2c2c2c; /* dark mode mobile nav background */
  border-top: 1px solid #555;
}

.hub-mobile-nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: #000; /* light mode mobile button text color */
}

.dark-mode .hub-mobile-nav-button {
  color: #fff; /* dark mode mobile button text color */
}

.hub-mobile-nav-button span {
  font-size: 1rem;
  margin-top: 2px;
}

@media (max-width: 768px) {
  .hub-list-group-item {
    font-size: 1rem;
    padding: 10px 15px;
  }

  .hub-nav-bar {
    flex-direction: column;
    align-items: center;
  }

  .hub-nav {
    flex-direction: column;
    width: 100%;
  }

  .hub-nav-item {
    width: 100%;
  }

  .hub-mobile-nav-button span {
    font-size: 1rem;
    margin-top: 2px;
  }
}
</style>
