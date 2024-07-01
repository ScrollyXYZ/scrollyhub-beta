<template>
  <div class="col col-lg-auto px-0 mt-1">
    <div
      id="sidebar1"
      class="collapse collapse-horizontal"
      :class="$config.sidebarLeftSticky ? 'sticky-lg-top' : ''"
    >
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start">
        <div class="card m-2 bg-light">
          <div class="card-body sidebar-card-body mt-4">
            <component
              :is="currentSidebarComponent"
              :user-store="userStore"
              :quest-store="questStore"
              :current-grade="currentGrade"
              :progress="progress"
              :completed-quests="completedQuests"
              :total-quests="totalQuests"
              :address="address"
              :is-mobile="isMobile"
              :l-sidebar="lSidebar"
              @update:is-mobile="updateIsMobile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useNotificationsStore } from "~/store/notifications";
import { useSidebarStore } from "~/store/sidebars";
import { useUserStore } from "~/store/user";
import { useQuestStore } from "~/store/questStore";
import ProfileImage from "~/components/profile/ProfileImage.vue";

import QuestPageSidebar from "./QuestPageSidebar.vue";
import DefaultSidebarContent from "./DefaultSidebarContent.vue";

export default {
  name: "SidebarLeft",
  components: {
    QuestPageSidebar,
    DefaultSidebarContent,
    ProfileImage,
  },
  props: ["lSidebar", "isMobile"],
  computed: {
    currentSidebarComponent() {
      if (
        this.$route.name === "quest" ||
        this.$route.name === "leaderboard" ||
        this.$route.name === "badge" ||
        this.$route.name === "scrollybadge"
      ) {
        return "QuestPageSidebar";
      } else {
        return "DefaultSidebarContent";
      }
    },
    userStore() {
      return useUserStore();
    },
    sidebarStore() {
      return useSidebarStore();
    },
    notificationsStore() {
      return useNotificationsStore();
    },
    questStore() {
      return useQuestStore();
    },
    currentGrade() {
      const tiers = [
        { name: "Scrolly Baby", points: 1 },
        { name: "Scrolly Novice", points: 667 },
        { name: "Scrolly Explorer", points: 1221 },
        { name: "Scrolly Mapper", points: 2442 },
        { name: "Carto Maestro", points: 4200 },
        { name: "Grand Cartographer of Scrolly", points: 6000 },
      ];
      return (
        tiers.reverse().find((tier) => this.getUserAp >= tier.points) ||
        tiers[0]
      );
    },
    progress() {
      const nextGrade = this.nextGrade;
      if (!nextGrade) return 100;
      const prevPoints = this.currentGrade.points;
      const nextPoints = nextGrade.points;
      return ((this.getUserAp - prevPoints) / (nextPoints - prevPoints)) * 100;
    },
    nextGrade() {
      const tiers = [
        { name: "Scrolly Baby", points: 1 },
        { name: "Scrolly Novice", points: 333 },
        { name: "Scrolly Explorer", points: 777 },
        { name: "Scrolly Mapper", points: 1337 },
        { name: "Carto Maestro", points: 2442 },
        { name: "Grand Cartographer of Scrolly", points: 4200 },
      ];
      return tiers.find((tier) => this.getUserAp < tier.points);
    },
    getUserAp() {
      if (this.userStore.getCurentUserActivityPoints > 0) {
        return this.userStore.getCurentUserActivityPoints;
      } else {
        return 0;
      }
    },
    completedQuests() {
      if (!this.questStore.questCategories) return 0;
      return this.questStore.questCategories.reduce((total, category) => {
        return total + this.questStore.getCompletedQuests(category.quests);
      }, 0);
    },
    totalQuests() {
      if (!this.questStore.questCategories) return 0;
      return this.questStore.questCategories.reduce((total, category) => {
        return total + category.quests.length;
      }, 0);
    },
    address() {
      return this.userStore.getCurrentUserAddress;
    },
  },
  methods: {
    getActivityPoints,
    closeLeftSidebar() {
      if (this.isMobile) {
        this.lSidebar.hide();
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
      }
    },
    updateIsMobile(value) {
      this.$emit("update:is-mobile", value);
    },
    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress && this.address) {
        this.toast.info("Refreshing activity points...", { timeout: 2000 });
        const activityPoints = await this.getActivityPoints(this.address);
        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    },
  },
  setup() {
    const { address, isActivated } = useEthers();
    const toast = useToast();
    return {
      address,
      isActivated,
      toast,
    };
  },
  mounted() {
    if (this.currentSidebarComponent === "QuestPageSidebar") {
      this.questStore.initializeQuests();
    }
  },
};
</script>
