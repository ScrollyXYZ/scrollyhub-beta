<template>
  <div class="latest-nfts">
    <div class="mb-3 nft-title">Latest NFT created</div>
    <div class="grid-container">
      <NuxtLink
        v-for="nft in lastNfts"
        :key="nft.address"
        class="grid-item text-decoration-none"
        :to="'/nft/collection?id=' + nft.address"
      >
        <div class="nft-card mb-3">
          <div class="nft-card-img-container">
            <div :class="['nft-svg-background', getSvgBackgroundClass()]">
              <div class="nft-card-content">
                <div class="nft-card-title">{{ nft.name }}</div>
                <Image
                  :url="nft.image"
                  :alt="nft.name"
                  class="nft-card-img-top crop-image"
                />
                <div class="nft-card-price">
                  {{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NuxtLink>
      <!-- See More Button -->
      <NuxtLink
        v-if="lastNfts.length === 9"
        to="/nft/latest"
        class="grid-item text-decoration-none"
      >
        <div class="nft-card mb-3 see-more-card">
          <div class="nft-card-img-container">
            <div class="nft-svg-background see-more-background">
              <div class="nft-card-content see-more-content">
                <div class="see-more-face">
                  <svg class="eye" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" fill="black" />
                    <circle class="pupil" cx="10" cy="10" r="5" fill="white" />
                  </svg>
                  <svg class="eye" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" fill="black" />
                    <circle class="pupil" cx="10" cy="10" r="5" fill="white" />
                  </svg>
                  <svg class="mouth" viewBox="0 0 20 10">
                    <path
                      d="M 2 2 Q 10 10 18 2"
                      stroke="black"
                      stroke-width="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div class="see-more-text">See more</div>
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
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import Image from "~/components/Image"; // Import the Image component

export default {
  name: "LatestNfts",
  components: {
    Image,
  },
  data() {
    return {
      lastNfts: [],
      waitingData: false,
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
    };
  },
  mounted() {
    this.fetchLastNfts();
  },
  methods: {
    async fetchLastNfts() {
      this.waitingData = true;

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const launchpadInterface = new ethers.utils.Interface([
        "function getLastNftContracts(uint256 amount) external view returns(address[] memory)",
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

      if (Number(this.allNftsArrayLength) > 0) {
        const fetchAmount = 9;
        const startIndex = Math.max(this.allNftsArrayLength - fetchAmount, 0);
        const lNfts = await launchpadContract.getNftContracts(
          startIndex,
          this.allNftsArrayLength - 1,
        );
        const lNftsWritable = [...lNfts];
        lNftsWritable.reverse();

        await this.parseNftsArray(lNftsWritable, this.lastNfts, provider);
      }

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
      const backgrounds = ["nftbondyellow"];
      return backgrounds[Math.floor(Math.random() * backgrounds.length)];
    },
    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }
      const price = Number(ethers.utils.formatEther(priceWei));
      return price.toFixed(8);
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
.nft-title {
  color: white;
  font-size: 25px;
}
.latest-nfts {
  margin: 20px 0;
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
  justify-content: center;
  align-items: center;
  z-index: 2;
  padding: 10% 10%;
}

.nft-card-img-top {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin-bottom: 10px;
  display: block;
  padding: 0.25rem;
  background-color: var(--bs-body-bg);
  border: var(--bs-border-width) solid var(--bs-border-color);
  border-radius: 10px;
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
  text-align: center;
  font-weight: bold;
}

.nft-card-price {
  margin-top: auto;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  background-color: rgba(235, 224, 180, 0.6);
}

.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}

/* See More Card */
.see-more-card {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: transparent;
}

.see-more-background {
  background-image: url("@/assets/nft/nftbondyellow.svg");
}

.see-more-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.see-more-eyes {
  display: flex;
  gap: 10px;
}

.eye {
  width: 50px;
  height: 50px;
}

.pupil {
  animation: look-around-animation 3s infinite;
}

@keyframes look-around-animation {
  0%,
  100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(2px) translateY(-2px);
  }
  50% {
    transform: translateX(-2px) translateY(2px);
  }
  75% {
    transform: translateX(2px) translateY(2px);
  }
}

.see-more-text {
  margin-top: 10px;
  font-size: 1rem;
  color: black;
}

/* Background SVG Classes */
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

.crop-image {
  object-fit: contain;
  max-height: 200px; 
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
