<template>
  <div>
    <NftSwiper />
  </div>
</template>

<script>
import NftSwiper from "@/components/nft/ComponentTest.vue";

export default {
  components: {
    NftSwiper,
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped></style>
