<template>
  <div>
    <div class="card border profile-card">
      <div class="card-body position-relative">
        <p class="fs-3 profile-back-button" @click="$router.back()">
          <i class="bi bi-arrow-left-circle cursor-pointer"></i>
        </p>
        <div
          v-if="isCurrentUser"
          class="dropdown position-absolute top-0 end-0 mt-3 me-3"
        >
          <i
            class="bi bi-gear-fill profile-settings-icon cursor-pointer"
            id="settingsDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          ></i>
          <ul class="dropdown-menu" aria-labelledby="settingsDropdown">
            <li>
              <span
                v-if="!userStore.getIsConnectedToOrbis"
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                :data-bs-target="'#verifyAccountModal'"
              >
                <i class="bi bi-person-check-fill"></i> Verify account ownership
              </span>
            </li>
            <li>
              <span
                class="dropdown-item cursor-pointer"
                :class="!userStore.getIsConnectedToOrbis ? 'disabled' : ''"
                data-bs-toggle="modal"
                :data-bs-target="'#fileUploadModal' + $.uid"
              >
                <i class="bi bi-person-circle"></i> Change your profile picture
              </span>
            </li>
            <li>
              <span
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                data-bs-target="#changeUsernameModal"
              >
                <i class="bi bi-pencil-square"></i> Change your username
              </span>
            </li>
            <li>
              <span
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                data-bs-target="#setEmailModal"
              >
                <i class="bi bi-envelope-at-fill"></i> Set email notification
                for chat
              </span>
            </li>
            <li>
              <span
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                data-bs-target="#chatSettingsModal"
              >
                <i class="bi bi-gear-fill"></i> Other settings
              </span>
            </li>
            <li>
              <span
                class="dropdown-item cursor-pointer"
                data-bs-toggle="modal"
                data-bs-target="#referralModal"
              >
                <i class="bi bi-person-plus-fill"></i> Share referral link
              </span>
            </li>
          </ul>
        </div>
        <div
          v-if="!userStore.getIsConnectedToOrbis && isCurrentUser"
          class="d-flex flex-column justify-content-center align-items-center"
          style="height: 200px"
        >
          <p class="text-center">
            Please verify ownership to access your profile
          </p>
          <button class="btn btn-primary" @click="connectToOrbis">
            Verify account ownership
          </button>
        </div>
        <div v-else class="row">
          <div class="col-md-3 mt-3 position-relative profile-image-column">
            <div
              v-if="isCurrentUser"
              class="profile-image-container"
              @click="openFileUploadModal"
            >
              <ProfileImage
                :address="uAddress"
                :domain="domain"
                :image="orbisImage"
              />
              <div v-if="isCurrentUser" class="edit-overlay">
                <i class="bi bi-camera-fill edit-icon"></i>
              </div>
            </div>
            <div v-else>
              <ProfileImage
                :address="uAddress"
                :domain="domain"
                :image="orbisImage"
              />
            </div>
          </div>

          <div class="col-md-9 mt-3">
            <h3 class="mb-1 profile-username">
              {{ domain }}
              <i
                v-if="isCurrentUser"
                class="bi bi-pencil-square cursor-pointer profile-edit-username-icon"
                data-bs-toggle="modal"
                data-bs-target="#changeUsernameModal"
              ></i>
            </h3>
            <p class="profile-address-link">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a
                :href="$config.blockExplorerBaseUrl + '/address/' + uAddress"
                target="_blank"
                style="text-decoration: none"
              >
                {{ shortenAddress(uAddress) }}
              </a>
            </p>
            <span class="badge bg-primary profile-scrolly-grade">{{
              userTier
            }}</span>
            <hr class="profile-separator" />
          </div>
        </div>
        <div class="row">
          <div class="col-md-9 offset-md-3 profile-categories-data">
            <div class="profile-category-item">
              <img
                src="@/assets/img/icon/eth_icon.png"
                alt="ETH Icon"
                class="profile-category-icon"
              />
              <div class="profile-category-text">
                <p class="profile-category-title">ETH</p>
                <p class="profile-category-value">{{ balanceEth }} ETH</p>
              </div>
            </div>
            <hr class="profile-category-separator" />
            <div class="profile-category-item">
              <img
                src="@/assets/img/icon/scrolly_icon.png"
                alt="SCROLLY Icon"
                class="profile-category-icon"
              />
              <div class="profile-category-text">
                <p class="profile-category-title">SCROLLY</p>
                <p class="profile-category-value">
                  {{ balanceChatToken }} SCROLLY
                </p>
              </div>
            </div>
            <hr class="profile-category-separator" />
            <div class="profile-category-item">
              <img
                src="@/assets/img/icon/mappy_icon.png"
                alt="Mappy Points Icon"
                class="profile-category-icon"
              />
              <div class="profile-category-text">
                <p class="profile-category-title">Mappy Points</p>
                <p class="profile-category-value">{{ balanceAp }} MP</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Set Email Notifications Modal -->
      <div
        class="modal fade"
        id="setEmailModal"
        tabindex="-1"
        aria-labelledby="setEmailModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="setEmailModalLabel">
                Set email notifications
              </h1>
              <button
                type="button"
                id="setEmailModalClose"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div v-if="!userStore.getIsConnectedToOrbis">
                <p>First connect to Ceramic to set email notifications:</p>
                <button class="btn btn-primary" @click="connectToOrbis">
                  Connect to Ceramic
                </button>
              </div>
              <div class="mt-3" v-if="userStore.getIsConnectedToOrbis">
                <p>
                  Enter your email address to receive notifications about
                  replies on your posts.
                </p>
                <p>
                  The email address will be encrypted and will not be publicly
                  visible.
                </p>
                <p v-if="emailForNotificationsSet">
                  Currently, the email for notifications is already set. You can
                  change it by entering a new email address below:
                </p>
                <p v-if="!emailForNotificationsSet">
                  Currently, the email for notifications is NOT yet set. You can
                  add your email address below:
                </p>
                <input
                  v-model="newEmail"
                  type="email"
                  class="form-control mt-2"
                  placeholder="Enter email address"
                />
                <small v-if="newEmail && !isEmail" class="text-danger">
                  Error: The entered text is not an email.
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="setEmailNotifications(false)"
                :disabled="!userStore.getIsConnectedToOrbis || !isEmail"
              >
                <span
                  v-if="waitingSetEmail"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Submit email
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- END Set Email Notifications Modal -->

      <!-- Change Image Modal -->
      <FileUploadModal
        v-if="userStore.getIsConnectedToOrbis && isCurrentUser"
        @processFileUrl="insertImage"
        title="Change profile image"
        infoText="Upload a new profile picture."
        storageType="ipfs"
        :componentId="$.uid"
        :maxFileSize="$config.fileUploadSizeLimit"
        :walletAddress="uAddress"
      />
      <!-- END Change Image Modal -->
    </div>

    <div class="card border mt-3 mb-3">
      <div class="card-body">
        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs nav-fill profile-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="currentTab === 'posts' ? 'active' : ''"
              @click="changeCurrentTab('posts')"
            >
              Posts
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="currentTab === 'nftCollection' ? 'active' : ''"
              @click="changeCurrentTab('nftCollection')"
            >
              NFT Collection
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="currentTab === 'mints' ? 'active' : ''"
              @click="changeCurrentTab('mints')"
            >
              Mints
            </button>
          </li>
        </ul>
        <!-- END Tabs Navigation -->

        <!-- Tabs Content -->
        <div class="tab-content mt-3">
          <!-- Posts Tab -->
          <div v-if="currentTab === 'posts' && uDid">
            <ChatFeed
              :byDid="uDid"
              :hideCommentBox="true"
              :orbisContext="getOrbisContext"
            />
          </div>

          <!-- NFT Collection Tab -->
          <div v-if="currentTab === 'nftCollection' && uAddress">
            <UserCollections :address="uAddress" />
          </div>

          <!-- Mints Tab -->
          <div v-if="currentTab === 'mints' && uAddress">
            <UserMintedPosts :address="uAddress" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEthers, shortenAddress } from "vue-dapp";
