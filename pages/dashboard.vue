<template>
  <div :class="['dashboard-page', { 'dark-mode': isDarkMode }]">
    <div class="top-section">
      <div class="progress-section">
        <ProgressBarComponent :activityPoints="activityPoints" />
      </div>
      <EmptyComponent />
    </div>
    <div class="content-separator"></div>
    <div class="grid-container">
      <div class="grid-item points-breakdown">
        <PointsDetailsComponent
          :pointsFromValidatedQuests="pointsFromValidatedQuests"
          :pointsFromUserActivities="pointsFromUserActivities"
          :questCategories="questStore.questCategories"
        />
        <LeaderboardTop3 />
      </div>
      <div class="grid-item latest-quests">
        <LatestQuests />
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBarComponent from "~/components/quests/ProgressBarComponent.vue";
import PointsDetailsComponent from "~/components/quests/PointsDetailsComponent.vue";
import LatestQuests from "~/components/quests/LatestBadges.vue";
import LeaderboardTop3 from "~/components/quests/DashboardLeaderboard.vue";
import EmptyComponent from "~/components/quests/EmptyComponent.vue";
import { useThemeStore } from "~/store/theme";
import { useQuestStore } from "~/store/questStore";
import { useUserStore } from "~/store/user";
import { computed, onMounted, watch } from "vue";
import { getActivityPoints } from "~/utils/balanceUtils";

export default {
  name: "Dashboard",
  components: {
    ProgressBarComponent,
    PointsDetailsComponent,
    LatestQuests,
    LeaderboardTop3,
    EmptyComponent,
  },
  setup() {
    const themeStore = useThemeStore();
    const questStore = useQuestStore();
    const userStore = useUserStore();

    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const username = computed(() => userStore.getDefaultDomain || "Username");

    const pointsFromValidatedQuests = computed(() =>
      questStore.filteredCategories.reduce(
        (acc, category) =>
          acc +
          category.quests
            .filter((q) => q.validated)
            .reduce((sum, quest) => sum + quest.points, 0),
        0,
      ),
    );

    const pointsFromUserActivities = computed(
      () => questStore.activityPoints - pointsFromValidatedQuests.value,
    );

    const activityPoints = computed(() => {
      if (userStore.getCurrentUserAddress) {
        return questStore.activityPoints;
      }
      return 0;
    });

    const fetchActivityPoints = async () => {
      if (userStore.getCurrentUserAddress) {
        const points = await getActivityPoints(userStore.getCurrentUserAddress);
        questStore.setActivityPoints(points);
      }
    };

    onMounted(async () => {
      if (userStore.getCurrentUserAddress) {
        await questStore.initializeQuests(userStore);
        await fetchActivityPoints();
      }
    });

    watch(
      () => userStore.getCurrentUserAddress,
      async (newAddress, oldAddress) => {
        if (newAddress) {
          await questStore.initializeQuests(userStore);
          await fetchActivityPoints();
        } else {
          questStore.$reset();
        }
      },
    );

    return {
      isDarkMode,
      username,
      pointsFromValidatedQuests,
      pointsFromUserActivities,
      activityPoints,
      questStore,
      userStore,
    };
  },
};
definePageMeta({
  layout: "quests",
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 60%; /* Reduced width */
  margin: 0 auto;
}

.top-section {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 65%;
  margin-right: 20px;
}

.empty-component {
  width: 400px;
  height: 500px;
  margin-right: 20px; /* Space between the sections */
}

.content-separator {
  width: 100%;
  height: 2px;
  background: #ccc;
  margin: 20px 0;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
}

.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.points-breakdown,
.latest-quests {
  background: none;
  width: 100%;
}

.latest-quests {
  position: relative;
  text-align: center;
  margin: 20px 0;
  width: 100%;
  padding: 15px;
  border-radius: 10px;
}

.latest-quests h2 {
  position: relative;
  color: var(--primary-color);
}

.latest-quests h2::after {
  content: "";
  display: block;
  width: 100%;
  height: 4px;
  background-color: #007bff;
  position: absolute;
  bottom: -5px;
  left: 0;
}

.dark-mode .dashboard-page {
  background: rgba(51, 51, 51, 0.8);
  color: #fff;
}

.dark-mode .username,
.dark-mode .divider,
.dark-mode .content-separator {
  color: #fff;
  background: #666;
}

.dark-mode .latest-quests h2::after {
  background-color: #0056b3;
}

.quests-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.quests-grid .quest-card {
  margin: 10px;
}

.access-quests-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 5px;
  transition:
    background-color 0.3s ease-in-out,
    transform 0.3s ease-in-out;
  font-weight: bold;
}

.access-quests-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.dark-mode .access-quests-btn {
  background-color: #0056b3;
}

.dark-mode .access-quests-btn:hover {
  background-color: #007bff;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .empty-component {
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
  }
}

@media (max-width: 874px) {
  .latest-quests {
    width: 100%;
    margin: 10px 0;
    padding: 10px;
  }

  .quests-grid {
    flex-direction: row;
    align-items: center;
  }
}
</style>
