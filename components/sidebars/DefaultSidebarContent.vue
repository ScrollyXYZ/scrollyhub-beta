<template>
  <div class="default-sidebar-content">
    <div class="text-left">
      <div v-if="isMobile">
        <div class="text-center">
          <NuxtLink to="/profile" @click.native="closeSidebar">
            <ProfileImage
              :key="userStore.getOrbisImage"
              @click="closeLeftSidebar"
              class="img-fluid mt-3 rounded-circle w-50 sidebar-profile-image"
              :address="address"
              :domain="userStore.getDefaultDomain"
              :image="userStore.getOrbisImage"
            />
          </NuxtLink>
          <h6 class="mt-3" v-if="userStore.getDefaultDomain">
            {{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}
          </h6>
        </div>
      </div>
      <div
        v-else
        style="display: flex; align-items: center; justify-content: flex-start"
      >
        <NuxtLink to="/profile" style="margin-right: 10px">
          <ProfileImage
            :key="userStore.getOrbisImage"
            class="rounded-circle"
            :address="address"
            :domain="userStore.getDefaultDomain"
            :image="userStore.getOrbisImage"
            style="width: 50px; height: 50px"
          />
        </NuxtLink>
        <NuxtLink to="/profile" style="text-decoration: none; color: inherit">
          <h6 style="margin-bottom: 0"><strong>{{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}</strong></h6>
        </NuxtLink>
      </div>

      <!-- Chat tokens -->
      <!--
      <button v-if="userStore.getChatTokenBalanceWei > 0 && $config.chatTokenAddress" class="btn btn-outline-primary btn-sm mt-2 mb-2 disabled">
        {{ userStore.getChatTokenBalance }} {{ $config.chatTokenSymbol }}
      </button>
      -->

      <!-- Activity Points -->
      <div
        v-if="
          $config.activityPointsAddress &&
          $config.showFeatures.activityPoints &&
          isMobile &&
          isActivated
        "
        class="mt-2"
      >
        <NuxtLink
          to="/activity-points"
          class="btn btn-outline-primary btn-sm mt-2 mb-2"
          @click.native="closeSidebar"
        >
          {{ getUserAp }} AP
        </NuxtLink>
      </div>
      <hr />
    </div>

    <ul class="nav nav-pills flex-column">
      <template v-if="!isNftRoute">
        <ul class="list-group">
          <NuxtLink
            to="/"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            General discussion
          </NuxtLink>
        </ul>

        <ul class="list-group">
          <NuxtLink
            to="/equilibre-memes"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path.startsWith('/equilibre-memes') ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Equilibre meme contest
          </NuxtLink>
        </ul>

        <!--
        <ul class="list-group">
          <NuxtLink to="/memes-contest" class="list-group-item cursor-pointer hover-color bg-light border-0" :class="$route.path.startsWith('/memes-contest') ? 'active' : ''" @click="closeLeftSidebar">
            Memes contest
          </NuxtLink>
        </ul>
        -->

        <ul class="list-group">
          <NuxtLink
            to="/memes-images"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path.startsWith('/memes-images') ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Share images & NFTs
          </NuxtLink>
        </ul>

        <ul class="list-group">
          <NuxtLink
            to="/shill"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path.startsWith('/shill') ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Shill & discuss projects
          </NuxtLink>
        </ul>

        <hr />
      </template>

      <template v-if="isNftRoute">
        <ul class="list-group">
          <NuxtLink
            to="/nft/mynfts"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/nft/mynfts' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            My NFTs
          </NuxtLink>
        </ul>
        <ul class="list-group">
          <NuxtLink
            to="/nft"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/nft' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Latest Collections
          </NuxtLink>
        </ul>
        <ul class="list-group">
          <NuxtLink
            to="/nft/create"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/nft/create' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Create a collection
          </NuxtLink>
        </ul>
        <ul class="list-group">
          <NuxtLink
            to="/nft/ManageMyCollections"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/nft/ManageMyCollections' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Manage My Collections
          </NuxtLink>
        </ul>
        <ul class="list-group">
          <NuxtLink
            v-if="isMobile"
            to="/"
            class="list-group-item cursor-pointer hover-color bg-light border-0"
            :class="$route.path === '/nft/mynfts' ? 'active' : ''"
            @click="closeLeftSidebar"
          >
            Return to the Hub
          </NuxtLink>
        </ul>
        <hr />
      </template>

      <!-- NFT Launchpad -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="
          $config.nftLaunchpadBondingAddress &&
          $config.showFeatures.nftLaunchpad &&
          isMobile
        "
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/nft') ? 'active' : ''"
          aria-current="page"
          to="/nft"
        >
          <i class="bi bi-rocket-takeoff"></i> NFT Launchpad
        </NuxtLink>
      </li>
      <!-- Domain Names -->
      <li
        class="nav-item p-1"
        v-if="$config.showFeatures.domainName && isMobile"
        @click="closeLeftSidebar"
      >
        <a class="nav-link" :href="$config.domainUrl" target="_blank">
          <i class="bi bi-box2"></i> Scrolly's Domains
          <small><i class="bi bi-box-arrow-up-right ms-1"></i></small>
        </a>
      </li>
      <!-- Notifications -->
      <li
        v-if="isActivated && !isNftRoute"
        class="nav-item p-1"
        @click="closeLeftSidebar"
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/notifications') ? 'active' : ''"
          aria-current="page"
          to="/notifications"
        >
          <i class="bi bi-bell"></i> Notifications

          <span
            class="badge text-bg-secondary"
            v-if="
              !notificationsStore.getLoadingNotifications &&
              notificationsStore.getUnreadNotificationsCount > 0
            "
          >
            {{ notificationsStore.getUnreadNotificationsCount }}
          </span>
        </NuxtLink>
      </li>

      <!-- Profile -->
      <li
        v-if="isActivated && isMobile"
        class="nav-item p-1"
        @click="closeLeftSidebar"
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/profile') ? 'active' : ''"
          aria-current="page"
          to="/profile"
        >
          <i class="bi bi-person"></i> Profile
        </NuxtLink>
      </li>

      <!-- Activity Points -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="
          $config.showFeatures.activityPoints &&
          $config.activityPointsAddress &&
          isMobile
        "
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/activity-points') ? 'active' : ''"
          aria-current="page"
          to="/activity-points"
        >
          <i class="bi bi-award"></i> Activity Points
        </NuxtLink>
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/quest') ? 'active' : ''"
          aria-current="page"
          to="/quest"
        >
          <i class="bi bi-award"></i> Quests
        </NuxtLink>
      </li>

      <!-- Shill 
      <li class="nav-item p-1" @click="closeLeftSidebar">
        <NuxtLink class="nav-link" :class="$route.path.startsWith('/shill') ? 'active' : ''" aria-current="page" to="/shill">
          <i class="bi bi-megaphone"></i> Shill projects
        </NuxtLink>
      </li>
      -->

      <!-- Send tokens -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="$config.showFeatures.sendTokens"
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/send-tokens') ? 'active' : ''"
          aria-current="page"
          to="/send-tokens"
        >
          <i class="bi bi-send"></i> Send tokens
        </NuxtLink>
      </li>

      <!-- Search Posts -->
      <li class="nav-item p-1" @click="closeLeftSidebar">
        <NuxtLink
          v-if="!isNftRoute"
          class="nav-link"
          :class="$route.path.startsWith('/search-posts') ? 'active' : ''"
          aria-current="page"
          to="/search-posts"
        >
          <i class="bi bi-search"></i> Search Posts
        </NuxtLink>
      </li>

      <!-- Stake & Earn -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="$config.stakingContractAddress && $config.showFeatures.stake"
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/stake') ? 'active' : ''"
          aria-current="page"
          to="/stake"
        >
          <i class="bi bi-cash-stack"></i> Stake & Earn
        </NuxtLink>
      </li>

      <!-- Swap -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="
          $config.swapRouterAddress && $config.showFeatures.swap && isMobile
        "
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/swap') ? 'active' : ''"
          aria-current="page"
          to="/swap"
        >
          <i class="bi bi-arrow-down-up"></i> Swap
        </NuxtLink>
      </li>

      <!-- Friend Keys -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="$config.keysAddress && $config.showFeatures.friendKeys"
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/keys') ? 'active' : ''"
          aria-current="page"
          to="/keys"
        >
          <i class="bi bi-key"></i> Friend Keys
        </NuxtLink>
      </li>

      <!-- Airdrop -->
      <li
        class="nav-item p-1"
        @click="closeLeftSidebar"
        v-if="
          ($config.airdropClaimDomainsAddress || $config.airdropApAddress) &&
          $config.showFeatures.airdrop
        "
      >
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/airdrop') ? 'active' : ''"
          aria-current="page"
          to="/airdrop"
        >
          <i class="bi bi-gift"></i> Airdrop
        </NuxtLink>
      </li>

      <!-- Governance -->
      <li
        class="nav-item p-1"
        v-if="$config.showFeatures.governance"
        @click="closeLeftSidebar"
      >
        <a class="nav-link" :href="$config.governanceUrl" target="_blank">
          <i class="bi bi-box2"></i> Governance
          <small><i class="bi bi-box-arrow-up-right ms-1"></i></small>
        </a>
      </li>
      <!-- Find User -->
      <li class="nav-item p-1" @click="closeLeftSidebar">
        <NuxtLink
          v-if="!isNftRoute"
          class="nav-link"
          :class="$route.path.startsWith('/find-user') ? 'active' : ''"
          aria-current="page"
          to="/find-user"
        >
          <i class="bi bi-binoculars"></i> Find User
        </NuxtLink>
      </li>

      <!-- About -->
      <li class="nav-item p-1" @click="closeLeftSidebar">
        <NuxtLink
          class="nav-link"
          :class="$route.path.startsWith('/about') ? 'active' : ''"
          aria-current="page"
          to="/about"
        >
          <i class="bi bi-patch-question"></i> About
        </NuxtLink>
      </li>

      <!-- More 
      <li class="nav-item p-1 dropdown">
        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">
          <i class="bi bi-three-dots"></i> More
        </a>

        <ul class="dropdown-menu">

          <li class="pt-1 pb-1" @click="closeLeftSidebar" v-if="$config.airdropClaimDomainsAddress || $config.airdropApAddress">
            <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/airdrop') ? 'active' : ''" aria-current="page" to="/airdrop">
              <i class="bi bi-gift"></i> Airdrop
            </NuxtLink>
          </li>

          <li class="pt-1 pb-1" @click="closeLeftSidebar">
            <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/profile') ? 'active' : ''" aria-current="page" to="/profile">
              <i class="bi bi-person"></i> Profile
            </NuxtLink>
          </li>

          <li class="pt-1 pb-1">
            <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/notifications') ? 'active' : ''" aria-current="page" to="/notifications">
              <i class="bi bi-bell"></i> Notifications

              <span 
                class="badge text-bg-secondary" 
                v-if="!notificationsStore.getLoadingNotifications && notificationsStore.getUnreadNotificationsCount > 0">
                {{ notificationsStore.getUnreadNotificationsCount }}
              </span>

            </NuxtLink>
          </li>

          <li class="pt-1 pb-1" @click="closeLeftSidebar">
            <a class="dropdown-item" href="https://snapshot.org/#/sgbchat.eth" target="_blank">
              <i class="bi bi-box2"></i> Governance <small><i class="bi bi-box-arrow-up-right ms-1"></i></small>
            </a>
          </li>

          <li class="pt-1 pb-1" @click="closeLeftSidebar">
            <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/about') ? 'active' : ''" aria-current="page" to="/about">
              <i class="bi bi-patch-question"></i> About
            </NuxtLink>
          </li>

        </ul>
      </li>
      -->
    </ul>
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
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "DefaultSidebarContent",
  components: {
    ProfileImage,
  },
  props: ["isMobile", "lSidebar"],
  computed: {
    getUserAp() {
      if (this.userStore.getCurentUserActivityPoints > 0) {
        return this.userStore.getCurentUserActivityPoints;
      } else {
        return 0;
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
    isNftRoute() {
      return this.$route.path.startsWith("/nft");
    },
  },
  methods: {
    getActivityPoints,
    getTextWithoutBlankCharacters,
    closeLeftSidebar() {
      if (this.isMobile) {
        this.lSidebar.hide();
        this.sidebarStore.setLeftSidebar(false);
        this.sidebarStore.setMainContent(true);
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
