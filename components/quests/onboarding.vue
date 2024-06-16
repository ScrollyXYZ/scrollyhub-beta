<template>
  <div class="get-started-carousel">
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      navigation
      pagination
    >
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 1: Create your Scrolly Domain</h2>
          <img src="https://scrolly.xyz/icons/wallet.png" alt="Wallet Icon" />
          <p>
            Join the hub and share with more than +1000 scrollies aroudn the
            world
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 2: Create your Scrolly Profile</h2>
          <img
            src="https://scrolly.xyz/icons/activities.png"
            alt="Activities Icon"
          />
          <p>Add your picture and get onboard with social features.</p>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 3: Participate on Contests & Quests to earn Mappy Points</h2>
          <img
            src="https://scrolly.xyz/icons/progress.png"
            alt="Progress Icon"
          />
          <p>Track your progress and earn rewards.</p>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>
            Step 4: Earn more Mappy Points with your On-Chain activities on the
            hub
          </h2>
          <img
            src="https://scrolly.xyz/icons/progress.png"
            alt="Progress Icon"
          />
          <p>
            Each wei used on Scrollyverse give you some passive Mappy Points
            rewards.
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 5: Refers your friends and get some rewards</h2>
          <img
            src="https://scrolly.xyz/icons/progress.png"
            alt="Progress Icon"
          />
          <p>Earn some Mappy Points & ETH for their activites on the hub.</p>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 6: Refers your friends and get some rewards</h2>
          <img
            src="https://scrolly.xyz/icons/progress.png"
            alt="Progress Icon"
          />
          <p>Earn some Mappy Points & ETH for their activites on the hub.</p>
        </div>
      </SwiperSlide>
    </Swiper>
    <button class="claim-button" @click="navigateToClaim">Claim Badge</button>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Pagination } from "swiper/modules";

export default {
  name: "GetStartedCarousel",
  methods: {
    navigateToClaim() {
      this.$router.push("/pages/badge.vue");
    },
  },
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      Navigation,
      Pagination,
    };
  },
};
</script>

<style scoped>
.get-started-carousel {
  text-align: center;
  padding: 20px;
}

.slide-content {
  text-align: center;
  padding: 20px;
}

.slide-content img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.claim-button {
  margin-top: 20px;
  padding: 12px 25px;
  border: none;
  border-radius: 25px;
  background-color: var(--secondary-color);
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.claim-button:hover {
  background-color: var(--primary-color);
  transform: scale(1.05);
}
</style>
