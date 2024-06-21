<template>
  <div class="quest-category-swiper">
    <div class="quest-category-thumbnails">
      <div
        v-for="category in questCategories"
        :key="category.category"
        class="thumbnail"
        @click="selectCategory(category)"
      >
        <img :src="getCategoryImage(category)" alt="Category Image" />
        <div class="thumbnail-info">
          <h3>{{ category.category }}</h3>
          <p>
            {{ getCompletedQuests(category.quests) }} /
            {{ category.quests.length }} completed
          </p>
          <p>
            {{ calculateCategoryPoints(category.quests) }} /
            {{ calculateMaxCategoryPoints(category.quests) }} points
          </p>
        </div>
      </div>
    </div>
    <quest-details-modal-category
      v-if="showModal"
      :category="selectedCategory"
      @close="closeModal"
      @claim="claimReward"
      @refresh="refreshQuests"
    />
  </div>
</template>

<script>
import QuestDetailsModalCategory from "./QuestDetailsModalCategory.vue";
import { useQuestStore } from "~/store/questStore";

export default {
  components: {
    QuestDetailsModalCategory,
  },
  props: {
    questCategories: Array,
  },
  data() {
    return {
      selectedCategory: null,
      showModal: false,
    };
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category;
      this.showModal = true;
    },
    getCategoryImage(category) {
      return category.quests[0].image || "http://placekitten.com/200/200";
    },
    getCompletedQuests(quests) {
      return quests.filter((q) => q.validated).length;
    },
    calculateCategoryPoints(quests) {
      return quests
        ? quests
            .filter((q) => q.validated)
            .reduce((sum, quest) => sum + quest.points, 0)
        : 0;
    },
    calculateMaxCategoryPoints(quests) {
      return quests ? quests.reduce((sum, quest) => sum + quest.points, 0) : 0;
    },
    closeModal() {
      this.showModal = false;
      this.selectedCategory = null;
    },
    async claimReward(quest) {
      const { contractAddress, functions, points } = quest;
      const questStore = useQuestStore();
      await questStore.claimReward(contractAddress, functions, points);
      this.refreshQuests();
    },
    refreshQuests() {
      const questStore = useQuestStore();
      questStore.updateData();
    },
  },
};
</script>

<style scoped>
.quest-category-swiper {
  width: 100%;
  height: 100%;
}

.quest-category-thumbnails {
  display: flex;
  overflow-x: scroll;
  padding: 10px 0;
  gap: 10px;
}

.thumbnail {
  flex: 0 0 auto;
  width: 150px;
  text-align: center;
  cursor: pointer;
}

.thumbnail img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.thumbnail-info {
  margin-top: 5px;
}
</style>
