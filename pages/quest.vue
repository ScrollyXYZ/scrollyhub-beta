<template>
  <div
    :class="[
      'quest-page',
      { 'dark-mode': isDarkMode, 'light-mode': !isDarkMode },
    ]"
  >
    <div class="quest-header">
      <div class="scrolly-journey">
        <h2
          :class="{
            'dark-mode-text': isDarkMode,
            'light-mode-text': !isDarkMode,
          }"
        >
          Scrolly's Journey
        </h2>
        <p
          :class="{
            'dark-mode-text': isDarkMode,
            'light-mode-text': !isDarkMode,
          }"
          class="subtitle"
        >
          The journey has just begun
        </p>
      </div>
    </div>
    <div class="quest-management">
      <div v-if="view === 'grid'" class="grid-view">
        <div
          v-for="category in questStore.filteredCategories"
          :key="category.category"
          :class="[
            'quest-category',
            {
              'dark-mode-category': isDarkMode,
              'light-mode-category': !isDarkMode,
            },
          ]"
        >
          <h3
            :class="{
              'dark-mode-text': isDarkMode,
              'light-mode-text': !isDarkMode,
            }"
            class="category-title"
          >
            {{ category.category }} ({{
              questStore.getCompletedQuests(category.quests)
            }}/{{ category.quests.length }} completed)
          </h3>
          <div
            :class="[
              'quest-path',
              { 'dark-mode': isDarkMode, 'light-mode': !isDarkMode },
            ]"
          >
            <quest-card
              v-for="quest in category.quests"
              :key="quest.id"
              :quest="quest"
              @showDetails="showQuestDetails"
              :isDarkMode="isDarkMode"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quest Details Modal -->
    <quest-details-modal
      v-if="questStore.showModal"
      :quest="questStore.selectedQuest"
      @close="questStore.closeModal"
      @claim="claimReward"
      :isDarkMode="isDarkMode"
    />

    <!-- Popup Notification -->
    <transition name="fade">
      <div v-if="questStore.showPopup" class="popup-notification">
        {{ questStore.popupMessage }}
      </div>
    </transition>

    <!-- Fixed Mappy Points Card -->
    <div class="mappy-points-fixed">
      <points-card :activityPoints="questStore.activityPoints" />
    </div>
  </div>
</template>
<script>
import { computed } from "vue";
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import { useThemeStore } from "~/store/theme";
import PointsCard from "~/components/quests/PointsCard.vue";
import QuestCard from "~/components/quests/QuestCard.vue";
import QuestDetailsModal from "~/components/quests/QuestDetailsModal.vue";

export default {
  name: "QuestPage",
  components: {
    PointsCard,
    QuestCard,
    QuestDetailsModal,
  },
  data() {
    return {
      view: "grid",
      showDetails: false,
    };
  },
  setup() {
    const userStore = useUserStore();
    const questStore = useQuestStore();
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      userStore,
      questStore,
      isDarkMode,
    };
  },
  computed: {
    pointsFromValidatedQuests() {
      return this.questStore.filteredCategories.reduce(
        (acc, category) =>
          acc +
          category.quests
            .filter((q) => q.validated)
            .reduce((sum, quest) => sum + quest.points, 0),
        0,
      );
    },
    pointsFromUserActivities() {
      return this.questStore.activityPoints - this.pointsFromValidatedQuests;
    },
  },
  async mounted() {
    await this.questStore.initializeQuests(this.userStore);
    this.handleHashChange();
    window.addEventListener("hashchange", this.handleHashChange);
  },
  beforeUnmount() {
    window.removeEventListener("hashchange", this.handleHashChange);
  },
  watch: {
    "userStore.getCurrentUserAddress": async function (newAddress, oldAddress) {
      if (newAddress !== oldAddress) {
        await this.questStore.initializeQuests(this.userStore);
      }
    },
    "$route.hash": "handleHashChange",
  },
  methods: {
    handleHashChange() {
      const hash = this.$route.hash.replace("#", "").replace(/-/g, " ");
      if (hash) {
        this.questStore.selectedCategory = hash;
        this.questStore.filterCategory(hash);
      }
    },
    setView(view) {
      this.view = view;
    },
    async showQuestDetails(quest) {
      this.questStore.selectedQuest = quest;
      this.questStore.showModal = true;
      if (quest.id === 1) {
        await this.questStore.checkDomainOwnership();
      } else {
        await this.questStore.checkEligibilityAndClaimStatus(
          quest.contractAddress,
          quest.functions,
        );
      }
    },
    async claimReward() {
      const { contractAddress, functions, points } =
        this.questStore.selectedQuest;
      await this.questStore.claimReward(contractAddress, functions, points);
      this.questStore.closeModal();
    },
    toggleDetails() {
      this.showDetails = !this.showDetails;
    },
    calculateCategoryPoints(quests) {
      return quests.reduce((sum, quest) => sum + quest.points, 0);
    },
    calculateMaxCategoryPoints(quests) {
      return quests.reduce((sum, quest) => sum + quest.points, 0);
    },
  },
};
definePageMeta({
  layout: "quests",
});
</script>
<style scoped>
@import "animate.css";

