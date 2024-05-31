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

  <div class="card border scroll-500">
    <div class="card-body">
      <p v-if="!hideBackButton" class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="d-flex flex-row flex-wrap mt-3">
        <div class="mb-3 me-auto">NFT Launchpad</div>

        <div class="mb-3">
          <NuxtLink class="btn btn-outline-primary btn-sm" to="/nft/create">
            <i class="bi bi-plus-circle"></i> Create
          </NuxtLink>
          <button
            class="btn btn-outline-primary btn-sm ms-2"
            data-bs-toggle="modal"
            data-bs-target="#searchNftModal"
          >
            <i class="bi bi-search"></i> Find
          </button>
          <NuxtLink
            v-if="isActivated"
            class="btn btn-outline-primary btn-sm ms-2"
            to="/nft/mynfts"
          >
            <i class="bi bi-box-arrow-in-right"></i> My NFTs
          </NuxtLink>
          <NuxtLink
            v-if="isActivated"
            class="btn btn-outline-primary btn-sm ms-2"
            to="/nft/ManageMyCollections"
          >
            <i class="bi bi-file-earmark"></i> My Created NFTs
          </NuxtLink>
        </div>
      </h3>

      <h4 class="mb-3" v-if="featuredNfts.length > 0">Featured</h4>

      <div class="row" v-if="featuredNfts.length > 0">
        <NuxtLink
          v-for="nft in featuredNfts"
          :key="nft.address"
          class="col-md-3 text-decoration-none"
          :to="'/nft/collection?id=' + nft.address"
        >
          <div class="card border mb-3">
            <Image :url="nft.image" :alt="nft.name" cls="card-img-top" />
            <div class="card-body rounded-bottom-3">
              <p class="card-text mb-1">
                <strong>{{ nft.name }}</strong>
              </p>
              <small class="card-text">
                {{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}
              </small>
            </div>
          </div>
        </NuxtLink>
      </div>

      <h4 class="mt-3 mb-3" v-if="lastNfts.length > 0">Latest</h4>

      <div class="row">
        <NuxtLink
          v-for="nft in lastNfts"
          :key="nft.address"
          class="col-md-3 text-decoration-none"
          :to="'/nft/collection?id=' + nft.address"
        >
          <div class="card border mb-3">
            <Image :url="nft.image" :alt="nft.name" cls="card-img-top" />
            <div class="card-body rounded-bottom-3">
              <p class="card-text mb-1">
                <strong>{{ nft.name }}</strong>
              </p>
              <small class="card-text">
                {{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}
              </small>
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

  <SearchNftModal />
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import Image from "~/components/Image.vue";
import SearchNftModal from "~/components/nft/SearchNftModal.vue";
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

  components: {
    Image,
    SearchNftModal,
  },

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
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();

    return { address, chainId, isActivated, signer };
  },
};
</script>
