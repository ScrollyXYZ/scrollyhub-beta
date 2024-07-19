<template>
  <div class="sidebar-quest" :class="{ 'dark-mode': isDarkMode, open: open }">
    <div
      id="sidebar1"
      :class="open ? 'collapse show' : 'collapse collapse-horizontal'"
    >
      <div
        class="quest-sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100"
      >
        <!-- Logout button -->
        <div class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
        </div>

        <!-- Dark mode toggle button -->
        <div class="mode-toggle-btn" @click="toggleDarkMode">
          <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </div>

        <div class="quest-card">
          <div v-if="isActivated" class="text-center">
            <NuxtLink to="/profile">
              <ProfileImage
                :key="profileImageKey"
                @click="closeLeftSidebar"
                class="img-fluid mt-3 rounded-circle w-30 quest-sidebar-profile-image"
                :address="address"
                :domain="userStore.getDefaultDomain"
                :image="userStore.getOrbisImage"
              />
            </NuxtLink>

            <div class="quest-profile-details">
              <div class="quest-username">
                {{ userStore.defaultDomain || "Guest" }}
              </div>
              <span
                v-if="!userStore.getIsConnectedToOrbis && isActivated"
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                :data-bs-target="'#verifyAccountModal'"
              >
                <i class="bi bi-person-check-fill"></i> Verify Ownership
              </span>
              <div class="quest-user-title">{{ userStore.getUserTitle }}</div>
              <div class="quest-progress-bar">
                <div
                  class="quest-progress"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
              <div class="quest-user-rank">
                Rank: {{ userStore.getUserRank }}
                <i
                  class="fas fa-info-circle quest-tooltip-icon"
                  title="Ranks are updated automatically every 24 hours."
                ></i>
              </div>
            </div>
          </div>

          <div
            v-if="!isActivated"
            class="quest-connect-wallet-section text-center"
          >
            <button class="btn btn-primary" @click="openConnectModal">
              Connect Wallet
            </button>
          </div>
          <div v-if="wrongChain" class="alert alert-warning mt-3">
            <strong>Warning!</strong> You are connected to the wrong network.
            Please switch to Scroll.
          </div>

          <hr class="quest-separator" />

          <!-- Nav -->
          <NuxtLink
            to="/dashboard"
            class="list-group-item cursor-pointer quest-hover-color"
            :class="{ 'quest-active': $route.path === '/dashboard' }"
          >
            <i class="fas fa-home"></i><span> Dashboard</span>
          </NuxtLink>
          <NuxtLink
            to="/quest"
            class="list-group-item cursor-pointer quest-hover-color"
            :class="{ 'quest-active': $route.path === '/quest' }"
          >
            <i class="fas fa-tasks"></i><span> Quests</span>
          </NuxtLink>
          <NuxtLink
            to="/leaderboard"
            class="list-group-item cursor-pointer quest-hover-color"
            :class="{ 'quest-active': $route.path === '/leaderboard' }"
          >
            <i class="fas fa-trophy"></i><span> Leaderboard</span>
          </NuxtLink>
          <NuxtLink
            to="/faq"
            class="list-group-item cursor-pointer quest-hover-color"
            :class="{ 'quest-active': $route.path === '/faq' }"
          >
            <i class="fas fa-info-circle"></i><span> FAQ</span>
          </NuxtLink>

          <NuxtLink
            to="/"
            @click.native="refreshLayout"
            class="list-group-item cursor-pointer quest-hover-color"
          >
            <i class="fas fa-arrow-left"></i><span> Back to the Map</span>
          </NuxtLink>
        </div>
        <SocialLinks />
      </div>
    </div>
  </div>
  <!-- Verify Account Ownership Modal -->
  <VerifyAccountOwnership />
</template>
<script>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  useEthers,
  useWallet,
  MetaMaskConnector,
  CoinbaseWalletConnector,
} from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useNotificationsStore } from "~/store/notifications";
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { getActivityPoints } from "~/utils/balanceUtils";
import { useThemeStore } from "~/store/theme";
import SocialLinks from "~/components/assets/SocialLinks.vue";
import VerifyAccountOwnership from "~/components/VerifyAccountOwnership.vue";

