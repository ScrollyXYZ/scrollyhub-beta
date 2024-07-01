import { defineStore } from "pinia";

export const useLayoutSidebarStore = defineStore("layoutSidebarStore", {
  state: () => ({
    showMainContent: true,
    leftSidebarOpen: true,
  }),
  actions: {
    toggleLeftSidebar() {
      this.leftSidebarOpen = !this.leftSidebarOpen;
    },
    setShowMainContent(value: boolean) {
      this.showMainContent = value;
    },
  },
});
