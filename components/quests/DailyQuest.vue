<template>
  <div class="daily-quest-container">
    <div :class="['daily-quest-card', { 'dark-mode': isDarkMode }]">
      <h2 class="daily-quest-title">Daily Quest</h2>
      <p class="daily-quest-info">
        <span>Claim your daily points:</span>
        <span>{{ dailyPoints }} MP</span>
      </p>
      <p class="daily-quest-status">
        Status:
        <span v-if="loadingStatus">Loading...</span>
        <span v-else-if="hasClaimed">Already claimed today</span>
        <span v-else-if="!isEligible">
          Not eligible to claim (Minimum 100,000 SCROLLY tokens required)
        </span>
        <span v-else>Eligible to claim</span>
      </p>
      <div class="daily-quest-actions">
        <button
          v-if="!loadingStatus && !hasClaimed && isEligible"
          @click="claimDailyPoints"
          class="claim-button"
        >
          Claim
        </button>
        <p v-if="hasClaimed && !loadingStatus">
          Next claim available in: {{ timeUntilNextClaim }}
        </p>
      </div>
      <div class="daily-quest-stats">
        <p>Your claims: {{ userClaims }}</p>
        <p>
          Your points: {{ userPoints }}
          <img
            src="@/assets/img/icon/mappy_icon.png"
            alt="Mappy Points"
            class="mappy-icon"
          />
        </p>
      </div>
    </div>

    <!-- Popup Notification -->
    <transition name="fade">
      <div
        v-if="showPopup"
        :class="[
          'popup-notification-custom',
          { 'dark-mode': isDarkMode, 'light-mode': !isDarkMode },
        ]"
      >
        {{ popupMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from "vue";
import { useThemeStore } from "~/store/theme";
import { useUserStore } from "~/store/user";
import { ethers } from "ethers";

export default {
  setup() {
    const themeStore = useThemeStore();
    const userStore = useUserStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const dailyPoints = ref(10);
    const userPoints = ref(0);
    const totalClaims = ref(0);
    const userClaims = ref(0);
    const hasClaimed = ref(false);
    const isEligible = ref(false);
    const loadingStatus = ref(true);
    const timeUntilNextClaim = ref("");
    const showPopup = ref(false);
    const popupMessage = ref("");

    const fetchDailyQuestData = async (contract, signer) => {
      try {
        const userAddress = await signer.getAddress();
        console.log("User address:", userAddress);

        const userHasClaimed = await contract.hasUserClaimed(userAddress);
        console.log("User has claimed:", userHasClaimed);

        const userTotalClaims = await contract.getUserClaims(userAddress);
        console.log("User total claims:", userTotalClaims);

        const totalClaimsCount = await contract.getTotalClaims();
        console.log("Total claims count:", totalClaimsCount);

        const userIsEligible = await contract.isEligible(userAddress);
        console.log("User is eligible:", userIsEligible);

        hasClaimed.value = userHasClaimed;
        userClaims.value = userTotalClaims;
        totalClaims.value = totalClaimsCount;
        isEligible.value = userIsEligible;
        loadingStatus.value = false;

        // Calculate points and time until next claim
        userPoints.value = userClaims.value * dailyPoints.value;

        if (hasClaimed.value) {
          const lastClaimedTimestamp = await contract.lastClaimed(userAddress);
          console.log(
            "Last claimed timestamp:",
            lastClaimedTimestamp.toString(),
          );

          const nextClaimTimestamp = lastClaimedTimestamp.toNumber() + 86400; // 24 hours
          const timeLeft = nextClaimTimestamp - Math.floor(Date.now() / 1000);
          timeUntilNextClaim.value = new Date(timeLeft * 1000)
            .toISOString()
            .substr(11, 8);
        }
      } catch (error) {
        console.error("Error fetching daily quest data:", error);
      }
    };

    const initializeDailyQuest = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = "0xe3a678ef78079be2d40930609bd0cf7fd732679a";
          const contractABI = [
            "function claimDailyPoints() external",
            "function hasUserClaimed(address user) external view returns (bool)",
            "function getTotalClaims() external view returns (uint256)",
            "function getUserClaims(address user) external view returns (uint256)",
            "function isClaimAvailable() external view returns (bool)",
            "function lastClaimed(address user) external view returns (uint256)",
            "function isEligible(address user) external view returns (bool)",
          ];
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer,
          );

          await fetchDailyQuestData(contract, signer);
        } catch (error) {
          console.error(
            "Error initializing ethers.js or fetching data:",
            error,
          );
        }
      }
    };

    const claimDailyPoints = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0xe3a678ef78079be2d40930609bd0cf7fd732679a";
        const contractABI = ["function claimDailyPoints() external"];
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        const tx = await contract.claimDailyPoints();
        await tx.wait();
        await fetchDailyQuestData(contract, signer);
        showPopupMessage(
          `Congratulations! You have successfully claimed ${dailyPoints.value} Mappy Points!`,
        );
      } catch (error) {
        console.error("Error claiming daily points:", error);
        showPopupMessage("Error claiming daily points.");
      }
    };

    const showPopupMessage = (message) => {
      popupMessage.value = message;
      showPopup.value = true;
      setTimeout(() => {
        showPopup.value = false;
      }, 5000);
    };

    onMounted(async () => {
      await initializeDailyQuest();
    });

    watch(
      () => userStore.getCurrentUserAddress,
      async (newAddress, oldAddress) => {
        if (newAddress) {
          await initializeDailyQuest();
        } else {
          resetDailyQuestData();
        }
      },
    );

    const resetDailyQuestData = () => {
      userPoints.value = 0;
      totalClaims.value = 0;
      userClaims.value = 0;
      hasClaimed.value = false;
      isEligible.value = false;
      loadingStatus.value = true;
      timeUntilNextClaim.value = "";
    };

    return {
      isDarkMode,
      dailyPoints,
      userPoints,
      totalClaims,
      userClaims,
      hasClaimed,
      isEligible,
      loadingStatus,
      timeUntilNextClaim,
      claimDailyPoints,
      showPopup,
      popupMessage,
    };
  },
};
</script>

<style scoped>
.daily-quest-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.daily-quest-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
}

.daily-quest-card.dark-mode {
  background: rgba(51, 51, 51, 0.9);
  color: #fff;
}

.daily-quest-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.daily-quest-info {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.daily-quest-status {
  font-size: 1em;
  margin-bottom: 20px;
}

.claim-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
}

.claim-button:hover {
  background-color: #45a049;
}

.daily-quest-stats {
  font-size: 0.9em;
  text-align: left;
}

.mappy-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-left: 5px;
}

/* Notification Styles */
.popup-notification-custom {
  position: fixed;
  top: 20px;
  right: 20px;
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
</style>
