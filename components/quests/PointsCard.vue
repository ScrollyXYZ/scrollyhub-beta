<template>
  <div class="points-display animate__animated animate__fadeInDown">
    <div class="points-card">
      <h2 class="mappy-point">Your Mappy Points</h2>
      <p>{{ activityPoints }}</p>
      <button @click="toggleDetails" class="details-button">
        {{ showDetails ? "▲" : "▼" }} Details
      </button>
      <transition name="fade">
        <div v-if="showDetails" class="points-details">
          <div class="details-section">
            <p class="details-header">Points Breakdown</p>
            <div class="details-item">
              <i class="icon quest-icon"></i>
              <span
                >{{ pointsFromValidatedQuests }} points from completed
                quests</span
              >
            </div>
            <div class="details-item">
              <i class="icon activity-icon"></i>
              <span
                >{{ pointsFromUserActivities }} points from user
                activities</span
              >
            </div>
          </div>
          <div class="details-section">
            <p class="details-header">Points by Category</p>
            <div
              v-for="category in questCategories"
              :key="category.category"
              class="details-item"
            >
              <i class="icon category-icon"></i>
              <span>
                {{ category.category }}:
                {{ calculateCategoryPoints(category.quests) }} /
                {{ calculateMaxCategoryPoints(category.quests) }} points
              </span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activityPoints: Number,
    pointsFromValidatedQuests: Number,
    pointsFromUserActivities: Number,
    questCategories: Array,
  },
  data() {
    return {
      showDetails: false,
    };
  },
  methods: {
    toggleDetails() {
      this.showDetails = !this.showDetails;
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
  },
};
</script>

<style scoped>
.points-display {
  text-align: center;
}

.points-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.points-card h2 {
  margin: 0;
  font-size: 1.5em;
}

.points-card p {
  margin: 0;
  font-size: 1em;
  font-weight: bold;
}

.details-button {
  margin-top: 10px;
  background: none;
  border: none;
  color: #333;
  font-size: 1em;
  cursor: pointer;
}

.details-button:hover {
  text-decoration: underline;
}

.points-details {
  margin-top: 10px;
  text-align: left;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.9em;
}

.details-section {
  margin-bottom: 10px;
}

.details-header {
  font-weight: bold;
  margin-bottom: 5px;
}

.details-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

.details-item .icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.quest-icon::before {
  content: "🎯";
}

.activity-icon::before {
  content: "🏆";
}

.category-icon::before {
  content: "📂";
}
</style>
