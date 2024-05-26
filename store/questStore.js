import { defineStore } from "pinia";
import { ethers } from "ethers";
import { useUserStore } from "~/store/user";
import { getActivityPoints } from "~/utils/balanceUtils";

export const useQuestStore = defineStore("questStore", {
  state: () => ({
    activityPoints: 0,
    showModal: false,
    selectedQuest: null,
    questDetails: "",
    hoveredQuest: null,
    selectedCategory: "all",
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
  }),
  getters: {
    filteredCategories(state) {
      if (state.selectedCategory === "all") {
        return state.questCategories;
      }
      if (state.selectedCategory === "latest") {
        const allQuests = state.questCategories.flatMap(
          (category) => category.quests,
        );
        const latestQuests = allQuests.sort((a, b) => b.id - a.id).slice(0, 3);
        return [
          {
            category: "Latest Quests",
            quests: latestQuests,
          },
        ];
      }
      return state.questCategories.filter(
        (category) => category.category === state.selectedCategory,
      );
    },
    getCompletedQuests: (state) => (quests) => {
      return quests.filter((quest) => quest.validated).length;
    },
  },
  actions: {
    async initializeQuests(userStore) {
      this.userStore = userStore;
      await this.updateData();
    },
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
        const hubQuests = this.questCategories.find(
          (category) => category.category === "Hub Quests",
        );
        const quest = hubQuests.quests.find((q) => q.id === 1);
        quest.points = points;
        quest.validated = balance.toNumber() > 0;
      }
    },
    async checkQuestConditions() {
      const userAddress = this.userStore.getCurrentUserAddress;
      if (userAddress) {
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
    filterCategory(category) {
      this.selectedCategory = category;
    },
    showQuestDetails(questId) {
      for (const category of this.questCategories) {
        const quest = category.quests.find((q) => q.id === questId);
        if (quest) {
          this.selectedQuest = quest;
          this.questDetails = quest.description;
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
});
