<template>
  <div :class="['leaderboard-container', { 'dark-mode': isDarkMode }]">
    <div :class="['header-section', { 'dark-mode': isDarkMode }]">
      <div class="header">
        <div :class="['title', { 'dark-mode': isDarkMode }]">Leaderboard</div>
        <a @click="showModal = true" class="refresh-link"
          >Clear Cache and Refresh</a
        >
      </div>
      <p :class="['welcome-message', { 'dark-mode': isDarkMode }]">
        We are thrilled to present the top 100 members of the Scrolly community
        on the hub! Their engagement, quest completions, and interactions on the
        hub have earned them this spot. Join the quests and participate in the
        community life on the hub—every message and interaction counts!
      </p>
    </div>
    <div
      v-if="userRank !== null"
      :class="[
        'user-rank',
        'leaderboard-item',
        'highlight',
        { 'dark-mode': isDarkMode },
      ]"
    >
      <div class="rank-container">
        <span>{{ userRank }}</span>
      </div>
      <div class="profile-container">
        <router-link to="/profile">
          <ProfileImage
            :address="address"
            :domain="displayName"
            :image="profileImage"
            class="profile-image"
          />
        </router-link>
      </div>
      <div class="profile-info">
        <router-link to="/profile">
          <p :class="['profile-name', { 'dark-mode': isDarkMode }]">
            {{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}
          </p>
          <p :class="['profile-points', { 'dark-mode': isDarkMode }]">
            Points: {{ getUserAp }}
          </p>
        </router-link>
      </div>
    </div>
    <p v-else-if="userRankError">{{ userRankError }}</p>
    <hr :class="['section-separator', { 'dark-mode': isDarkMode }]" />
    <div v-if="showModal" class="modal-overlay">
      <div :class="['modal-content', { 'dark-mode': isDarkMode }]">
        <h2 :class="['title', { 'dark-mode': isDarkMode }]">
          Trouble Displaying Data?
        </h2>
        <p>
          If you are experiencing display issues, you can clear the cache and
          refresh the data. Please note that data is fetched from the
          blockchain, and due to our RPC limitations, there may be delays or
          missing usernames. This can happen when the RPC requests are
          overloaded. You can try to clear cache and refresh to update missing
          data. All data is stored on Ceramic or Scroll Network, and we ensure
          your data's safety.
        </p>
        <p>
          If you do not see your points updated in the table, the data refreshes
          automatically. Our Scrolly engineers progressively fetch data from the
          blockchain, and your updated balance appears at the top of your
          screen!
        </p>
        <button @click="clearCacheAndRefresh" class="modal-button">
          Clear Cache and Refresh
        </button>
        <button @click="showModal = false" class="modal-button">Close</button>
      </div>
    </div>
    <div v-if="loading" class="loading-indicator">
      Refreshing data, please wait...
    </div>
    <div
      v-for="(item, index) in paginatedLeaderboard"
      :key="index"
      :class="[
        'leaderboard-item',
        { highlight: isCurrentUser(item.address), 'dark-mode': isDarkMode },
      ]"
    >
      <div class="rank-container">
        <span>{{ getRank(index) }}</span>
      </div>
      <div class="profile-container">
        <router-link :to="'/profile/?id=' + getProfileLink(item)">
          <ProfileImage
            :address="item.address"
            :domain="item.displayName"
            :image="item.profileImage"
            class="profile-image"
          />
        </router-link>
      </div>
      <div class="profile-info">
        <router-link :to="'/profile/?id=' + getProfileLink(item)">
          <p :class="['profile-name', { 'dark-mode': isDarkMode }]">
            {{ cleanDisplayName(item.displayName) }}
          </p>
          <p :class="['profile-points', { 'dark-mode': isDarkMode }]">
            Points: {{ Math.round(item.roundedPoints) }}
          </p>
        </router-link>
      </div>
    </div>
    <div class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1">
        Previous
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import ProfileImage from "@/components/profile/ProfileImage.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { Orbis } from "@orbisclub/orbis-sdk";
import { useEthers } from "vue-dapp";
import { getActivityPoints } from "~/utils/balanceUtils";
import { useUserStore } from "~/store/user";
import { useThemeStore } from "~/store/theme";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

const orbis = new Orbis();

