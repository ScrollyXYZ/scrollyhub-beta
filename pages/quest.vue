<template>
  <div class="quest-page">
    <div class="header-section">
      <div class="leaderboard-link">
        <NuxtLink to="/leaderboard"></NuxtLink>
      </div>
      <points-card
        :activityPoints="questStore.activityPoints"
        :pointsFromValidatedQuests="pointsFromValidatedQuests"
        :pointsFromUserActivities="pointsFromUserActivities"
        :questCategories="questStore.questCategories"
      />
    </div>
    <div class="quest-management">
      <h2>Scrolly's Journey</h2>
      <p class="subtitle">The journey has just begun</p>
      <p class="activity-info">
        Activity points can be earned by using Scrolly's features. Earn extra
        points by minting NFTs, creating collections, or participating in
        community activities.
      </p>
      <div v-if="view === 'grid'" class="grid-view">
        <div
          v-for="category in questStore.filteredCategories"
          :key="category.category"
          class="quest-category"
        >
          <h3 class="category-title">
            {{ category.category }} ({{
              questStore.getCompletedQuests(category.quests)
            }}/{{ category.quests.length }} completed)
          </h3>
          <div class="quest-path">
            <quest-card
              v-for="quest in category.quests"
              :key="quest.id"
              :quest="quest"
              @showDetails="showQuestDetails"
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
    />

    <!-- Popup Notification -->
    <transition name="fade">
      <div v-if="questStore.showPopup" class="popup-notification">
        {{ questStore.popupMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
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

    return {
      userStore,
      questStore,
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
  beforeDestroy() {
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
</script>

<style scoped>
@import "animate.css";

.quest-page {
  min-height: 100vh;
  padding: 20px;
  text-align: center;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.points-display {
  text-align: center;
}

.points-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.points-card h2 {
  margin: 0;
  font-size: 1.5em;
}

.points-card p {
  margin: 0;
  font-size: 1em;
  font-weight: bold;
}

.details-button {
  margin-top: 10px;
  background: none;
  border: none;
  color: #333;
  font-size: 1em;
  cursor: pointer;
}

.details-button:hover {
  text-decoration: underline;
}

.points-details {
  margin-top: 10px;
  text-align: left;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.9em;
}

.details-section {
  margin-bottom: 10px;
}

.details-header {
  font-weight: bold;
  margin-bottom: 5px;
}

.details-item {
  margin: 5px 0;
}

.leaderboard-link {
  margin: 20px;
}

.leaderboard-button {
  display: inline-block;
  background: #ddd;
  color: #999;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  cursor: not-allowed;
}

.quest-management {
  margin-top: 40px;
}

.quest-management .subtitle {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.activity-info {
  margin-bottom: 30px;
  font-size: 1.1em;
}

.view-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.view-toggle button {
  padding: 10px 20px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.view-toggle button.active {
  background-color: #333;
  color: #fff;
}

.view-toggle button:not(.active) {
  background-color: #ddd;
  color: #333;
}

.grid-view {
  display: flex;
  flex-direction: column;
}

.quest-category {
  margin-top: 20px;
}

.category-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.quest-path {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.quest-container {
  perspective: 1000px;
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
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  margin: 20px;
  width: 150px;
  height: 150px;
}

.quest-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.quest-image img {
  width: 100%;
  height: auto;
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
  color: #fff;
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
</style>
