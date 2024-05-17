<template>
  <Head>
    <Title>My Created NFTs | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'My Created NFTs | ' + $config.projectMetadataTitle"
    />
    <Meta
      name="description"
      :content="
        'Check out these awesome NFT collections created by you on ' +
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
        'Check out these awesome NFT collections created by you on ' +
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
        'Check out these awesome NFT collections created by you on ' +
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
        <div class="mb-3 me-auto">My Created NFTs</div>
      </h3>

      <div v-if="!isActivated" class="alert alert-info">
        Connect to your account to display the NFTs you've created.
      </div>

      <div v-else>
        <h4 class="mt-3 mb-3" v-if="createdNfts.length > 0">My Created NFTs</h4>

        <div v-if="waitingData" class="alert alert-info">
          Searching for your created NFTs on the blockchain. Please wait a
          moment...
        </div>

        <div v-else-if="createdNfts.length === 0" class="alert alert-warning">
          You haven't created any NFTs.
        </div>

        <div class="row">
          <NuxtLink
            v-for="nft in createdNfts"
            :key="nft.address"
            class="col-md-3 text-decoration-none"
            :to="'/nft/collection?id=' + nft.address"
          >
            <div class="card border mb-3">
              <img :src="nft.image" class="card-img-top" :alt="nft.name" />
              <div class="card-body rounded-bottom-3">
                <p class="card-text mb-1">
                  <strong>{{ nft.name }}</strong>
                </p>
                <small class="card-text"
                  >Number of NFTs minted: {{ nft.totalSupply }}</small
                >
              </div>
            </div>
          </NuxtLink>
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
import { fetchCollection, storeCollection } from "~/utils/storageUtils";

export default {
  name: "MyCreatedNfts",
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

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId);

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer;
      }

      // create launchpad contract object
      const launchpadInterface = new ethers.utils.Interface([
        "function getNftContracts(uint256 fromIndex, uint256 toIndex) external view returns(address[] memory)",
        "function getNftContractsArrayLength() external view returns(uint256)",
      ]);

      const launchpadContract = new ethers.Contract(
        this.$config.nftLaunchpadBondingAddress,
        launchpadInterface,
        provider,
      );

      // get all NFTs array length
      if (Number(this.allNftsArrayLength) === 0) {
        this.allNftsArrayLength =
          await launchpadContract.getNftContractsArrayLength();
      }

      // fetch all NFTs
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

          const totalSupply = await nftContract.totalSupply();

          // store collection object in storage
          storeCollection(window, nftAddress, collection);

          createdNfts.push({
            address: nftAddress,
            image: collection.image,
            name: collection.name,
            totalSupply: totalSupply.toString(),
          });
        }
      }

      this.createdNfts = createdNfts;
      this.waitingData = false;
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers();

    return { address, chainId, isActivated, signer };
  },
};
</script>
