<template>
  <Head>
    <Title>Create NFT Collection | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'Create NFT Collection | ' + $config.projectMetadataTitle"
    />
    <Meta
      name="description"
      :content="
        'Create your very own NFT collection on ' + $config.projectName + '!'
      "
    />
    <Meta
      property="og:image"
      :content="$config.projectUrl + $config.previewImageNftCreate"
    />
    <Meta
      property="og:description"
      :content="
        'Create your very own NFT collection on ' + $config.projectName + '!'
      "
    />
    <Meta
      name="twitter:image"
      :content="$config.projectUrl + $config.previewImageNftCreate"
    />
    <Meta
      name="twitter:description"
      :content="
        'Create your very own NFT collection on ' + $config.projectName + '!'
      "
    />
  </Head>

  <div class="create-collection-card">
    <div class="card-body">
      <p class="back-icon" @click="$router.back()">
        <i class="bi bi-arrow-left-circle"></i>
      </p>

      <h3 class="title">Create NFT Collection</h3>

      <div class="loading" v-if="waitingData">
        <span class="spinner-border" role="status" aria-hidden="true"></span>
      </div>

      <p class="price-info" v-if="createPrice">
        Price for creating a collection is {{ createPrice }}
        {{ $config.tokenSymbol }}.
      </p>

      <div class="form-group image-section">
        <!-- Image -->
        <div class="image-upload">
          <label for="cImage" class="form-label"
            >Collection Image (can be changed later)</label
          >
          <div class="image-preview-container" @click="openModal">
            <div class="image-wrapper">
              <div
                v-if="loadingImage"
                class="spinner-border spinner-border-sm"
                role="status"
              ></div>
              <Image
                v-if="cImage && !loadingImage"
                :url="cImage"
                alt="Collection Image"
                class="preview-image"
              />
              <div v-if="!cImage || loadingImage" class="default-image">
                <i class="bi bi-image"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="collection-details">
          <!-- Collection Name -->
          <div class="form-group">
            <label for="cName" class="form-label">Collection Name</label>
            <input
              type="text"
              class="form-control"
              id="cName"
              aria-describedby="cNameHelp"
              placeholder="e.g. Crypto Punks"
              v-model="cName"
            />
            <div id="cNameHelp" class="form-text">
              This is not a token name, but the whole collection name.
            </div>
          </div>

          <!-- Symbol -->
          <div class="form-group">
            <label for="cSymbol" class="form-label">Collection Symbol</label>
            <input
              type="text"
              class="form-control"
              id="cSymbol"
              aria-describedby="cSymbolHelp"
              placeholder="e.g. PUNKS"
              v-model="cSymbol"
            />
            <div id="cSymbolHelp" class="form-text">
              Collection symbol (required by the ERC-721 smart contract, but not
              really important).
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="cDescription" class="form-label"
          >Collection Description (can be changed later)</label
        >
        <textarea
          class="form-control"
          id="cDescription"
          aria-describedby="cDescriptionHelp"
          placeholder="Keep it short and sweet."
          v-model="cDescription"
          rows="3"
        ></textarea>
        <div id="cDescriptionHelp" class="form-text">
          Too long description means higher gas cost for storing it.
        </div>
      </div>

      <!-- Unique ID and Bonding Curve Ratio -->
      <div class="form-group grid-container">
        <div>
          <label for="uniqueId" class="form-label"
            >Unique ID (store it - just in case)</label
          >
          <input
            type="text"
            class="form-control"
            id="uniqueId"
            aria-describedby="uniqueIdHelp"
            disabled
            readonly
            v-model="uniqueId"
          />
          <div id="uniqueIdHelp" class="form-text">
            This is just in case the frontend will not show you the NFT
            collection address and you'll need to find it manually.
          </div>
        </div>

        <div>
          <label for="ratio" class="form-label">Bonding Curve Ratio</label>
          <input
            type="text"
            class="form-control"
            id="ratio"
            aria-describedby="ratioHelp"
            v-model="ratio"
          />
          <div id="ratioHelp" class="form-text">
            Price for mint #1 will be
            {{ getLessDecimals(calculatePrice(2, ratio)) }}
            {{ $config.tokenSymbol }}, for mint #5 will be
            {{ getLessDecimals(calculatePrice(5, ratio)) }}
            {{ $config.tokenSymbol }}, for mint #15 will be
            {{ getLessDecimals(calculatePrice(15, ratio)) }}
            {{ $config.tokenSymbol }}, for mint #30 will be
            {{ getLessDecimals(calculatePrice(30, ratio)) }}
            {{ $config.tokenSymbol }}, etc.
          </div>
        </div>
      </div>

      <!-- Buttons div -->
      <div class="buttons-container">
        <!-- Create Collection button -->
        <button
          :disabled="waitingCreate || !fieldsValid"
          v-if="isActivated && !launchpadPaused"
          class="btn btn-primary"
          type="button"
          @click="createCollection"
        >
          <span
            v-if="waitingData || waitingCreate"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Create NFT Collection for {{ createPrice }} {{ $config.tokenSymbol }}
        </button>

        <!-- Paused button -->
        <button
          :disabled="true"
          v-if="isActivated && launchpadPaused"
          class="btn btn-primary"
        >
          Paused
        </button>

        <!-- Connect Wallet button -->
        <ConnectWalletButton
          v-if="!isActivated"
          class="btn btn-primary"
          btnText="Connect wallet"
        />
      </div>

      <!-- Upload Image Modal -->
      <FileUploadModal
        v-if="isMounted"
        @processFileUrl="insertImage"
        title="Upload your NFT image"
        infoText="Upload the NFT image."
        storageType="ipfs"
        :componentId="componentId"
        :maxFileSize="$config.fileUploadSizeLimit"
        :isOpen="isModalOpen"
        @close="closeModal"
      />
      <!-- END Upload Image Modal -->
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { ref } from "vue";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import Image from "~/components/Image.vue";
import WaitingToast from "~/components/WaitingToast";
import FileUploadModal from "~/components/storage/FileUploadModalNft.vue";
import { useUserStore } from "~/store/user";
import { getLessDecimals } from "~/utils/numberUtils";
import { fetchReferrer } from "~/utils/storageUtils";

