<template>
  <div class="col col-lg-auto px-0 mt-1">
    <div
      id="sidebar1"
      class="collapse collapse-horizontal"
      :class="$config.sidebarLeftSticky ? 'sticky-lg-top' : ''"
    >
      <div
        class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100"
      >
        <component
          :is="currentSidebarComponent"
          :user-store="userStore"
          :current-grade="currentGrade"
          :progress="progress"
          :completed-quests="completedQuests"
          :total-quests="totalQuests"
          :is-mobile="isMobile"
        >
          <!-- Default sidebar content goes here if necessary -->
          <div v-if="!isMobile" class="text-left">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: flex-start;
              "
            >
              <NuxtLink to="/profile" style="margin-right: 10px">
                <ProfileImage
                  :key="userStore.getOrbisImage"
                  class="rounded-circle"
                  :address="address"
                  :domain="userStore.getDefaultDomain"
                  :image="userStore.getOrbisImage"
                  style="width: 33px; height: 33px"
                />
              </NuxtLink>
              <NuxtLink
                to="/profile"
                style="text-decoration: none; color: inherit"
              >
                <h6 style="margin-bottom: 0"><strong>My Scrollie</strong></h6>
              </NuxtLink>
            </div>
            <hr />
          </div>
        </component>
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
import ProfileImage from "~/components/profile/ProfileImage.vue";
import { getActivityPoints } from "~/utils/balanceUtils";

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
      if (this.$route.name === "quest") {
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
    currentGrade() {
      const tiers = [
        { name: "Scrolly Baby", points: 1 },
        { name: "Scrolly Novice", points: 333 },
        { name: "Scrolly Explorer", points: 777 },
        { name: "Scrolly Mapper", points: 1337 },
        { name: "Carto Maestro", points: 2442 },
        { name: "Grand Cartographer of Scrolly", points: 4200 },
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
    address() {
      return this.userStore.address;
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
};
</script>
