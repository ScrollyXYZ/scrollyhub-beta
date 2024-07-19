<template>
  <div v-if="loading" class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
  </div>
  <div v-else-if="error" class="alert alert-danger" role="alert">
    {{ error }}
  </div>
  <div v-else>
    <Swiper
      :slides-per-view="1"
      :space-between="10"
      :navigation="true"
      :pagination="{ clickable: true }"
      @slideChange="onSlideChange"
    >
      <SwiperSlide v-for="(nft, index) in nfts" :key="index">
        <NftCard :nft="nft" />
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import NftCard from "./NftCard.vue";
import { useNftStore } from "@/store/nftStore"; // Update the path if needed

export default {
  components: {
    NftCard,
  },
  setup() {
    const nftStore = useNftStore();
    const toast = useToast();

    return {
      nftStore,
      toast,
      error: null,
    };
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    nfts() {
      return this.nftStore.nfts;
    },
  },
  methods: {
    async onSlideChange(swiper) {
      const currentIndex = swiper.activeIndex;
      if (swiper.previousIndex < currentIndex) {
        try {
          await this.nftStore.getRandomNft();
        } catch (error) {
          console.error("Error fetching NFT:", error);
          this.error = "Failed to load NFT data.";
          this.toast.error("Failed to load NFT data.");
        }
      }
    },
  },
  async mounted() {
    try {
      await this.nftStore.initializeProvider();
      await this.nftStore.getRandomNft();
    } catch (error) {
      console.error("Error initializing or fetching NFT:", error);
      this.error = "Failed to initialize or load NFT data.";
      this.toast.error("Failed to initialize or load NFT data.");
    } finally {
      this.loading = false;
    }
  },
};
</script>
