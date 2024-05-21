<template>
  <div
    class="modal fade"
    id="changeUsernameModal"
    tabindex="-1"
    aria-labelledby="changeUsernameModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div
        class="modal-content elegant-modal animate__animated animate__fadeInDown"
      >
        <div class="modal-header elegant-header">
          <h1 class="modal-title fs-5" id="changeUsernameModalLabel">
            Change your username
          </h1>
          <button
            id="closeChangeUsernameModal"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>Select your new main username (you must own it):</p>

          <template v-if="userDomains.length > 0">
            <h5>Your Domains</h5>
            <ul class="domain-list">
              <li
                v-for="domain in userDomains"
                :key="domain.tokenId"
                class="domain-item"
                @click="selectDomain(domain.name)"
                :class="{ active: selectedDomain === domain.name }"
              >
                {{ domain.name }}
              </li>
            </ul>
          </template>
          <template v-else>
            <p class="no-domains-message">
              You don't have any domains yet. Mint one on
              <a href="https://sns.scrolly.xyz" target="_blank"
                >sns.scrolly.xyz</a
              >.
            </p>
          </template>
          <template v-if="!isActivated">
            <p class="disconnected-message">
              Please connect to view your domains.
            </p>
          </template>
        </div>

        <div class="modal-footer elegant-footer">
          <button
            type="button"
            class="btn btn-secondary elegant-button"
            data-bs-dismiss="modal"
          >
            Close
          </button>

          <button
            type="button"
            :disabled="loading || !selectedDomain"
            class="btn btn-primary elegant-button"
            @click="changeUsername"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm mx-1"
              role="status"
              aria-hidden="true"
            ></span>
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEthers } from "vue-dapp";
import { ethers } from "ethers";
import { useToast } from "vue-toastification/dist/index.mjs";
import WaitingToast from "~/components/WaitingToast";

export default {
  name: "ChangeUsernameModal",
  data() {
    return {
      loading: false,
      userDomains: [], // To store the user's domains
      selectedDomain: null, // Domain selected by the user
    };
  },
  methods: {
    async changeUsername() {
      this.loading = true;
      if (this.isActivated && this.selectedDomain) {
        const tldInterface = new ethers.utils.Interface([
          "function editDefaultDomain(string calldata _domainName) external",
        ]);
        const tldContract = new ethers.Contract(
          this.$config.punkTldAddress,
          tldInterface,
          this.signer,
        );
        try {
          const tx = await tldContract.editDefaultDomain(
            this.selectedDomain.toLowerCase(),
          );
          const toastWait = this.toast(
            {
              component: WaitingToast,
              props: {
                text: "Please wait for your transaction to confirm. Click on this notification to see the transaction in the block explorer.",
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
            await this.fetchUserDomains();
            this.toast("You have successfully changed your username!", {
              type: "success",
              onClick: () =>
                window
                  .open(
                    this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                    "_blank",
                  )
                  .focus(),
            });
            this.loading = false;
            document.getElementById("closeChangeUsernameModal").click();
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
            this.loading = false;
            console.log(receipt);
          }
        } catch (e) {
          console.log("error: " + e);
          this.toast("Error: " + e.message, { type: "error" });
          this.loading = false;
          return;
        }
      }
    },
    async fetchUserDomains() {
      if (this.isActivated && this.address) {
        try {
          const response = await fetch(
            `https://api-utils1.vercel.app/api/tokens?address=${this.address}`,
          );
          const data = await response.json();
          const userDomains = [];
          for (const token of data.tokens) {
            const tokenUri = await this.getTokenUri(token.tokenId);
            const tokenData = JSON.parse(
              Buffer.from(tokenUri.split(",")[1], "base64").toString("utf-8"),
            );
            const domainName = tokenData.name.replace(".scrolly", "");
            userDomains.push({ tokenId: token.tokenId, name: domainName });
          }
          this.userDomains = userDomains;
        } catch (error) {
          console.error("Error fetching user domains: ", error);
        }
      }
    },
    async getTokenUri(tokenId) {
      const tldInterface = new ethers.utils.Interface([
        "function tokenURI(uint256 tokenId) view returns (string)",
      ]);
      const tldContract = new ethers.Contract(
        this.$config.punkTldAddress,
        tldInterface,
        this.signer,
      );
      return await tldContract.tokenURI(tokenId);
    },
    selectDomain(domainName) {
      this.selectedDomain = domainName;
    },
  },
  mounted() {
    this.fetchUserDomains();
  },
  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();
    return { address, isActivated, signer, toast };
  },
  watch: {
    isActivated(newVal) {
      if (newVal) {
        this.fetchUserDomains();
      } else {
        this.userDomains = [];
      }
    },
  },
};
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";

/* General modal styles */
.elegant-modal {
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.elegant-header,
.elegant-footer {
  border: none;
  background-color: #ffffff;
  color: #333;
  padding: 1rem 1.5rem;
}

.elegant-header h1 {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #555;
}

.elegant-footer .btn {
  border-radius: 8px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.elegant-button {
  background-color: #4a90e2;
  border-color: #357ab8;
  color: #ffffff;
}

.elegant-button:hover {
  background-color: #357ab8;
  border-color: #2e68a5;
}

.elegant-button:disabled {
  background-color: #b5c9e6;
  border-color: #a5b9d6;
}

.modal-body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #555;
}

/* List styles */
.domain-list {
  padding-left: 0;
  list-style: none;
  margin-top: 1rem;
}

.domain-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.3s ease,
    color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.domain-item:hover {
  transform: scale(1.05);
  background-color: #f1f5fc;
  color: #333;
}

.domain-item.active {
  background-color: #4a90e2;
  color: white;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.no-domains-message,
.disconnected-message {
  font-size: 1.2rem;
  color: #ff6347;
  text-align: center;
  margin-top: 2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