export default {
  name: "NftCreate",

  data() {
    return {
      cDescription: null,
      cImage: null,
      cName: null,
      cSymbol: null,
      isMounted: false,
      launchpadPaused: null,
      nftName: null,
      createPriceWei: null,
      ratio: null,
      uniqueId: null,
      waitingCreate: false,
      waitingData: false,
      componentId: null,
      loadingImage: false,
      loadError: false,
    };
  },

  components: {
    ConnectWalletButton,
    FileUploadModal,
    WaitingToast,
    Image,
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const userStore = useUserStore();
    const toast = useToast();
    const isModalOpen = ref(false);

    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };

    const removeImage = () => {
      cImage.value = null;
    };

    return {
      address,
      chainId,
      isActivated,
      signer,
      toast,
      userStore,
      isModalOpen,
      openModal,
      closeModal,
      removeImage,
    };
  },

  mounted() {
    this.isMounted = true;
    this.ratio = this.$config.nftDefaultRatio;
    this.fetchData();
    this.componentId = this.$.uid;
  },

  computed: {
    cleanDescription() {
      if (!this.cDescription) return null;
      return this.cDescription.replace(/"/g, "'"); // replace double quotes with single quotes
    },

    createPrice() {
      if (!this.createPriceWei) return null;

      const price = Number(ethers.utils.formatEther(this.createPriceWei));

      if (price > 1) {
        return price.toFixed(0);
      } else if (price > 0.1) {
        return price.toFixed(4);
      } else if (price > 0.01) {
        return price.toFixed(5);
      } else if (price > 0.001) {
        return price.toFixed(6);
      } else if (price > 0.0001) {
        return price.toFixed(7);
      } else if (price > 0.00001) {
        return price.toFixed(8);
      } else if (price > 0.000001) {
        return price.toFixed(9);
      } else {
        return price;
      }
    },

    fieldsValid() {
      return (
        this.cName &&
        this.cSymbol &&
        this.cImage &&
        this.cDescription &&
        this.ratio
      );
    },
  },

  methods: {
    calculatePrice(nftId, ratio) {
      const supply = Number(nftId) - 1;
      return (
        ((((supply * (supply + 1) * (2 * supply + 1) -
          (supply - 1) * supply * (2 * (supply - 1) + 1)) *
          10000) /
          42069) *
          Number(ratio)) /
        31337
      );
    },

    async createCollection() {
      this.waitingCreate = true;

      if (this.signer) {
        const launchpadInterface = new ethers.utils.Interface([
          `function launch(
              address contractOwner_,
              address referrer_,
              string memory mdDescription_,
              string memory mdImage_,
              string memory mdName_,
              string memory name_,
              string memory symbol_,
              string calldata uniqueId_,
              uint256 ratio_
            ) external payable`,
          "function getNftContractAddress(string calldata _uniqueId) external view returns(address)",
        ]);

        const launchpadContract = new ethers.Contract(
          this.$config.nftLaunchpadBondingAddress,
          launchpadInterface,
          this.signer,
        );

        try {
          const tx = await launchpadContract.launch(
            this.address,
            fetchReferrer(window),
            this.cleanDescription,
            this.cImage,
            this.cName,
            this.cName,
            this.cSymbol,
            this.uniqueId,
            ethers.utils.parseEther(String(this.ratio)),
            { value: this.createPriceWei },
          );

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

            this.toast("You have successfully created an NFT collection!", {
              type: "success",
              onClick: () =>
                window
                  .open(
                    this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                    "_blank",
                  )
                  .focus(),
            });

            const nftContractAddress =
              await launchpadContract.getNftContractAddress(this.uniqueId);

            this.makeOrbisPost(nftContractAddress);

            this.$router.push({
              path: "/nft/collection",
              query: { id: nftContractAddress },
            });

            this.waitingCreate = false;
          } else {
            this.toast.dismiss(toastWait);
            this.waitingCreate = false;
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
          this.toast(e.message, { type: "error" });
          this.waitingCreate = false;
        }
      }

      this.waitingCreate = false;
    },

    async fetchData() {
      this.waitingData = true;

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const launchpadInterface = new ethers.utils.Interface([
        "function paused() public view returns(bool)",
        "function isUniqueIdAvailable(string calldata _uniqueId) public view returns(bool)",
        "function price() public view returns(uint256)",
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider,
      );

      try {
        console.log("Fetching paused status...");
        this.launchpadPaused = await launchpadContract.paused();
        console.log("Paused status:", this.launchpadPaused);

        console.log("Generating unique ID...");
        this.uniqueId = Math.random().toString(36).slice(2);

        const isUniqueIdAvailable = await launchpadContract.isUniqueIdAvailable(
          this.uniqueId,
        );
        console.log("Unique ID available:", isUniqueIdAvailable);

        if (!isUniqueIdAvailable) {
          this.uniqueId = Math.random().toString(36).slice(10);
        }

        console.log("Fetching create price...");
        this.createPriceWei = await launchpadContract.price();
        console.log("Create price (Wei):", this.createPriceWei);

        this.waitingData = false;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.toast("Error fetching data. Please try again.", { type: "error" });
        this.waitingData = false;
      }
    },

    async retryLoadImage(url, retries = 3) {
      this.loadingImage = true;
      this.loadError = false;
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            this.loadingImage = false;
            this.loadError = false;
            return;
          }
        } catch (error) {
          console.error("Failed to load image, retrying...", error);
        }
      }
      this.loadingImage = false;
      this.loadError = true;
      console.error("Failed to load image after multiple attempts.");
    },

    insertImage(imageUrl) {
      this.cImage = imageUrl.replace("?.img", "");
      this.retryLoadImage(this.cImage);
    },

    async makeOrbisPost(nftContractAddress) {
      if (this.userStore.getIsConnectedToOrbis) {
        try {
          if (
            !String(this.cImage).toLowerCase().endsWith("?.img") &&
            !String(this.cImage).toLowerCase().endsWith(".png") &&
            !String(this.cImage).toLowerCase().endsWith(".jpg") &&
            !String(this.cImage).toLowerCase().endsWith(".jpeg") &&
            !String(this.cImage).toLowerCase().endsWith(".gif") &&
            !String(this.cImage).toLowerCase().endsWith(".webp")
          ) {
            this.cImage = this.cImage + "?.img";
          }

          const options = {
            body:
              "I have launched a new NFT collection: " +
              this.cName +
              " <br /><br />Check it out here 👇",
            context: this.$config.chatChannels.general,
            data: {
              type: "nftCollectionCreated",
              authorAddress: String(this.address),
              collectionAddress: String(nftContractAddress),
              collectionDescription: this.cleanDescription,
              collectionImage: this.cImage.replace("?.img", ""),
              collectionName: this.cName,
              collectionRatio: this.ratio,
              collectionSymbol: this.cSymbol,
              collectionUniqueId: this.uniqueId,
              pricePaidWei: this.createPriceWei,
            },
          };

          await this.$orbis.createPost(options);
        } catch (e) {
          console.log(e);
        }
      }
    },
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped>
.create-collection-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-body {
  padding: 20px;
}

.back-icon {
  cursor: pointer;
  font-size: 1.5rem;
  display: none; /* Hide in PC view */
}

@media (max-width: 768px) {
  .back-icon {
    display: block; /* Show in mobile view */
  }
}

.title {
  margin-bottom: 20px;
  margin-top: 20px;
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.price-info {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  font-weight: bold;
}

.form-control {
  border-radius: 10px;
  padding: 10px;
  border: 1px solid #ced4da;
}

.form-text {
  color: #6c757d;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .image-section {
    grid-template-columns: 1fr;
  }
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  position: relative;
}

.image-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
  border-radius: 10px;
  border: 2px solid white;
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  transition: opacity 0.3s ease;
}

.preview-image:hover {
  opacity: 0.8;
}

.default-image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.default-image i {
  font-size: 3rem;
  color: #6c757d;
}

.delete-button,
.refresh-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: absolute;
}

.delete-button {
  top: 10px;
  right: 10px;
  color: #dc3545;
}

.refresh-button {
  bottom: 10px;
  right: 10px;
  color: #007bff;
}

.delete-button:hover,
.refresh-button:hover {
  transform: scale(1.2);
}

.buttons-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
