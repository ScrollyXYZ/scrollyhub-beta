<template>
  <Head>
    <Title>Badge | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'Badge | ' + $config.projectMetadataTitle"
    />
  </Head>

  <div :class="['badge-container', { 'dark-mode': isDarkMode }]">
    <div class="badge-card">
      <i class="bi bi-arrow-left-circle back-icon" @click="$router.back()"></i>
      <h3 class="badge-title">Scroll Badge</h3>

      <div class="loading-spinner" v-if="waiting">
        <span class="spinner"></span>
      </div>

      <BadgeNotConnected v-if="!isActivated" />
      <BadgeSwitchNetwork v-if="isActivated && !isSupportedChain" />

      <BadgeCheckEligibility
        @check-eligibility="checkEligibility"
        v-if="
          isActivated &&
          isSupportedChain &&
          !isEligible &&
          !badgeMetadata &&
          !hasBadge &&
          !waiting
        "
      />

      <BadgeNotEligible v-if="isActivated && isSupportedChain && !isEligible" />

      <BadgeMintProfile
        v-if="isActivated && isSupportedChain && isEligible && !isProfileMinted"
        :profileRegistryAddress="profileRegistryAddress"
        @checkIfProfileMinted="checkIfProfileMinted"
      />

      <div
        v-if="isActivated && isSupportedChain && isEligible && isProfileMinted"
      >
        <BadgeMintBadge
          v-if="badgeMetadata && !hasBadge"
          :apiBaseUrl="apiBaseUrl"
          :badgeContractAddress="badgeContractAddress"
          :badgeMetadata="badgeMetadata"
          @checkIfBadgeMinted="checkIfBadgeMinted"
        />

        <BadgeDetails
          v-if="badgeMetadata && hasBadge"
          :badgeMetadata="badgeMetadata"
          :badgeContractAddress="badgeContractAddress"
          :graphqlUrl="graphqlUrl"
          :profileAddress="profileAddress"
          :profileRegistryAddress="profileRegistryAddress"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import BadgeCheckEligibility from "~/components/badge/BadgeCheckEligibility.vue";
import BadgeDetails from "~/components/badge/BadgeDetails.vue";
import BadgeMintBadge from "~/components/badge/BadgeMintBadge.vue";
import BadgeMintProfile from "~/components/badge/BadgeMintProfile.vue";
import BadgeNotConnected from "~/components/badge/BadgeNotConnected.vue";
import BadgeNotEligible from "~/components/badge/BadgeNotEligible.vue";
import BadgeSwitchNetwork from "~/components/badge/BadgeSwitchNetwork.vue";
import { useThemeStore } from "~/store/theme";

export default {
  name: "Badge",
  components: {
    BadgeCheckEligibility,
    BadgeDetails,
    BadgeMintBadge,
    BadgeMintProfile,
    BadgeNotConnected,
    BadgeNotEligible,
    BadgeSwitchNetwork,
  },
  data() {
    return {
      apiBaseUrl: this.$config.badge.apiBaseUrl,
      badgeContractAddress: this.$config.badge.badgeContractAddress,
      badgeMetadata: null,
      graphqlUrl: this.$config.badge.graphqlUrl,
      hasBadge: false,
      isEligible: false,
      isProfileMinted: false,
      profileAddress: null,
      profileRegistryAddress: this.$config.badge.profileRegistryAddress,
      waiting: false,
    };
  },
  computed: {
    isSupportedChain() {
      return this.chainId === this.$config.supportedChainId;
    },
    isDarkMode() {
      const themeStore = useThemeStore();
      return themeStore.getIsDarkMode;
    },
  },
  methods: {
    async checkEligibility() {
      this.waiting = true;
      if (!this.address) {
        this.toast.error("Please connect your wallet first.");
        return (this.waiting = false);
      }
      const checkUrl = `${this.apiBaseUrl}check?badge=${this.badgeContractAddress}&recipient=${this.address}`;
      try {
        const response = await axios.get(checkUrl);
        this.isEligible = response.data.eligibility;
      } catch (error) {
        console.error(error);
        this.toast.error("An error occurred. Please try again later.");
      } finally {
        this.waiting = false;
      }
      this.checkIfBadgeMinted();
      this.checkIfProfileMinted();
    },
    async checkIfBadgeMinted() {
      this.waiting = true;
      const intrfc = [
        "function hasBadge(address _user) external view returns (bool)",
      ];
      const contract = new ethers.Contract(
        this.badgeContractAddress,
        intrfc,
        this.signer,
      );
      try {
        this.hasBadge = await contract.hasBadge(this.address);
        this.getBadgeMetadata();
      } catch (error) {
        console.error(error);
        this.toast.error(
          "An error occurred with the hasBadge() call. Please try again later.",
        );
      } finally {
        this.waiting = false;
      }
    },
    async checkIfProfileMinted() {
      this.waiting = true;
      const intrfc = [
        "function getProfile(address account) public view returns (address)",
        "function isProfileMinted(address _user) external view returns (bool)",
      ];
      const contract = new ethers.Contract(
        this.profileRegistryAddress,
        intrfc,
        this.signer,
      );
      try {
        this.profileAddress = await contract.getProfile(this.address);
        this.isProfileMinted = await contract.isProfileMinted(
          this.profileAddress,
        );
      } catch (error) {
        console.error(error);
        this.toast.error(
          "An error occurred with the isProfileMinted() call. Please try again later.",
        );
      } finally {
        this.waiting = false;
      }
    },
    async getBadgeMetadata() {
      this.waiting = true;
      const intrfc = [
        "function badgeTokenURI(bytes32) external view returns (string memory)",
        "function getLevel(address) public view returns (uint8)",
      ];
      const contract = new ethers.Contract(
        this.badgeContractAddress,
        intrfc,
        this.signer,
      );
      try {
        const level = await contract.getLevel(this.address);
        const mdUrl = await contract.badgeTokenURI(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        );
        if (mdUrl.startsWith("https://")) {
          const response = await axios.get(mdUrl + "?level=" + level);
          this.badgeMetadata = response.data;
        } else {
          console.error("Invalid IPFS URL");
        }
      } catch (error) {
        console.error(error);
        this.toast.error(
          "An error occurred with the hasBadge() call. Please try again later.",
        );
      } finally {
        this.waiting = false;
      }
    },
  },
  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    return {
      address,
      chainId,
      isActivated,
      signer,
      toast,
    };
  },
  watch: {
    address(newValue, oldValue) {
      if (
        oldValue &&
        oldValue !== newValue &&
        !this.waiting &&
        this.isSupportedChain
      ) {
        this.checkEligibility();
      }
    },
    chainId(newValue, oldValue) {
      if (
        oldValue &&
        oldValue !== newValue &&
        !this.waiting &&
        this.isSupportedChain
      ) {
        this.checkEligibility();
      }
    },
  },
};
definePageMeta({
  layout: "quests",
});
</script>
<style scoped>
.badge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
}

.badge-card {
  background: var(--card-bg);
  color: var(--card-text);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 90%;
  max-width: 600px;
  position: relative;
}

.back-icon {
  font-size: 2rem;
  cursor: pointer;
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.badge-title {
  margin-bottom: 1.5rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Light Mode Styles */
.badge-container:not(.dark-mode) {
  --text-color: #333;
  --card-bg: #fff;
  --card-text: #000;
  --primary-color: #007bff;
}

/* Dark Mode Styles */
.badge-container.dark-mode {
  --text-color: #333;
  --card-bg: #444;
  --card-text: #fff;
  --primary-color: #4caf50;
}
</style>
