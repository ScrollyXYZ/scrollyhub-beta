<template>
  <div class="quest-sidebar-content">
    <div class="links" v-if="!isMobile">
      <NuxtLink to="/quest" class="link" @click="handleLinkClick"
        >Scrolly Quests</NuxtLink
      >
    </div>
    <div class="profile-section">
      <img
        :src="userStore.getOrbisImage || '/img/user/anon.svg'"
        alt="Profile Image"
        class="profile-image"
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
    <div class="links" v-if="isMobile">
      <NuxtLink to="/" class="link" @click="handleLinkClick"
        >Back to Main Site</NuxtLink
      >
    </div>
    <div class="category-links" v-if="!isMobile">
      <h3>Categories</h3>
      <ul>
        <li @click="handleCategoryClick('all')">All</li>
        <li @click="handleCategoryClick('latest')">Latest</li>
        <li
          v-for="category in questCategories"
          :key="category.category"
          @click="handleCategoryClick(category.category)"
        >
          {{ category.category }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import { useSidebarStore } from "~/store/sidebars";
import { useRouter } from "vue-router";

export default {
  name: "QuestPageSidebar",
  props: ["isMobile"],
  setup(props) {
    const userStore = useUserStore();
    const questStore = useQuestStore();
    const sidebarStore = useSidebarStore();
    const router = useRouter();

    const closeLeftSidebar = () => {
      if (props.isMobile) {
        sidebarStore.setLeftSidebar(false);
        sidebarStore.setMainContent(true);
      }
    };

    const handleCategoryClick = (category) => {
      questStore.filterCategory(category);
      closeLeftSidebar();
      router.push("/quest");
    };

    const handleLinkClick = () => {
      closeLeftSidebar();
    };

    return {
      userStore,
      questStore,
      sidebarStore,
      handleCategoryClick,
      handleLinkClick,
      questCategories: questStore.questCategories,
    };
  },
  computed: {
    currentGrade() {
      const grades = [
        { name: "Scrolly Baby", points: 0 },
        { name: "Scrolly Novice", points: 333 },
        { name: "Scrolly Explorer", points: 777 },
        { name: "Scrolly Mapper", points: 1337 },
        { name: "Carto Maestro", points: 2442 },
        { name: "Grand Cartographer of Scrolly", points: 4200 },
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
        { name: "Scrolly Novice", points: 333 },
        { name: "Scrolly Explorer", points: 777 },
        { name: "Scrolly Mapper", points: 1337 },
        { name: "Carto Maestro", points: 2442 },
        { name: "Grand Cartographer of Scrolly", points: 4200 },
      ];
      return grades.find(
        (grade) => this.questStore.activityPoints < grade.points,
      );
    },
    completedQuests() {
      return this.questStore.questCategories.reduce((total, category) => {
        return total + this.questStore.getCompletedQuests(category.quests);
      }, 0);
    },
    totalQuests() {
      return this.questStore.questCategories.reduce((total, category) => {
        return total + category.quests.length;
      }, 0);
    },
  },
  mounted() {
    const userStore = useUserStore();
    this.questStore.initializeQuests(userStore);
  },
};
</script>
<style scoped>
.quest-page-sidebar {
  background: rgba(232, 232, 232, 0.7);
  border-radius: 15px;
  padding: 10px;
  left: 30px;
  top: 10px;
}

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
  color: black;
}

.grade-label {
  display: inline-block;
  background-color: #6a0dad;
  color: white;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.8em;
  margin-top: 5px;
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

.links {
  margin-top: 10px;
  text-align: center;
}

.link {
  display: block;
  color: var(--bs-indigo);
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.2em;
}

.link:hover {
  text-decoration: underline;
}

.category-links {
  margin-top: 20px;
}

.category-links h3 {
  text-align: center;
}

.category-links ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

.category-links li {
  margin: 5px 0;
  cursor: pointer;
  font-size: 1.2em;
  font-family: Arial, sans-serif;
  padding-left: 15px;
}

.category-links li:hover {
  text-decoration: underline;
}
</style>
