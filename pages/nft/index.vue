<template>
  <div>
    <div class="container">
      <HeroSection />
      <FeaturedNfts />
      <TrendingCollections :trendingNfts="trendingNfts" />
      <LatestNfts :lastNfts="lastNfts" />
    </div>
  </div>
</template>

<script>
import HeroSection from "~/components/nft/HeroSection.vue";
import FeaturedNfts from "~/components/nft/TrendingCollections.vue";
import TrendingCollections from "~/components/nft/FeaturedNfts.vue";
import LatestNfts from "~/components/nft/LatestNfts.vue";

export default {
  components: {
    HeroSection,
    FeaturedNfts,
    TrendingCollections,
    LatestNfts,
  },
  data() {
    return {
      trendingNfts: [],
      lastNfts: [],
    };
  },
  mounted() {
    this.fetchTrendingNfts();
    this.fetchLastNfts();
  },
  methods: {
    fetchTrendingNfts() {},
    fetchLastNfts() {},
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped>
/* Ajoutez ici vos styles spécifiques pour la page */
</style>
