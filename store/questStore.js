import { defineStore } from "pinia";
import { ethers } from "ethers";
import { getActivityPoints } from "~/utils/balanceUtils";
import { createOrbisPost } from "~/utils/orbisUtils";
export const useQuestStore = defineStore("questStore", {
  state: () => ({
    activityPoints: 0,
    showModal: false,
    selectedQuest: null,
    questDetails: "",
    hoveredQuest: null,
    selectedCategory: "all",
    claimStatus: false,
    eligibilityStatus: false,
    showPopup: false,
    popupMessage: "",
    questCategories: [
      {
        category: "Social Hub Quests",
        quests: [
          {
            id: 1,
            title: "Create your Scrolly Domains",
            description: "Create your Scrolly Domains",
            points: 0,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyDomains.png",
            contractAddress: "0xc2C543D39426bfd1dB66bBde2Dd9E4a5c7212876",
            functions: {
              checkBalance: "balanceOf",
            },
          },
          {
            id: 2,
            title: "Post Scrolly's Minter",
            description: "Mint your first post on the hub",
            points: 100,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyPostMinter.png",
            contractAddress: "0xFC9b5992CEEB886C2ba7d0F785E2839802E27DC1",
            functions: {
              isEligible: "isEligible",
              hasUserClaimed: "hasUserClaimed",
              claim: "claim",
            },
          },
          {
            id: 3,
            title: "Scrolly's Journey Owner",
            description:
              "Mint the Scrolly's Journey NFT Collection on the NFT Launchpad",
            points: 200,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyJourneyOwner.png",
            contractAddress: "0x0F06e87d431E90435677b83c056AED9d5e30761d",
            functions: {
              isEligible: "isEligible",
              hasUserClaimed: "hasUserClaimed",
              claim: "claim",
            },
          },
          {
            id: 4,
            title: "Scrolly's Artist",
            description:
              "Create your own NFT's collection on the NFT Launchpad to get this reward",
            points: 800,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyArtist.png",
            contractAddress: "0x875d479920B8c9564501DAb57EA1325EeA6FD99D",
            functions: {
              isEligible: "isEligible",
              hasUserClaimed: "hasUserClaimed",
              claim: "claim",
            },
          },
          // add other quests here
        ],
      },
      {
        category: "Scrolly DeFi",
        quests: [
          {
            id: 5,
            title: "Scrolly Providor on Zprotocol",
            description:
              "Provide at least $10 on ETH-Scrolly pair on Zprotocol.",
            points: 200,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyDeFi.png",
            contractAddress: "0xd76Eb5383E4CdA4d933E0C3Cb0ff5c7fD6aA676f",
            functions: {
              isEligible: "isEligible",
              hasUserClaimed: "hasUserClaimed",
              claimInfo: "claimInfo",
              claim: "claim",
            },
          },
          {
            id: 7,
            title: "Scrolly Yield Farmer",
            description:
              "Farm on the Earn Section of Zprotocol for 7 consecutive days and win 100 MP each day by claiming it daily. Additionally, you will be eligible for extra $ZP rewards.",
            points: 700,
            validated: false,
            tbd: false,
            ended: false,
            image: "http://scrolly.xyz/img/quests/ScrollyYield.png",
            contractAddress: "0x8C9103EC43Ae6FAF11a4Ce98Ce6F3442A0C4C944",
            functions: {
              isEligible: "isEligible",
              hasUserClaimed: "hasUserClaimed",
              claimInfo: "claimInfo",
              claim: "claim",
            },
          },
          // add other quests here
        ],
      },
      {
        category: "Community Rewards",
        quests: [
          {
            id: 6,
            title: "Equilibre Memes Contestor",
            description:
              "Participate in the meme contest, share, and create as part of our community spirit. Regardless of winning, sharing and creating is what matters.",
            points: 50,
            validated: false,
            tbd: false,
            ended: true, // Marked as ended
            image: "http://scrolly.xyz/img/quests/ScrollyMemeConstest.png",
            contractAddress: "0x166E1FB48160D066C4724191463F4d3b298B3bbb",
            functions: {
              checkEligibility: "checkEligibility",
            },
          },
          // add other quests here
        ],
      },
    ],
    claimInfo: {
      lastClaimTime: 0,
      claimCount: 0,
    },
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
      // Fetch claim info for quest ID 7
      const quest7 = this.questCategories
        .find((category) => category.quests.some((quest) => quest.id === 7))
        ?.quests.find((quest) => quest.id === 7);
      if (quest7) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          quest7.contractAddress,
          ["function claimInfo(address) view returns (uint256, uint256)"],
          provider,
        );
        const [lastClaimTime, claimCount] = await contract.claimInfo(
          this.userStore.getCurrentUserAddress,
        );
        quest7.lastClaimTime = lastClaimTime;
        quest7.claimCount = claimCount;
        if (claimCount >= 7) {
          quest7.validated = true;
        }
      }
    },
    async updateData() {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      await this.fetchActivityPoints();
      await this.checkDomainOwnership();
      await this.checkQuestConditions();
      // Fetch claim info for quest ID 7 during update
      const quest7 = this.questCategories
        .find((category) => category.quests.some((quest) => quest.id === 7))
        ?.quests.find((quest) => quest.id === 7);
      if (quest7) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          quest7.contractAddress,
          ["function claimInfo(address) view returns (uint256, uint256)"],
          provider,
        );
        const [lastClaimTime, claimCount] = await contract.claimInfo(
          this.userStore.getCurrentUserAddress,
        );
        quest7.lastClaimTime = lastClaimTime;
        quest7.claimCount = claimCount;
        if (claimCount >= 7) {
          quest7.validated = true;
        }
      }
    },
    async fetchActivityPoints() {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      const userAddress = this.userStore.getCurrentUserAddress;
      if (ethers.utils.isAddress(userAddress)) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        this.activityPoints = await getActivityPoints(userAddress, signer);
      } else {
        console.error("Invalid user address:", userAddress);
      }
    },
    async checkDomainOwnership() {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      const userAddress = this.userStore.getCurrentUserAddress;
      if (ethers.utils.isAddress(userAddress)) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          "0xc2C543D39426bfd1dB66bBde2Dd9E4a5c7212876",
          ["function balanceOf(address owner) view returns (uint256)"],
          provider,
        );
        const balance = await contract.balanceOf(userAddress);
        let points = 169 * Math.min(balance.toNumber(), 3);
        const hubQuests = this.questCategories.find(
          (category) => category.category === "Social Hub Quests",
        );
        const quest = hubQuests.quests.find((q) => q.id === 1);
        quest.points = points;
        quest.validated = balance.toNumber() > 0;
      } else {
        console.error("Invalid user address:", userAddress);
      }
    },
    async checkQuestConditions() {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      const userAddress = this.userStore.getCurrentUserAddress;
      if (ethers.utils.isAddress(userAddress)) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        for (const category of this.questCategories) {
          for (const quest of category.quests) {
            if (quest.id === 1) {
              await this.checkDomainOwnership();
            } else if (quest.id === 6) {
              const contract = new ethers.Contract(
                quest.contractAddress,
                [
                  `function ${quest.functions.checkEligibility}(address _user) external view returns (bool)`,
                ],
                provider,
              );
              const eligible =
                await contract[quest.functions.checkEligibility](userAddress);
              quest.validated = eligible;
              console.log(`Quest ${quest.id} eligibility: ${eligible}`);
            } else if (quest.id === 7) {
              const contract = new ethers.Contract(
                quest.contractAddress,
                [
                  `function ${quest.functions.isEligible}(address _user) external view returns (bool)`,
                  `function ${quest.functions.claimInfo}(address _user) external view returns (uint256, uint256)`,
                ],
                provider,
              );
              const [lastClaimTime, claimCount] =
                await contract[quest.functions.claimInfo](userAddress);
              const isEligible =
                await contract[quest.functions.isEligible](userAddress);
              quest.validated = claimCount >= 7;
              quest.eligible = isEligible;
              this.claimInfo = { lastClaimTime, claimCount };
              this.claimStatus = claimCount > 0;
              this.eligibilityStatus = isEligible;
              console.log(`Quest ${quest.id} lastClaimTime: ${lastClaimTime}`);
              console.log(`Quest ${quest.id} claimCount: ${claimCount}`);
              console.log(`Quest ${quest.id} isEligible: ${isEligible}`);
            } else if (quest.functions) {
              const contract = new ethers.Contract(
                quest.contractAddress,
                [
                  `function ${quest.functions.isEligible}(address _user) external view returns (bool)`,
                  `function ${quest.functions.hasUserClaimed}(address _user) external view returns (bool)`,
                ],
                provider,
              );
              const hasClaimed =
                await contract[quest.functions.hasUserClaimed](userAddress);
              const isEligible =
                await contract[quest.functions.isEligible](userAddress);
              quest.validated = hasClaimed;
              quest.eligible = isEligible;
              this.claimStatus = hasClaimed;
              this.eligibilityStatus = isEligible;
              console.log(`Quest ${quest.id} hasClaimed: ${hasClaimed}`);
              console.log(`Quest ${quest.id} isEligible: ${isEligible}`);
              console.log("Updated claimStatus:", this.claimStatus);
              console.log("Updated eligibilityStatus:", this.eligibilityStatus);
            }
          }
        }
      } else {
        console.error("Invalid user address:", userAddress);
      }
    },
    async checkEligibilityAndClaimStatus(contractAddress, functions) {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      const userAddress = this.userStore.getCurrentUserAddress;
      if (ethers.utils.isAddress(userAddress)) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          [
            `function ${functions.isEligible}(address _user) external view returns (bool)`,
            `function ${functions.hasUserClaimed}(address _user) external view returns (bool)`,
            `function ${functions.claim}(address _user) external`,
          ],
          signer,
        );
        try {
          const hasClaimed =
            await contract[functions.hasUserClaimed](userAddress);
          const isEligible = await contract[functions.isEligible](userAddress);
          if (hasClaimed) {
            this.claimStatus = true;
            this.eligibilityStatus = false;
          } else {
            this.claimStatus = false;
            this.eligibilityStatus = isEligible;
          }
          console.log(
            "Updated claimStatus in checkEligibilityAndClaimStatus:",
            this.claimStatus,
          );
          console.log(
            "Updated eligibilityStatus in checkEligibilityAndClaimStatus:",
            this.eligibilityStatus,
          );
        } catch (error) {
          console.error("Error checking eligibility and claim status:", error);
        }
      } else {
        console.error("Invalid user address:", userAddress);
      }
    },
    async claimReward(contractAddress, functions, points, title) {
      if (!this.userStore) {
        console.error("User store is not defined");
        return;
      }
      const userAddress = this.userStore.getCurrentUserAddress;
      if (ethers.utils.isAddress(userAddress)) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          [`function ${functions.claim}(address _user) external`],
          signer,
        );

        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastClaim = currentTime - this.claimInfo.lastClaimTime;

        if (
          this.claimInfo.claimCount >= 7 ||
          timeSinceLastClaim < 86400 ||
          !this.eligibilityStatus
        ) {
          this.showPopupMessage("You are not eligible to claim at this time.");
          return;
        }

        try {
          await contract[functions.claim](userAddress);
          this.claimInfo.lastClaimTime = currentTime;
          this.claimInfo.claimCount += 1;
          this.claimStatus = true;
          this.showPopupMessage(
            `Congratulations! You have successfully claimed ${points} Mappy Points!`,
          );
          setTimeout(async () => {
            await this.updateData(); // Refresh quest status
          }, 5000);

          await createOrbisPost({
            context:
              "kjzl6cwe1jw145d2rd0l68smmvsazouh91qd48m5qnqc3dsl6bfm9om6tti1sfx",
            body: `🎉 I just claimed <b>${points}</b> Mappy Points for completing the quest: <b>${title}</b>! 🌟 Excited to keep progressing and earning more rewards. #MappyQuest #AchievementUnlocked #KeepGoing`,
            data: {
              type: "questclaimed",
              points: points, // To update due to Quest id 7 different mechanism
              userAddress,
              questTitle: title,
            },
          });
        } catch (error) {
          console.error("Error claiming reward:", error);
          this.showPopupMessage(
            "There was an issue processing your claim. Please try again later.",
          );