import { ethers } from "ethers";
import { useUserStore } from "~/store/user";
import { useToast } from "vue-toastification/dist/index.mjs";
import ProfileImage from "~/components/profile/ProfileImage.vue";
import FileUploadModal from "~/components/storage/FileUploadModal.vue";
import UserCollections from "~/components/nft/UserCollections.vue";
import UserMintedPosts from "~/components/minted-posts/UserMintedPosts.vue";
import ChatFeed from "../chat/ChatFeed.vue";
import { getActivityPoints } from "~/utils/balanceUtils";
import { getDomainName, getDomainHolder } from "~/utils/domainUtils";
import { fetchUsername, storeUsername } from "~/utils/storageUtils";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "PunkProfile",
  props: ["pAddress", "pDomain"],

  data() {
    return {
      balanceAp: 0,
      balanceChatTokenWei: 0,
      currentTab: "posts",
      domain: this.pDomain,
      emailForNotificationsSet: false,
      followers: 0,
      following: 0,
      lastActivityTimestamp: null,
      newEmail: null,
      newImageLink: null,
      orbisImage: null,
      orbisProfile: null,
      uAddress: this.pAddress,
      uBalance: 0,
      uDid: null,
      waitingDataLoad: false,
      waitingImageUpdate: false,
      waitingSetEmail: false,
    };
  },

  components: {
    ChatFeed,
    FileUploadModal,
    ProfileImage,
    UserCollections,
    UserMintedPosts,
  },

  mounted() {
    this.currentTab = localStorage.getItem("profileCurrentTab") || "posts";

    if (!this.pAddress || !this.pDomain) {
      this.fetchAddressAndDomain();
    }

    this.checkConnectionToOrbis();
  },

  computed: {
    balanceChatToken() {
      const bal = ethers.utils.formatEther(this.balanceChatTokenWei);
      return bal >= 0 ? Math.floor(Number(bal)) : Number(bal).toFixed(4);
    },

    balanceEth() {
      const bal = ethers.utils.formatEther(this.uBalance);
      return bal > 0 ? Number(bal).toFixed(2) : Number(bal).toFixed(4);
    },

    getOrbisContext() {
      return this.$config.orbisTest
        ? this.$config.orbisTestContext
        : this.$config.chatChannels.general;
    },

    isCurrentUser() {
      return (
        String(this.uAddress).toLowerCase() ===
        String(this.address).toLowerCase()
      );
    },

    isEmail() {
      return (
        this.newEmail &&
        this.newEmail.includes("@") &&
        this.newEmail.includes(".")
      );
    },

    userTier() {
      const tiers = [
        { name: "Scrolly Baby", points: 1 },
        { name: "Scrolly Novice", points: 667 },
        { name: "Scrolly Explorer", points: 1221 },
        { name: "Scrolly Mapper", points: 2442 },
        { name: "Carto Maestro", points: 4200 },
        { name: "Grand Cartographer of Scrolly", points: 6000 },
      ];
      const userPoints = this.balanceAp;
      let userTier = "Unknown";
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (userPoints >= tiers[i].points) {
          userTier = tiers[i].name;
          break;
        }
      }
      return userTier;
    },
  },

  methods: {
    changeCurrentTab(tab) {
      this.currentTab = tab;
      localStorage.setItem("profileCurrentTab", tab);
    },

    openFileUploadModal() {
      const modal = document.getElementById(`fileUploadModal${this.$.uid}`);
      if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
      }
    },

    async changeImage() {
      if (this.userStore.getIsConnectedToOrbis) {
        this.waitingImageUpdate = true;

        if (!this.orbisProfile) {
          this.orbisProfile = { pfp: "", username: "" };
        }

        this.orbisProfile.pfp = this.newImageLink;

        if (!this.orbisProfile.username && this.domain) {
          this.orbisProfile.username = this.domain;
        }

        const res = await this.$orbis.updateProfile(this.orbisProfile);

        if (res.status !== 200) {
          console.log("Error: ", res);
          this.toast(res.result, { type: "error" });
          this.waitingImageUpdate = false;
        } else {
          this.orbisImage = this.newImageLink;
          this.userStore.setOrbisImage(this.newImageLink);
          sessionStorage.setItem(
            String(this.address).toLowerCase() + "-img",
            this.newImageLink,
          );
          this.toast("Image successfully updated!", { type: "success" });
          this.waitingImageUpdate = false;
        }
      } else {
        this.toast("Please connect to chat first", { type: "error" });
      }
    },

    async checkConnectionToOrbis() {
      if (!this.userStore.getIsConnectedToOrbis) {
        let res = await this.$orbis.isConnected();

        if (res) {
          this.userStore.setIsConnectedToOrbis(true);

          if (this.$orbis.session && !this.userStore.getDid) {
            this.userStore.setDid(this.$orbis.session.did._id);
            this.userStore.setDidParent(this.$orbis.session.did._parentId);
          }
        } else {
          this.userStore.setIsConnectedToOrbis(false);
        }
      }
    },

    async connectToOrbis() {
      if (!this.userStore.getIsConnectedToOrbis) {
        let res = await this.$orbis.connect_v2({
          provider: this.signer.provider.provider,
          lit: false,
        });

        if (res.status == 200) {
          this.userStore.setIsConnectedToOrbis(true);

          if (this.$orbis.session) {
            this.userStore.setDid(this.$orbis.session.did._id);
            this.userStore.setDidParent(this.$orbis.session.did._parentId);
          }
        } else {
          console.log("Error connecting to Ceramic: ", res);
          this.toast(res.result, { type: "error" });
        }
      }
    },

    async fetchAddressAndDomain() {
      this.waitingDataLoad = true;

      if (this.$route.query.id) {
        const id = this.$route.query.id;

        if (id.includes(".")) {
          this.domain = id;
        } else {
          this.uAddress = id;
        }
      } else {
        this.uAddress = this.address;
      }

      if (!this.domain && this.uAddress) {
        this.domain = fetchUsername(window, this.uAddress);
      }

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      if (!this.domain && this.uAddress) {
        const domainName = await getDomainName(this.uAddress, provider);

        if (domainName) {
          this.domain = domainName + this.$config.tldName;
          storeUsername(window, this.uAddress, this.domain);
        }
      }

      if (this.domain && !this.uAddress) {
        const domainHolder = await getDomainHolder(
          String(this.domain).toLowerCase().split(".")[0],
          provider,
        );

        if (domainHolder !== ethers.constants.AddressZero) {
          this.uAddress = domainHolder;
        }

        storeUsername(window, this.uAddress, this.domain);
      }

      await this.fetchOrbisProfile();
      await this.fetchBalance();
      this.refreshCollections();
    },

    async fetchBalance() {
      if (this.uAddress) {
        let provider = this.$getFallbackProvider(this.$config.supportedChainId);

        this.uBalance = await provider.getBalance(this.uAddress);

        if (this.$config.chatTokenAddress) {
          const chatInterface = new ethers.utils.Interface([
            "function balanceOf(address owner) view returns (uint256)",
          ]);

          const chatContract = new ethers.Contract(
            this.$config.chatTokenAddress,
            chatInterface,
            provider,
          );

          this.balanceChatTokenWei = await chatContract.balanceOf(
            this.uAddress,
          );
        }

        if (
          this.$config.activityPointsAddress &&
          this.$config.showFeatures.activityPoints
        ) {
          this.balanceAp = await getActivityPoints(this.uAddress, provider);
        }
      }
    },

    async fetchOrbisProfile() {
      this.orbisProfile = { pfp: "", username: "" };

      if (this.uAddress) {
        let { data } = await this.$orbis.getDids(this.uAddress);

        if (data[0]?.did) {
          this.uDid = data[0].did;

          const profile = await this.$orbis.getProfile(data[0].did);

          if (profile.status === 200) {
            this.orbisProfile = profile.data.details.profile;

            if (
              profile &&
              profile.data.details.profile &&
              profile.data.details.profile.pfp
            ) {
              this.orbisImage = profile.data.details.profile.pfp;
            }

            if (profile) {
              this.followers = profile.data.count_followers;
              this.following = profile.data.count_following;
              this.lastActivityTimestamp = profile.data.last_activity_timestamp;
            }

            if (profile.data.details["encrypted_email"]) {
              this.emailForNotificationsSet = true;
            } else {
              this.emailForNotificationsSet = false;
            }

            this.waitingDataLoad = false;
          }
        }

        this.waitingDataLoad = false;
      }
    },

    async insertImage(imageUrl) {
      this.newImageLink = imageUrl;
      this.changeImage();
    },

    async setEmailNotifications(remove) {
      if (this.userStore.getIsConnectedToOrbis) {
        this.waitingSetEmail = true;

        if (remove) {
          this.newEmail = "";
        }

        let res = await this.$orbis.setEmail(this.newEmail);

        if (res.status !== 200) {
          console.log("Error: ", res);
          this.toast(res.result, { type: "error" });
          this.waitingSetEmail = false;
        } else {
          this.toast("Email notifications successfully set!", {
            type: "success",
          });
          this.waitingSetEmail = false;
          document.getElementById("setEmailModalClose").click();
        }
      } else {
        this.toast("Please connect to chat first", { type: "error" });
      }
    },

    refreshCollections() {
      this.$nextTick(() => {
        this.currentTab = "nftCollection";
        this.$nextTick(() => {
          this.currentTab = "posts";
        });
      });
    },
  },

  setup() {
    const { address, balance, chainId, isActivated, signer } = useEthers();
    const userStore = useUserStore();
    const toast = useToast();

    return {
      address,
      balance,
      chainId,
      isActivated,
      userStore,
      shortenAddress,
      signer,
      toast,
    };
  },
  watch: {
    address() {
      this.fetchAddressAndDomain();
    },
  },
};
</script>

