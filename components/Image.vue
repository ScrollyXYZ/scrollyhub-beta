<template>
  <div class="image-container">
    <img
      @load="loading = false"
      :src="parseImageLink"
      @error="handleLoadError"
      :alt="alt"
      :class="cls"
      class="responsive-image"
    />
    <div class="d-flex justify-content-center">
      <span
        v-if="loading"
        class="spinner-grow spinner-grow-lg"
        role="status"
        aria-hidden="true"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Image",
  props: ["alt", "cls", "url"],
  data() {
    return {
      cid: null,
      imageUrl: null,
      loading: true,
      gatewayIndex: 0,
      gateways: [
        "https://ipfs.io/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
        "https://dweb.link/ipfs/",
      ],
    };
  },
  mounted() {
    this.fetchImageData();
  },
  computed: {
    parseImageLink() {
      let parsedImage = this.imageUrl;
      if (parsedImage && parsedImage.includes("ipfs://")) {
        parsedImage = parsedImage.replace(
          "ipfs://",
          this.gateways[this.gatewayIndex],
        );
      }
      return parsedImage;
    },
  },
  methods: {
    fetchImageData() {
      this.imageUrl = this.url;
      if (this.url) {
        if (this.url.startsWith("ipfs://")) {
          this.cid = this.url.replace("ipfs://", "");
        } else if (this.url.startsWith("https://ipfs.io/ipfs/")) {
          this.cid = this.url.replace("https://ipfs.io/ipfs/", "");
        } else if (this.url.startsWith("https://cloudflare-ipfs.com/ipfs/")) {
          this.cid = this.url.replace("https://cloudflare-ipfs.com/ipfs/", "");
        } else if (this.url.startsWith("https://dweb.link/ipfs/")) {
          this.cid = this.url.replace("https://dweb.link/ipfs/", "");
        }
      }
    },
    handleLoadError() {
      this.gatewayIndex++;
      if (this.gatewayIndex < this.gateways.length) {
        this.imageUrl = `${this.gateways[this.gatewayIndex]}${this.cid}`;
      } else {
        this.imageUrl =
          "https://placeholder.pics/svg/300/8e85e6/ffffff/loading%20error";
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.responsive-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
</style>
