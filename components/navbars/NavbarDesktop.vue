<template>
  <nav class="navbar navbar-expand-lg navbar-bg-custom">
    <div class="container-fluid mx-3">
      <!-- Logo Left -->
      <NuxtLink class="navbar-brand" to="/">
        <img
          src="/img/favicon2.png"
          alt="Chat logo"
          height="120"
          class="filtered-shadow"
        />
      </NuxtLink>

      <!-- Activities -->

      <ul class="navbar-nav mx-auto">
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/">
            <span class="navbar-brand-text align-middle">Hub</span>
          </NuxtLink>
        </li>
        <li class="nav-item dropdown special-link">
          <!-- NFT Launchpad -->
          <a
            class="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
            aria-haspopup="true"
            aria-expanded="false"
          >
            NFT Launchpad
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <NuxtLink class="dropdown-item" to="/nft">NFT Launchpad</NuxtLink>
            <span
              class="dropdown-item"
              data-bs-toggle="modal"
              data-bs-target="#chatSettingsModal"
              >Collection</span
            >
            <span
              class="dropdown-item"
              data-bs-toggle="modal"
              data-bs-target="#changeUsernameModal"
              >My NFTs</span
            >
            <span
              class="dropdown-item"
              data-bs-toggle="modal"
              data-bs-target="#findUserModal"
              >Create a collection</span
            >
          </div>
        </li>

        <li class="nav-item">
          <NuxtLink class="nav-link" to="/swap">
            <span class="navbar-brand-text align-middle">Swap</span>
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/">
            <span class="navbar-brand-text align-middle">SNS</span>
          </NuxtLink>
        </li>
        <!-- NFT Setttings -->
        <li v-if="isActivated" class="av-item dropdown special-link">
          <a
            class="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
            aria-expanded="false"
          >
            Settings
          </a>
          <div class="dropdown-menu dropdown-menu-end">
            <NuxtLink class="dropdown-item cursor-pointer" to="/profile"
              >Profile</NuxtLink
            >
            <span
              class="dropdown-item cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#chatSettingsModal"
              >Settings</span
            >
            <span
              class="dropdown-item cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#changeUsernameModal"
              >Change username</span
            >
            <span
              class="dropdown-item cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#findUserModal"
              >Find user</span
            >
            <span
              class="dropdown-item cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#referralModal"
              >Share referral link</span
            >
            <span
              class="dropdown-item cursor-pointer"
              data-bs-toggle="modal"
              data-bs-target="#themeSelectionModal"
              >Theme</span
            >
            <span class="dropdown-item cursor-pointer" @click="disconnectWallet"
              >Disconnect</span
            >
          </div>
        </li>
      </ul>

      <!-- UI Account-->
      <ul class="navbar-nav">
        <div class="d-flex align-items-center">
          <li v-if="!isActivated" class="nav-item">
            <ConnectWalletButton
              class="nav-link cursor-pointer"
              btnText="Connect wallet"
            />
          </li>
          <div>
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
                {{ String(siteStore.getColorMode).charAt(0).toUpperCase()
                }}{{ String(siteStore.getColorMode).slice(1) }}
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <span
                  class="dropdown-item cursor-pointer"
                  @click="changeColorMode('scrolly')"
                  >Scrolly</span
                >
                <span
                  class="dropdown-item cursor-pointer"
                  @click="changeColorMode('dark')"
                  >Dark</span
                >
                <span
                  class="dropdown-item cursor-pointer"
                  @click="changeColorMode('light')"
                  >Light</span
                >
              </div>
            </li>
            <!-- Chat tokens -->
            <!-- Activity Points -->
          </div>
          <div
            v-if="
              isActivated &&
              $config.activityPointsAddress &&
              $config.showFeatures.activityPoints
            "
            class="mt-3"
          >
            <div
              class="user-profile-container d-flex flex-column align-items-center justify-content-center"
            >
              <!-- Check if userStore.getDefaultDomain exists before displaying ProfileImage and link -->
              <NuxtLink to="/profile" v-if="userStore.getDefaultDomain">
                <ProfileImage
                  :key="userStore.getOrbisImage"
                  @click="closeLeftSidebar"
                  class="img-fluid rounded-circle profile-image"
                  :address="address"
                  :domain="userStore.getDefaultDomain"
                  :image="userStore.getOrbisImage"
                />
              </NuxtLink>

              <!-- Display user name or a clickable link if the domain name is null -->
              <h6 class="user-name" v-if="userStore.getDefaultDomain">
                {{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}
              </h6>
              <a
                href="https://sns.scrolly.xyz"
                target="_blank"
                rel="noopener noreferrer"
                v-else
              >
                <h6 class="user-name">Get your Scrolly Domain</h6>
              </a>
              <!-- Chat tokens -->
              <div class="button-container">
                <button
                  v-if="
                    userStore.getChatTokenBalanceWei > 0 &&
                    $config.chatTokenAddress
                  "
                  class="btn btn-outline-primary btn-sm"
                >
                  {{ userStore.getChatTokenBalance }}
                  {{ $config.chatTokenSymbol }}
                </button>

                <!-- Activity Points -->
                <div
                  v-if="
                    $config.activityPointsAddress &&
                    $config.showFeatures.activityPoints &&
                    isActivated
                  "
                  class="activity-points-link"
                >
                  <NuxtLink
                    to="/activity-points"
                    class="btn btn-outline-primary btn-sm"
                  >
                    {{ getUserAp }} MP
                  </NuxtLink>
                </div>
              </div>
              <!-- Settings & Chain bar -->

              <SwitchChainButton
                v-if="isActivated"
                :navbar="true"
                :dropdown="true"
              />
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

    return {
      address,
      disconnect,
      isActivated,
      shortenAddress,
      siteStore,
      userStore,
    };
  },
};
</script>