<style scoped>
.profile-image-column {
  text-align: center;
}

.profile-image-container {
  position: relative;
  width: fit-content;
  margin: 0 auto;
  cursor: pointer;
}

.profile-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-image-container:hover .edit-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.edit-overlay {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.edit-icon {
  color: white;
  font-size: 2rem;
}

.profile-data {
  display: flex;
  flex-direction: column;
}

.profile-edit-username-icon {
  margin-left: 10px;
}

.profile-scrolly-grade {
  margin-top: 5px;
  font-size: 1rem;
}

.profile-separator {
  margin: 15px 0;
  border: 1px solid #6f42c1;
  width: calc(100% - 170px);
}

.profile-categories-data {
  border-radius: 10px;
  margin-top: 20px;
  padding: 10px;
  width: calc(100% - 170px);
  margin-left: calc(170px);
}

.profile-category-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.profile-category-icon {
  padding-left: 10px;
  padding-right: 10px;
}

.profile-category-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 10px;
}

.profile-category-title {
  font-weight: bold;
}

.profile-category-text p {
  margin: 0;
}

.profile-category-value {
  font-size: 14px;
  font-weight: bold;
}

.profile-category-separator {
  margin: 0;
  border: 0.5px solid #d3d3d3;
}

.profile-settings-icon {
  font-size: 1.5rem;
  cursor: pointer;
}

.profile-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.profile-tabs .nav-link {
  color: #6f42c1;
}

.profile-tabs .nav-link.active {
  background-color: #6f42c1;
  color: #ffffff;
}

.profile-address-link {
  margin-top: 5px;
  font-size: 14px;
}

.profile-username {
  font-weight: bold;
}

.profile-back-button {
  display: none;
}

@media (max-width: 768px) {
  .profile-back-button {
    display: block;
  }

  .profile-image-column {
    text-align: center;
  }
  .profile-categories-data {
    margin-left: 0;
    width: 100%;
  }
}
</style>
