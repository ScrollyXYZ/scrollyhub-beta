<template>
  <div class="quest-page">
    <div class="header-section">
      <div class="leaderboard-link">
        <span class="leaderboard-button disabled"> View Leaderboard </span>
      </div>
      <div class="points-display animate__animated animate__fadeInDown">
        <div class="points-card">
          <h2>Your Mappy Points</h2>
          <p>{{ questStore.activityPoints }}</p>
          <button @click="toggleDetails" class="details-button">
            {{ showDetails ? "▲" : "▼" }} Details
          </button>
          <transition name="fade">
            <div v-if="showDetails" class="points-details">
              <div class="details-section">
                <p class="details-header">Points Breakdown</p>
                <p class="details-item">
                  <strong>{{ pointsFromValidatedQuests }}</strong> points from
                  completed quests
                </p>
                <p class="details-item">
                  <strong>{{ pointsFromUserActivities }}</strong> points from
                  user activities on the hub
                </p>
              </div>
              <div class="details-section">
                <p class="details-header">Points by Category</p>
                <div
                  v-for="category in questStore.questCategories"
                  :key="category.category"
                  class="details-item"
                >
                  <p>
                    <strong>{{ category.category }}:</strong>
                    {{ calculateCategoryPoints(category.quests) }} /
                    {{ calculateMaxCategoryPoints(category.quests) }} points
                  </p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="quest-management">
      <h2>Scrolly's Journey</h2>
      <p class="subtitle">The journey has just begun</p>
      <p class="activity-info">
        Activity points can be earned by using Scrolly's features. Earn extra
        points by minting NFTs, creating collections, or participating in
        community activities.
      </p>

      <div class="view-toggle">
        <button @click="setView('grid')" :class="{ active: view === 'grid' }">
          Grid View
        </button>
      </div>

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
            <div
              v-for="quest in category.quests"
              :key="quest.id"
              class="quest-container"
            >
              <div
                class="quest"
                :class="{
                  validated: quest.validated,
                  notValidated: !quest.validated && !quest.tbd && !quest.ended,
                  tbd: quest.tbd,
                  ended: quest.ended,
                  'validated-ended': quest.validated && quest.ended,
                  flipped: questStore.hoveredQuest === quest.id,
                }"
                @mouseover="quest.tbd ? null : questStore.hoverQuest(quest.id)"
                @mouseleave="questStore.hoverQuest(null)"
                @click="
                  quest.tbd ? null : questStore.showQuestDetails(quest.id)
                "
              >
                <div class="quest-front">
                  <div class="quest-image">
                    <img :src="quest.image" alt="Quest Image" />
                  </div>
                  <div class="quest-title">{{ quest.title }}</div>
                  <div
                    v-if="!quest.validated && !quest.tbd && !quest.ended"
                    class="points-box-front"
                  >
                    <img src="/img/mappy_icon.png" alt="Mappy Icon" />
                    <span>{{ quest.points }} MP</span>
                  </div>
                </div>
                <div class="quest-back">
                  <div class="quest-title">{{ quest.title }}</div>
                  <div class="points-box">
                    <img src="/img/mappy_icon.png" alt="Mappy Icon" />
                    <span>{{ quest.points }} MP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quest Details Modal -->
    <div
      v-if="questStore.showModal"
      class="modal-overlay"
      @click="questStore.closeModal"
    >
      <div class="modal-content animate__animated animate__zoomIn" @click.stop>
        <h3>Quest: {{ questStore.selectedQuest.title }} Details</h3>
        <div class="modal-body">
          <p>
            <span
              :class="{
                'validated-check':
                  questStore.selectedQuest.validated &&
                  !questStore.selectedQuest.ended,
                'not-validated-check':
                  !questStore.selectedQuest.validated &&
                  !questStore.selectedQuest.ended,
                'ended-check':
                  questStore.selectedQuest.ended &&
                  !questStore.selectedQuest.validated,
                'validated-ended-check':
                  questStore.selectedQuest.validated &&
                  questStore.selectedQuest.ended,
              }"
            ></span>
            Status:
            {{
              questStore.selectedQuest.validated &&
              questStore.selectedQuest.ended
                ? "Validated + Quest Ended"
                : questStore.selectedQuest.validated
                  ? "Validated"
                  : questStore.selectedQuest.ended
                    ? "Quest Ended"
                    : "Not validated"
            }}
          </p>
          <p
            v-if="
              questStore.selectedQuest.validated &&
              questStore.selectedQuest.ended
            "
          >
            Congratulations! You have successfully claimed
            {{ questStore.selectedQuest.points }} Mappy Points and the quest has
            ended!
          </p>
          <p v-else-if="questStore.selectedQuest.validated">
            Congratulations! You have successfully claimed
            {{ questStore.selectedQuest.points }} Mappy Points!
          </p>
          <p>Max points: {{ questStore.selectedQuest.points }} MP</p>
          <p>Description: {{ questStore.questDetails }}</p>
          <div
            v-if="
              questStore.selectedQuest.contractAddress &&
              !questStore.selectedQuest.validated &&
              !questStore.selectedQuest.ended
            "
          >
            <p v-if="questStore.claimStatus">
              You have already claimed this reward.
            </p>
            <p v-else-if="questStore.eligibilityStatus">
              You are eligible to claim your reward!
              <button class="claim-button" @click="claimReward">
                Claim Reward
              </button>
            </p>
            <p v-else>You are not eligible to claim this reward yet.</p>
          </div>
          <NuxtLink
            v-if="questStore.selectedQuest.id === 1"
            to="https://sns.scrolly.xyz/#/"
            target="_blank"
          >
            Mint your domain
          </NuxtLink>
        </div>
        <button @click="questStore.closeModal" class="modal-close-button">
          Close
        </button>
      </div>
    </div>
    <!-- Popup Notification -->
    <div v-if="questStore.showPopup" class="popup-notification">
      {{ questStore.popupMessage }}
    </div>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";

