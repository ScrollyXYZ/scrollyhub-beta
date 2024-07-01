<template>
  <div :class="['leaderboard', { 'dark-mode': isDarkMode }]">
    <h1 :class="{ 'dark-mode-text': isDarkMode }">Top 3 Leaders</h1>
    <div class="podium-container">
      <div v-if="leaders[1]" class="leader second">
        <div :class="['podium', { 'dark-mode-podium': isDarkMode }]">
          <ProfileImage
            class="profile-picture"
            :address="leaders[1].address"
            :domain="leaders[1].username"
            :image="leaders[1].profilePicture"
          />
          <span :class="['badge silver', { 'dark-mode-badge': isDarkMode }]"
            >2</span
          >
        </div>
        <p :class="['leader-name', { 'dark-mode-text': isDarkMode }]">
          {{ cleanDisplayName(leaders[1].username) }}
        </p>
        <p :class="['leader-points', { 'dark-mode-text': isDarkMode }]">
          {{ Math.round(leaders[1].points) }} Points
        </p>
      </div>
      <div v-if="leaders[0]" class="leader first">
        <div :class="['podium', { 'dark-mode-podium': isDarkMode }]">
          <ProfileImage
            class="profile-picture"
            :address="leaders[0].address"
            :domain="leaders[0].username"
            :image="leaders[0].profilePicture"
          />
          <span :class="['badge gold', { 'dark-mode-badge': isDarkMode }]"
            >1</span
          >
        </div>
        <p :class="['leader-name', { 'dark-mode-text': isDarkMode }]">
          {{ cleanDisplayName(leaders[0].username) }}
        </p>
        <p :class="['leader-points', { 'dark-mode-text': isDarkMode }]">
          {{ Math.round(leaders[0].points) }} Points
        </p>
      </div>
      <div v-if="leaders[2]" class="leader third">
        <div :class="['podium', { 'dark-mode-podium': isDarkMode }]">
          <ProfileImage
            class="profile-picture"
            :address="leaders[2].address"
            :domain="leaders[2].username"
            :image="leaders[2].profilePicture"
          />
          <span :class="['badge bronze', { 'dark-mode-badge': isDarkMode }]"
            >3</span
          >
        </div>
        <p :class="['leader-name', { 'dark-mode-text': isDarkMode }]">
          {{ cleanDisplayName(leaders[2].username) }}
        </p>
        <p :class="['leader-points', { 'dark-mode-text': isDarkMode }]">
          {{ Math.round(leaders[2].points) }} Points
        </p>
      </div>
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
    };
  },
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      isDarkMode,
    };
  },
  methods: {
    async fetchLeaders() {
      try {
        const response = await fetch(
          "https://leaderboard-scrolly.vercel.app/leaderboard",
        );
        const data = await response.json();
        const top3 = data.leaderboard.slice(0, 3);
        const leaderPromises = top3.map(async (leader) => {
          const profile = await this.fetchOrbisProfile(leader.address);
          return {
            ...leader,
            username: profile.username || "Unknown",
            profilePicture: profile.profilePicture || "/img/user/anon.svg",
          };
        });
        this.leaders = await Promise.all(leaderPromises);
        this.refreshProfileImages();
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    },
    async fetchOrbisProfile(address) {
      let profile = { username: null, profilePicture: null };

      // Check if author's domain is already stored
      const storedDomain = fetchUsername(window, address);
      if (storedDomain) {
        profile.username = storedDomain;
      } else {
        // Fetch profile from Orbis
        try {
          const { data } = await orbis.getDids(address);
          if (data && data.length > 0) {
            const did = data[0].did;
            const profileResponse = await orbis.getProfile(did);
            if (profileResponse.status === 200) {
              profile = profileResponse.data.details.profile;
              profile.username = profile.username || address;
              profile.profilePicture = profile.pfp || profile.profilePicture;
            }
          }

          // Fetch domain name from provider
          let provider = this.$getFallbackProvider(
            this.$config.supportedChainId,
          );
          const domainName = await getDomainName(address, provider);
          if (domainName) {
            profile.username = domainName + this.$config.tldName;
            storeUsername(window, address, profile.username);
          } else {
            // Store the address as the fallback username
            profile.username = address;
            storeUsername(window, address, address);
          }
        } catch (error) {
          console.error(`Error fetching profile for ${address}:`, error);
        }
      }

      console.log(`Profile for ${address}:`, profile); // Log the profile for debugging

      return profile;
    },
    cleanDisplayName(displayName) {
      console.log("Cleaning display name:", displayName);
      if (displayName) {
        return displayName.replace(/\.scrolly/g, "");
      }
      return "Unknown"; // Fallback if displayName is null or undefined
    },
    async refreshProfileImages() {
      const leaderPromises = this.leaders.map(async (leader) => {
        const profile = await this.fetchOrbisProfile(leader.address);
        leader.profilePicture = profile.profilePicture || leader.profilePicture;
        leader.username = profile.username || leader.username;
      });
      await Promise.all(leaderPromises);
    },
  },
  async created() {
    await this.fetchLeaders();
  },
};
</script>

<style scoped>
.leaderboard {
  text-align: center;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-top: 30px;
}

.leader {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.first {
  margin-top: -30px;
}

.second {
  margin-top: -10px;
}

.third {
  margin-top: 0;
}

.podium {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 5px 10px;
  border-radius: 50%;
  font-size: 1em;
  font-weight: bold;
  color: white;
}

.gold {
  background-color: gold;
}

.silver {
  background-color: silver;
}

.bronze {
  background-color: #cd7f32;
}

.dark-mode {
  color: #fff;
}

.dark-mode-text {
  color: #fff;
}

.dark-mode-podium {
  background-color: #444;
  color: #fff;
}

.dark-mode-badge {
  color: #000;
}

.leader-name {
  font-weight: bold;
  font-size: 0.9em;
}

.leader-points {
  font-size: 0.8em;
}
</style>
