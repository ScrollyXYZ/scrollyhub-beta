<template>
  <div class="leaderboard">
    <h1>Top 3 Leaders</h1>
    <div class="podium-container">
      <div v-if="leaders[1]" class="leader second">
        <ProfileImage
          class="profile-picture"
          :address="leaders[1].address"
          :domain="leaders[1].username"
          :image="leaders[1].profilePicture"
        />
        <p class="leader-name">{{ cleanDisplayName(leaders[1].username) }}</p>
        <p class="leader-points">{{ leaders[1].points }} Points</p>
      </div>
      <div v-if="leaders[0]" class="leader first">
        <ProfileImage
          class="profile-picture"
          :address="leaders[0].address"
          :domain="leaders[0].username"
          :image="leaders[0].profilePicture"
        />
        <p class="leader-name">{{ cleanDisplayName(leaders[0].username) }}</p>
        <p class="leader-points">{{ leaders[0].points }} Points</p>
      </div>
      <div v-if="leaders[2]" class="leader third">
        <ProfileImage
          class="profile-picture"
          :address="leaders[2].address"
          :domain="leaders[2].username"
          :image="leaders[2].profilePicture"
        />
        <p class="leader-name">{{ cleanDisplayName(leaders[2].username) }}</p>
        <p class="leader-points">{{ leaders[2].points }} Points</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { Orbis } from "@orbisclub/orbis-sdk";
import { getDomainName } from "~/utils/domainUtils";
import { fetchUsername, storeUsername } from "~/utils/storageUtils";

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
  methods: {
    async fetchLeaders() {
      try {
        const response = await fetch(
          "https://leaderboard-scrolly.vercel.app/leaderboard",
        );
        const data = await response.json();
        const top3 = data.leaderboard.slice(0, 3);
        const leaderPromises = top3.map(async (leader) => {
          const profile = await this.fetchProfileData(leader.address);
          return {
            ...leader,
            username: profile.username || "Unknown",
            profilePicture: profile.profilePicture || "/img/user/anon.svg",
          };
        });
        this.leaders = await Promise.all(leaderPromises);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    },
    async fetchProfileData(address) {
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
          }
        } catch (error) {
          console.error(`Error fetching profile for ${address}:`, error);
        }
      }

      return profile;
    },
    cleanDisplayName(displayName) {
      return displayName.replace(/\.scrolly/g, "");
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
}

.leader {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.first {
  margin-top: -20px;
}

.profile-picture {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.leader-name {
  font-weight: bold;
  font-size: 0.9em;
}

.leader-points {
  font-size: 0.8em;
}
</style>
