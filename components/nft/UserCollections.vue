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
      >
        <div class="card border mb-3">
          <img :src="nft.image" class="card-img-top" :alt="nft.name" />
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
          collection = { address: inputArray[i] };
        }

        let cName = collection.name || (await nftContract.name());
        let mintPriceWei = await nftContract.getMintPrice();
        let cImage =
          collection.image || (await nftContract.collectionPreview());

        if (cImage.includes(".ipfs.sphn.link/")) {
          const linkParts = cImage.split(".ipfs.sphn.link/");
          const cid = linkParts[0].replace("https://", "");
          const newImageLink =
            this.$config.ipfsGateway + cid + "/" + linkParts[1];
          collection.image = newImageLink;
          cImage = newImageLink;
        }

        collection.name = cName;
        storeCollection(window, inputArray[i], collection);

        outputArray.push({
          address: inputArray[i],
          image: cImage,
          name: cName,
          price: mintPriceWei,
        });
      }
    },
    formatPrice(priceWei) {
      if (priceWei === null) return null;
      const price = Number(ethers.utils.formatEther(priceWei));
      if (price > 100) return price.toFixed(0);
      if (price > 1) return price.toFixed(2);
      if (price > 0.1) return price.toFixed(4);
      if (price > 0.01) return price.toFixed(5);
      if (price > 0.001) return price.toFixed(6);
      if (price > 0.0001) return price.toFixed(7);
      if (price > 0.00001) return price.toFixed(8);
      if (price > 0.000001) return price.toFixed(9);
      return price;
    },
  },
};
</script>
