<template>
  <div :class="['empty-component', { 'dark-mode': isDarkMode }]">
    <img
      src="~/assets/img/badge/unrevealed.png"
      alt="Unrevealed Badge"
      class="unrevealed-image"
    />
    <div class="button-container">
      <NuxtLink to="/getstarted" class="get-started-button"
        >Get Started</NuxtLink
      >
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useThemeStore } from "~/store/theme";

export default {
  name: "EmptyComponent",
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      isDarkMode,
    };
  },
};
</script>

<style scoped>
.empty-component {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.unrevealed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin-bottom: 20px;
}

.button-container {
  display: flex;
  gap: 10px;
}

.get-started-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f0ad4e; /* Adjusted yellow color */
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.get-started-button:hover {
  background-color: #ec971f; /* Darker yellow for hover */
}

.dark-mode .empty-component {
  background: rgba(51, 51, 51, 0.5);
  border: 1px solid #555;
}

.dark-mode .get-started-button {
  background-color: #ec971f;
}

.dark-mode .get-started-button:hover {
  background-color: #d58512;
}
</style>
