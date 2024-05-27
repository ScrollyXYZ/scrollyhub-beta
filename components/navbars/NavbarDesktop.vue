<template>
  <nav class="navbar navbar-expand-lg navbar-bg-custom">
    <div class="container-fluid">
      <!-- Scrolly Logo Left -->
      <NuxtLink class="navbar-brand" to="/">
        <img
          src="/img/banner.png"
          alt="Chat logo"
          height="90"
          class="filtered-shadow"
        />
      </NuxtLink>

      <!-- Navbar Content -->
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav mx-auto d-flex justify-content-center">
          <li class="nav-item align-items-center justify-content-center">
            <NuxtLink class="nav-link" to="/">
              <span class="navbar-brand-text align-middle">Hub</span>
              <span
                class="badge text-bg-secondary"
                v-if="
                  !notificationsStore.getLoadingNotifications &&
                  notificationsStore.getUnreadNotificationsCount > 0
                "
              >
                {{ notificationsStore.getUnreadNotificationsCount }}
              </span>
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/nft">
              <span class="navbar-brand-text align-middle">NFT Launchpad</span>
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/swap">
              <span class="navbar-brand-text align-middle">Swap</span>
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink class="nav-link" to="/quest">
              <span class="navbar-brand-text align-middle">Quests</span>
            </NuxtLink>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://sns.scrolly.xyz" target="_blank">
              <span class="navbar-brand-text align-middle">SNS</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Account -->
      <ul class="navbar-nav">
        <div class="d-flex align-items-center">
          <li v-if="!isActivated" class="nav-item">
            <ConnectWalletButton
              class="nav-link cursor-pointer"
              btnText="Connect wallet"
            />
          </li>
          <li v-if="!isActivated" class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Theme:
              {{ `${String(siteStore.getColorMode).charAt(0).toUpperCase()}${String(siteStore.getColorMode).slice(1)}` }}
            </a>
            <div class="dropdown-menu dropdown-menu-end">
              <span
                class="dropdown-item cursor-pointer"
                @click="changeColorMode('scrolly')"
              >
                Scrolly
              </span>
              <span
                class="dropdown-item cursor-pointer"
                @click="changeColorMode('dark')"
              >
                Dark
              </span>
              <span
                class="dropdown-item cursor-pointer"
                @click="changeColorMode('light')"
              >
                Light
              </span>
            </div>
          </li>
          <!-- Mappy Points -->
          <div
            v-if="
              isActivated &&
              $config.activityPointsAddress &&
              $config.showFeatures.activityPoints
            "
            class="connect-wallet-button user-and-settings-container d-flex align-items-start"
          >
            <div style="flex-grow: 0">
              <!-- Image Left -->
              <NuxtLink to="/profile" v-if="userStore.getDefaultDomain">
                <ProfileImage
                  :key="userStore.getOrbisImage"
                  @click="closeLeftSidebar"
                  class="img-fluid rounded-circle"
                  :address="address"
                  :domain="userStore.getDefaultDomain"
                  :image="userStore.getOrbisImage"
                  style="width: 60px; height: 60px"
                />
              </NuxtLink>
            </div>
            <!-- Settings & Chain bar -->
            <div style="flex-grow: 1; padding-left: 20px">
              <div class="d-flex flex-column align-items-start">
                <!-- Username or Get your username -->
                <div class="">
                  <a
                    class=""
                    href="#"
                    id="dropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <h6 class="m-0 d-flex align-items-center">
                      <span v-if="userStore.getDefaultDomain">
                        <i class="user-name">
                          {{
                            getTextWithoutBlankCharacters(
                              userStore.getDefaultDomain,
                            )
                          }}
                        </i>
                        <i
                          class="user-name bi bi-nut-fill"
                          style="margin-left: 5px"
                        ></i>
                      </span>
                      <span v-else>
                        Get your Scrolly Domain
                        <i class="bi bi-nut-fill" style="margin-left: 5px"></i>
                      </span>
                      <SwitchChainButton
                        v-if="isActivated"
                        :navbar="true"
                        :dropdown="true"
                        v-b-tooltip.hover
                        :title="networkMessage"
                        style="margin-left: 10px"
                      />
                    </h6>
                  </a>
                  <!-- Settings Dropdown -->
                  <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                    <NuxtLink class="dropdown-item" to="/profile">
                      Profile
                    </NuxtLink>
                    <span
                      class="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#referralModal"
                    >
                      Share referral link
                    </span>
                    <span
                      class="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#themeSelectionModal"
                    >
                      Theme
                    </span>
                    <span
                      class="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#chatSettingsModal"
                    >
                      More settings
                    </span>
                    <span class="dropdown-item" @click="disconnectWallet">
                      Disconnect
                    </span>
                  </div>
                </div>
                <!-- Tokens & Mappy Points div -->
                <div class="d-flex justify-content-start mt-2">
                  <!-- sub-tokens-->
                  <button
                    v-if="
                      userStore.getChatTokenBalanceWei > 0 &&
                      $config.chatTokenAddress
                    "
                    class="nav-custom-button btn btn-outline-primary btn-sm me-2"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {{ userStore.getChatTokenBalance }}
                    {{ $config.chatTokenSymbol }}
                  </button>
                  <div class="dropdown-menu">
                    <NuxtLink
                      class="dropdown-item"
                      to="/stake"
                      v-if="
                        $config.stakingContractAddress &&
                        $config.showFeatures.stake
                      "
                    >
                      Stake & earn weekly {{ $config.tokenSymbol }} rewards
                    </NuxtLink>
                    <span class="dropdown-item" @click="addToMetaMask">
                      Add {{ $config.chatTokenSymbol }} to MetaMask
                    </span>
                  </div>

                  <!-- sub-Activity Points -->
                  <div
                    v-if="
                      $config.activityPointsAddress &&
                      $config.showFeatures.activityPoints &&
                      isActivated
                    "
                    class="nav-custom-button btn btn-outline-primary btn-sm me-2"
                  >
                    <NuxtLink to="/activity-points">
                      {{ getUserAp }} MP
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ul>
    </div>
    <div
      class="modal fade"
      id="themeSelectionModal"
      tabindex="-1"
      aria-labelledby="themeSelectionModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="themeSelectionModalLabel">
              Choose Theme
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <button
              class="btn btn-primary w-100 mb-2"
              @click="
                changeColorMode('scrolly');
                $bvModal.hide('themeSelectionModal');
              "
            >
              Scrolly
            </button>
            <button
              class="btn btn-secondary w-100 mb-2"
              @click="
                changeColorMode('dark');
                $bvModal.hide('themeSelectionModal');
              "
            >
              Dark
            </button>
            <button
              class="btn btn-light w-100"
              @click="
                changeColorMode('light');
                $bvModal.hide('themeSelectionModal');
              "
            >
              Light
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useEthers, useWallet, shortenAddress } from "vue-dapp";
import { useSiteStore } from "~/store/site";
import { useUserStore } from "~/store/user";
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import SwitchChainButton from "~/components/SwitchChainButton.vue";
import { addTokenToMetaMask } from "~/utils/tokenUtils";
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";
import { useNotificationsStore } from "~/store/notifications";

