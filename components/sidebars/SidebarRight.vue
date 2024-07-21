<template>
  <div :class="['sidebar-right', { open: isOpen }]">
    <button
      id="close-right-sidebar-button"
      @click="closeSidebar"
      v-if="isMobileOrSmallScreen"
    >
      ❌
    </button>
    <!-- Contenu de la barre latérale -->
    <div class="sidebar-content">
      <!-- Popup Message - Ongoing  -->
      <div class="card m-2 bg-light">
        <div class="">
          <!-- Show Infos for users who have a domain -->
          <template v-if="userStore.getDefaultDomain">
            <ongoing />
          </template>
          <!-- User without default domain give info about Scrolly Mainnet -->
          <template v-else>
            <onboarding />
          </template>
        </div>
      </div>
      <!-- Keys list -->
      <KeysListWidget
        v-if="$config.keysAddress && $config.showFeatures.friendKeys"
      />
      <!-- Random minted post(s) -->
      <MintedPostsWidget
        v-if="$config.showFeatures.randomMintedPosts"
        @closeRightSidebar="closeSidebar"
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
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1812713007&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
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
              >Scrolly</a
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import ongoing from "~/components/sidebars/components/ongoing.vue";
import onboarding from "~/components/sidebars/components/onboarding.vue";
import KeysListWidget from "~/components/keys/KeysListWidget.vue";
import MintedPostsWidget from "~/components/minted-posts/MintedPostsWidget.vue";
import { useUserStore } from "~/store/user";

export default {
  name: "SidebarRight",
  components: {
    KeysListWidget,
    onboarding,
    ongoing,
    MintedPostsWidget,
  },
  props: {
    isMobile: {
      type: Boolean,
      default: false,
    },
    rSidebar: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const isMobileOrSmallScreen = ref(props.isMobile);
    const userStore = useUserStore();

    const checkScreenSize = () => {
      isMobileOrSmallScreen.value = window.innerWidth < 1450;
    };

    onMounted(() => {
      checkScreenSize();
      window.addEventListener("resize", checkScreenSize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", checkScreenSize);
    });

    const closeSidebar = () => {
      emit("closeSidebar");
    };

    return {
      isMobileOrSmallScreen,
      closeSidebar,
      userStore,
    };
  },
  computed: {
    isOpen() {
      return this.rSidebar;
    },
  },
  watch: {
    rSidebar(newVal) {
      if (newVal !== this.isOpen) {
        this.isOpen = newVal;
      }
    },
  },
};
</script>

<style scoped>
.sidebar-right {
  width: 300px;
  transition: transform 0.3s ease;
  transform: translateX(100%);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  color: black;
  overflow-y: auto;
}

.sidebar-right.open {
  transform: translateX(0);
}

#close-right-sidebar-button {
  position: absolute;
  z-index: 1001;
  background-color: #ffffffef;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 100%;
  transition: background-color 0.3s ease;
  font-size: 0.75rem;
}

/* Add styles for the sidebar content */
.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Hide scrollbar for WebKit-based browsers */
.sidebar-right::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for Firefox */
.sidebar-right {
  scrollbar-width: none; /* Firefox */
}
</style>
