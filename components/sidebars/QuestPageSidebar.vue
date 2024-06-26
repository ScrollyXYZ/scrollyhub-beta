<template>
  <div class="default-sidebar-content quest-sidebar-content">
    <div class="profile-section">
      <ProfileImage
        :key="userStore.getOrbisImage"
        class="profile-image"
        :address="address"
        :domain="userStore.getDefaultDomain || 'Guest'"
        :image="userStore.getOrbisImage"
      />
      <div class="profile-details">
        <div class="username">
          {{ userStore.getDefaultDomain || "Guest" }}
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      <div class="quests-info">
        <div class="quest-count">
          <span class="quest-count-title">Quests</span>
          <div class="quest-count-numbers">
            <span class="quest-count-number">{{ completedQuests }}</span>
            <span class="quest-count-separator"></span>
            <span class="quest-count-number">{{ totalQuests }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="category-links">
      <h3>Scrolly Quests</h3>
      <ul class="list-group">
        <li
          class="list-group-item cursor-pointer hover-color bg-light border-0"
          :class="$route.path === '/quest' ? 'active' : ''"
          @click="handleCategoryClick('all')"
        >
          <i class="fas fa-list"></i> All
        </li>
        <li
          class="list-group-item cursor-pointer hover-color bg-light border-0"
          :class="$route.path === '/quest/latest' ? 'active' : ''"
          @click="handleCategoryClick('latest')"
        >
          <i class="fas fa-clock"></i> Latest
        </li>
        <li
          v-for="category in questCategories"
          :key="category.category"
          class="list-group-item cursor-pointer hover-color bg-light border-0"
          :class="$route.path === `/quest/${category.category}` ? 'active' : ''"
          @click="handleCategoryClick(category.category)"
        >
          <i class="fas" :class="category.iconClass"></i>
          {{ category.category }}
        </li>
      </ul>
    </div>
    <hr class="separator" />
    <NuxtLink
      to="/dashboard"
      class="list-group-item cursor-pointer hover-color bg-light border-0"
      :class="$route.path === '/dashboard' ? 'active' : ''"
      @click="closeLeftSidebar"
    >
      <i class="fas fa-info-circle"></i> Badge Infos
    </NuxtLink>
    <NuxtLink
      to="/leaderboard"
      class="list-group-item cursor-pointer hover-color bg-light border-0"
      :class="$route.path === '/leaderboard' ? 'active' : ''"
      @click="closeLeftSidebar"
    >
      <i class="fas fa-trophy"></i> Leaderboard
    </NuxtLink>
    <div
      v-if="isMobile"
      class="list-group-item cursor-pointer hover-color bg-light border-0"
    >
      <NuxtLink
        to="/profile"
        class="list-group-item cursor-pointer hover-color bg-light border-0"
        :class="$route.path === '/profile' ? 'active' : ''"
        @click="closeLeftSidebar"
      >
        <i class="fas fa-arrow-left"></i> Back to Main Site
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import { useSidebarStore } from "~/store/sidebars";
import { useRouter } from "vue-router";
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "QuestPageSidebar",
  components: {
    ProfileImage,
  },
  props: {
    isMobile: Boolean,
    lSidebar: Object,
    address: String, // Ajout de la prop address
    completedQuests: Number,
    totalQuests: Number,
  },
  setup(props) {
    const userStore = useUserStore();
    const questStore = useQuestStore();
    const sidebarStore = useSidebarStore();
    const router = useRouter();

    const closeLeftSidebar = () => {
      if (props.isMobile) {
        props.lSidebar.hide();
        sidebarStore.setLeftSidebar(false);
        sidebarStore.setMainContent(true);
      }
    };

    const handleCategoryClick = (category) => {
      questStore.filterCategory(category);
      closeLeftSidebar();
      router.push("/quest");
    };

    const mapCategoryToIcon = (category) => {
      switch (category) {
        case "Social Hub Quests":
          return "fa-users";
        case "Scrolly DeFi":
          return "fa-coins";
        case "Community Rewards":
          return "fa-gift";
        default:
          return "fa-question-circle";
      }
    };

    const questCategories = questStore.questCategories.map((category) => ({
      ...category,
      iconClass: mapCategoryToIcon(category.category),
    }));

    return {
      userStore,
      questStore,
      sidebarStore,
      handleCategoryClick,
      closeLeftSidebar,
      questCategories,
      getTextWithoutBlankCharacters,
    };
  },
  computed: {
    currentGrade() {
      const grades = [
        { name: "Scrolly Baby", points: 0 },
        { name: "Scrolly Novice", points: 667 },
        { name: "Scrolly Explorer", points: 1221 },
        { name: "Scrolly Mapper", points: 2442 },
        { name: "Carto Maestro", points: 4200 },
        { name: "Grand Cartographer of Scrolly", points: 6000 },
      ];
      return (
        grades
          .slice()
          .reverse()
          .find((grade) => this.questStore.activityPoints >= grade.points) ||
        grades[0]
      );
    },
    progress() {
      const nextGrade = this.nextGrade;
      if (!nextGrade) return 100;
      const prevPoints = this.currentGrade.points;
      const nextPoints = nextGrade.points;
      return (
        ((this.questStore.activityPoints - prevPoints) /
          (nextPoints - prevPoints)) *
        100
      );
    },
    nextGrade() {
      const grades = [
        { name: "Scrolly Baby", points: 0 },
        { name: "Scrolly Novice", points: 667 },
        { name: "Scrolly Explorer", points: 1221 },
        { name: "Scrolly Mapper", points: 2442 },
        { name: "Carto Maestro", points: 4200 },
        { name: "Grand Cartographer of Scrolly", points: 6000 },
      ];
      return grades.find(
        (grade) => this.questStore.activityPoints < grade.points
      );
    },
  },
  mounted() {
    const userStore = useUserStore();
    this.questStore.initializeQuests(userStore);
  },
};
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 5px;
  border-radius: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.profile-details {
  flex-grow: 1;
  margin-left: 10px;
}

.username {
  font-size: 1.1em;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
  height: 10px;
  margin-top: 5px;
}

.progress {
  height: 100%;
  background: #4caf50;
}

.quests-info {
  text-align: center;
  font-size: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quest-count {
  background: #dcdcdc;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  margin: 10px;
}

.quest-count-title {
  font-size: 1em;
  font-weight: bold;
  display: block;
}

.quest-count-numbers {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quest-count-number {
  font-size: 0.9em;
  font-weight: bold;
  display: block;
}

.quest-count-separator {
  height: 1px;
  width: 100%;
  background: black;
  margin: 2px 0;
}

.separator {
  border: 0;
  height: 1px;
  background: grey;
  margin: 10px 0;
}
</style>
