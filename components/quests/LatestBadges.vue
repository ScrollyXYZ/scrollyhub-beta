<template>
  <div :class="['latest-quests', { 'dark-mode': isDarkMode }]">
    <h2>Latest Quests</h2>
    <div class="quests-grid">
      <QuestCard
        v-for="quest in latestQuests"
        :key="quest.id"
        :quest="quest"
        @showDetails="showDetails"
      />
    </div>
    <NuxtLink to="/quest" class="access-quests-btn">Access to Quests</NuxtLink>
  </div>
</template>
<script>
import { computed, onMounted } from "vue";
import { useQuestStore } from "~/store/questStore";
import { useUserStore } from "~/store/user";
import { useThemeStore } from "~/store/theme";
import QuestCard from "~/components/quests/QuestCard.vue";

export default {
  name: "LatestQuests",
  components: { QuestCard },
  setup() {
    const questStore = useQuestStore();
    const userStore = useUserStore();
    const themeStore = useThemeStore();

    onMounted(async () => {
      if (userStore.getCurrentUserAddress) {
        await questStore.initializeQuests(userStore);
        await questStore.updateData();
      }
    });

    const latestQuests = computed(() => {
      return questStore.questCategories
        .flatMap((category) =>
          category.quests.filter((quest) => !quest.tbd && !quest.ended),
        )
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
    });

    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    const showDetails = (quest) => {
      // Logic to show quest details
    };

    return {
      latestQuests,
      isDarkMode,
      showDetails,
    };
  },
};
</script>

<style scoped>
.latest-quests {
  position: relative;
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

.latest-quests:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
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

.dark-mode .latest-quests {
  background-color: rgba(51, 51, 51, 0.9);
  color: #fff;
}

.dark-mode .latest-quests h2 {
  color: #fff;
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
