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
            <img
              :src="nft.image"
              class="card-img-top rounded"
              :alt="nft.name"
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
              >bonding</small
            >
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { fetchCollection, storeCollection } from "~/utils/storageUtils";

export default {
  name: "UserCollections",
  props: ["address"],
  data() {
    return {
      nfts: [],
      waitingData: false,
      retryNfts: [],
    };
  },
  mounted() {
    this.fetchUserNfts();
  },
  methods: {
    async fetchUserNfts() {
      this.waitingData = true;
      const provider = this.$getFallbackProvider(this.$config.supportedChainId);

      const launchpadInterface = new ethers.utils.Interface([
        "function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)",
        "function getNftContractsArrayLength() external view returns(uint256)",
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider,
      );

      const allNftsArrayLength =
        await launchpadContract.getNftContractsArrayLength();
      const allNfts = await launchpadContract.getNftContracts(
        0,
        allNftsArrayLength - 1,
      );
      const ownedNfts = [];

      for (const nftAddress of allNfts) {
        const nftInterface = new ethers.utils.Interface([
          "function balanceOf(address owner) external view returns (uint256)",
        ]);

        const nftContract = new ethers.Contract(
          nftAddress,
          nftInterface,
          provider,
        );
        const balance = await nftContract.balanceOf(this.address);

        if (balance > 0) {
          ownedNfts.push(nftAddress);
        }
      }

      await this.parseNftsArray(ownedNfts, this.nfts, provider);
      this.waitingData = false;

      // Retry loading images for NFTs that failed to load initially
      this.retryFailedImages();
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

          if (cImage.includes(".ipfs.sphn.link/")) {
            const linkParts = cImage.split(".ipfs.sphn.link/");
            const cid = linkParts[0].replace("https://", "");
            const newImageLink =
              this.$config.ipfsGateway + cid + "/" + linkParts[1];
            collection.image = newImageLink;
            cImage = newImageLink;
          }

          if (!cImage) {
            continue; // Skip NFTs without valid image
          }

          collection.name = cName;
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