export default {
  name: "Navbar",

  components: {
    ConnectWalletButton,
    ProfileImage,
    SwitchChainButton,
  },
  computed: {
    getUserAp() {
      if (this.userStore.getCurentUserActivityPoints > 0) {
        return this.userStore.getCurentUserActivityPoints;
      } else {
        return 0;
      }
    },
  },

  mounted() {
    this.enableDropdownHover();
  },

  methods: {
    enableDropdownHover() {
      const dropdowns = this.$el.querySelectorAll(".dropdown");
      dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("mouseover", function () {
          this.classList.add("show");
          this.querySelector(".dropdown-menu").classList.add("show");
        });
        dropdown.addEventListener("mouseout", function () {
          this.classList.remove("show");
          this.querySelector(".dropdown-menu").classList.remove("show");
        });
      });
    },
    getActivityPoints() {
      // Activity Points Query
    },

    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress && this.address) {
        this.toast.info("Refreshing activity points...", { timeout: 2000 });
        const activityPoints = await this.getActivityPoints(this.address);
        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    },
    addToMetaMask() {
      addTokenToMetaMask(
        window.ethereum,
        this.$config.chatTokenAddress,
        this.$config.chatTokenSymbol,
        18, // decimals
        this.$config.chatTokenImage,
      );
    },

    changeColorMode(newMode) {
      this.siteStore.setColorMode(newMode);
      document.documentElement.setAttribute(
        "data-bs-theme",
        this.siteStore.getColorMode,
      );
    },

    async disconnectWallet() {
      this.disconnect();
    },
  },
  setup() {
    const { disconnect } = useWallet();
    const { address, isActivated } = useEthers();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const notificationsStore = useNotificationsStore();
    return {
      address,
      disconnect,
      isActivated,
      notificationsStore,
      shortenAddress,
      siteStore,
      userStore,
    };
  },
};
</script>

<style scoped>
.navbar-nav {
  flex-direction: row;
  align-items: center;
}

.nav-item {
  margin-left: 2rem;
  margin-right: 2rem;
}
.navbar-collapse {
  justify-content: space-between;
}

.connect-wallet-button {
  align-items: center;
}
</style>
