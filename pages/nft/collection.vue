<template>
  <Head>
    <Title>NFT Collection Details | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'NFT Collection Details | ' + $config.projectMetadataTitle"
    />
    <Meta
      name="description"
      :content="'Check this NFT collection on ' + $config.projectName + '!'"
    />
    <Meta
      property="og:image"
      :content="$config.projectUrl + $config.previewImageNftCollection"
    />
    <Meta
      property="og:description"
      :content="'Check this NFT collection on ' + $config.projectName + '!'"
    />
    <Meta
      name="twitter:image"
      :content="$config.projectUrl + $config.previewImageNftCollection"
    />
    <Meta
      name="twitter:description"
      :content="'Check this NFT collection on ' + $config.projectName + '!'"
    />
  </Head>

  <div class="collection-container">
    <div class="collection-card">

      <h3 class="collection-title" v-if="!cName">NFT Collection Details</h3>
      <h3 class="collection-title" v-if="cName">{{ cName }}</h3>

      <div class="loading-spinner" v-if="waitingData">
        <span
          class="spinner-border spinner-border-lg"
          role="status"
          aria-hidden="true"
        ></span>
      </div>

      <div class="row">
        <div class="col-md-5 text-center mb-3">
          <div class="nft-image-container">
            <div class="svg-background">
              <Image
                :url="cImage"
                v-if="cImage"
                cls="nft-image"
                :alt="cName"
                :key="cImage"
              />
            </div>
          </div>

          <div class="actions-dropdown mt-3">
            <button
              class="btn custom-btn btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Actions
            </button>
            <ul class="dropdown-menu">
              <li v-if="isCurrentAddressOwner">
                <span
                  class="dropdown-item cursor-pointer"
                  @click="openManageModal"
                >
                  Manage my Collection
                </span>
              </li>
              <li>
                <span
                  class="dropdown-item cursor-pointer"
                  @click="getCollectionDetails(true)"
                  >Refresh metadata</span
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-7">
          <div class="collection-details mt-1 mb-4">
            <p class="back-button">
                <i
                  @click="$router.push({ path: '/nft' })"
                  class="bi bi-arrow-left-circle cursor-pointer"
                ></i>
              </p>
            <div class="detail-item">
              <i class="bi bi-file-earmark-text-fill me-1"></i>
              <span class="detail-label">Description:</span> {{ cDescription }}
            </div>
            <div class="detail-item">
              <i class="bi bi-coin me-1"></i>
              <span class="detail-label">Buy/Sell price:</span>
              {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }} /
              {{ formatPrice(priceSellWei) }} {{ $config.tokenSymbol }}
            </div>
            <div class="detail-item">
              <i class="bi bi-file-earmark-binary me-1"></i>
              <span class="detail-label">NFTs minted:</span> {{ cSupply }}
            </div>
            <div class="detail-item">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a
                :href="$config.blockExplorerBaseUrl + '/address/' + cAddress"
                target="_blank"
                class="collection-link"
              >
                {{ shortenAddress(cAddress) }}
              </a>
              <span v-if="getUsernameOrShortAddress">
                &nbsp;by
                <NuxtLink
                  :to="'/profile/?id=' + String(getUsernameOrFullAddress)"
                  class="collection-link"
                  >{{ getUsernameOrShortAddress }}</NuxtLink
                >
              </span>
            </div>
            <div class="detail-item">
              <i class="bi bi-box-arrow-up-right me-2"></i>
              <a
                :href="$config.marketplaceNftCollectionBaseUrl + cAddress"
                target="_blank"
                class="collection-link"
              >
                See on NFT marketplace
              </a>
            </div>
          </div>

          <div class="row mb-3">
            <div v-if="!isActivated" class="d-grid gap-2 col">
              <ConnectWalletButton
                class="btn custom-btn connect-wallet-btn"
                btnText="Connect wallet"
              />
            </div>
            <div v-if="isActivated" class="d-grid gap-2 col">
              <button
                @click="buyNft"
                class="btn custom-btn action-btn"
                type="button"
                :disabled="waitingData || waitingBuy"
              >
                <span
                  v-if="waitingBuy"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Buy for {{ formatPrice(priceBuyWei) }} {{ $config.tokenSymbol }}
              </button>
            </div>
            <div v-if="isActivated" class="d-grid gap-2 col">
              <button
                @click="sellNft"
                class="btn custom-btn action-btn"
                type="button"
                :disabled="
                  waitingData ||
                  waitingSell ||
                  !userTokenId ||
                  priceSellWei == 0
                "
              >
                <span
                  v-if="waitingSell"
                  class="spinner-border spinner-border-sm mx-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Sell for {{ formatPrice(priceSellWei) }}
                {{ $config.tokenSymbol }}
              </button>
            </div>
          </div>

          <small v-if="isActivated">
            <em style="color: white;"
              >(Price may still change after pressing the button, so make sure
              to check the {{ $config.tokenSymbol }} amount in wallet.)</em
            >
          </small>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!userTokenId" class="collection-card mt-3">
    <div class="card-body">
      <h5 class="mb-2 mt-3 text-center">Buy an NFT to see the chat</h5>
      <div class="d-flex justify-content-center">
        <div class="col-12 col-lg-8">
          <p class="text-break text-center mt-3 mb-4">
            This NFT's chat is open only for NFT holders. Buy an NFT to see the
            chat and talk with the NFT creator and other NFT holders.
          </p>
        </div>
      </div>
    </div>
  </div>

  <ChatFeed
    v-if="$config.chatChannels.nftLaunchpad && userTokenId"
    :key="cAddress"
    class="mt-3 scroll-500"
    :showQuotedPost="$config.showRepliesOnHomepage"
    :orbisContext="$config.chatChannels.nftLaunchpad + ':' + cAddress"
  />

  <!-- Manage Collection Modal -->
  <div
    v-if="selectedNft"
    class="modal fade"
    id="manageNftModal"
    tabindex="-1"
    aria-labelledby="manageNftModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="manageNftModalLabel">
            Manage Collection: {{ selectedNft.name }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs" id="manageTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link active"
                id="description-tab"
                data-bs-toggle="tab"
                data-bs-target="#description"
                type="button"
                role="tab"
                aria-controls="description"
                aria-selected="true"
              >
                Description
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="preview-tab"
                data-bs-toggle="tab"
                data-bs-target="#preview"
                type="button"
                role="tab"
                aria-controls="preview"
                aria-selected="false"
              >
                Preview Image
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="images-tab"
                data-bs-toggle="tab"
                data-bs-target="#images"
                type="button"
                role="tab"
                aria-controls="images"
                aria-selected="false"
              >
                Images
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                id="metadata-tab"
                data-bs-toggle="tab"
                data-bs-target="#metadata"
                type="button"
                role="tab"
                aria-controls="metadata"
                aria-selected="false"
              >
                Metadata
              </button>
            </li>
          </ul>
          <div class="tab-content" id="manageTabContent">
            <div
              class="tab-pane fade show active"
              id="description"
              role="tabpanel"
              aria-labelledby="description-tab"
            >
              <change-description-modal
                :cAddress="selectedNft.address"
                :cDescription="selectedNft.description"
                :mdAddress="selectedNft.mdAddress"
                @saveCollection="saveCollection"
              ></change-description-modal>
            </div>
            <div
              class="tab-pane fade"
              id="preview"
              role="tabpanel"
              aria-labelledby="preview-tab"
            >
              <change-collection-preview-modal
                :cAddress="selectedNft.address"
                :mdAddress="selectedNft.mdAddress"
                storageType="ipfs"
                @saveCollection="saveCollection"
              ></change-collection-preview-modal>
            </div>
            <div
              class="tab-pane fade"
              id="images"
              role="tabpanel"
              aria-labelledby="images-tab"
            >
              <div class="row">
                <div class="col-md-6">
                  <add-image-to-collection-modal
                    :cAddress="selectedNft.address"
                    :mdAddress="selectedNft.mdAddress"
                    storageType="ipfs"
                    @saveCollection="saveCollection"
                  ></add-image-to-collection-modal>
                </div>
                <div class="col-md-6">
                  <remove-image-from-collection-modal
                    :cAddress="selectedNft.address"
                    :mdAddress="selectedNft.mdAddress"
                    @saveCollection="saveCollection"
                  ></remove-image-from-collection-modal>
                </div>
              </div>
            </div>
            <div
              class="tab-pane fade"
              id="metadata"
              role="tabpanel"
              aria-labelledby="metadata-tab"
            >
              <change-nft-type-modal
                :cAddress="selectedNft.address"
                :cType="selectedNft.type"
                :mdAddress="selectedNft.mdAddress"
                @saveCollection="saveCollection"
              ></change-nft-type-modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- End Manage Collection Modal -->
</template>

<script>
import { ethers } from "ethers";
import { useEthers, shortenAddress } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import ChatFeed from "~/components/chat/ChatFeed.vue";
import ConnectWalletButton from "~/components/ConnectWalletButton.vue";
import Image from "~/components/Image.vue";
import WaitingToast from "~/components/WaitingToast";
import AddImageToCollectionModal from "~/components/nft/collection/AddImageToCollectionModal";
import ChangeCollectionPreviewModal from "~/components/nft/collection/ChangeCollectionPreviewModal";
import ChangeDescriptionModal from "~/components/nft/collection/ChangeDescriptionModal";
import ChangeNftTypeModal from "~/components/nft/collection/ChangeNftTypeModal";
import RemoveImageFromCollectionModal from "~/components/nft/collection/RemoveImageFromCollectionModal";
import { getDomainName } from "~/utils/domainUtils";
import {
  fetchCollection,
  fetchUsername,
  storeCollection,
  storeUsername,
} from "~/utils/storageUtils";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "NftCollection",

  data() {
    return {
      cAddress: null,
      cAuthorAddress: null,
      cAuthorDomain: null,
      cDescription: null,
      cImage: null,
      cName: null,
      cSupply: null,
      cType: 0,
      mdAddress: null,
      priceBuyWei: null,
      priceSellWei: null,
      userTokenId: null, // if user owns at least one NFT, this will be set to the first token ID that user owns
      waitingBuy: false,
      waitingData: false,
      waitingSell: false,
      selectedNft: null,
    };
  },

  components: {
    AddImageToCollectionModal,
    ChangeCollectionPreviewModal,
    ChangeDescriptionModal,
    ChangeNftTypeModal,
    ChatFeed,
    ConnectWalletButton,
    Image,
    RemoveImageFromCollectionModal,
    WaitingToast,
  },

  mounted() {
    this.cAddress = this.$route.query.id;

    if (this.cAddress) {
      this.getCollectionDetails();
    }
  },

  computed: {
    getUsernameOrFullAddress() {
      if (this.cAuthorDomain) {
        let cleanName = String(this.cAuthorDomain).replace(
          this.$config.tldName,
          "",
        );
        return getTextWithoutBlankCharacters(cleanName) + this.$config.tldName;
      } else {
        return this.cAuthorAddress;
      }
    },

    getUsernameOrShortAddress() {
      if (this.cAuthorAddress) {
        if (this.cAuthorDomain) {
          let cleanName = String(this.cAuthorDomain).replace(
            this.$config.tldName,
            "",
          );
          return (
            getTextWithoutBlankCharacters(cleanName) + this.$config.tldName
          );
        } else {
          return shortenAddress(this.cAuthorAddress);
        }
      }

      return null;
    },

    isCurrentAddressOwner() {
      if (this.cAuthorAddress && this.address) {
        return (
          String(this.cAuthorAddress).toLowerCase() ===
          String(this.address).toLowerCase()
        );
      }

      return false;
    },
  },

  methods: {
    getDomainName,

    async buyNft() {
      this.waitingBuy = true;

      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function mint(address to) external payable returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)",
      ]);

      const nftContract = new ethers.Contract(
        this.cAddress,
        nftInterface,
        this.signer,
      );

      // fetch the price again to get the latest price
      this.priceBuyWei = await nftContract.getMintPrice();

      try {
        const tx = await nftContract.mint(this.address, {
          value: this.priceBuyWei,
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

          this.toast("You have successfully bought the NFT! Congrats!", {
            type: "success",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });

          this.priceBuyWei = await nftContract.getMintPrice();
          this.priceSellWei = await nftContract.getBurnPrice();

          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(
              this.address,
              0,
            );
          } catch (e) {
            this.userTokenId = null;
          }

          this.cSupply = await nftContract.totalSupply();

          this.waitingBuy = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingBuy = false;
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

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace(
            "execution reverted:",
            "Error:",
          );

          console.log(extractMessage);

          this.toast(extractMessage, { type: "error" });
        } catch (e) {
          this.toast("Transaction has failed.", { type: "error" });
        }

        this.waitingBuy = false;
      }
    },

    async fetchUserDomain() {
      if (this.cAuthorAddress) {
        const userDomain = await this.getDomainName(this.cAuthorAddress);

        if (userDomain) {
          this.cAuthorDomain = userDomain;
          storeUsername(
            window,
            this.cAuthorAddress,
            userDomain + this.$config.tldName,
          );
        }
      }
    },

    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }

      const price = Number(ethers.utils.formatEther(priceWei));

      if (price > 100) {
        return price.toFixed(0);
      } else if (price > 1) {
        return price.toFixed(2);
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

    async getCollectionDetails(refresh = false) {
      this.waitingData = true;

      let collection = fetchCollection(window, this.cAddress);

      if (refresh) {
        console.log("Refreshing collection metadata...");
        collection = null;
      }

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function metadataAddress() public view returns (address)",
        "function name() public view returns (string memory)",
        "function owner() public view returns (address)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)",
      ]);

      const nftContract = new ethers.Contract(
        this.cAddress,
        nftInterface,
        provider,
      );

      if (collection?.mdAddress) {
        this.mdAddress = collection.mdAddress;
      } else {
        this.mdAddress = await nftContract.metadataAddress();
      }

      const metadataInterface = new ethers.utils.Interface([
        "function getCollectionDescription(address) public view returns (string memory)",
        "function getCollectionMetadataType(address nftAddress_) external view returns (uint256)",
        "function getCollectionPreviewImage(address) public view returns (string memory)",
      ]);

      const metadataContract = new ethers.Contract(
        this.mdAddress,
        metadataInterface,
        provider,
      );

      this.priceBuyWei = await nftContract.getMintPrice();
      this.priceSellWei = await nftContract.getBurnPrice();

      if (collection?.image) {
        this.cImage = collection.image;
      } else {
        this.cImage = await metadataContract.getCollectionPreviewImage(
          this.cAddress,
        );
      }

      if (this.cImage.includes(".ipfs.sphn.link/")) {
        const linkParts = this.cImage.split(".ipfs.sphn.link/");
        const cid = linkParts[0].replace("https://", "");
        this.cImage = this.$config.ipfsGateway + cid + "/" + linkParts[1];
      }

      if (
        collection?.description &&
        collection.description !== "" &&
        collection.description !== null
      ) {
        this.cDescription = collection.description;
      } else {
        this.cDescription = await metadataContract.getCollectionDescription(
          this.cAddress,
        );
      }

      if (collection?.type >= 0) {
        this.cType = collection.type;
      } else {
        this.cType = Number(
          await metadataContract.getCollectionMetadataType(this.cAddress),
        );
      }

      if (collection?.name) {
        this.cName = collection.name;
      } else {
        this.cName = await nftContract.name();
      }

      try {
        this.userTokenId = await nftContract.tokenOfOwnerByIndex(
          this.address,
          0,
        );
      } catch (e) {
        this.userTokenId = null;
      }

      this.waitingData = false;

      this.cSupply = await nftContract.totalSupply();

      if (collection?.authorAddress) {
        this.cAuthorAddress = collection.authorAddress;
        this.cAuthorDomain = collection.authorDomain;
      } else {
        this.cAuthorAddress = await nftContract.owner();
      }

      this.cAuthorDomain = fetchUsername(window, this.cAuthorAddress);

      if (!this.cAuthorDomain) {
        this.fetchUserDomain();
      }

      collection = {
        address: this.cAddress,
        authorAddress: this.cAuthorAddress,
        authorDomain: this.cAuthorDomain,
        description: this.cDescription,
        image: this.cImage,
        mdAddress: this.mdAddress,
        name: this.cName,
        type: this.cType,
      };

      storeCollection(window, this.cAddress, collection);

      this.selectedNft = {
        address: this.cAddress,
        name: this.cName,
        description: this.cDescription,
        mdAddress: this.mdAddress,
        type: this.cType,
      };
    },

    saveCollection(newCollectionData) {
      if (newCollectionData?.type) {
        this.cType = newCollectionData.type;
      }

      if (newCollectionData?.description) {
        this.cDescription = newCollectionData.description;
      }

      if (newCollectionData?.image) {
        this.cImage = newCollectionData.image;
      }

      const collection = {
        address: this.cAddress,
        authorAddress: this.cAuthorAddress,
        authorDomain: this.cAuthorDomain,
        description: this.cDescription,
        image: this.cImage,
        mdAddress: this.mdAddress,
        name: this.cName,
        type: this.cType,
      };

      storeCollection(window, this.cAddress, collection);
    },

    openManageModal() {
      const modal = new bootstrap.Modal(
        document.getElementById("manageNftModal"),
      );
      modal.show();
    },

    async sellNft() {
      this.waitingSell = true;

      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function burn(uint256 tokenId) external returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
        "function totalSupply() public view returns (uint256)",
      ]);

      const nftContract = new ethers.Contract(
        this.cAddress,
        nftInterface,
        this.signer,
      );

      try {
        const tx = await nftContract.burn(this.userTokenId);

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

          this.toast("You have dumped the NFT.", {
            type: "success",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });

          this.priceBuyWei = await nftContract.getMintPrice();
          this.priceSellWei = await nftContract.getBurnPrice();

          try {
            this.userTokenId = await nftContract.tokenOfOwnerByIndex(
              this.address,
              0,
            );
          } catch (e) {
            this.userTokenId = null;
          }

          this.cSupply = await nftContract.totalSupply();

          this.waitingSell = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingSell = false;
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

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace(
            "execution reverted:",
            "Error:",
          );

          console.log(extractMessage);

          this.toast(extractMessage, { type: "error" });
        } catch (e) {
          this.toast("Transaction has failed.", { type: "error" });
        }

        this.waitingSell = false;
      }
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();

    return { address, chainId, isActivated, shortenAddress, signer, toast };
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped>
.collection-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background: rgba(0, 0, 0, 0);
  border-radius: 27px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  margin: 0 auto;
}

