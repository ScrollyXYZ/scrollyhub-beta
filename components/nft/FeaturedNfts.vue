<template>
  <div class="featured-nfts">
    <div class="mb-3">Featured NFTs</div>
    <div class="row">
      <NuxtLink
        v-for="nft in featuredNfts"
        :key="nft.address"
        class="col-md-3 col-sm-6 col-12 text-decoration-none"
        :to="'/nft/collection?id=' + nft.address"
      >
        <div class="nft-card mb-3 mx-auto">
          <div class="nft-card-img-container">
            <div class="nft-svg-background nftbondmulti">
              <div class="nft-card-content">
                <div class="nft-card-title">{{ nft.name }}</div>
                <img
                  :src="convertIpfsToHttp(nft.image)"
                  :alt="nft.name"
                  class="nft-card-img-small"
                />
                <div class="nft-card-price">
                  {{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";

export default {
  name: "FeaturedNfts",
  data() {
    return {
      featuredNfts: [],
      waitingData: false,
    };
  },
  mounted() {
    this.fetchFeaturedNfts();
  },
  methods: {
    async fetchFeaturedNfts() {
      this.waitingData = true;

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const launchpadInterface = new ethers.utils.Interface([
        "function getFeaturedNftContracts(uint256 amount) external view returns(address[] memory)",
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider,
      );

      const fNfts = await launchpadContract.getFeaturedNftContracts(10); // Fetch 10 featured NFTs
      await this.parseNftsArray(fNfts, this.featuredNfts, provider);

      this.waitingData = false;
    },
    async parseNftsArray(inputArray, outputArray, provider) {
      const nftInterface = new ethers.utils.Interface([
        "function collectionPreview() public view returns (string memory)",
        "function getMintPrice() public view returns (uint256)",
        "function name() public view returns (string memory)",
      ]);

      for (let i = 0; i < inputArray.length; i++) {
        const nftContract = new ethers.Contract(
          inputArray[i],
          nftInterface,
          provider,
        );

        let collection = this.fetchCollection(window, inputArray[i]);

        if (!collection) {
          collection = { address: inputArray[i] };
        }

        let cName;

        if (collection?.name) {
          cName = collection.name;
        } else {
          cName = await nftContract.name();
          collection["name"] = cName;
        }

        const mintPriceWei = await nftContract.getMintPrice();

        let cImage;

        if (collection?.image) {
          cImage = collection.image;
        } else {
          cImage = await nftContract.collectionPreview();
          collection["image"] = cImage;
        }

        if (collection.image.includes(".ipfs.sphn.link/")) {
          const linkParts = collection.image.split(".ipfs.sphn.link/");
          const cid = linkParts[0].replace("https://", "");
          const newImageLink =
            this.$config.ipfsGateway + cid + "/" + linkParts[1];
          collection["image"] = newImageLink;
          cImage = newImageLink;
        }

        this.storeCollection(window, inputArray[i], collection);

        outputArray.push({
          address: inputArray[i],
          image: cImage,
          name: cName,
          price: mintPriceWei,
        });
      }
    },
    getSvgBackgroundClass() {
      return "nftbondmulti";
    },
    convertIpfsToHttp(ipfsUrl) {
      if (ipfsUrl.startsWith("ipfs://")) {
        return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return ipfsUrl;
    },
    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }
      const price = Number(ethers.utils.formatEther(priceWei));
      return price.toFixed(9);
    },
    fetchCollection(window, address) {
      // Implementation of fetchCollection
    },
    storeCollection(window, address, collection) {
      // Implementation of storeCollection
    },
  },
  setup() {
    const { address, chainId, isActivated, signer } = useEthers();
    return { address, chainId, isActivated, signer };
  },
};
</script>

<style scoped>
.featured-nfts {
  margin: 20px 0;
  color: white;
  font-size: 1.5rem;
}
.nft-card {
  display: flex;
  flex-direction: column;
  height: 50%;
}
.nft-card-img-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Aspect ratio 1:1 */
  background: transparent;
  overflow: hidden;
}
.nft-svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
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
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 10% 5%;
}
.nft-card-img-small {
  width: 100%;
  height: auto;
  object-fit: cover;
  margin-bottom: 10px;
}
.nft-card-title,
.nft-card-price {
  color: black;
  width: 100%;
  text-align: center;
}
.nft-card-title {
  margin-bottom: auto;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nft-card-price {
  margin-top: auto;
  font-size: 0.85rem; /* Make the price smaller */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}

/* Additional CSS from the referenced component */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  width: 60%;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: rgba(0, 0, 0, 0.4);
}

.nftbondblue {
  background-image: url("@/assets/nft/nftbondblue.svg");
}

.nftbondmulti {
  background-image: url("@/assets/nft/nftbondmulti.svg");
}

.nftbondorange {
  background-image: url("@/assets/nft/nftbondorange.svg");
}

.nftbondyellow {
  background-image: url("@/assets/nft/nftbondyellow.svg");
}

.nft-svg-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
  z-index: 1;
}

.nft-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nft-card-body {
  flex: 1;
  overflow-y: auto;
}

.nft-fs-3 {
  font-size: 1.75rem;
}

.nft-card-img-container {
  position: relative;
  width: 100%;
  padding-top: 145%;
  background: transparent;
  overflow: hidden;
}

.nft-card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 10% 5%;
}

.nft-card-img-top {
  width: 80%;
  height: auto;
  object-fit: cover;
  margin-bottom: 10px; /* Adjust space between image and price */
}

.nft-card-title,
.nft-card-price {
  color: black;
  width: 100%;
  text-align: center;
}

.nft-card-title {
  margin-bottom: auto;
  font-size: 1rem; /* Adjust font size to be smaller */
  white-space: nowrap; /* Prevent text overflow */
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis for overflow */
  font-weight: bold;
}

.nft-card-price {
  margin-top: auto;
  font-size: 0.85rem; /* Make the price smaller */
  white-space: nowrap; /* Prevent text overflow */
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis for overflow */
}

.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}

@media (min-width: 1500px) {
  .nft-fs-3 {
    font-size: 2rem;
  }

  .nft-card-title {
    font-size: 1.25rem;
  }

  .nft-card-price {
    font-size: 1rem;
  }
}
</style>
