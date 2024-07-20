<template>
  <div :class="['quests-default-layout', { 'dark-mode': isDarkMode }]">
    <Head>
      <Title>{{ $config.projectMetadataTitle }}</Title>
      <Meta name="description" :content="$config.projectDescription" />
      <Link rel="icon" type="image/x-icon" :href="$config.favicon" />
      <Meta property="og:title" :content="$config.projectMetadataTitle" />
      <Meta property="og:description" :content="$config.projectDescription" />
      <Meta
        property="og:image"
        :content="$config.projectUrl + $config.previewImage"
      />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" :content="$config.projectTwitter" />
      <Meta name="twitter:creator" :content="$config.projectTwitter" />
      <Meta name="twitter:title" :content="$config.projectMetadataTitle" />
      <Meta name="twitter:description" :content="$config.projectDescription" />
      <Meta
        name="twitter:image"
        :content="$config.projectUrl + $config.previewImage"
      />
    </Head>
    <!-- Main content with sidebars -->
    <div class="quests-page-container">
      <SidebarQuest
        ref="sidebarRef"
        :isMobile="isMobile"
        :open="layoutSidebarStore.leftSidebarOpen"
      />
      <button id="toggle-sidebar-button" @click="toggleSidebar" v-if="isMobile">
        ☰
      </button>
      <MoonBackground :isDarkMode="isDarkMode" />
      <main
        class="quests-main-container"
        v-show="layoutSidebarStore.showMainContent"
      >
        <slot></slot>
      </main>
      <BadgeSticker
        v-show="badgeIsEligible"
        class="fixed-bottom"
        style="margin-right: 0; margin-left: auto"
      />
    </div>
  </div>

  <!-- Connect Wallet modal -->
  <div
    class="modal modal-sm fade"
    id="connectModal"
    tabindex="-1"
    aria-labelledby="connectModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Connect your wallet</h5>
          <button
            id="closeConnectModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div class="modal-body row">
          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/metamask.png"
              class="card-img-top card-img-wallet"
              alt="MetaMask"
            />
            <small class="text-center mb-3 text-muted">MetaMask</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/rabby.png"
              class="card-img-top card-img-wallet"
              alt="Rabby"
            />
            <small class="text-center mb-3 text-muted">Rabby</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/bifrost.png"
              class="card-img-top card-img-wallet"
              alt="Bifrost"
            />
            <small class="text-center mb-3 text-muted">Bifrost</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/zerion.png"
              class="card-img-top card-img-wallet"
              alt="Zerion"
            />
            <small class="text-center mb-3 text-muted">Zerion</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectCoinbase"
          >
            <img
              src="@/assets/img/wallets/coinbase.png"
              class="card-img-top card-img-wallet"
              alt="Coinbase"
            />
            <small class="text-center mb-3 text-muted">Coinbase</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/brave.png"
              class="card-img-top card-img-wallet"
              alt="Brave"
            />
            <small class="text-center mb-3 text-muted">Brave</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/trust.png"
              class="card-img-top card-img-wallet"
              alt="Trust Wallet"
            />
            <small class="text-center mb-3 text-muted">Trust Wallet</small>
          </div>

          <div
            class="card col-6 cursor-pointer wallet-img-wrapper"
            @click="connectMetaMask"
          >
            <img
              src="@/assets/img/wallets/imtoken.png"
              class="card-img-top card-img-wallet"
              alt="imToken"
            />
            <small class="text-center mb-3 text-muted">imToken</small>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END Connect Wallet modal -->
  <!-- Do not delete: ugly hack to make "global" work with Vite -->
  <component :is="'script'"> var global = global || window; </component>
</template>

