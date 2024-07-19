<template>
  <div class="user-collections">
    <div class="mb-3">Manage My Collections</div>
    <div v-if="!isActivated" class="alert alert-info">
      Connect to your account to display the NFTs you've created.
    </div>

    <div v-else>
      <div v-if="createdNfts.length > 0" class="mt-3 mb-3">My Collections</div>

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

      <div class="grid-container">
        <div
          v-for="nft in createdNfts"
          :key="nft.address"
          class="grid-item text-decoration-none"
        >
          <div class="nft-card mb-3">
            <div class="nft-card-img-container">
              <div :class="['nft-svg-background', 'nftbondorange']"></div>
              <div class="nft-card-content">
                <div class="nft-card-title">{{ nft.name }}</div>
                <img
                  :src="nft.image"
                  :alt="nft.name"
                  class="nft-card-img-top"
                />
                <div class="nft-card-price">
                  Minted NFTs: {{ nft.totalSupply }}
                </div>
                <div
                  v-if="nft.isBonding"
                  class="badge bg-primary bonding-badge"
                >
                  Bonding
                </div>
                <div class="overlay">
                  <i
                    class="bi bi-eye eye-icon"
                    @click="$router.push(`/nft/collection?id=${nft.address}`)"
                  ></i>
                </div>
              </div>
            </div>
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
  name: "ManageMyCollectionsComponent",
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
      (newVal) => {
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
    collectionsCount() {
      return this.createdNfts.length;
    },
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0;
    },
  },
  watch: {
    createdNfts(newVal) {
      this.$emit("collectionsCountUpdated", newVal.length);
    },
  },
  methods: {
    async fetchCollectionsFromAPI() {
      const url = `https://apicreator.scrolly.xyz/collections/${this.address}`;
      console.log(`Fetching collections from API: ${url}`);
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
        console.log(`API response:`, data);
        return data.contract_addresses || [];
      } catch (error) {
        console.error("Error fetching collections from API:", error);
        console.error("API URL:", url);
        return [];
      }
    },
    convertIpfsToHttp(ipfsUrl) {
      if (ipfsUrl.startsWith("ipfs://")) {
        return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return ipfsUrl;
    },
    async fetchCreatedNfts() {
      console.log(`Current address: ${this.address}`);
      if (!this.address) {
        console.warn("No address found.");
        return;
      }
      this.waitingData = true;
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);
      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const nftAddresses = await this.fetchCollectionsFromAPI();
      console.log(`NFT addresses:`, nftAddresses);

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

            collection.image = this.convertIpfsToHttp(collection.image);

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
      console.log(`Created NFTs:`, createdNfts);
      this.createdNfts = createdNfts;
      this.waitingData = false;
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
.user-collections {
  margin: 20px 0;
  color: white;
  font-size: 1.5rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nft-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 5px;
  border: 1px solid transparent;
  background: transparent;
}

.nft-card-img-container {
  position: relative;
  width: 100%;
  padding-top: 145%;
  background: transparent;
  overflow: hidden;
}

.nft-svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 1;
}

.nft-card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  z-index: 2;
  padding: 10% 5%;
}

.nft-card-title {
  margin-bottom: 10px;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
  margin-top: 10px;
}

.nft-card-img-top {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
  margin: auto;
  display: block;
}

.nft-card-price {
  margin-top: auto;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
}

.bonding-badge {
  margin-top: 5px;
  font-size: 0.75rem;
}

.spinner-border-lg {
  width: 3rem;
  height: 3rem;
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
  z-index: 3;
}

.overlay .eye-icon {
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.nft-card-img-top:hover + .overlay,
.overlay:hover {
  opacity: 1;
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

.nftbondorange {
  background-image: url("@/assets/nft/nftbondorange.svg");
}
</style>