.quest-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px;
  background-color: transparent;
  position: relative;
}

.quest-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
}

.scrolly-journey {
  width: 100%;
}

.scrolly-journey h2 {
  position: relative;
  font-size: 2em;
}

.scrolly-journey h2::after {
  content: url("/path/to/your/svg.svg"); /* URL of your SVG */
  position: absolute;
  top: -10px;
  left: -30px;
  opacity: 0.1; /* Adjust opacity for background effect */
}

.header-content {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
}

.mappy-points-fixed {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.quest-management {
  flex: 1 1 auto;
  margin-top: 20px; /* Reduce top margin for better spacing */
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.grid-view {
  display: flex;
  flex-direction: column;
}

.quest-category {
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  transition: background-color 0.3s;
}

.category-title {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: #333;
}

.quest-path {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.quest-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  padding: 10px;
  margin: 20px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.9);
  color: inherit;
}

.quest-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.quest-info {
  padding: 15px;
  text-align: left;
}

.quest-info h3 {
  margin: 0;
  font-size: 1.2em;
}

.quest-info p {
  margin: 5px 0;
  color: #666;
}

.quest-status {
  display: block;
  margin-top: 10px;
  font-size: 0.9em;
  color: #333;
}

.validated .quest-status {
  color: #4caf50;
}

.notValidated .quest-status {
  color: #f44336;
}

.tbd .quest-status {
  color: #9e9e9e;
}

.ended .quest-status {
  color: #ff9800;
}

.badges {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
  color: #fff;
}

.badge-validated {
  background-color: #4caf50;
}

.badge-ended {
  background-color: #ff9800;
}

.badge-claimable {
  background-color: #00bcd4;
}

.badge-not-claimable {
  background-color: #9e9e9e;
}

/* Light Mode Styles */
body.light-mode .quest-page {
  background-color: transparent;
  color: #000;
}

body.light-mode .quest-category {
  background: rgba(255, 255, 255, 0.9);
  color: #000;
}

body.light-mode .category-title,
body.light-mode .quest-info h3 {
  color: #000;
}

body.light-mode .quest-card {
  background: rgba(255, 255, 255, 0.9);
}

body.light-mode .quest-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

body.light-mode .quest-path {
  background: rgba(240, 240, 240, 0.9);
}

/* Dark Mode Styles */
body.dark-mode .quest-page {
  background-color: transparent;
  color: #fff;
}

body.dark-mode .quest-category {
  background: rgba(51, 51, 51, 0.9);
  color: #fff;
}

body.dark-mode .category-title,
body.dark-mode .quest-info h3 {
  color: #fff;
}

body.dark-mode .quest-card {
  background: rgba(51, 51, 51, 0.9);
  border: 1px solid #666;
}

body.dark-mode .quest-card:hover {
  box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
}

body.dark-mode .quest-path {
  background: rgba(40, 40, 40, 0.9);
}

/* Responsive Styles */
@media (max-width: 767px) {
  .header-content {
    flex-direction: column;
    align-items: center;
  }
  .mappy-points-fixed {
    top: 10px;
    right: 10px;
    text-align: center;
  }
  .quest-management {
    margin-top: 20px;
  }
}
</style>
