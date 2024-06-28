<template>
  <div :class="['badge-card', { 'dark-mode': isDarkMode }]">
    <img
      src="../../assets/img/badge/mint-profile.png"
      class="card-img-top"
      alt="Mint Profile"
    />
    <div class="badge-card-body">
      <h5 class="badge-card-title">Mint Profile</h5>

      <div class="loading-spinner" v-if="waitingUsername">
        <span class="spinner"></span>
      </div>

      <p class="badge-card-text">
        You don't have a profile yet. Mint it here. Enter username below.
      </p>

      <input
        type="text"
        class="form-control text-center"
        id="inputUsername"
        v-model="username"
        placeholder="Enter username"
      />

      <button
        @click="mintUsername"
        :disabled="waiting || waitingUsername || !username"
        class="badge-button"
      >
        <span
          v-if="waiting"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Mint Profile for {{ mintFee }} ETH
      </button>
    </div>
  </div>
</template>

<script>
import { useEthers } from "vue-dapp";
import { ethers } from "ethers";
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";
import { useUserStore } from "~/store/user";
import { getDomainName } from "~/utils/domainUtils";
import { useThemeStore } from "~/store/theme";

export default {
  name: "BadgeMintProfile",
  props: ["profileRegistryAddress"],
  emits: ["checkIfProfileMinted"],
  data() {
    return {
      domainName: null,
      mintFeeWei: 1000000000000000,
      username: null,
      waiting: false,
      waitingUsername: false,
    };
  },
  mounted() {
    this.fetchScrollyName();
    this.fetchMintFee();
  },
  computed: {
    mintFee() {
      return ethers.utils.formatEther(this.mintFeeWei);
    },
    isDarkMode() {
      const themeStore = useThemeStore();
      return themeStore.getIsDarkMode;
    },
  },
  methods: {
    async fetchMintFee() {
      const intrfc = new ethers.utils.Interface([
        "function MINT_FEE() external view returns (uint256)",
        "function mint(string calldata username, bytes memory referral) external payable returns (address)",
      ]);
      const contract = new ethers.Contract(
        this.profileRegistryAddress,
        intrfc,
        this.signer,
      );
      try {
        this.mintFeeWei = await contract.MINT_FEE();
      } catch (error) {
        console.error("Error getting mint fee", error);
      }
    },
    async fetchScrollyName() {
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);
      if (this.signer) {
        provider = this.signer;
      }
      this.domainName = await getDomainName(this.address, provider);
      if (this.domainName) {
        this.username = this.domainName;
      }
    },
    async isUsernameUsed() {
      if (!this.username) {
        this.toast.error("Please enter a username");
        this.waiting = false;
        return;
      }
      const intrfc = new ethers.utils.Interface([
        "function isUsernameUsed(string calldata username) external view returns (bool)",
      ]);
      const contract = new ethers.Contract(
        this.profileRegistryAddress,
        intrfc,
        this.signer,
      );
      try {
        const usernameUsed = await contract.isUsernameUsed(this.username);
        return usernameUsed;
      } catch (error) {
        console.error("Error checking if username is used", error);
      } finally {
        this.waiting = false;
      }
    },
    async mintUsername() {
      this.waiting = true;
      const usernameUsed = await this.isUsernameUsed();
      if (usernameUsed) {
        this.toast.error("Username already used. Please pick another one.");
        this.waiting = false;
        return;
      }
      const intrfc = new ethers.utils.Interface([
        "function mint(string calldata username, bytes memory referral) external payable returns (address)",
      ]);
      const contract = new ethers.Contract(
        this.profileRegistryAddress,
        intrfc,
        this.signer,
      );
      try {
        const tx = await contract.mint(this.username, "0x", {
          value: this.mintFeeWei,
        });
        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.",
            },
          },
          {
            type: "info",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          },
        );
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully minted a Scroll Canvas profile!", {
            type: "success",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });
          this.$emit("checkIfProfileMinted");
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);
        this.toast("Error: " + e, { type: "error" });
        return;
      } finally {
        this.waiting = false;
      }
    },
  },
  setup() {
    const { address, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();
    return { address, signer, toast, userStore };
  },
};
</script>
<style scoped>
.badge-card {
  background: var(--card-bg);
  color: var(--card-text);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
}

.badge-card-body {
  text-align: center;
}

.badge-card-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.badge-card-text {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.form-control {
  margin-bottom: 1rem;
}

.badge-button {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
  font-size: 1rem;
  margin-top: 1rem;
}

.badge-button:disabled {
  background-color: rgba(0, 123, 255, 0.5);
  cursor: not-allowed;
}

.badge-button:hover:not(:disabled) {
  background-color: var(--primary-hover-color);
  transform: scale(1.05);
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid var(--primary-color);
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
.badge-card:not(.dark-mode) {
  --card-bg: #fff;
  --card-text: #000;
  --primary-color: #007bff;
  --primary-hover-color: #0056b3;
}

/* Dark Mode Styles */
.badge-card.dark-mode {
  --card-bg: #333;
  --card-text: #dcdcdc;
  --primary-color: #4caf50;
  --primary-hover-color: #388e3c;
}
</style>
