<template>
  <div class="points-details">
    <div class="details-section">
      <p class="details-header">Points Breakdown</p>
      <p class="overview">Overview</p>
      <div class="overview-details">
        <span
          >{{ pointsFromValidatedQuests }} points from completed quests</span
        >
        |
        <span>{{ pointsFromUserActivities }} points from user activity</span>
      </div>
    </div>
    <div class="details-section">
      <p class="details-header">Points from Quests</p>
      <div
        v-for="category in questCategories"
        :key="category.category"
        class="details-item"
      >
        <span>
          {{ category.category }}:
          {{ calculateCategoryPoints(category.quests) }} /
          {{ calculateMaxCategoryPoints(category.quests) }} points
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useThemeStore } from "~/store/theme";

export default {
  props: {
    pointsFromValidatedQuests: Number,
    pointsFromUserActivities: Number,
    questCategories: Array,
  },
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      isDarkMode,
    };
  },
  methods: {
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
  },
};
</script>

<style scoped>
.points-details {
  margin-top: 20px;
  text-align: left;
  font-size: 1em;
}

.details-section {
  margin-bottom: 20px;
}

.details-header {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.overview {
  font-weight: bold;
  margin-bottom: 10px;
}

.overview-details {
  margin-bottom: 10px;
}

.details-item {
  margin: 5px 0;
}
</style>
