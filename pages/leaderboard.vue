<template>
  <div class="leaderboard-container">
    <h1>Leaderboard</h1>
    <div
      v-for="(item, index) in paginatedLeaderboard"
      :key="index"
      class="leaderboard-item"
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
          <p class="profile-name">{{ item.displayName }}</p>
          <p class="profile-points">Points: {{ item.roundedPoints }}</p>
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
import { ethers } from "ethers";
import ProfileImage from "@/components/profile/ProfileImage.vue";
import { useToast } from "vue-toastification/dist/index.mjs";
import { getDomainName } from "@/utils/domainUtils";
import { fetchUsername, storeUsername } from "@/utils/storageUtils";

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

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.scroll.io",
    ); // Remplacez par votre URL RPC

    const shortenAddress = (address) => {
      return address.slice(0, 6) + "..." + address.slice(-4);
    };

    const fetchUserProfiles = async () => {
      const batchSize = 20;
      const delay = 3000;

      for (let i = 0; i < leaderboard.value.length; i += batchSize) {
        const batch = leaderboard.value.slice(i, i + batchSize);
        for (const item of batch) {
          const address = item.address.toLowerCase();
          try {
            let profile = fetchUsername(window, address);
            if (!profile) {
              profile = await getDomainName(address, provider);
              storeUsername(window, address, profile);
            }
            item.displayName = profile || shortenAddress(item.address);
            item.profileImage =
              sessionStorage.getItem(
                String(item.address).toLowerCase() + "-img",
              ) || "/img/user/anon.svg";
          } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error(
              `Error fetching profile for ${shortenAddress(item.address)}: ${error.message}`,
            );
            item.displayName = shortenAddress(item.address);
            item.profileImage = "/img/user/anon.svg";
          }
        }
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

    const getRank = (index) => {
      return (currentPage.value - 1) * itemsPerPage + index + 1;
    };

    const getProfileLink = (item) => {
      return item.address;
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
            profileImage:
              sessionStorage.getItem(
                String(item.address).toLowerCase() + "-img",
              ) || "/img/user/anon.svg", // Check for cached image
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
      getRank,
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
  background-color: #f1f1f1;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  margin: 10px 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateY(-5px);
}

.rank-container {
  flex: 0 0 30px;
  font-weight: bold;
  font-size: 1.2em;
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
  font-size: 1.1em;
}

.profile-points {
  color: #888888;
  font-size: 0.9em;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 10px 20px;
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