export default {
  components: {
    ProfileImage,
  },
  setup() {
    const { address, isActivated, signer } = useEthers();
    const userStore = useUserStore();
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const leaderboard = ref([]);
    const paginatedLeaderboard = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 20;
    const totalPages = ref(1);
    const showModal = ref(false);
    const loading = ref(false);
    const userRank = ref(null);
    const userPoints = ref(0);
    const userRankError = ref("");
    const displayName = ref("");
    const profileImage = ref("");
    const toast = useToast();
    const maxRetries = 3;
    const retryDelay = 2000;

    const shortenAddress = (address) =>
      address.slice(0, 6) + "..." + address.slice(-4);

    const cleanDisplayName = (displayName) =>
      displayName.replace(/\.scrolly/g, "");

    const fetchOrbisProfile = async (address) => {
      let profile = { username: null, pfp: null };
      try {
        const { data } = await orbis.getDids(address);
        if (data && data.length > 0) {
          const did = data[0].did;
          const profileResponse = await orbis.getProfile(did);
          if (profileResponse.status === 200) {
            profile = profileResponse.data.details.profile;
          }
        }
      } catch (error) {
        console.error(`Error fetching profile for ${address}:`, error);
      }
      return profile;
    };

    const fetchUserProfiles = async (forceRefresh = false, retryCount = 0) => {
      const batchSize = 20;
      const delay = 3000;
      let allProfilesLoaded = true;

      for (let i = 0; i < leaderboard.value.length; i += batchSize) {
        const batch = leaderboard.value.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (item) => {
            const address = item.address.toLowerCase();
            try {
              const profile = await fetchOrbisProfile(address);
              item.displayName =
                profile.username || shortenAddress(item.address);
              item.profileImage = profile.pfp || "/img/user/anon.svg";
              if (forceRefresh) {
                sessionStorage.removeItem(
                  String(address).toLowerCase() + "-img",
                );
              }
              if (!profile.username || !profile.pfp) {
                allProfilesLoaded = false;
              }
            } catch (error) {
              console.error("Error fetching profile:", error);
              item.displayName = shortenAddress(item.address);
              item.profileImage = "/img/user/anon.svg";
              allProfilesLoaded = false;
            }
          }),
        );
        paginateLeaderboard();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      if (!allProfilesLoaded && retryCount < maxRetries) {
        console.log(
          `Retrying to fetch missing profiles, attempt ${retryCount + 1}`,
        );
        setTimeout(
          () => fetchUserProfiles(forceRefresh, retryCount + 1),
          retryDelay,
        );
      } else {
        loading.value = false;
      }
    };

    const clearCacheAndRefresh = async () => {
      loading.value = true;
      sessionStorage.clear();
      await fetchUserProfiles(true);
      toast.success("Cache cleared and data refreshed!");
    };

    const paginateLeaderboard = () => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      paginatedLeaderboard.value = leaderboard.value.slice(start, end);
    };

    const nextPage = async () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        paginateLeaderboard();
        await fetchUserProfiles(); // Ensure fetching user profiles for the new page
      }
    };

    const previousPage = async () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        paginateLeaderboard();
        await fetchUserProfiles(); // Ensure fetching user profiles for the new page
      }
    };

    const getRank = (index) =>
      (currentPage.value - 1) * itemsPerPage + index + 1;

    const getProfileLink = (item) => item.address;

    const fetchUserRank = async () => {
      if (isActivated.value && address.value) {
        try {
          const response = await fetch(
            `https://leaderboard-scrolly.vercel.app/rank/${address.value}`,
          );
          const data = await response.json();
          if (data.rank) {
            userRank.value = data.rank;
            await fetchActivityPoints();
            const profile = await fetchOrbisProfile(address.value);
            displayName.value =
              profile.username || shortenAddress(address.value);
            profileImage.value = profile.pfp || "/img/user/anon.svg";
          } else {
            userRankError.value =
              "Sorry, only Scrolly Domains Holders are displayed on this leaderboard.";
          }
        } catch (error) {
          console.error("Error fetching user rank:", error);
          userRankError.value = "Error fetching user rank.";
        }
      }
    };

    const fetchActivityPoints = async () => {
      if (address.value) {
        userPoints.value = await getActivityPoints(address.value, signer);
        userStore.setCurrentUserActivityPoints(userPoints.value);
      }
    };

    const isCurrentUser = (userAddress) =>
      isActivated.value &&
      address.value.toLowerCase() === userAddress.toLowerCase();

    onMounted(async () => {
      if (typeof window !== "undefined") {
        try {
          const response = await fetch(
            "https://leaderboard-scrolly.vercel.app/leaderboard",
          );
          const data = await response.json();
          leaderboard.value = data.leaderboard.map((item) => ({
            ...item,
            roundedPoints: Math.round(item.points),
            displayName: shortenAddress(item.address),
            profileImage: "/img/user/anon.svg", // Placeholder until we fetch the actual image
          }));
          totalPages.value = Math.ceil(leaderboard.value.length / itemsPerPage);
          await fetchUserRank();
          await fetchUserProfiles();
          paginateLeaderboard();
        } catch (error) {
          console.error("Error fetching leaderboard data:", error);
          toast.error("Error fetching leaderboard data");
        }
      }
    });

    watch([address, isActivated], async ([newAddress, newIsActivated]) => {
      if (newIsActivated) {
        await fetchUserRank();
        await fetchOrbisProfile(newAddress);
      }
    });

    return {
      leaderboard,
      paginatedLeaderboard,
      currentPage,
      totalPages,
      nextPage,
      previousPage,
      shortenAddress,
      getProfileLink,
      showModal,
      clearCacheAndRefresh,
      loading,
      userRank,
      userPoints,
      userRankError,
      isCurrentUser,
      cleanDisplayName,
      getRank,
      displayName,
      profileImage,
      isDarkMode,
      getUserAp: userStore.getCurentUserActivityPoints,
      getTextWithoutBlankCharacters,
      userStore,
    };
  },
};
definePageMeta({
  layout: "quests",
});
</script>
<style scoped>
.leaderboard-container {
  margin: 0 auto;
  padding: 20px;
  max-width: 800px; /* Centering the leaderboard */
  font-family: Arial, sans-serif;
  background: var(--card-bg); /* Variable for background */
  color: var(--card-text); /* Variable for text color */
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-section {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.5em;
  font-weight: bold;
}

.refresh-link {
  font-size: 0.9em;
  cursor: pointer;
  color: #007bff;
  text-decoration: underline;
}

.welcome-message {
  margin-top: 10px;
  font-size: 1em;
  text-align: center;
  color: var(--welcome-message-color); /* Added for text color */
}

.user-rank {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 8px 0;
  background: var(--highlight-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-container,
.leaderboard-item .rank-container {
  flex: 0 0 30px;
  font-weight: bold;
  font-size: 1.1em;
}

.profile-container {
  flex: 0 0 30px;
  margin-right: 10px;
}

.profile-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.profile-info {
  flex: 1;
  text-align: left;
}

.profile-info p {
  margin: 0;
}

.profile-name {
  font-weight: bold;
  font-size: 1em;
  color: var(--profile-name-color);
}

.profile-name:hover {
  color: var(--profile-name-hover-color);
}

.profile-points {
  color: var(--profile-points-color);
  font-size: 0.9em;
}

.loading-indicator {
  text-align: center;
  font-size: 1.2em;
  color: #007bff;
  margin: 20px 0;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin: 8px 0;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateY(-3px);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background-color: #0056b3;
}

.highlight {
  background-color: var(--highlight-bg);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1090;
}

.modal-content {
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  background: var(--card-bg);
  color: var(--card-text);
}

.modal-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin: 10px;
  cursor: pointer;
}

.modal-button:hover {
  background: #0056b3;
}

.section-separator {
  border: none;
  height: 1px;
  background-color: #ddd;
  margin: 20px 0;
}

/* Light Mode Styles */
.leaderboard-container:not(.dark-mode),
.header-section:not(.dark-mode),
.modal-content:not(.dark-mode) {
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-text: #000000;
  --highlight-bg: rgba(230, 247, 255, 0.9);
  --welcome-message-color: #000000; /* Added for text color */
  --profile-points-color: #888888;
  --profile-name-color: #000000;
  --profile-name-hover-color: #666666;
}

/* Dark Mode Styles */
.leaderboard-container.dark-mode,
.header-section.dark-mode,
.modal-content.dark-mode {
  --card-bg: rgba(50, 50, 50, 0.9);
  --card-text: #ffffff;
  --highlight-bg: rgba(30, 59, 73, 0.9);
  --welcome-message-color: #ffffff; /* Added for text color */
  --profile-points-color: #aaaaaa;
  --profile-name-color: #ffffff;
  --profile-name-hover-color: #cccccc;
}

body.dark-mode .title {
  color: #ffffff; /* Title color for dark mode */
}
body:not(.dark-mode) .title {
  color: #000000; /* Title color for light mode */
}
</style>
