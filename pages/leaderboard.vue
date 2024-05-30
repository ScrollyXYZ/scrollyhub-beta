<template>
  <div class="leaderboard-container">
    <h1>Leaderboard</h1>
    <div
      v-for="(item, index) in paginatedLeaderboard"
      :key="index"
      class="leaderboard-item"
    >
      <div class="profile-container">
        <router-link :to="'/profile/?id=' + getProfileLink(item)">
          <ProfileImage
            :address="item.address"
            :domain="item.displayName"
            :image="item.profileImage"
          />
        </router-link>
      </div>
      <div class="profile-info">
        <router-link :to="'/profile/?id=' + getProfileLink(item)">
          <p>{{ item.displayName }} - Points: {{ item.roundedPoints }}</p>
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
import { ref, onMounted } from "vue";
import ProfileImage from "@/components/profile/ProfileImage.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { Orbis } from "@orbisclub/orbis-sdk";

const orbis = new Orbis();

export default {
  components: {
    ProfileImage,
  },
  setup() {
    const leaderboard = ref([]);
    const paginatedLeaderboard = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 50;
    const totalPages = ref(1);
    const toast = useToast();

    const shortenAddress = (address) => {
      return address.slice(0, 6) + "..." + address.slice(-4);
    };

    const fetchOrbisProfile = async (address) => {
      let profile = { username: null, pfp: null };
      try {
        const cachedProfile = localStorage.getItem(address);
        if (cachedProfile) {
          return JSON.parse(cachedProfile);
        }

        const { data, error } = await orbis.getDids(address);
        if (data && data.length > 0) {
          const did = data[0].did;
          const profileResponse = await orbis.getProfile(did);
          if (profileResponse.status === 200) {
            profile = profileResponse.data.details.profile;
            localStorage.setItem(address, JSON.stringify(profile));
          }
        }
        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        console.error(`Error fetching profile for ${address}:`, error);
        toast.error(`Error fetching profile for ${address}: ${error.message}`);
      }
      return profile;
    };

    const fetchUserProfiles = async () => {
      const batchSize = 20;
      const delay = 3000;

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
            } catch (error) {
              console.error("Error fetching profile:", error);
              toast.error(
                `Error fetching profile for ${shortenAddress(item.address)}: ${error.message}`,
              );
              item.displayName = shortenAddress(item.address);
              item.profileImage = "/img/user/anon.svg";
            }
          }),
        );
        paginateLeaderboard();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    };

    const paginateLeaderboard = () => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      paginatedLeaderboard.value = leaderboard.value.slice(start, end);
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        paginateLeaderboard();
      }
    };

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        paginateLeaderboard();
      }
    };

    const getProfileLink = (item) => {
      return item.displayName !== shortenAddress(item.address)
        ? item.displayName + ".scrolly"
        : item.address;
    };

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
          await fetchUserProfiles();
          paginateLeaderboard();
        } catch (error) {
          console.error("Error fetching leaderboard data:", error);
          toast.error("Error fetching leaderboard data");
        }
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
    };
  },
};
</script>

<style scoped>
.leaderboard-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 10px 0;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-container {
  flex: 0 0 40px; /* Smaller size */
}

.profile-info {
  flex: 1;
  text-align: left;
  margin-left: 10px;
}

.profile-info p {
  margin: 0;
  font-size: 0.9em; /* Smaller font size */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 5px 10px; /* Smaller padding */
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
</style>
