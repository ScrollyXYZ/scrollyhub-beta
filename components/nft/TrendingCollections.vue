<template>
  <div id="trendingCollections" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-inner">
      <div
        class="carousel-item active"
        v-for="nft in trendingNfts"
        :key="nft.address"
      >
        <div class="row">
          <NuxtLink
            :to="'/nft/collection?id=' + nft.address"
            class="col-md-3 text-decoration-none"
          >
            <div class="nft-card border mb-3">
              <div class="nft-card-img-container">
                <img
                  :src="convertIpfsToHttp(nft.image)"
                  :alt="nft.name"
                  class="nft-card-img-top"
                />
              </div>
              <div class="nft-card-content">
                <div class="nft-card-title">{{ nft.name }}</div>
                <div class="nft-card-price">
                  {{ formatPrice(nft.price) }} {{ $config.tokenSymbol }}
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrendingCollections",
  props: ["trendingNfts"],
  methods: {
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
      return price.toFixed(2);
    },
  },
};
</script>

<style scoped>
.nft-card {
  display: flex;
  flex-direction: column;
}
.nft-card-img-container {
  width: 100%;
  padding-top: 100%;
  position: relative;
}
.nft-card-img-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.nft-card-content {
  padding: 10px;
  text-align: center;
}
</style>