<script>
import axios from "axios";
import { ethers } from "ethers";
import {
  MetaMaskConnector,
  CoinbaseWalletConnector,
  useEthers,
  useWallet,
} from "vue-dapp";
import { useNotificationsStore } from "~/store/notifications";
import { useUserStore } from "~/store/user";
import { useSiteStore } from "~/store/site";
import SidebarQuest from "~/components/sidebars/SidebarQuest.vue";
import ChatSettingsModal from "~/components/ChatSettingsModal.vue";
import { getActivityPoints } from "~/utils/balanceUtils";
import { getDomainHolder, getDomainName } from "~/utils/domainUtils";
import { storeReferrer, storeUsername } from "~/utils/storageUtils";
import VerifyAccountOwnership from "~/components/VerifyAccountOwnership.vue";
import BadgeSticker from "~/components/badge/BadgeSticker.vue";
import ReferralModal from "~/components/referrals/ReferralModal.vue";
import ChangeUsernameModal from "~/components/names/ChangeUsernameModal.vue";
import FindUserModal from "~/components/search/FindUserModal.vue";
import MoonBackground from "~/components/quests/MoonBackground.vue";
import { useThemeStore } from "~/store/theme";
import { useLayoutSidebarStore } from "~/store/layoutSidebarStore";
import { ref, computed, onMounted, onUnmounted } from "vue";

