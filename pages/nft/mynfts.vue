<template>
  <div>
    <div class="container">
      <div class="info-box">
        <div class="info-item">
          <span class="info-title">NFTs:</span>
          <span class="info-amount">{{ validNftsCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-title">Collections:</span>
          <span class="info-amount">{{ collectionsCount }}</span>
        </div>
      </div>
      <ManageMyCollectionsComponent
        @collectionsCountUpdated="updateCollectionsCount"
      />
      <MyNfts @validNftsCountUpdated="updateValidNftsCount" />
    </div>
  </div>
</template>

<script>
import ManageMyCollectionsComponent from "~/components/nft/mynfts/MyCollections.vue";
import MyNfts from "~/components/nft/mynfts/MyNfts.vue";

export default {
  components: {
    MyNfts,
    ManageMyCollectionsComponent,
  },
  data() {
    return {
      collectionsCount: 0,
      validNftsCount: 0,
    };
  },
  methods: {
    updateCollectionsCount(newCount) {
      this.collectionsCount = newCount;
    },
    updateValidNftsCount(newCount) {
      this.validNftsCount = newCount;
    },
  },
};
definePageMeta({
  layout: "nft",
});
</script>

<style scoped>
.container {
  position: relative;
}

.info-box {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1.2rem;
  color: #333;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-title {
  font-weight: bold;
  margin-right: 10px;
  font-size: 1.2rem;
}

.info-amount {
  font-size: 1.5rem;
  color: #007bff;
}
</style>
