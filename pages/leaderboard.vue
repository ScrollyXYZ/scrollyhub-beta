<template>
  <div :class="['leaderboard-container', { 'dark-mode': isDarkMode }]">
    <div :class="['header-section', { 'dark-mode': isDarkMode }]">
      <div class="header">
        <div :class="['title', { 'dark-mode': isDarkMode }]">Top Leaders</div>
      </div>
      <p :class="['welcome-message', { 'dark-mode': isDarkMode }]">
        We are thrilled to present the top 100 members of the Scrolly community
        on the hub! Their engagement, quest completions, and interactions on the
        hub have earned them this spot. Join the quests and participate in the
        community life on the hub—every message and interaction counts!
      </p>
    </div>
    <div class="linear-container">
      <div
        v-for="(leader, index) in paginatedLeaders"
        :key="leader.address"
        :class="['leader-row', 'leaderboard-item', { 'dark-mode': isDarkMode }]"
      >
        <div class="rank-container">
          <span :class="['rank', { 'dark-mode-text': isDarkMode }]">
            {{ (page - 1) * 20 + index + 1 }}
          </span>
        </div>
        <div class="profile-container">
          <ProfileImage
            v-if="leader.profilePicture"
            class="profile-image"
            :address="leader.address"
            :domain="leader.username"
            :image="convertIpfsUrl(leader.profilePicture)"
          />
        </div>
        <div class="profile-info">
          <span
            :class="[
              'leader-name',
              'profile-name',
              { 'dark-mode-text': isDarkMode },
            ]"
          >
            {{ cleanDisplayName(leader.username) }}
          </span>
        </div>
        <span
          :class="[
            'leader-points',
            'profile-points',
            { 'dark-mode-text': isDarkMode },
          ]"
        >
          {{ Math.round(leader.points) }} Points
        </span>
      </div>
    </div>
    <div class="pagination">
      <button
        @click="previousPage"
        :disabled="page === 1"
        :class="{ 'dark-mode-button': isDarkMode }"
      >
        Previous
      </button>
      <button
        @click="nextPage"
        :disabled="page * 20 >= leaders.length"
        :class="{ 'dark-mode-button': isDarkMode }"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { Orbis } from "@orbisclub/orbis-sdk";
import { fetchUsername, storeUsername } from "~/utils/storageUtils";
import { useThemeStore } from "~/store/theme";
import { getDomainName } from "~/utils/domainUtils";

const orbis = new Orbis();