export default {
  data() {
    return {
      badgeIsEligible: false,
      breakpoint: 1000,
      isMounted: false,
      referrer: null,
      width: null,
    };
  },
  components: {
    BadgeSticker,
    ChangeUsernameModal,
    ChatSettingsModal,
    FindUserModal,
    ReferralModal,
    SidebarQuest,
    VerifyAccountOwnership,
    MoonBackground,
  },
  mounted() {
    this.isMounted = true;
    document.documentElement.setAttribute(
      "data-bs-theme",
      this.siteStore.getColorMode,
    );
    this.width = window.innerWidth;
    this.updateSidebarState();

    if (!this.isActivated) {
      if (localStorage.getItem("connected") == "metamask") {
        this.connectMetaMask();
      } else if (localStorage.getItem("connected") == "coinbase") {
        this.connectCoinbase();
      }
    }
    new bootstrap.Popover(document.body, {
      selector: "[data-bs-toggle='popover']",
    });
    this.badgeCheckEligibility();
    this.siteStore.setFileUploadEnabled(this.$config.fileUploadEnabled);
    this.referrer = this.$route.query.ref;
    if (this.referrer) {
      this.parseReferrer();
    }

    window.addEventListener("resize", this.onWidthChange);
  },
  unmounted() {
    window.removeEventListener("resize", this.onWidthChange);
  },
  computed: {
    isConnectedToOrbis() {
      return this.userStore.getIsConnectedToOrbis;
    },
    isMobile() {
      return this.width < this.breakpoint;
    },
    isSupportedChain() {
      return this.chainId === this.$config.supportedChainId;
    },
    orbisAddress() {
      if (this.userStore.getDidParent) {
        return this.userStore.getDidParent.split(":").pop();
      }
    },
    isDarkMode() {
      const themeStore = useThemeStore();
      return themeStore.getIsDarkMode;
    },
  },
  methods: {
    getActivityPoints,
    getDomainHolder,
    getDomainName,
    async badgeCheckEligibility() {
      if (
        this.$config.badge.isLive &&
        this.isSupportedChain &&
        !this.badgeIsEligible
      ) {
        const checkUrl = `${this.$config.badge.apiBaseUrl}check?badge=${this.$config.badge.badgeContractAddress}&recipient=${this.address}`;
        try {
          const response = await axios.get(checkUrl);
          if (response.data.eligibility) {
            const intrfc = [
              "function hasBadge(address _user) external view returns (bool)",
            ];
            const contract = new ethers.Contract(
              this.$config.badge.badgeContractAddress,
              intrfc,
              this.signer,
            );
            try {
              const hasBadge = await contract.hasBadge(this.address);
              this.badgeIsEligible = !hasBadge;
            } catch (error) {
              console.error(error);
              this.badgeIsEligible = false;
            }
          } else {
            this.badgeIsEligible = false;
          }
        } catch (error) {
          console.error(error);
          this.badgeIsEligible = false;
        }
      }
    },
    async connectCoinbase() {
      await this.connectWith(this.coinbaseConnector);
      localStorage.setItem("connected", "coinbase");
      document.getElementById("closeConnectModal").click();
    },
    async connectMetaMask() {
      await this.connectWith(this.mmConnector);
      localStorage.setItem("connected", "metamask");
      document.getElementById("closeConnectModal").click();
    },
    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress) {
        const activityPoints = await this.getActivityPoints(
          this.address,
          this.signer,
        );
        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    },
    async fetchChatTokenBalance() {
      if (this.$config.chatTokenAddress) {
        const chatTokenInterface = new ethers.utils.Interface([
          "function balanceOf(address owner) view returns (uint256)",
        ]);
        const chatTokenContract = new ethers.Contract(
          this.$config.chatTokenAddress,
          chatTokenInterface,
          this.signer,
        );
        const balance = await chatTokenContract.balanceOf(this.address);
        this.userStore.setChatTokenBalanceWei(balance);
      }
    },
    async fetchOrbisNotifications() {
      if (this.userStore.getIsConnectedToOrbis) {
        this.notificationsStore.setLoadingNotifications(true);
        let { data, error, status } = await this.$orbis.getNotificationsCount({
          type: "social",
          context: this.$config.chatChannels.general,
        });
        if (status === 200 && data?.count_new_notifications) {
          this.notificationsStore.setUnreadNotificationsCount(
            data.count_new_notifications,
          );
        } else if (error) {
          console.log("New notifications count error", error);
        }
        let {
          data: notifications,
          error: notificationsError,
          status: notificationsStatus,
        } = await this.$orbis.getNotifications({
          type: "social",
          context: this.$config.chatChannels.general,
        });
        if (notificationsStatus === 200 && notifications) {
          const newNotifications = notifications.filter((item) => {
            return item.status === "new";
          });
          this.notificationsStore.setNotifications(newNotifications);
        } else if (notificationsError) {
          console.log("Notifications fetching error", notificationsError);
        }
        this.notificationsStore.setLoadingNotifications(false);
      }
    },
    async fetchOrbisProfile() {
      if (this.isActivated) {
        let { data, error } = await this.$orbis.getDids(this.address);
        if (data[0].did) {
          const profile = await this.$orbis.getProfile(data[0].did);
          if (profile && profile.data.details.profile) {
            this.userStore.setOrbisImage(profile.data.details.profile.pfp);
          }
          if (profile) {
            this.userStore.setFollowers(profile.data.count_followers);
            this.userStore.setFollowing(profile.data.count_following);
            this.userStore.setLastActivityTimestamp(
              profile.data.last_activity_timestamp,
            );
          }
          this.fetchOrbisNotifications();
        }
      }
    },
    async fetchUserDomain() {
      if (
        this.chainId === this.$config.supportedChainId &&
        this.address != this.userStore.getCurrentUserAddress
      ) {
        this.userStore.setCurrentUserAddress(this.address);
        let userDomain;
        if (this.signer) {
          userDomain = await this.getDomainName(this.address, this.signer);
        } else {
          userDomain = await this.getDomainName(this.address);
        }
        if (userDomain) {
          this.userStore.setDefaultDomain(userDomain + this.$config.tldName);
          storeUsername(
            window,
            this.address,
            userDomain + this.$config.tldName,
          );
        } else {
          this.userStore.setDefaultDomain(null);
        }
        this.fetchActivityPoints();
        this.fetchChatTokenBalance();
      }
    },
    async getOrbisDids() {
      const isConn = await this.$orbis.isConnected();
      this.userStore.setIsConnectedToOrbis(isConn);
      if (this.$orbis.session) {
        this.userStore.setDid(this.$orbis.session.did._id);
        this.userStore.setDidParent(this.$orbis.session.did._parentId);
      }
    },
    onWidthChange() {
      if (typeof window !== "undefined") {
        this.width = window.innerWidth;
        this.updateSidebarState();
      }
    },
    updateSidebarState() {
      if (this.isMobile) {
        this.layoutSidebarStore.setShowMainContent(true);
        this.layoutSidebarStore.leftSidebarOpen = false;
      } else {
        this.layoutSidebarStore.setShowMainContent(true);
        this.layoutSidebarStore.leftSidebarOpen = true;
      }
    },
    async orbisLogout() {
      await this.$orbis.logout();
      this.userStore.setIsConnectedToOrbis(false);
      this.userStore.setDid(null);
      this.userStore.setDidParent(null);
      this.userStore.setOrbisImage(null);
    },
    async parseReferrer() {
      if (!this.referrer.startsWith("0x")) {
        let domainName = this.referrer;
        if (this.referrer.includes(this.$config.tldName)) {
          domainName = this.referrer.split(".")[0];
        }
        this.referrer = await this.getDomainHolder(domainName);
      }
      if (this.address) {
        if (
          String(this.address).toLowerCase() ===
          String(this.referrer).toLowerCase()
        ) {
          return;
        }
      }
      if (
        ethers.utils.isAddress(this.referrer) &&
        this.referrer != ethers.constants.AddressZero
      ) {
        storeReferrer(window, this.referrer);
      }
    },
    toggleSidebar() {
      this.layoutSidebarStore.toggleLeftSidebar();
      this.layoutSidebarStore.setShowMainContent(
        !this.layoutSidebarStore.leftSidebarOpen,
      );
    },
  },
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    const config = useRuntimeConfig();
    const notificationsStore = useNotificationsStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const layoutSidebarStore = useLayoutSidebarStore();
    const { address, chainId, isActivated, signer } = useEthers();
    const { connectWith } = useWallet();

    const coinbaseConnector = new CoinbaseWalletConnector({
      appName: config.projectName,
      jsonRpcUrl: config.rpcCustom,
    });

    const mmConnector = new MetaMaskConnector({
      appUrl: config.projectUrl,
    });

    const isMobile = ref(false);

    onMounted(() => {
      isMobile.value = window.innerWidth < 768;

      window.addEventListener("resize", () => {
        isMobile.value = window.innerWidth < 768;
      });
    });

    onUnmounted(() => {
      window.removeEventListener("resize", () => {
        isMobile.value = window.innerWidth < 768;
      });
    });

    return {
      address,
      chainId,
      coinbaseConnector,
      connectWith,
      isActivated,
      mmConnector,
      signer,
      notificationsStore,
      siteStore,
      userStore,
      layoutSidebarStore,
      isDarkMode,
      isMobile,
    };
  },
  watch: {
    address(newVal, oldVal) {
      if (
        newVal.startsWith("0x") &&
        oldVal.startsWith("0x") &&
        String(newVal).toLowerCase() !== String(oldVal).toLowerCase()
      ) {
        this.orbisLogout();
      }
      if (newVal) {
        this.fetchUserDomain();
        this.badgeCheckEligibility();
      }
    },
    chainId(newVal, oldVal) {
      if (newVal) {
        this.fetchUserDomain();
        this.badgeCheckEligibility();
      }
    },
    isActivated(newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        localStorage.setItem("connected", "");
        this.orbisLogout();
      } else {
        if (!this.userStore.getDid) {
          this.getOrbisDids();
        }
      }
    },
    isConnectedToOrbis(newVal, oldVal) {
      if (newVal && oldVal === false) {
        this.fetchOrbisProfile();
      }
    },
    orbisAddress(newVal, oldVal) {
      if (newVal && this.address) {
        if (
          String(newVal).toLowerCase() != String(this.address).toLowerCase()
        ) {
          this.orbisLogout();
        }
      }
    },
    width(newVal, oldVal) {
      this.updateSidebarState();
    },
  },
};
</script>

<style scoped>
.quests-default-layout {
  position: relative;
  height: 100%;
  width: 100%;
}

.quests-page-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  height: 100%;
}
#toggle-sidebar-button {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
  font-size: 1.5rem;
  background-color: #007bff00;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.sidebar-open .quests-page-container {
  grid-template-columns: 1fr;
}
@media (max-width: 768px) {
  .quests-page-container {
    grid-template-columns: 1fr;
  }
}

.quests-main-container {
  padding: 2rem;
  z-index: 1;
  border-radius: 1rem;
  background-color: transparent;
  color: inherit;
}

.dark-mode .quests-main-container {
  background-color: transparent;
  color: inherit;
}
</style>
