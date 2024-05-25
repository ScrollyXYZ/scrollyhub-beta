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

      <div class="category-filter">
        <label for="categorySelect">Select Category:</label>
        <select id="categorySelect" v-model="selectedCategory">
          <option
            v-for="category in questCategories"
            :key="category.category"
            :value="category.category"
          >
            {{ category.category }}
          </option>
        </select>
      </div>

      <div
        v-for="category in filteredCategories"
        :key="category.category"
        :id="category.category.replace(/\s+/g, '-')"
        class="quest-category"
      >
        <h3>
          {{ category.category }} ({{ getCompletedQuests(category.quests) }}/{{
            category.quests.length
          }}
          completed)
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
                notValidated: !quest.validated && !quest.tbd,
                tbd: quest.tbd,
                flipped: hoveredQuest === quest.id,
              }"
              @mouseover="quest.tbd ? null : hoverQuest(quest.id)"
              @mouseleave="hoverQuest(null)"
              @click="quest.tbd ? null : showQuestDetails(quest.id)"
            >
              <div class="quest-front">
                <div class="quest-image">
                  <img :src="quest.image" alt="Quest Image" />
                </div>
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

export default {
  name: "QuestPage",
  data() {
    return {
      activityPoints: 0,
      showModal: false,
      selectedQuest: null,
      questDetails: "",
      hoveredQuest: null,
      selectedCategory: "",
      questCategories: [
        {
          category: "Hub Quests",
          quests: [
            {
              id: 1,
              title: "Create your Scrolly Domains",
              description: "Create your Scrolly Domains",
              points: 0,
              validated: false,
              tbd: false,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            {
              id: 2,
              title: "Post Scrolly's Minter",
              description: "Mint your first post on the hub",
              points: 100,
              validated: false,
              tbd: false,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            {
              id: 3,
              title: "Scrolly's Journey Holder",
              description:
                "Own a Scrolly's Journey before the start of the Scrolly's Journey : Quests",
              points: 100,
              validated: false,
              tbd: true,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            // add others quests there
          ],
        },
        {
          category: "Social Quests",
          quests: [
            {
              id: 4,
              title: "Share on Social Media",
              description: "Share your experience on social media",
              points: 0,
              validated: false,
              tbd: false,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            // add others quests there
          ],
        },
        {
          category: "Scrolly Community FTW",
          quests: [
            {
              id: 7,
              title: "Equilibre Memes Competitor",
              description: "Share your experience on social media",
              points: 50,
              validated: false,
              tbd: false,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            {
              id: 6,
              title: "Lottery Addict",
              description: "Share your experience on social media",
              points: 100,
              validated: false,
              tbd: false,
              image: "https://sns.scrolly.xyz/assets/cover.png",
            },
            // add others quests there
          ],
        },
        // add others categories
      ],
      userStore: null,
    };
  },
  computed: {
    filteredCategories() {
      if (this.selectedCategory) {
        return this.questCategories.filter(
          (category) => category.category === this.selectedCategory,
        );
      }
      return this.questCategories;
    },
  },
  async mounted() {
    this.userStore = useUserStore();
    await this.updateData();
  },
  watch: {
    // Watch for changes in the user's address
    "userStore.getCurrentUserAddress": async function (newAddress, oldAddress) {
      if (newAddress !== oldAddress) {
        await this.updateData();
      }
    },
  },
  methods: {
    async updateData() {
      await this.fetchActivityPoints();
      await this.checkDomainOwnership();
      await this.checkQuestConditions();
    },
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
      if (userAddress) {
        const config = useRuntimeConfig();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          config.public.punkTldAddress,
          ["function balanceOf(address owner) view returns (uint256)"],
          provider,
        );
        const balance = await contract.balanceOf(userAddress);

        let points = 169 * Math.min(balance.toNumber(), 3);
        this.questCategories.find(
          (category) => category.category === "Hub Quests",
        ).quests[0].points = points;
        this.questCategories.find(
          (category) => category.category === "Hub Quests",
        ).quests[0].validated = balance.toNumber() > 0;
      }
    },
    async checkQuestConditions() {
      const userAddress = this.userStore.getCurrentUserAddress;
      if (userAddress) {
        // example of smartcontract verification
        const config = useRuntimeConfig();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          config.public.questVerifierAddress,
          [
            "function checkQuestCondition(uint256 questId, address user) view returns (bool)",
          ],
          provider,
        );

        for (const category of this.questCategories) {
          for (const quest of category.quests) {
            if (quest.tbd === false) {
              const isValidated = await contract.checkQuestCondition(
                quest.id,
                userAddress,
              );
              quest.validated = isValidated;
            }
          }
        }
      }
    },
    getCompletedQuests(quests) {
      return quests.filter((quest) => quest.validated).length;
    },
    showQuestDetails(questId) {
      for (const category of this.questCategories) {
        const quest = category.quests.find((q) => q.id === questId);
        if (quest) {
          this.selectedQuest = quest;
          this.questDetails = quest.description;
          if (quest.id === 1) {
            this.questDetails +=
              "\n\nMax points: 507 MP\n\nScrolly Domains allow you to interact with the hub's social features. It's your digital identity.";
          }
          this.showModal = true;
          break;
        }
      }
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.updateData();
    });
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

.category-filter {
  margin-bottom: 20px;
}

.quest-category {
  margin-top: 20px;
}

.quest-category h3 {
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
