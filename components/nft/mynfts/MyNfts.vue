<template>
  <div class="user-collections">
    <div class="mb-3">User's NFT Collections</div>

    <div v-if="waitingData" class="alert alert-info">
      Searching for NFTs on the blockchain. Please wait a moment...
    </div>

    <div v-else-if="nfts.length === 0" class="alert alert-warning">
      This user doesn't own any NFT.
    </div>

    <div class="grid-container">
      <NuxtLink
        v-for="nft in nfts"
        :key="nft.address"
        class="grid-item text-decoration-none"
        :to="'/nft/collection?id=' + nft.address"
      >
        <div class="nft-card mb-3">
          <div class="nft-card-img-container">
            <div class="nft-svg-background nftbondorange"></div>
            <div class="nft-card-content">
              <div class="nft-card-title">{{ nft.name }}</div>
              <img
                :src="nft.image"
                :alt="nft.name"
                class="nft-card-img-top"
                @error="onImageError(nft)"
                @load="onImageLoad(nft)"
              />
              <div v-if="nft.isBonding" class="badge bg-primary bonding-badge">
                Bonding
              </div>
              <div class="overlay">
                <i class="bi bi-eye eye-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="d-flex justify-content-center mb-3" v-if="waitingData">
      <span
        class="spinner-border spinner-border-lg"
        role="status"
        aria-hidden="true"
      ></span>
    </div>

    <div v-if="retryNfts.length" class="d-grid gap-2">
      <button class="btn btn-primary" @click="retryFailedImages">
        Retry Loading Images
      </button>
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
  props: ["address"],
  components: {
    Image,
  },
  data() {
    return {
      nfts: [],
      waitingData: false,
      retryNfts: [],
      apiKey: "sqbpcbCNJHIZMXeDMGCS5mEc",
    };
  },
  mounted() {
    if (this.isActivated) {
      this.fetchUserNfts();
    }
  },
  watch: {
    nfts(newVal) {
      this.$emit("validNftsCountUpdated", newVal.length);
    },
  },
  methods: {
    convertIpfsToHttp(ipfsUrl) {
      if (ipfsUrl.startsWith("ipfs://")) {
        return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return ipfsUrl;
    },
    async fetchUserNfts() {
      try {
        this.waitingData = true;

        const nftScanResponse = await axios.get(
          `https://scrollapi.nftscan.com/api/v2/collections/own/${this.address}?erc_type=erc721`,
          {
            headers: {
              "X-API-KEY": this.apiKey,
            },
          },
        );
        const ownedContracts = nftScanResponse.data.data.map(
          (asset) => asset.contract_address,
        );

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

        const provider = this.$getFallbackProvider(
          this.$config.supportedChainId,
        );
        await this.parseNftsArray(ownedNfts, this.nfts, provider);

        this.waitingData = false;
        this.$emit("validNftsCountUpdated", this.nfts.length); // Emit event after updating nfts
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        this.waitingData = false;
      }
    },
    async checkContractWhitelist(contractAddress) {
      try {
        const response = await axios.get(
          `https://apicreator.scrolly.xyz/check-contract/${contractAddress}`,
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
            continue;
          }

          // Convert IPFS URL to HTTP URL
          const imageUrl = this.convertIpfsToHttp(cImage);

          collection.name = cName;
          collection.image = imageUrl;
          storeCollection(window, inputArray[i], collection);

          outputArray.push({
            address: inputArray[i],
            image: imageUrl,
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
      this.$emit("validNftsCountUpdated", this.nfts.length); // Emit event after parsing array
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
        nft.validImage = true;
      });

      setTimeout(() => {
        this.retryNfts.forEach((nft) => {
          nft.validImage = false;
        });
      }, 3000);
    },
  },
  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    return { address, chainId, isActivated, signer };
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
  background-image: url("@/assets/nft/nftbondyellow.svg");
}
</style>