.collection-card {
  border: 1px solid #ddd;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);;
  width: 100%;
  padding: 20px 40px 20px 40px;
}

.collection-card .card-body {
  padding: 20px;
}

.back-button {
  font-size: 2rem;
  cursor: pointer;
  color: white;
  margin: 20px 0 20px 0;
}

.collection-title {
  font-size: 2.5rem;
  margin: 20px;
  text-align: center;
  font-weight: bold;
  color: #fff;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.nft-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border: 6px solid white;
  border-radius: 17px;
}

.svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fcf1c4; /* Background color from Figma */
  border: 1px solid #000000; /* Border color from Figma */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Box shadow */
  border-radius: 15px; /* Border radius */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Ensure content stays within the SVG container */
}

.nft-image {
  width: auto;
  height: auto;
  max-width: 80%;
  max-height: 80%;
  margin: 10%;
  object-fit: fill;
}

.actions-dropdown {
  margin-top: 15px;
}

.collection-details {
  font-size: 1.25rem;
  color: #fff;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.detail-label {
  margin-right: 5px;
  margin-left: 5px;
}

.collection-link {
  color: #007bff;
  text-decoration: none;
}

.collection-link:hover {
  color: #0056b3;
}

.btn.custom-btn {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
  font-weight: bold;
  transition:
    background-color 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}

.btn.custom-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
  transform: translateY(-2px);
}

.connect-wallet-btn {
  font-weight: bold;
}

.action-btn {
  font-weight: bold;
}

.dark-mode .collection-title,
.dark-mode .collection-details p,
.dark-mode .collection-details small em {
  color: #fff;
}

.dark-mode .collection-link {
  color: #0056b3;
}

.dark-mode .collection-link:hover {
  color: #007bff;
}

.dark-mode .btn.custom-btn {
  background-color: #0056b3;
  border-color: #0056b3;
}

.dark-mode .btn.custom-btn:hover {
  background-color: #007bff;
  border-color: #007bff;
}

p {color: #fff;}
h5 {color: #fff;}
</style>