export default {
  components: {
    ProfileImage,
  },
  data() {
    return {
      leaders: [],
      page: 1,
      allLoaded: false,
    };
  },
  computed: {
    paginatedLeaders() {
      const start = (this.page - 1) * 20;
      const end = start + 20;
      return this.leaders.slice(start, end);
    },
    isDarkMode() {
      return useThemeStore().getIsDarkMode;
    },
  },
  methods: {
    async fetchInitialLeaders() {
      try {
        const response = await fetch(
          "https://leaderboard-scrolly.vercel.app/leaderboard",
        );
        const data = await response.json();
        const top20 = data.leaderboard.slice(0, 20);
        const leaderPromises = top20.map(async (leader) => {
          const profile = await this.fetchOrbisProfile(leader.address);
          return {
            ...leader,
            username: profile.username || "Unknown",
            profilePicture:
              this.convertIpfsUrl(profile.profilePicture) ||
              "/img/user/anon.svg",
          };
        });
        this.leaders = await Promise.all(leaderPromises);
        this.refreshProfileImages();
      } catch (error) {
        console.error("Error fetching initial leaderboard data:", error);
      }
    },
    async fetchRemainingLeaders() {
      try {
        const response = await fetch(
          "https://leaderboard-scrolly.vercel.app/leaderboard",
        );
        const data = await response.json();
        const remaining = data.leaderboard.slice(20, 100);
        const leaderPromises = remaining.map(async (leader) => {
          const profile = await this.fetchOrbisProfile(leader.address);
          return {
            ...leader,
            username: profile.username || "Unknown",
            profilePicture:
              this.convertIpfsUrl(profile.profilePicture) ||
              "/img/user/anon.svg",
          };
        });
        const remainingLeaders = await Promise.all(leaderPromises);
        this.leaders = this.leaders.concat(remainingLeaders);
        this.allLoaded = true;
        this.refreshProfileImages();
      } catch (error) {
        console.error("Error fetching remaining leaderboard data:", error);
      }
    },
    async fetchOrbisProfile(address) {
      let profile = { username: null, profilePicture: null };

      const storedDomain = fetchUsername(window, address);
      if (storedDomain) {
        profile.username = storedDomain;
      } else {
        try {
          const { data } = await orbis.getDids(address);
          if (data && data.length > 0) {
            const did = data[0].did;
            const profileResponse = await orbis.getProfile(did);
            if (profileResponse.status === 200) {
              profile = profileResponse.data.details.profile || {};
              profile.username = profile.username || address;
              profile.profilePicture =
                profile.pfp || profile.profilePicture || null;
            }
          }

          let provider = this.$getFallbackProvider(
            this.$config.supportedChainId,
          );
          const domainName = await getDomainName(address, provider);
          if (domainName) {
            profile.username = domainName + this.$config.tldName;
            storeUsername(window, address, profile.username);
          } else {
            profile.username = address;
            storeUsername(window, address, address);
          }
        } catch (error) {
          console.error(`Error fetching profile for ${address}:`, error);
        }
      }

      return profile;
    },
    cleanDisplayName(displayName) {
      if (displayName) {
        return displayName.replace(/\.scrolly/g, "");
      }
      return "Unknown";
    },
    convertIpfsUrl(ipfsUrl) {
      if (ipfsUrl && ipfsUrl.startsWith("ipfs://")) {
        return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return ipfsUrl;
    },
    async refreshProfileImages() {
      const leaderPromises = this.leaders.map(async (leader) => {
        const profile = await this.fetchOrbisProfile(leader.address);
        leader.profilePicture =
          this.convertIpfsUrl(profile.profilePicture) || leader.profilePicture;
        leader.username = profile.username || leader.username;
      });
      await Promise.all(leaderPromises);
    },
    async nextPage() {
      if (this.page * 20 < this.leaders.length) {
        this.page++;
      }
      if (!this.allLoaded && this.leaders.length < this.page * 20 + 20) {
        await this.fetchRemainingLeaders();
      }
    },
    async previousPage() {
      if (this.page > 1) {
        this.page--;
      }
    },
  },
  async created() {
    await this.fetchInitialLeaders();
    this.fetchRemainingLeaders();
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
  max-width: 800px;
  font-family: Arial, sans-serif;
  background: var(--card-bg);
  color: var(--card-text);
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
  color: var(--welcome-message-color);
}

.rank-container,
.leaderboard-item .rank-container {
  flex: 0 0 30px;
  font-weight: bold;
  font-size: 1.1em;
}

.profile-container {
  flex: 0 0 40px; /* Increased to make the rows larger */
  margin-right: 10px;
}

.profile-image {
  width: 40px;
  height: 40px;
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
  font-size: 1.2em; /* Increased font size */
  color: var(--profile-name-color);
}

.profile-name:hover {
  color: var(--profile-name-hover-color);
}

.profile-points {
  color: var(--profile-points-color);
  font-size: 1.2em; /* Increased font size */
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
  padding: 8px 16px; /* Increased padding */
  margin: 4px 0;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateY(-3px);
}

.linear-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-top: 30px;
}

.leader-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  padding: 8px; /* Increased padding */
  border-bottom: 1px solid #ccc;
}

.rank {
  width: 40px; /* Increased to make the rows larger */
  text-align: center;
}

.profile-picture {
  width: 50px; /* Increased to make the rows larger */
  height: 50px; /* Increased to make the rows larger */
  border-radius: 50%;
  margin: 0 10px;
}

.leader-name {
  flex-grow: 1;
  text-align: left;
}

.leader-points {
  text-align: right;
  margin-left: auto;
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
  --welcome-message-color: #000000;
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
  --welcome-message-color: #ffffff;
  --profile-points-color: #aaaaaa;
  --profile-name-color: #ffffff;
  --profile-name-hover-color: #cccccc;
}

body.dark-mode .title {
  color: #ffffff;
}
body:not(.dark-mode) .title {
  color: #000000;
}

.dark-mode {
  color: #fff;
}

.dark-mode-text {
  color: #fff;
}

.dark-mode-button {
  background-color: #444;
  color: #fff;
}

.leader-row.dark-mode {
  border-bottom-color: #444;
}
</style>