export default {
  name: "SidebarQuest",
  components: { ProfileImage, SocialLinks, VerifyAccountOwnership }, // Add the component
  props: ["lSidebar", "isMobile", "open"],
  setup(props) {
    const { address, isActivated, chainId } = useEthers();
    const { connectWith, disconnect } = useWallet();
    const config = useRuntimeConfig();
    const toast = useToast();
    const notificationsStore = useNotificationsStore();
    const userStore = useUserStore();
    const questStore = useQuestStore();
    const themeStore = useThemeStore();
    const router = useRouter();
    const userRank = ref(userStore.getUserRank);
    const userTitle = ref(userStore.getUserTitle);
    const profileImageKey = ref(Date.now());
    const wrongChain = ref(false);
    const isDarkMode = ref(themeStore.getIsDarkMode);

    const reloadProfileImage = () => {
      profileImageKey.value = Date.now();
    };

    const fetchUserRank = async () => {
      if (isActivated.value && address.value && !userStore.getUserRank) {
        try {
          const response = await fetch(
            `https://leaderboard-scrolly.vercel.app/rank/${address.value}`,
          );
          const data = await response.json();
          if (data.rank) {
            userStore.setUserRank(data.rank);
            userStore.setUserTitle(data.title);
          } else {
            userStore.setUserRank("");
            userStore.setUserTitle("");
          }
        } catch (error) {
          console.error("Failed to fetch user rank:", error);
          userStore.setUserRank("Error fetching rank");
          userStore.setUserTitle("Error fetching title");
        }
      }
    };

    const grades = [
      { name: "Scrolly Baby", points: 0 },
      { name: "Scrolly Novice", points: 667 },
      { name: "Scrolly Explorer", points: 1221 },
      { name: "Scrolly Mapper", points: 2442 },
      { name: "Carto Maestro", points: 4200 },
      { name: "Grand Cartographer of Scrolly", points: 6000 },
    ];

    const handleCategoryClick = (category) => {
      questStore.filterCategory(category);
      router.push("/quest");
    };

    const questCategories = computed(() => questStore.questCategories);

    const currentGrade = computed(() => {
      return (
        grades
          .slice()
          .reverse()
          .find((grade) => questStore.activityPoints >= grade.points) ||
        grades[0]
      );
    });

    const progress = computed(() => {
      const nextGrade = grades.find(
        (grade) => questStore.activityPoints < grade.points,
      );
      if (!nextGrade) return 100;
      const prevPoints = currentGrade.value.points;
      const nextPoints = nextGrade.points;
      return (
        ((questStore.activityPoints - prevPoints) / (nextPoints - prevPoints)) *
        100
      );
    });

    const completedQuests = computed(() => {
      if (!questStore.questCategories) return 0;
      return questStore.questCategories.reduce((total, category) => {
        return total + questStore.getCompletedQuests(category.quests);
      }, 0);
    });

    const totalQuests = computed(() => {
      if (!questStore.questCategories) return 0;
      return questStore.questCategories.reduce((total, category) => {
        return total + category.quests.length;
      }, 0);
    });

    const coinbaseConnector = new CoinbaseWalletConnector({
      appName: config.projectName,
      jsonRpcUrl: config.rpcCustom,
    });

    const mmConnector = new MetaMaskConnector({
      appUrl: config.projectUrl,
    });

    const openConnectModal = () => {
      const modal = new bootstrap.Modal(
        document.getElementById("connectModal"),
      );
      modal.show();
    };

    const connectMetaMask = async () => {
      await connectWith(mmConnector);
      if (typeof window !== "undefined") {
        localStorage.setItem("connected", "metamask");
      }
      userStore.setCurrentUserAddress(address.value);
      document.getElementById("closeConnectModal").click();
      reloadProfileImage();
      await fetchUserRank();
    };

    const connectCoinbase = async () => {
      await connectWith(coinbaseConnector);
      if (typeof window !== "undefined") {
        localStorage.setItem("connected", "coinbase");
      }
      userStore.setCurrentUserAddress(address.value);
      document.getElementById("closeConnectModal").click();
      reloadProfileImage();
      await fetchUserRank();
    };

    const fetchActivityPoints = async () => {
      if (config.activityPointsAddress && address.value) {
        const activityPoints = await getActivityPoints(address.value);
        userStore.setCurrentUserActivityPoints(activityPoints);
      }
    };

    const checkChain = () => {
      const supportedChainId = 534352; // ScrollChainId
      if (chainId.value !== supportedChainId) {
        wrongChain.value = true;
      } else {
        wrongChain.value = false;
      }
    };

    const logout = async () => {
      await disconnect();
      userStore.setCurrentUserAddress(null);
      userStore.setUserRank(null);
      userStore.setUserTitle(null);
    };

    const toggleDarkMode = () => {
      themeStore.toggleDarkMode();
      isDarkMode.value = themeStore.getIsDarkMode;
    };

    const refreshLayout = () => {
      router.push("/").then(() => {
        window.location.reload();
      });
    };

    watch(isActivated, (newVal) => {
      if (newVal) {
        fetchActivityPoints();
        fetchUserRank();
        checkChain();
      }
    });

    watch(chainId, (newVal) => {
      checkChain();
    });

    onMounted(() => {
      if (isActivated.value) {
        fetchActivityPoints();
        fetchUserRank();
        checkChain();
      }
    });

    return {
      address,
      isActivated,
      config,
      toast,
      notificationsStore,
      userStore,
      questStore,
      connectMetaMask,
      connectCoinbase,
      openConnectModal,
      currentGrade,
      progress,
      completedQuests,
      totalQuests,
      questCategories,
      handleCategoryClick,
      userRank,
      userTitle,
      logout,
      profileImageKey,
      wrongChain,
      toggleDarkMode,
      refreshLayout,
      isDarkMode,
    };
  },
};
</script>