export default {
  name: "QuestPage",
  data() {
    return {
      view: "grid", // Default to grid view
      hoverQuest: null, // Store hovered quest ID for tooltip
      showDetails: false, // Show or hide points details
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
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
  color: #333;
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
  font-size: 2em;
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

.quest {
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
  margin: 20px;
  cursor: pointer;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  text-align: center;
  width: 150px;
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quest.flipped {
  transform: rotateY(180deg);
}

.quest-front,
.quest-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 10px;
}

.quest-back {
  transform: rotateY(180deg);
}

.quest-image {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.quest-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.quest-title {
  margin-top: 10px;
  font-weight: bold;
  font-size: 1em;
  color: #fff;
}

.points-box-front {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 10px;
}

.points-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 10px;
}

.points-box img {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.quest.validated {
  border: 2px solid #4caf50;
}

.quest.notValidated {
  border: 2px solid #f44336;
}

.quest.tbd {
  border: 2px solid #9e9e9e;
  background: rgba(158, 158, 158, 0.7);
  cursor: not-allowed;
}

.quest.ended {
  border: 2px solid #ff9800;
}

.quest.validated-ended {
  border: 2px solid #4caf50;
  background: linear-gradient(to right, #4caf50, #ff9800);
}

.claim-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.claim-button:hover {
  background-color: #45a049;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #333;
  max-width: 400px;
  width: 80%;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-body {
  text-align: left;
}

.validated-check::before {
  content: "✔️";
  color: green;
}

.not-validated-check::before {
  content: "❌";
  color: red;
}

.ended-check::before {
  content: "⌛";
  color: #ff9800;
}

.validated-ended-check::before {
  content: "✔️⌛";
  color: green;
}

.modal-close-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.modal-close-button:hover {
  background-color: #555;
}

.popup-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #333;
  color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: opacity 0.3s ease-in-out;
}

.popup-notification-enter-active,
.popup-notification-leave-active {
  transition: opacity 0.5s;
}

.popup-notification-enter,
.popup-notification-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
