<template>
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
            <Image :url="nft?.image" :alt="nft?.name" cls="card-img-top" />
            <div class="overlay">
              <i
                class="bi bi-eye eye-icon"
                @click="$router.push(`/nft/collection?id=${nft.address}`)"
              ></i>
            </div>
          </div>
          <div class="col-md-6">
            {{ nft.name }}
            <p>Minted NFTs: {{ nft.totalSupply }}</p>
            <p v-if="nft.isBonding">
              <span class="badge bg-primary">Bonding</span>
            </p>
          </div>
          <div class="col-md-3 text-end">
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
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { fetchCollection, storeCollection } from "~/utils/storageUtils";
import Image from "~/components/Image.vue";

export default {
  name: "ManageMyCollections",
  components: {
    Image,
  },
  props: ["hideBackButton"],
  data() {
    return {
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
      createdNfts: [],
      waitingData: false,
    };
  },
  mounted() {
    this.$watch(
      () => this.isActivated,
      (newVal, oldVal) => {
        if (newVal) {
          this.fetchCreatedNfts();
        }
      },
    );

    this.$watch(
      () => this.address,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          this.fetchCreatedNfts();
        }
      },
    );

    if (this.$config.nftLaunchpadBondingAddress && this.isActivated) {
      this.fetchCreatedNfts();
    }
  },
  computed: {
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0;
    },
  },
  methods: {
    async fetchCollectionsFromAPI() {
      const url = `https://apicreator.scrolly.xyz/collections/${this.address}`;
      console.log(`Fetching collections from API: ${url}`); // Debug log
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`API response:`, data); // Debug log
        return data.contract_addresses || [];
      } catch (error) {
        console.error("Error fetching collections from API:", error);
        console.error("API URL:", url);
        return [];
      }
    },
    async fetchCreatedNfts() {
      console.log(`Current address: ${this.address}`); // Debug log
      if (!this.address) {
        console.warn("No address found."); // Debug log
        return;
      }
      this.waitingData = true;
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);
      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      // Fetch collection from API
      const nftAddresses = await this.fetchCollectionsFromAPI();
      console.log(`NFT addresses:`, nftAddresses); // Debug log

      const createdNfts = [];
      for (const nftAddress of nftAddresses) {
        try {
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
            });
          }
        } catch (error) {
          console.error(`Error processing NFT ${nftAddress}:`, error);
        }
      }
      console.log(`Created NFTs:`, createdNfts); // Debug log
      this.createdNfts = createdNfts;
      this.waitingData = false;
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
</style>
