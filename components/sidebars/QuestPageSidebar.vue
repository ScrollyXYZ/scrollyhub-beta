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
          <li v-for="category in questCategories" :key="category.category">
            <NuxtLink
              :to="`#${category.category.replace(/\s+/g, '-')}`"
              class="link"
            >
              {{ category.category }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "~/store/user";

export default {
  name: "QuestPageSidebar",
  props: [
    "currentGrade",
    "progress",
    "completedQuests",
    "totalQuests",
    "isMobile",
  ],
  computed: {
    userStore() {
      return useUserStore();
    },
  },
  data() {
    return {
      questCategories: [],
    };
  },
  mounted() {
    this.fetchQuestCategories();
  },
  methods: {
    fetchQuestCategories() {
      this.questCategories = [
        { category: "Hub Quests" },
        { category: "Social Quests" },
        { category: "Scrolly Community FTW" },
      ];
    },
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
  color: black;
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
}
</style>
