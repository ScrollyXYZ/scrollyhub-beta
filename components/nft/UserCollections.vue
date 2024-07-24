<template>
  <div>
    <div v-if="waitingData" class="alert alert-info">
      Searching for NFTs on the blockchain. Please wait a moment...
    </div>

    <div v-else-if="nfts.length === 0" class="alert alert-warning">
      This user doesn't own any NFT.
    </div>

    <div class="row">
      <NuxtLink
        v-for="nft in nfts"
        :key="nft.address"
        class="col-md-3 text-decoration-none"
        :to="'/nft/collection?id=' + nft.address"
        v-show="nft.validImage"
      >
        <div
          class="card border mb-3 h-100 d-flex flex-column position-relative"
        >
          <div class="image-container rounded">
            <Image
              :url="nft.image"
              :alt="nft.name"
              cls="card-img-top rounded"
              @error="onImageError(nft)"
              @load="onImageLoad(nft)"
            />
            <div class="overlay rounded">
              <div class="overlay-text">{{ nft.name }}</div>
            </div>
          </div>
          <div class="card-body d-flex flex-column">
            <small
              v-if="nft.isBonding"
              class="badge bg-primary text-white align-self-start"
            >
              bonding
            </small>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import axios from "axios";
import { useEthers } from "vue-dapp";
import { fetchCollection, storeCollection } from "~/utils/storageUtils";
import Image from "~/components/Image.vue";

export default {
  name: "UserCollections",
  props: ["address", "uAddress"],
  components: {
    Image,
  },
  data() {
    return {
      nfts: [],
      waitingData: false,
      retryNfts: [],
    };
  },
  mounted() {
    if (this.isActivated) {
      this.fetchUserNfts();
    }
  },
  methods: {
    async fetchUserNfts() {
      try {
        this.waitingData = true;
        const userAddress = this.uAddress || this.address;

        // Step 1: Find contracts address owned by User via NFTScan API
        const nftScanResponse = await this.fetchWithRetry(() =>
          axios.get(
            `https://scrollapi.nftscan.com/api/v2/collections/own/${userAddress}?erc_type=erc721`,
            {
              headers: {
                "X-API-KEY": this.$config.apiKey,
              },
            },
          ),
        );
        const ownedContracts = nftScanResponse.data.data.map(
          (asset) => asset.contract_address,
        );

        // Step 2: Vérify if Contract is Whitelisted
        const ownedNfts = [];
        for (const contractAddress of ownedContracts) {
          const isWhitelisted =
            await this.checkContractWhitelist(contractAddress);
          if (isWhitelisted) {
            ownedNfts.push(contractAddress);
          } else {
            console.log(`Contract ${contractAddress} is not whitelisted`);
          }
        }

        // Step 3: Fetch Datas for WhitelistedNfts
        const provider = this.$getFallbackProvider(
          this.$config.supportedChainId,
        );
        await this.parseNftsArray(ownedNfts, this.nfts, provider);

        this.waitingData = false;
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        this.waitingData = false;
      }
    },
    async checkContractWhitelist(contractAddress) {
      try {
        const response = await this.fetchWithRetry(() =>
          axios.get(
            `https://apicreator.scrolly.xyz/check-contract/${contractAddress}`,
          ),
        );
        return response.data.exists;
      } catch (error) {
        console.error(
          `Error checking whitelist for contract: ${contractAddress}`,
          error,
        );
        return false;
      }
    },
    async parseNftsArray(inputArray, outputArray, provider) {
      const nftInterface = new ethers.utils.Interface([
        "function collectionPreview() public view returns (string memory)",
        "function name() public view returns (string memory)",
        "function pricingType() public view returns (string memory)",
      ]);

      for (let i = 0; i < inputArray.length; i++) {
        const nftContract = new ethers.Contract(
          inputArray[i],
          nftInterface,
          provider,
        );
        let collection = fetchCollection(window, inputArray[i]);

        if (!collection) {
          collection = { address: inputArray[i] };
        }

        try {
          const [cName, cImage, pricingType] = await Promise.all([
            collection.name || nftContract.name(),
            collection.image || nftContract.collectionPreview(),
            nftContract.pricingType(),
          ]);

          if (!cName || !cImage) {
            continue; // Skip NFTs with incomplete data
          }

          collection.name = cName;
          collection.image = cImage;
          storeCollection(window, inputArray[i], collection);

          outputArray.push({
            address: inputArray[i],
            image: cImage,
            name: cName,
            isBonding: pricingType.includes("bonding"),
            validImage: true,
          });
        } catch (error) {
          console.error(
            `Failed to fetch metadata for NFT: ${inputArray[i]}`,
            error,
          );
        }
      }
    },
    async fetchWithRetry(fn, retries = 3, delay = 1000) {
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === retries - 1) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    },
    onImageError(nft) {
      nft.validImage = false;
      if (!this.retryNfts.includes(nft)) {
        this.retryNfts.push(nft);
      }
    },
    onImageLoad(nft) {
      nft.validImage = true;
      this.retryNfts = this.retryNfts.filter(
        (retryNft) => retryNft.address !== nft.address,
      );
    },
    retryFailedImages() {
      this.retryNfts.forEach((nft) => {
        nft.validImage = true; // Attempt to show the image again
      });

      setTimeout(() => {
        this.retryNfts.forEach((nft) => {
          nft.validImage = false; // Hide again if still not loaded
        });
      }, 3000); // Retry after 3 seconds
    },
  },
  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    return { address, chainId, isActivated, signer };
  },
};
</script>

<style scoped>
.image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  max-height: 100%;
  width: auto;
  object-fit: contain;
  border-radius: 10px;
}

.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  opacity: 0;
  transition: 0.5s ease;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}

.overlay-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.image-container:hover .overlay {
  opacity: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.badge.bg-primary {
  background-color: #007bff;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
}
</style>
