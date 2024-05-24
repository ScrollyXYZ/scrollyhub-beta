<template>
  <div class="quest-page">
    <div class="header-section">
      <div class="leaderboard-link">
        <span class="leaderboard-button disabled"> View Leaderboard </span>
      </div>
      <div class="points-display animate__animated animate__fadeInDown">
        <div class="points-card">
          <h2>Your Mappy Points</h2>
          <p>{{ activityPoints }}</p>
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
      <div class="quest-path">
        <div v-for="quest in quests" :key="quest.id" class="quest-container">
          <div
            class="quest"
            :class="{
              validated: quest.validated,
              notValidated: !quest.validated && !quest.tbd,
              tbd: quest.tbd,
              flipped: hoveredQuest === quest.id,
            }"
            @mouseover="quest.tbd ? null : hoverQuest(quest.id)"
            @mouseleave="hoverQuest(null)"
            @click="quest.tbd ? null : showQuestDetails(quest.id)"
          >
            <div class="quest-front">
              <div class="quest-image-placeholder"></div>
              <div class="quest-title">{{ quest.title }}</div>
              <div
                v-if="!quest.validated && !quest.tbd"
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

    <!-- Quest Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content animate__animated animate__zoomIn" @click.stop>
        <h3>Quest: {{ selectedQuest.title }} Details</h3>
        <div class="modal-body">
          <p>
            <span
              :class="{
                'validated-check': selectedQuest.validated,
                'not-validated-check': !selectedQuest.validated,
              }"
            ></span>
            To do: {{ selectedQuest.validated ? "Validated" : "Not validated" }}
          </p>
          <p>Max points: {{ selectedQuest.maxPoints }} MP</p>
          <p>Description: {{ questDetails }}</p>
          <NuxtLink
            v-if="selectedQuest.id === 1"
            to="https://sns.scrolly.xyz/#/"
            target="_blank"
          >
            Mint your domain
          </NuxtLink>
        </div>
        <button @click="closeModal" class="modal-close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useUserStore } from "~/store/user";
import { getActivityPoints } from "~/utils/balanceUtils";
import { useRuntimeConfig } from "#app";

const SCROLLY_DOMAINS_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

export default {
  name: "QuestPage",
  data() {
    return {
      activityPoints: 0,
      showModal: false,
      selectedQuest: null,
      questDetails: "",
      hoveredQuest: null,
      quests: [
        {
          id: "Bonus",
          title: "Quest Bonus",
          description: "Hold a Scrolly Journey",
          points: 50,
          validated: true,
          tbd: false,
          maxPoints: 50,
        },
        {
          id: 1,
          title: "Scrolly Domains",
          description: "Create your Scrolly Domains",
          points: 0,
          validated: false,
          tbd: false,
          maxPoints: 507,
        },
        {
          id: 2,
          title: "Quest 2",
          description: "TBD",
          points: 0,
          validated: false,
          tbd: true,
          maxPoints: 0,
        },
        {
          id: 3,
          title: "Quest 3",
          description: "TBD",
          points: 0,
          validated: false,
          tbd: true,
          maxPoints: 0,
        },
        {
          id: 4,
          title: "Quest 4",
          description: "TBD",
          points: 0,
          validated: false,
          tbd: true,
          maxPoints: 0,
        },
      ],
    };
  },
  async created() {
    this.userStore = useUserStore();
    await this.fetchActivityPoints();
    await this.checkDomainOwnership();
  },
  methods: {
    async fetchActivityPoints() {
      const userAddress = this.userStore.getCurrentUserAddress;
      if (userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        this.activityPoints = await getActivityPoints(userAddress, signer);
      }
    },
    async checkDomainOwnership() {
      const userAddress = this.userStore.getCurrentUserAddress;
      const config = this.getConfig();
      if (userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          config.punkTldAddress,
          SCROLLY_DOMAINS_ABI,
          provider,
        );
        const balance = await contract.balanceOf(userAddress);

        let points = 169 * Math.min(balance.toNumber(), 3);
        this.quests[1].points = points;
        this.quests[1].validated = balance.toNumber() > 0;
      }
    },
    getConfig() {
      return useRuntimeConfig().public;
    },
    showQuestDetails(questId) {
      const quest = this.quests.find((q) => q.id === questId);
      this.selectedQuest = quest;
      this.questDetails = quest.description;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedQuest = null;
      this.questDetails = "";
    },
    hoverQuest(questId) {
      this.hoveredQuest = questId;
    },
  },
};
</script>

<style scoped>
@import "animate.css";

.quest-page {
  background: linear-gradient(to right, #ff7e5f, #feb47b);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
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
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
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

.quest-image-placeholder {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
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

.small-connector {
  width: 30px;
  height: 4px;
  background: #fff;
  margin: 0 10px;
}

.status {
  font-weight: bold;
}

.status.validated {
  color: #4caf50;
}

.status.not-validated {
  color: #f44336;
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
  color: #000;
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

.modal-close-button {
  background-color: #ff7e5f;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.modal-close-button:hover {
  background-color: #feb47b;
}
</style>
