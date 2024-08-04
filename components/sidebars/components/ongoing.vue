<template>
  <div class="get-started-carousel">
    <Swiper
      :modules="[Navigation]"
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
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation } from "swiper/modules";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useUserStore } from "~/store/user";
import { getTextWithoutBlankCharacters } from "~/utils/textUtils";

export default {
  name: "GetStartedCarousel",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    // Define slide data
    const slides = ref([
      {
        title: "",
        img: "http://scrolly.xyz/onboarding/playlotto.png",
        alt: "Wallet Icon",
        description: "",
        buttonText: "Participate",
        link: "https://lotto.scrolly.xyz",
      },
      {
        title: "",
        img: "http://scrolly.xyz/onboarding/2.png",
        alt: "Activities Icon",
        description: "",
        buttonText: "Explore",
        link: "/quest",
      },
      {
        title: "",
        img: "http://scrolly.xyz/online/refer.png",
        alt: "Progress Icon",
        description: "",
        buttonText: "Get my Link",
        link: "referral",
      },
    ]);

    // Function to determine if a link is external
    const isExternalLink = (link) => {
      return link.startsWith("http");
    };

    const { address } = useEthers(); // Get the MetaMask address
    const userStore = useUserStore(); // Access user store for domain info
    const toast = useToast(); // Initialize toast notifications

    // Determine whether to use the Scrolly domain or MetaMask address
    const getDomainNameOrAddress = () => {
      if (userStore.getDefaultDomain) {
        return getTextWithoutBlankCharacters(userStore.getDefaultDomain);
      }
      return address;
    };

    // Generate the referral link with the user's domain or address
    const getReferralLink = () => {
      const url = new URL(window.location.href);
      url.searchParams.set("ref", getDomainNameOrAddress());
      return url.toString();
    };

    // Copy the referral link to the clipboard and show a success toast
    const copyReferralLink = () => {
      navigator.clipboard.writeText(getReferralLink());
      toast("Referral link copied to your clipboard!", { type: "success" });
    };

    return {
      Navigation,
      slides,
      isExternalLink,
      copyReferralLink,
    };
  },
};
</script>

<style scoped>
.get-started-carousel {
  text-align: center;
  padding: 20px;
}

.main-swiper {
  margin-bottom: 20px;
  width: 100%;
  margin: 0 auto;
}

.slide-content {
  position: relative;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
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
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overlay h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: white;
}

.overlay p {
  font-size: 1.2em;
  margin-bottom: 15px;
  color: white;
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

/* Custom styles */
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
