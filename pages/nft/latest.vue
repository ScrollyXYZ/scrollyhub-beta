<template>
  <Head>
    <Title>NFT Launchpad | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'NFT Launchpad | ' + $config.projectMetadataTitle"
    />
    <Meta
      name="description"
      :content="
        'Check out these awesome NFT collections on ' +
        $config.projectName +
        '!'
      "
    />
    <Meta
      property="og:image"
      :content="$config.projectUrl + $config.previewImageNftLaunchpad"
    />
    <Meta
      property="og:description"
      :content="
        'Check out these awesome NFT collections on ' +
        $config.projectName +
        '!'
      "
    />
    <Meta
      name="twitter:image"
      :content="$config.projectUrl + $config.previewImageNftLaunchpad"
    />
    <Meta
      name="twitter:description"
      :content="
        'Check out these awesome NFT collections on ' +
        $config.projectName +
        '!'
      "
    />
  </Head>

  <div class="container">
    <div class="nft-card">
      <h3 class="d-flex flex-row flex-wrap mt-3">
        <div class="mb-3 me-auto">Explorer</div>

        <div class="mb-3"></div>
      </h3>

      <div class="row">
        <NuxtLink
          v-for="nft in lastNfts"
          :key="nft.address"
          class="col-md-3 text-decoration-none"
          :to="'/nft/collection?id=' + nft.address"
        >
          <div class="nft-card mb-3">
            <div class="nft-card-img-container">
              <div class="nft-svg-background" :class="getSvgBackgroundClass()">
                <div class="nft-card-content">
                  <div class="nft-card-title">{{ nft.name }}</div>
                  <img
                    :src="convertIpfsToHttp(nft.image)"
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
          @click="fetchLastNfts"
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
import { fetchCollection, storeCollection } from "~/utils/storageUtils";

export default {
  name: "Nft",
  props: ["hideBackButton"],

  data() {
    return {
      allNftsArrayLength: 0,
      allNftsIndexStart: 0,
      allNftsIndexEnd: 0,
      featuredNfts: [],
      lastNfts: [],
      waitingData: false,
    };
  },

  components: {},

  mounted() {
    if (this.$config.nftLaunchpadBondingAddress) {
      this.fetchFeaturedNfts();
      this.fetchLastNfts();
    }
  },

  computed: {
    showLoadMoreButton() {
      return this.allNftsIndexEnd > 0;
    },
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

      const fNfts = await launchpadContract.getFeaturedNftContracts(4);

      await this.parseNftsArray(fNfts, this.featuredNfts, provider);
    },

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

      if (Number(this.allNftsArrayLength) === 1) {
        const lNfts = await launchpadContract.getLastNftContracts(1);
        await this.parseNftsArray(lNfts, this.lastNfts, provider);
      } else if (Number(this.allNftsArrayLength) > 1) {
        if (this.allNftsIndexEnd === 0) {
          this.allNftsIndexEnd = this.allNftsArrayLength - 1;

          if (this.allNftsArrayLength < this.$config.nftLaunchpadLatestItems) {
            this.allNftsIndexStart = 0;
          } else {
            this.allNftsIndexStart =
              this.allNftsArrayLength - this.$config.nftLaunchpadLatestItems;
          }
        }

        const lNfts = await launchpadContract.getNftContracts(
          this.allNftsIndexStart,
          this.allNftsIndexEnd,
        );
        const lNftsWritable = [...lNfts];
        lNftsWritable.reverse();

        await this.parseNftsArray(lNftsWritable, this.lastNfts, provider);

        if (this.allNftsIndexEnd > this.$config.nftLaunchpadLatestItems) {
          this.allNftsIndexEnd =
            this.allNftsIndexEnd - this.$config.nftLaunchpadLatestItems;
        } else {
          this.allNftsIndexEnd = 0;
        }

        if (this.allNftsIndexStart > this.$config.nftLaunchpadLatestItems) {
          this.allNftsIndexStart =
            this.allNftsIndexStart - this.$config.nftLaunchpadLatestItems;
        } else {
          this.allNftsIndexStart = 0;
        }
      }

      this.waitingData = false;
    },

    async fetchOwnedNfts() {
      this.waitingData = true;

      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        provider = this.signer;
      }

      const launchpadInterface = new ethers.utils.Interface([
        "function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)",
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

      this.lastNfts = [];
      await this.parseNftsArray(ownedNfts, this.lastNfts, provider);
      this.waitingData = false;
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

        let collection = fetchCollection(window, inputArray[i]);

        if (!collection) {
          collection = {
            address: inputArray[i],
          };
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

        storeCollection(window, inputArray[i], collection);

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

    convertIpfsToHttp(ipfsUrl) {
      if (ipfsUrl.startsWith("ipfs://")) {
        return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return ipfsUrl;
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();

    return { address, chainId, isActivated, signer };
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
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

.crop-image {
  object-fit: contain;
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
