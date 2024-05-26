import { defineStore } from "pinia";

export const useSidebarStore = defineStore({
  id: "sidebars",
  state: () => ({
    showLeftSidebar: false,
    showRightSidebar: false,
    showMainContent: true,
  }),
  actions: {
    setLeftSidebar(value: boolean) {
      this.showLeftSidebar = value;
    },
    setRightSidebar(value: boolean) {
      this.showRightSidebar = value;
    },
    setMainContent(value: boolean) {
      this.showMainContent = value;
    },
  },
});
