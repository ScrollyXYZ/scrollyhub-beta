<template>
  <div :class="['points-display', { 'dark-mode': isDarkMode }]">
    <div class="points-card">
      <div class="mappy-points-header">
        <h2 class="mappy-point">Mappy Points</h2>
      </div>
      <p>
        {{ activityPoints }}
        <img
          src="@/assets/img/icon/mappy_icon.png"
          alt="Mappy Points"
          class="mappy-icon"
        />
      </p>
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
          <div
            v-for="tier in badgeTiers"
            :key="tier.id"
            class="badge-marker"
            :style="{ left: `${calculateBadgePosition(tier)}%` }"
            :title="getBadgeTitle(tier)"
          >
            <img
              :src="tier.image"
              :alt="`Tier ${tier.level} Badge`"
              :class="{
                'badge-reached': activityPoints >= tier.points,
                'badge-unreached': activityPoints < tier.points,
              }"
            />
          </div>
        </div>
        <div class="tier-markers">
          <div
            v-for="tier in badgeTiers"
            :key="tier.id"
            class="marker"
            :style="{ left: `${calculateBadgePosition(tier)}%` }"
          ></div>
        </div>
      </div>
      <div :class="['points-details', { 'dark-mode': isDarkMode }]">
        <div class="details-section">
          <p class="details-header">Points Breakdown</p>
          <div class="details-item">
            <i class="icon quest-icon"></i>
            <span>
              {{ pointsFromValidatedQuests }} points from completed quests
            </span>
          </div>
          <div class="details-item">
            <i class="icon activity-icon"></i>
            <span>
              {{ pointsFromUserActivities }} points from user activities
            </span>
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
    </div>
  </div>
</template>
<script>
import { computed } from "vue";
import { useThemeStore } from "~/store/theme";

export default {
  props: {
    activityPoints: Number,
    pointsFromValidatedQuests: Number,
    pointsFromUserActivities: Number,
    questCategories: Array,
  },
  data() {
    return {
      badgeTiers: [
        {
          id: 1,
          level: 1,
          image: "https://scrolly.xyz/badges/1.png",
          points: 0,
        },
        {
          id: 2,
          level: 2,
          image: "https://scrolly.xyz/badges/2.png",
          points: 667,
        },
        {
          id: 3,
          level: 3,
          image: "https://scrolly.xyz/badges/3.png",
          points: 1221,
        },
        {
          id: 4,
          level: 4,
          image: "https://scrolly.xyz/badges/4.png",
          points: 2442,
        },
        {
          id: 5,
          level: 5,
          image: "https://scrolly.xyz/badges/5.png",
          points: 4200,
        },
        {
          id: 6,
          level: 6,
          image: "https://scrolly.xyz/badges/6.png",
          points: 6000,
        },
      ],
    };
  },
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      isDarkMode,
    };
  },
  computed: {
    progressPercentage() {
      const lastTier = this.badgeTiers[this.badgeTiers.length - 1];
      return Math.min((this.activityPoints / lastTier.points) * 100, 100);
    },
  },
  methods: {
    calculateBadgePosition(tier) {
      const lastTier = this.badgeTiers[this.badgeTiers.length - 1];
      return (tier.points / lastTier.points) * 100;
    },
    getBadgeTitle(tier) {
      if (this.activityPoints >= tier.points) {
        return `You have reached Tier ${tier.level}`;
      }
      const nextTier = this.badgeTiers.find(
        (t) => t.points > this.activityPoints,
      );
      const pointsNeeded = nextTier ? nextTier.points - this.activityPoints : 0;
      return `Tier ${tier.level} Badge: ${pointsNeeded} points to next tier`;
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
  margin: 20px 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease-in-out,
    box-shadow 0.3s ease-in-out;
}

.points-display:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.points-card {
  background: transparent;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: none;
}

.points-card.dark-mode {
  background: rgba(51, 51, 51, 0.9);
  color: #fff;
}

.mappy-points-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px; /* Adjusted margin */
}

.mappy-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.mappy-point {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.points-card.dark-mode .mappy-point {
  color: #fff;
}

.points-card p {
  margin: 10px 0; /* Added margin to separate from progress bar */
  font-size: 1em;
  font-weight: bold;
}

.progress-bar-container {
  position: relative;
  height: 40px; /* Adjusted to give more space for badges and markers */
  margin-bottom: 10px; /* Adjusted margin to fix the spacing issue */
  margin-top: 40px;
}

.progress-bar {
  position: relative;
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  overflow: visible; /* Ensure badges are not cut off */
}

.progress {
  height: 100%;
  background: green;
}

.badge-marker {
  position: absolute;
  top: -25px; /* Adjusted to position badges above the bar */
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2; /* Ensures the badges are above the progress bar */
}

.badge-marker img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: white;
  position: relative;
}

.badge-reached {
  filter: grayscale(0%);
}

.badge-unreached {
  filter: grayscale(100%);
}

.tier-markers {
  position: relative;
  height: 10px;
  background: none;
  border-top: 1px dashed #ccc;
  margin-top: -10px; /* Align with progress bar */
}

.marker {
  position: absolute;
  width: 2px;
  height: 10px;
  background: #666;
  transform: translateX(-50%);
}

.points-details {
  margin-top: 10px; /* Decreased margin for better alignment */
  text-align: left;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 0.9em;
}

.points-details.dark-mode {
  background: rgba(51, 51, 51, 0.9);
  color: #fff;
  border-color: #666;
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

.dark-mode .points-display {
  background-color: rgba(51, 51, 51, 0.9);
  color: #fff;
}

.dark-mode .points-card p {
  color: #fff;
}

.dark-mode .points-details {
  background-color: rgba(51, 51, 51, 0.9);
  border-color: #666;
}

.dark-mode .details-header {
  color: #fff;
}

.dark-mode .details-item {
  color: #fff;
}

.dark-mode .mappy-point {
  color: #fff;
}
</style>
