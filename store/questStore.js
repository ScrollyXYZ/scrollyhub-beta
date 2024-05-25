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
      if (state.selectedCategory === "latest") {
        return this.getLatestQuests();
      }
      if (state.selectedCategory === "all") {
        return state.questCategories;
      }
      if (state.selectedCategory) {
        return state.questCategories.filter(
          (category) => category.category === state.selectedCategory,
        );
      }
      return state.questCategories;
    },
  },
  actions: {
    async initializeQuests(userStore) {
      await this.fetchActivityPoints(userStore);
      await this.checkDomainOwnership(userStore);
      await this.checkQuestConditions(userStore);
    },
    async fetchActivityPoints(userStore) {
      const userAddress = userStore.getCurrentUserAddress;
      if (userAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        this.activityPoints = await getActivityPoints(userAddress, signer);
      }
    },
    async checkDomainOwnership(userStore) {
      const userAddress = userStore.getCurrentUserAddress;
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
    async checkQuestConditions(userStore) {
      const userAddress = userStore.getCurrentUserAddress;
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
    filterCategory(category) {
      this.selectedCategory = category;
    },
    getLatestQuests() {
      const allQuests = this.questCategories.flatMap(
        (category) => category.quests,
      );
      const latestQuests = allQuests.sort((a, b) => b.id - a.id).slice(0, 3);
      return [
        {
          category: "Latest Quests",
          quests: latestQuests,
        },
      ];
    },
  },
});
