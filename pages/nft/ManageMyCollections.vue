<template>
  <Head>
    <Title>Manage my Collections | {{ $config.projectMetadataTitle }}</Title>
    <!-- Meta tags -->
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p v-if="!hideBackButton" class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="d-flex flex-row flex-wrap mt-3">
        <div class="mb-3 me-auto">Manage my Collections</div>
      </h3>

      <div v-if="!isActivated" class="alert alert-info">
        Connect to your account to display the NFTs you've created.
      </div>

      <div v-else>
        <h4 class="mt-3 mb-3" v-if="createdNfts.length > 0">
          Manage my Collections
        </h4>

        <div v-if="waitingData" class="alert alert-info">
          Searching for your created NFTs on the blockchain. Please wait a
          moment...
        </div>

        <div v-else-if="createdNfts.length === 0" class="alert alert-warning">
          You haven't created any collections.
          <button
            class="btn btn-primary mt-3"
            @click="$router.push('/nft/create')"
          >
            Create a Collection
          </button>
        </div>

        <div
          v-for="nft in createdNfts"
          :key="nft.address"
          class="row mb-4 align-items-center position-relative"
        >
          <div class="col-md-3 text-center position-relative">
            <img
              :src="nft.image"
              class="img-fluid img-thumbnail rounded nft-image"
              :alt="nft.name"
            />
            <div class="overlay">
              <i
                class="bi bi-eye eye-icon"
                @click="$router.push(`/nft/collection?id=${nft.address}`)"
              ></i>
            </div>
          </div>
          <div class="col-md-6">
            <h5>{{ nft.name }}</h5>
            <p>Minted NFTs: {{ nft.totalSupply }}</p>
            <p v-if="nft.isBonding">
              <span class="badge bg-primary">Bonding</span>
            </p>
          </div>
          <div class="col-md-3 text-end">
            <button
              class="btn btn-outline-primary"
              @click="openSettingsModal(nft)"
            >
              Manage NFT
            </button>
            <button
              class="btn btn-secondary mt-2"
              @click="refreshMetadata(nft)"
            >
              <span
                v-if="nft.waitingRefresh"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Refresh Metadata
            </button>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span
          class="spinner-border spinner-border-lg"
          role="status"
          aria-hidden="true"
        ></span>
      </div>

      <div v-if="showLoadMoreButton" class="d-grid gap-2">
        <button
          class="btn btn-primary"
          @click="fetchCreatedNfts"
          :disabled="waitingData"
        >
          <span
            v-if="waitingData"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Load more
        </button>
      </div>

      <!-- Settings Modal -->
      <div
        v-if="selectedNft"
        class="modal fade"
        id="settingsModal"
        tabindex="-1"
        aria-labelledby="settingsModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="settingsModalLabel">
                Manage NFT: {{ selectedNft.name }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs" id="settingsTab" role="tablist">
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
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    id="about-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#about"
                    type="button"
                    role="tab"
                    aria-controls="about"
                    aria-selected="false"
                  >
                    About
                  </button>
                </li>
              </ul>
              <div class="tab-content" id="settingsTabContent">
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
                <div
                  class="tab-pane fade"
                  id="about"
                  role="tabpanel"
                  aria-labelledby="about-tab"
                >
                  <div class="mt-3">
                    <p>
                      <strong>About:</strong> Learn more about managing your NFT
                      collections.
                    </p>
                    <p>
                      <strong>Q1:</strong> How do I update the description of my
                      NFT collection?
                      <br />
                      <strong>A:</strong> Go to the "Description" tab and use
                      the provided form to update the collection's description.
                    </p>
                    <p>
                      <strong>Q2:</strong> How do I change the preview image of
                      my NFT collection?
                      <br />
                      <strong>A:</strong> Go to the "Preview Image" tab and
                      upload or link to the new image you want to use as the
                      preview.
                    </p>
                    <p>
                      <strong>Q3:</strong> How can I add or remove images from
                      my NFT collection?
                      <br />
                      <strong>A:</strong> Use the "Images" tab to add new images
                      or remove existing ones from your collection.
                    </p>
                    <p>
                      <strong>Q4:</strong> What is metadata and how do I update
                      it?
                      <br />
                      <strong>A:</strong> Metadata provides details about each
                      NFT. Use the "Metadata" tab to update the metadata URL or
                      type.
                    </p>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade show active mt-3">
                <div v-if="tabDetails.description">
                  <p class="mt-3">
                    <strong>Description:</strong> {{ tabDetails.description }}
                  </p>
                </div>
                <div v-if="tabDetails.preview">
                  <p class="mt-3">
                    <strong>Preview Image:</strong> Update the collection's
                    preview image.
                  </p>
                </div>
                <div v-if="tabDetails.images">
                  <p class="mt-3">
                    <strong>Images:</strong> Add or remove images in the
                    collection.
                  </p>
                </div>
                <div v-if="tabDetails.metadata">
                  <p class="mt-3">
                    <strong>Metadata:</strong> Modify the metadata URL for the
                    collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End Settings Modal -->
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { fetchCollection, storeCollection } from "~/utils/storageUtils";
import ChangeDescriptionModal from "~/components/nft/collection/ChangeDescriptionModal.vue";
import ChangeCollectionPreviewModal from "~/components/nft/collection/ChangeCollectionPreviewModal.vue";
import AddImageToCollectionModal from "~/components/nft/collection/AddImageToCollectionModal.vue";
import RemoveImageFromCollectionModal from "~/components/nft/collection/RemoveImageFromCollectionModal.vue";
import ChangeNftTypeModal from "~/components/nft/collection/ChangeNftTypeModal.vue";

export default {
  name: "MyCreatedNfts",
  components: {
    ChangeDescriptionModal,
    ChangeCollectionPreviewModal,
    AddImageToCollectionModal,
    RemoveImageFromCollectionModal,
    ChangeNftTypeModal,
  },
  props: ["hideBackButton"],
  data() {
    return {
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
      createdNfts: [],
      waitingData: false,
      selectedNft: null,
      tabDetails: {
        description: "Update the description for the collection.",
        preview: "Update the collection's preview image.",
        images: "Add or remove images in the collection.",
        metadata: "Modify the metadata URL for the collection.",
      },
    };
  },
  mounted() {
    if (this.$config.nftLaunchpadBondingAddress) {
      this.fetchCreatedNfts();
    }
  },
  computed: {
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0;
    },
  },
  methods: {
    async fetchCreatedNfts() {
      this.waitingData = true;
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);
      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }
      const launchpadInterface = new ethers.utils.Interface([
        "function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)",
        "function getNftContractsArrayLength() external view returns(uint256)",
      ]);
      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider,
      );
      if (Number(this.allNftsArrayLength) === 0) {
        this.allNftsArrayLength =
          await launchpadContract.getNftContractsArrayLength();
      }
      const allNfts = await launchpadContract.getNftContracts(
        0,
        this.allNftsArrayLength - 1,
      );
      const createdNfts = [];
      for (const nftAddress of allNfts) {
        const nftInterface = new ethers.utils.Interface([
          "function owner() external view returns (address)",
          "function collectionPreview() public view returns (string memory)",
          "function totalSupply() public view returns (uint256)",
          "function name() public view returns (string memory)",
          "function pricingType() public view returns (string memory)",
        ]);
        const nftContract = new ethers.Contract(
          nftAddress,
          nftInterface,
          provider,
        );
        const owner = await nftContract.owner();
        if (owner.toLowerCase() === this.address.toLowerCase()) {
          const collection = fetchCollection(window, nftAddress) || {};
          if (!collection.name) {
            collection.name = await nftContract.name();
          }
          if (!collection.image) {
            collection.image = await nftContract.collectionPreview();
          }
          if (!collection.pricingType) {
            collection.pricingType = await nftContract.pricingType();
          }
          const totalSupply = await nftContract.totalSupply();
          storeCollection(window, nftAddress, collection);
          createdNfts.push({
            address: nftAddress,
            image: collection.image,
            name: collection.name,
            totalSupply: totalSupply.toString(),
            isBonding: collection.pricingType.includes("bonding"),
            description: collection.description || "",
            mdAddress: collection.mdAddress || "",
            type: collection.type || 0,
            waitingRefresh: false,
          });
        }
      }
      this.createdNfts = createdNfts;
      this.waitingData = false;
    },
    openSettingsModal(nft) {
      this.selectedNft = nft;
      const modal = new bootstrap.Modal(
        document.getElementById("settingsModal"),
      );
      modal.show();
      console.log("Opened modal for NFT:", nft);
    },
    async refreshMetadata(nft) {
      nft.waitingRefresh = true;
      const provider = this.$getFallbackProvider(this.$config.supportedChainId);
      const nftInterface = new ethers.utils.Interface([
        "function owner() external view returns (address)",
        "function collectionPreview() public view returns (string memory)",
        "function totalSupply() public view returns (uint256)",
        "function name() public view returns (string memory)",
        "function pricingType() public view returns (string memory)",
      ]);
      const nftContract = new ethers.Contract(
        nft.address,
        nftInterface,
        provider,
      );
      const updatedCollection = {
        address: nft.address,
        image: await nftContract.collectionPreview(),
        name: await nftContract.name(),
        totalSupply: (await nftContract.totalSupply()).toString(),
        isBonding: (await nftContract.pricingType()).includes("bonding"),
      };
      const collection = fetchCollection(window, nft.address) || {};
      Object.assign(collection, updatedCollection);
      storeCollection(window, nft.address, collection);
      this.saveCollection(updatedCollection);
      nft.waitingRefresh = false;
      this.toast("Metadata refreshed successfully.", { type: "success" });
    },
    saveCollection(updatedData) {
      const index = this.createdNfts.findIndex(
        (nft) => nft.address === updatedData.address,
      );
      if (index !== -1) {
        Object.assign(this.createdNfts[index], updatedData);
        storeCollection(
          window,
          this.createdNfts[index].address,
          this.createdNfts[index],
        );
      }
    },
  },
  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    return { address, chainId, isActivated, signer, toast };
  },
};
</script>

<style scoped>
.card {
  border-radius: 15px;
  overflow: hidden;
}

.img-thumbnail {
  max-height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.img-thumbnail:hover {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.overlay .eye-icon {
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.nft-image:hover + .overlay,
.overlay:hover {
  opacity: 1;
}

.nav-tabs .nav-link {
  border-radius: 15px 15px 0 0;
}

.nav-tabs .nav-link.active {
  background-color: var(--bs-primary);
  color: white;
}

.btn-outline-primary {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.btn-outline-primary:hover {
  background-color: var(--bs-primary);
  color: white;
}

.badge {
  display: inline-block;
  padding: 0.5em 1em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
}

.tab-content {
  padding: 1rem;
  border: 1px solid #ddd;
  border-top: 0;
  border-radius: 0 0 15px 15px;
  background-color: #f9f9f9;
}
</style>