<style scoped>
.quest-sidebar-nav {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 250px; /* Fixed width */
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  z-index: 2;
  font-family: "Roboto", sans-serif;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.dark-mode .quest-sidebar-nav {
  background: rgba(255, 255, 255, 0.1);
  color: #000;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.logout-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: transparent;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 3;
}

.mode-toggle-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  border-radius: 50%;
  padding: 5px;
  cursor: pointer;
  z-index: 3;
}

.logout-btn i,
.mode-toggle-btn i {
  color: #fff;
  font-size: 1.5em;
}

.dark-mode .logout-btn i,
.dark-mode .mode-toggle-btn i {
  color: #000;
}

.quest-card {
  background: none;
  color: #ffffff;
  border: none;
  width: 100%;
  margin: 0;
  padding: 20px;
}

.dark-mode .quest-card {
  color: #000;
}

.quest-sidebar-profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 3px solid #ffffff;
}

.dark-mode .quest-sidebar-profile-image {
  border: 3px solid #000;
}

.quest-profile-details {
  text-align: center;
}

.quest-username {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 5px;
  color: #ffffff;
  position: relative;
}

.dark-mode .quest-username {
  color: #000;
}

.quest-user-title {
  font-size: 1.2em;
  color: #dcdcdc;
}

.dark-mode .quest-user-title {
  color: white;
}

.quest-logout-btn {
  background: none;
  border: none;
  color: red;
  font-size: 0.8em;
  position: absolute;
  top: 0;
  right: -20px;
  cursor: pointer;
}

.quest-tooltip-icon {
  color: #dcdcdc;
  font-size: 1em;
  margin-left: 5px;
}

.dark-mode .quest-tooltip-icon {
  color: white;
}

.quest-user-rank {
  font-size: 1.1em;
  margin-top: 5px;
  color: #dcdcdc;
}

.dark-mode .quest-user-rank {
  color: white;
}

.quest-progress-bar {
  width: 80%;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  overflow: hidden;
  height: 12px;
  margin: 10px auto;
}

.dark-mode .quest-progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.quest-progress {
  height: 100%;
  background: #000;
}

.dark-mode .quest-progress {
  background: #fff;
}

.quest-separator {
  width: 100%;
  height: 1px;
  background: #000;
  margin: 20px 0;
}

.dark-mode .quest-separator {
  background: #fff;
}

.list-group-item {
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  margin-bottom: 5px;
  text-align: center;
  color: #000;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
  border-radius: 5px;
}

.list-group-item i {
  font-size: 1.5em;
  margin-right: 8px;
  transition: font-size 0.3s ease;
}

.dark-mode .list-group-item {
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.dark-mode .list-group-item i {
  color: #fff;
}

.quest-hover-color:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.dark-mode .quest-hover-color:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quest-active {
  background: #ccc;
  color: #000;
}

.dark-mode .quest-active {
  background: #667a8a;
  color: #fff;
}

NuxtLink {
  display: block;
  padding: 12px;
  text-align: center;
  color: #000;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 5px;
  border-radius: 5px;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

NuxtLink:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.dark-mode NuxtLink {
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
}

.dark-mode NuxtLink:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quest-connect-wallet-section {
  margin-top: auto;
  margin-bottom: 20px;
}

.quest-btn-connect {
  background: rgba(0, 0, 0, 0.3);
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.quest-btn-connect:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: scale(1.05);
}

.dark-mode .quest-btn-connect {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.dark-mode .quest-btn-connect:hover {
  background: rgba(255, 255, 255, 0.4);
}

.alert {
  width: 90%;
  margin: 0 auto;
  text-align: center;
  padding: 10px;
}

.dark-mode .alert {
  background: #333;
  color: #fff;
}

.light-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.light-mode-toggle i {
  font-size: 1.5em;
  margin-right: 8px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.social-links {
  margin-top: auto;
  display: flex;
  gap: 20px;
}

.social-link {
  color: var(--primary-color);
  font-size: 1.5rem;
  transition: color 0.3s;
}

.social-link:hover {
  color: #fff;
}

/* Light Mode Styles */
body.dark-mode {
  background-color: #333;
  color: #fff;
}

body.dark-mode .quest-sidebar-nav {
  background: rgba(255, 255, 255, 0.1);
  color: #000;
}

body.dark-mode .list-group-item {
  background: rgba(0, 0, 0, 0.1);
  color: #fff;
}

body.dark-mode .list-group-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

body.dark-mode .quest-progress {
  background: #fff;
}

body.dark-mode .quest-progress-bar {
  background: rgba(255, 255, 255, 0.2);
}
</style>
