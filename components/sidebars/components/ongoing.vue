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
            <template v-else-if="slide.link.startsWith('#')">
              <button
                type="button"
                class="slide-button"
                data-bs-toggle="modal"
                :data-bs-target="slide.link"
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

    <!-- Modal -->
    <ReferralModal />
  </div>
</template>

<script>
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation } from "swiper/modules";
import ReferralModal from "~/components/referrals/ReferralModal.vue";

export default {
  name: "GetStartedCarousel",
  components: {
    Swiper,
    SwiperSlide,
    ReferralModal,
  },
  setup() {
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
        img: "http://scrolly.xyz/online/vote1.png",
        alt: "Progress Icon",
        description: "",
        buttonText: "Vote",
        link: "/voting?id=1",
      },
      {
        title: "",
        img: "http://scrolly.xyz/online/refer.png",
        alt: "Progress Icon",
        description: "",
        buttonText: "Get my Link",
        link: "#referralModal",
      },
    ]);

    const isExternalLink = (link) => {
      return link.startsWith("http");
    };

    return {
      Navigation,
      slides,
      isExternalLink,
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
