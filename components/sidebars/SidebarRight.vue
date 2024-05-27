<template>
  <div
    :class="['col-auto', isNftRoute ? 'col-lg-1' : 'col-lg-3', 'px-0', 'mt-1']"
  >
    <div
      id="sidebar2"
      class="collapse collapse-horizontal"
      :class="{ show: sidebarStore.showRightSidebar }"
    >
      <div
        id="sidebar-nav"
        class="list-group border-0 rounded-0 text-sm-start min-vh-100"
      >
        <template v-if="!isNftRoute">
          <div class="card m-2 bg-light" v-if="isMobile">
            <div class="card-body sidebar-card-body mt-4">
              <div class="d-grid gap-2">
                <div class="btn-group" role="group">
                  <button
                    type="button"
                    class="btn btn-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Theme:
                    {{ String(siteStore.getColorMode).charAt(0).toUpperCase() }}
                    {{ String(siteStore.getColorMode).slice(1) }}
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('scrolly')"
                        >Scrolly</span
                      >
                    </li>
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('dark')"
                        >Dark</span
                      >
                    </li>
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('light')"
                        >Light</span
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        <!-- Register a domain name OR say Hello -->
        <div class="card m-2 bg-light">
          <div class="sidebar-card-body">
            <img
              src="/img/scrollyimg.png"
              class="sidebar-card-body-img"
            />
            <div class="speech-bubble">
              <!-- Greeting for users who are connected and have a domain -->
              <template v-if="isActivated && userStore.getDefaultDomain">
                Nice to see you again!
                {{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}
              </template>
                <!-- Greeting for connected users who do not have a domain -->
                <template
                  v-else-if="isActivated && !userStore.getDefaultDomain"
                >
                  Nice to meet you! We saw that you don't have a Domain yet.
                  Choose your Nickname and join us on the Hub.
                </template>

                <!-- Message for users who are not connected -->
                <template v-else>
                  You can create your Scrolly Domain now.
                </template>
              </div>
            </div>
            <template v-if="!userStore.getDefaultDomain">
              <div class="button-container">
                <a
                  href="https://sns.scrolly.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="create-domain-button"
                >
                  Create a domain
                </a>
              </div>
            </template>
          </div>
          <!-- Referrals -->
          <ReferralWidget />

          <!-- Swap tokens -->
          <SimpleSwapWidget
            v-if="$config.swapRouterAddress && $config.showFeatures.swap"
            :routerAddress="$config.swapRouterAddress"
            :tokens="tokens"
            title="Swap tokens"
          />

          <!-- Playlist -->
          <div class="card m-2 bg-light" v-if="$config.showFeatures.spotify">
            <div class="card-header bg-light">
              {{ $config.projectName }} Playlist
            </div>
            <div class="card-body sidebar-card-body">
              <iframe
                width="100%"
                height="300"
                scrolling="no"
                frameborder="no"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1812713007&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
              ></iframe>
              <div
                style="
                  font-size: 10px;
                  color: #cccccc;
                  line-break: anywhere;
                  word-break: normal;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  font-family:
                    Interstate,
                    Lucida Grande,
                    Lucida Sans Unicode,
                    Lucida Sans,
                    Garuda,
                    Verdana,
                    Tahoma,
                    sans-serif;
                  font-weight: 100;
                "
              >
                <a
                  href="https://soundcloud.com/scrolly-themap"
                  title="Scrolly TheMap"
                  target="_blank"
                  style="color: #cccccc; text-decoration: none"
                  >Scrolly TheMap</a
                >
                ·
                <a
                  href="https://soundcloud.com/scrolly-themap/sets/scrolliverse-song"
                  title="Scrolliverse Song"
                  target="_blank"
                  style="color: #cccccc; text-decoration: none"
                  >Scrolliverse Song</a
                >
              </div>
            </div>
          </div>

          <!-- Keys list -->
          <KeysListWidget
            v-if="$config.keysAddress && $config.showFeatures.friendKeys"
          />

          <!-- Random minted post(s) -->
          <MintedPostsWidget
            v-if="$config.showFeatures.randomMintedPosts"
            @closeRightSidebar="closeRightSidebar"
          />

          <!-- Newsletter -->
          <div
            v-if="$config.newsletterLink && $config.showFeatures.newsletter"
            class="card m-2 bg-light"
          >
            <div class="card-header bg-light">
              {{ $config.projectName }} Newsletter
            </div>
            <div class="card-body sidebar-card-body">
              <a
                class="btn btn-outline-primary mt-2 mb-2"
                target="_blank"
                :href="$config.newsletterLink"
              >
                Join our newsletter!
                <i class="bi bi-box-arrow-up-right ms-1"></i>
              </a>
            </div>
          </div>
        </template>

        <!-- Minimized content for testing -->
        <template v-else>
          <div class="card m-1 bg-light" v-if="isMobile">
            <div class="card-body sidebar-card-body mt-1">
              <div class="d-grid gap-1">
                <div class="btn-group" role="group">
                  <button
                    type="button"
                    class="btn btn-primary dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="font-size: 0.8em"
                  >
                    T:
                    {{ String(siteStore.getColorMode).charAt(0).toUpperCase() }}
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('scrolly')"
                        >S</span
                      >
                    </li>
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('dark')"
                        >D</span
                      >
                    </li>
                    <li>
                      <span
                        class="dropdown-item cursor-pointer"
                        @click="changeColorMode('light')"
                        >L</span
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import tokens from "~/assets/data/tokens.json";
import { useSidebarStore } from "~/store/sidebars";
import { useSiteStore } from "~/store/site";
import { useUserStore } from "~/store/user";
import { useWallet } from "vue-dapp";
import MintedPostsWidget from "~/components/minted-posts/MintedPostsWidget.vue";
import NameMintWidget from "~/components/names/NameMintWidget.vue";
import SimpleSwapWidget from "~/components/swap/SimpleSwapWidget.vue";
import KeysListWidget from "~/components/keys/KeysListWidget.vue";
import ReferralWidget from "~/components/referrals/ReferralWidget.vue";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";
import { useEthers } from "vue-dapp";
import { useRoute } from "vue-router";

export default {
  name: "SidebarRight",
  props: ["rSidebar", "isMobile"],
  components: {
    KeysListWidget,
    MintedPostsWidget,
    NameMintWidget,
    ReferralWidget,
    SimpleSwapWidget,
  },
  setup() {
    const { disconnect, isConnected } = useWallet();
    const sidebarStore = useSidebarStore();
    const siteStore = useSiteStore();
    const userStore = useUserStore();
    const { address, isActivated } = useEthers();
    const isWalletConnected = computed(() => isConnected.value);
    const route = useRoute();
    const isNftRoute = computed(() => route.path.startsWith("/nft"));

    return {
      sidebarStore,
      siteStore,
      userStore,
      tokens,
      disconnect,
      isWalletConnected,
      isActivated,
      isNftRoute,
    };
  },
  methods: {
    changeColorMode(newMode) {
      this.siteStore.setColorMode(newMode);
      document.documentElement.setAttribute(
        "data-bs-theme",
        this.siteStore.getColorMode,
      );
    },

    closeRightSidebar() {
      if (this.isMobile) {
        this.sidebarStore.setRightSidebar(false);
        this.sidebarStore.setMainContent(true);
      }
    },
    async disconnectWallet() {
      try {
        await this.disconnect();
        this.userStore.clearUserData();
        console.log("Wallet disconnected successfully.");
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    },
  },
};
</script>
