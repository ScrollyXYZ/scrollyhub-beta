<template>
  <div :class="['get-started-carousel', { 'dark-mode': isDarkMode }]">
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      navigation
      :grab-cursor="true"
      class="main-swiper"
    >
      <SwiperSlide v-for="(slide, index) in slides" :key="index">
        <div class="slide-content">
          <img :src="slide.img" :alt="slide.alt" class="slide-image" />
          <div class="overlay">
            <h2 class="slide-title">{{ slide.title }}</h2>
            <p>{{ slide.description }}</p>
            <template v-if="isExternalLink(slide.link)">
              <a
                :href="slide.link"
                class="slide-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ slide.buttonText }}
              </a>
            </template>
            <template v-else-if="slide.link === 'referral'">
              <button
                type="button"
                class="slide-button"
                @click="copyReferralLink"
              >
                {{ slide.buttonText }}
              </button>
            </template>
            <template v-else>
              <NuxtLink :to="slide.link" class="slide-button">
                {{ slide.buttonText }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Pagination } from "swiper/modules";
import { useThemeStore } from "~/store/theme";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useEthers } from "vue-dapp";
import { useUserStore } from "~/store/user";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "GetStartedCarousel",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const slides = ref([
      {
        title: "Step 1: Create Your Scrolly Domain",
        img: "http://scrolly.xyz/onboarding/1.png",
        alt: "Wallet Icon",
        description:
          "Join the hub and share with more than 1,000 scrollies around the world.",
        buttonText: "Get your Scrolly Domain",
        link: "https://sns.scrolly.xyz/#/",
      },
      {
        title: "Step 2: Participate in Contests & Quests",
        img: "http://scrolly.xyz/onboarding/2.png",
        alt: "Activities Icon",
        description: "Track your progress and earn Mappy Points as rewards.",
        buttonText: "I want to be an adventurer",
        link: "/quest",
      },
      {
        title: "Step 3: Get MOAR Mappy Points with your on-chain activities",
        img: "http://scrolly.xyz/onboarding/3.png",
        alt: "Progress Icon",
        description: "Track your progress and earn Mappy Points as rewards.",
        buttonText: "Learn More",
        link: "/activity-points",
      },
      {
        title: "Step 4: Refer Your Friends",
        img: "http://scrolly.xyz/onboarding/4.png",
        alt: "Progress Icon",
        description:
          "Earn passive Mappy Points rewards with your friends' activities on-chain.",
        buttonText: "Copy Referral Link",
        link: "referral", // Custom link to identify referral action
      },
      {
        title: "Step 5: Evolve your Badge",
        img: "http://scrolly.xyz/onboarding/5.png",
        alt: "Progress Icon",
        description: "Your badge evolved with your Mappy Points.",
        buttonText: "Soon",
        link: "#",
      },
      {
        title: "Step 6: Enjoy Your Rewards",
        img: "http://scrolly.xyz/onboarding/6.png",
        alt: "Progress Icon",
        description:
          "Keep engaging and enjoying the benefits of being part of the Scrolly community.",
        buttonText: "Soon",
        link: "#",
      },
    ]);

    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const { address } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    const getDomainNameOrAddress = () => {
      if (userStore.getDefaultDomain) {
        return getTextWithoutBlankCharacters(userStore.getDefaultDomain);
      }
      return address;
    };

    const getReferralLink = () => {
      const url = new URL(window.location.href);
      url.searchParams.set("ref", getDomainNameOrAddress());
      return url.toString();
    };

    const copyReferralLink = () => {
      navigator.clipboard.writeText(getReferralLink());
      toast("Referral link copied to your clipboard!", { type: "success" });
    };

    return {
      Navigation,
      Pagination,
      slides,
      isExternalLink: (link) => link.startsWith("https"),
      isDarkMode,
      copyReferralLink,
    };
  },
};
</script>

<style scoped>
.get-started-carousel {
  width: 100%;
  text-align: center;
  background-color: #f0f0f0; /* Light mode background color */
  transition: background-color 0.3s ease;
}

.get-started-carousel.dark-mode {
  background-color: #333; /* Dark mode background color */
}

.main-swiper {
  width: 100%;
}

.slide-content {
  position: relative;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
  color: #fff; /* Default text color */
}

.slide-image {
  width: 100%;
  height: auto;
  display: block;
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
}

.overlay p {
  font-size: 1.2em;
  margin-bottom: 15px;
}

.slide-button {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background-color: #007bff;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
  text-decoration: none;
}

.slide-button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dark-mode .overlay {
  background: rgba(51, 51, 51, 0.9);
}

.dark-mode .slide-title,
.dark-mode .slide-button {
  color: #fff;
}

/* Ensure text is white in both light and dark modes */
.overlay h2,
.overlay p {
  color: #fff;
}

@media (max-width: 874px) {
  .get-started-carousel {
    width: 100%;
    margin: 10px 0;
    padding: 10px;
  }

  .swiper-slide {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .slide-content {
    width: 100%;
  }
}
</style>
