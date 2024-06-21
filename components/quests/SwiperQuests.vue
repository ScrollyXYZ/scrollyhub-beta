<template>
  <div class="swiper-container">
    <swiper :slides-per-view="1" pagination>
      <swiper-slide
        v-for="category in questCategories"
        :key="category.category"
      >
        <div class="quest-category">
          <h3 class="category-title">{{ category.category }}</h3>
          <div class="quests-grid">
            <quest-card
              v-for="quest in category.quests"
              :key="quest.id"
              :quest="quest"
              @showDetails="showQuestDetails"
            />
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <quest-details-modal-swiper
      v-if="showModal"
      :quest="selectedQuest"
      @close="closeModal"
      @claim="claimReward"
    />
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import QuestCard from "./QuestCard.vue";
import QuestDetailsModalSwiper from "./QuestDetailsModalSwiper.vue";

export default {
  components: {
    Swiper,
    SwiperSlide,
    QuestCard,
    QuestDetailsModalSwiper,
  },
  props: {
    questCategories: Array,
  },
  data() {
    return {
      showModal: false,
      selectedQuest: null,
    };
  },
  methods: {
    showQuestDetails(quest) {
      this.selectedQuest = quest;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedQuest = null;
    },
    async claimReward() {
      const { contractAddress, functions, points } = this.selectedQuest;
      await this.$store.dispatch("questStore/claimReward", {
        contractAddress,
        functions,
        points,
      });
      this.closeModal();
    },
  },
};
</script>

<style scoped>
.swiper-container {
  width: 100%;
  height: 100%;
}

.quests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}
</style>
