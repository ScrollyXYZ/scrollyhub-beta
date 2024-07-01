<template>
  <div :class="['dashboard-page', { 'dark-mode': isDarkMode }]">
    <div class="grid-container">
      <div class="grid-item">
        <section
          :class="['onboarding-section', 'box', { 'dark-mode': isDarkMode }]"
        >
          <h2>Get Started</h2>
          <GetStartedCarousel />
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import GetStartedCarousel from "~/components/quests/onboarding.vue";
import { useThemeStore } from "~/store/theme";
import { useQuestStore } from "~/store/questStore";
import { useUserStore } from "~/store/user";
import { computed, onMounted, watch } from "vue";
export default {
  name: "Dashboard",
  components: {
    GetStartedCarousel,
  },
  setup() {
    const themeStore = useThemeStore();
    const questStore = useQuestStore();
    const userStore = useUserStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    onMounted(async () => {
      if (userStore.getCurrentUserAddress) {
        await questStore.initializeQuests(userStore);
      }
    });

    // Watch for changes in user address and reinitialize quests
    watch(
      () => userStore.getCurrentUserAddress,
      async (newAddress, oldAddress) => {
        if (newAddress) {
          await questStore.initializeQuests(userStore);
        } else {
          questStore.$reset(); // Reset the quest store when user logs out
        }
      },
    );

    return {
      isDarkMode,
      questStore,
      userStore,
    };
  },
};
definePageMeta({
  layout: "quests",
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: transparent;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.box {
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: box-shadow 0.3s;
  width: 100%;
  max-width: 800px;
  background-color: #fff; /* Light mode background color */
}

.box.dark-mode {
  background-color: #444; /* Dark mode background color */
  color: #fff;
}

.box:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.onboarding-section h2 {
  font-size: 2.2em;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 20px;
  animation: fadeIn 2s;
}

@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .box {
    padding: 20px;
  }
}
</style>
