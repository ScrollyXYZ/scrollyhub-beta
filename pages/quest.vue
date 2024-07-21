<template>
  <div
    :class="[
      'quest-page-custom',
      { 'dark-mode': isDarkMode, 'light-mode': !isDarkMode },
    ]"
  >
    <div class="quest-header-custom">
      <div class="scrolly-journey-custom">
        <div
          :class="[
            'scrolly-journey-title-custom',
            {
              'dark-mode-text-custom': isDarkMode,
              'light-mode-text-custom': !isDarkMode,
            },
          ]"
        >
          Scrolly's Journey
        </div>
        <p
          :class="[
            'subtitle-custom',
            {
              'dark-mode-text-custom': isDarkMode,
              'light-mode-text-custom': !isDarkMode,
            },
          ]"
        >
          The journey has just begun
        </p>
      </div>
    </div>
    <div class="quest-management-custom">
      <div v-if="view === 'grid'" class="grid-view-custom">
        <div
          v-for="category in questStore.filteredCategories"
          :key="category.category"
          :class="[
            'quest-category-custom',
            {
              'dark-mode-category': isDarkMode,
              'light-mode-category': !isDarkMode,
            },
          ]"
        >
          <div class="category-title-custom">
            {{ category.category }} ({{
              questStore.getCompletedQuests(category.quests)
            }}/{{ category.quests.length }} completed)
          </div>
          <div class="quest-path-custom">
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
      <div v-if="questStore.showPopup" class="popup-notification-custom">
        {{ questStore.popupMessage }}
      </div>
    </transition>

    <!-- Fixed Mappy Points Card -->
    <div class="mappy-points-fixed-custom">
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
    const isDarkMode = computed(() => themeStore.isDarkMode);

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

.quest-page-custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 20px;
  background-color: transparent;
  position: relative;
}

.quest-header-custom {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
}

.scrolly-journey-custom {
  width: 100%;
}

.scrolly-journey-title-custom {
  position: relative;
  font-size: 2em;
  color: inherit;
}

.scrolly-journey-title-custom::after {
  position: absolute;
  top: -10px;
  left: -30px;
  opacity: 0.1; /* Adjust opacity for background effect */
}

.header-content-custom {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
}

.mappy-points-fixed-custom {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.quest-management-custom {
  flex: 1 1 auto;
  margin-top: 20px;
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.grid-view-custom {
  display: flex;
  flex-direction: column;
}

.quest-category-custom {
  position: relative;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  transition:
    background-color 0.3s,
    color 0.3s;
  background-color: inherit;
  color: inherit;
  border: 1px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.quest-category-custom::before {
  content: "";
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background-image: url("~/assets/Vector.svg");
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 10px;
  z-index: -1;
}

.category-title-custom {
  font-size: 1.5em;
  margin-bottom: 10px;
  color: inherit;
}

.quest-path-custom {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.quest-card-custom {
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

.quest-card-custom:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.quest-info-custom {
  padding: 15px;
  text-align: left;
}

.quest-info-custom div {
  margin: 0;
  font-size: 1.2em;
}

.quest-info-custom p {
  margin: 5px 0;
  color: #666;
}

.quest-status-custom {
  display: block;
  margin-top: 10px;
  font-size: 0.9em;
  color: inherit;
}

.validated .quest-status-custom {
  color: #4caf50;
}

.notValidated .quest-status-custom {
  color: #f44336;
}

.tbd .quest-status-custom {
  color: #9e9e9e;
}

.ended .quest-status-custom {
  color: #ff9800;
}

.badges-custom {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.badge-custom {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
  color: #fff;
}

.badge-validated-custom {
  background-color: #4caf50;
}

.badge-ended-custom {
  background-color: #ff9800;
}

.badge-claimable-custom {
  background-color: #00bcd4;
}

.badge-not-claimable-custom {
  background-color: #9e9e9e;
}

/* Light Mode Styles */
.light-mode .quest-page-custom {
  background-color: #f5f5f5;
  color: #000;
}

.light-mode .quest-category-custom {
  background: hsla(
    0,
    0%,
    100%,
    0.6
  ); /* Light background with slight transparency */
  color: #000; /* Black text color */
  border-color: #ddd; /* Light border */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Light shadow */
}

.light-mode .category-title-custom,
.light-mode .quest-info-custom div {
  color: #000;
}

.light-mode .quest-card-custom {
  background: rgba(255, 255, 255, 0.9);
}

.light-mode .quest-card-custom:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Dark Mode Styles */
.dark-mode .quest-page-custom {
  background-color: None;
  color: #fff;
}

.dark-mode .quest-category-custom {
  background: rgba(
    51,
    51,
    51,
    0.6
  ); /* Dark background with slight transparency */
  color: #fff; /* White text color */
  border-color: #666; /* Dark border */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Dark shadow */
}

.dark-mode .category-title-custom,
.dark-mode .quest-info-custom div {
  color: #fff;
}

.dark-mode .quest-card-custom {
  background: rgba(51, 51, 51, 0.9);
  border: 1px solid #666;
}

.dark-mode .quest-card-custom:hover {
  box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
}
/* Notification Styles */
.popup-notification-custom {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1em;
  z-index: 2000;
  text-align: center;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.light-mode .popup-notification-custom {
  background-color: rgba(255, 255, 255, 0.9);
  color: #000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-mode .popup-notification-custom {
  background-color: rgba(51, 51, 51, 0.9);
  color: #fff;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.2);
}

/* Responsive Styles */
@media (max-width: 767px) {
  .header-content-custom {
    flex-direction: column;
    align-items: center;
  }
  .mappy-points-fixed-custom {
    top: 10px;
    right: 10px;
    text-align: center;
  }
  .quest-management-custom {
    margin-top: 20px;
  }
}
</style>
