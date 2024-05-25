<template>
  <div class="quest-page-sidebar">
    <div class="quest-sidebar-content">
      <div class="profile-section">
        <img
          :src="userStore.getOrbisImage || '/path/to/default/avatar.png'"
          alt="Profile Image"
          class="profile-image"
        />
        <div class="profile-details">
          <div class="username">
            {{ userStore.getDefaultDomain || "Guest" }}
          </div>
          <div class="grade-label">{{ currentGrade.name }}</div>
          <div class="progress-bar">
            <div class="progress" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        <div class="quests-info">
          <span>Quests</span>
          <span>{{ completedQuests }} / {{ totalQuests }}</span>
        </div>
      </div>
      <div class="links">
        <NuxtLink to="/quest" class="link">Scrolly Quest</NuxtLink>
        <NuxtLink v-if="isMobile" to="/" class="link"
          >Back to Main Site</NuxtLink
        >
      </div>
      <div class="category-links">
        <h3>Categories</h3>
        <ul>
          <li @click="filterCategory('all')">All</li>
          <li @click="filterCategory('latest')">Latest</li>
          <li
            v-for="category in questCategories"
            :key="category.category"
            @click="filterCategory(category.category)"
          >
            {{ category.category }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";

export default {
  name: "QuestPageSidebar",
  setup() {
    const userStore = useUserStore();
    const questStore = useQuestStore();

    return {
      userStore,
      questStore,
      filterCategory: questStore.filterCategory,
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
  width: 396px;
  border-radius: 15px;
  padding: 10px;
  position: fixed;
  left: 30px;
  top: 10px;
}

.quest-sidebar-content {
  padding: 10px;
}

.profile-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 10px;
  border-radius: 8px;
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
  font-size: 1.2em;
  font-weight: bold;
  color: black;
}

.grade-label {
  display: inline-block;
  background-color: #6a0dad;
  color: white;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.9em;
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
  text-align: right;
  font-size: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.links {
  margin-top: 10px;
  text-align: center;
}

.link {
  display: block;
  color: #6a0dad;
  text-decoration: none;
  margin: 5px 0;
  font-weight: bold;
}

.link:hover {
  text-decoration: underline;
}

.category-links {
  margin-top: 20px;
}

.category-links h3 {
  text-align: center;
  color: #333;
}

.category-links ul {
  list-style: none;
  padding: 0;
  text-align: center;
}

.category-links li {
  margin: 5px 0;
  cursor: pointer;
}
</style>
