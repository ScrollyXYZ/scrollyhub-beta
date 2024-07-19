<template>
  <div class="card border">
    <div class="card-body">
      <h3 class="mb-3 mt-3">{{ nft.name || "NFT Collection Details" }}</h3>
      <div class="text-center mb-3">
        <Image
          :url="nft.image"
          :alt="nft.name"
          cls="img-fluid img-thumbnail rounded col-12"
        />
      </div>
      <div class="mt-1 mb-4 muted-text" style="font-size: 14px">
        <p>
          <i class="bi bi-file-earmark-text-fill me-1"></i>{{ nft.description }}
        </p>
        <p>
          <i class="bi bi-coin me-1"></i>Price:
          {{ formatPrice(nft.priceBuyWei) }} ETH
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Image from "@/components/Image.vue";
import { ethers } from "ethers";

export default {
  name: "NftCard",
  components: {
    Image,
  },
  props: {
    nft: Object,
  },
  methods: {
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
  },
};
</script>

<style scoped>
.img-thumbnail {
  max-height: 300px;
  object-fit: contain;
}
</style>
