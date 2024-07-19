import { defineStore } from "pinia";

export const useLayoutSidebarStore = defineStore("layoutSidebarStore", {
  state: () => ({
    showMainContent: true,
    leftSidebarOpen: true,
    rightSidebarOpen: false, // Ajout de la propriété pour la sidebar droite
  }),
  actions: {
    toggleLeftSidebar() {
      this.leftSidebarOpen = !this.leftSidebarOpen;
    },
    toggleRightSidebar() {
      // Ajout de la méthode pour la sidebar droite
      this.rightSidebarOpen = !this.rightSidebarOpen;
    },
    setShowMainContent(value: boolean) {
      this.showMainContent = value;
    },
  },
});
