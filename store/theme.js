// store/theme.js
import { defineStore } from "pinia";
import { watch } from "vue";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    isDarkMode: false,
  }),
  actions: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    setDarkMode(isDarkMode) {
      this.isDarkMode = isDarkMode;
    },
  },
  getters: {
    getIsDarkMode: (state) => state.isDarkMode,
  },
});
