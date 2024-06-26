<template>
  <div class="progress-bar-container">
    <ProfileImage
      :address="address"
      :domain="username"
      :image="userStore.getOrbisImage"
      class="user-image"
    />
    <div class="username">{{ username }}</div>
    <div class="divider"></div>
    <div class="progression-title">Your Progression</div>
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${progressPercentage}%` }"></div>
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
  </div>
</template>
<script>
import { computed, onMounted, watch } from "vue";
import { useThemeStore } from "~/store/theme";
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import { getActivityPoints } from "~/utils/balanceUtils";
import ProfileImage from "~/components/profile/ProfileImage.vue";

export default {
  name: "ProgressBarComponent",
  components: {
    ProfileImage,
  },
  setup() {
    const themeStore = useThemeStore();
    const userStore = useUserStore();
    const questStore = useQuestStore();

    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const username = computed(() => userStore.getDefaultDomain || "Guest");
    const address = computed(() => userStore.getCurrentUserAddress);

    const fetchActivityPoints = async () => {
      const config = useRuntimeConfig();
      if (config.activityPointsAddress && userStore.getCurrentUserAddress) {
        const activityPoints = await getActivityPoints(
          userStore.getCurrentUserAddress,
        );
        questStore.setActivityPoints(activityPoints);
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
          questStore.$reset(); // Reset the quest store when user logs out
        }
      },
      { immediate: true },
    );

    watch(
      () => userStore.getDefaultDomain,
      (newDomain) => {
        if (!newDomain) {
          userStore.setDefaultDomain("Guest");
        }
      },
      { immediate: true },
    );

    const activityPoints = computed(() => questStore.activityPoints);

    const badgeTiers = [
      { id: 1, level: 1, image: "https://scrolly.xyz/badges/1.png", points: 0 },
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
    ];

    const progressPercentage = computed(() => {
      const lastTier = badgeTiers[badgeTiers.length - 1];
      return Math.min((activityPoints.value / lastTier.points) * 100, 100);
    });

    const calculateBadgePosition = (tier) => {
      const lastTier = badgeTiers[badgeTiers.length - 1];
      return (tier.points / lastTier.points) * 100;
    };

    const getBadgeTitle = (tier) => {
      if (activityPoints.value >= tier.points) {
        return `You have reached Tier ${tier.level}`;
      }
      const nextTier = badgeTiers.find((t) => t.points > activityPoints.value);
      const pointsNeeded = nextTier
        ? nextTier.points - activityPoints.value
        : 0;
      return `Tier ${tier.level} Badge: ${pointsNeeded} points to next tier`;
    };

    return {
      isDarkMode,
      username,
      address,
      userStore,
      activityPoints,
      progressPercentage,
      badgeTiers,
      calculateBadgePosition,
      getBadgeTitle,
    };
  },
};
</script>
<style scoped>
.progress-bar-container {
  text-align: center;
  margin: 20px 0;
  width: 100%;
}

.user-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.username {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.divider {
  width: 50%;
  height: 2px;
  background: #ccc;
  margin: 10px auto;
}

.progression-title {
  font-size: 1.5em;
  color: #333;
  margin: 20px 0;
  margin-bottom: 75px;
}

.dark-mode .username,
.dark-mode .progression-title {
  color: #fff;
}

.progress-bar {
  position: relative;
  height: 20px;
  background: #ddd;
  border-radius: 5px;
  overflow: visible;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #65b15e, #8bc34a);
}

.badge-marker {
  position: absolute;
  top: -40px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
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
</style>
