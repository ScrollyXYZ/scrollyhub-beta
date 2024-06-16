<template>
  <div class="get-started-carousel">
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      navigation
      pagination
      grab-cursor="true"
      class="main-swiper"
    >
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 1: Create Your Scrolly Domain</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Wallet Icon"
          />
          <p>
            Join the hub and share with more than 1,000 scrollies around the
            world.
          </p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step1')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 2: Create Your Scrolly Profile</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Activities Icon"
          />
          <p>Add your picture and get onboard with social features.</p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step2')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 3: Participate in Contests & Quests</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Progress Icon"
          />
          <p>Track your progress and earn Mappy Points as rewards.</p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step3')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 4: Earn More Mappy Points</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Progress Icon"
          />
          <p>
            Earn passive Mappy Points rewards with your on-chain activities on
            the hub.
          </p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step4')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 5: Refer Your Friends</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Progress Icon"
          />
          <p>
            Earn Mappy Points and ETH for your friends' activities on the hub.
          </p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step5')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div class="slide-content">
          <h2>Step 6: Enjoy Your Rewards</h2>
          <img
            src="https://www.dutchfarmint.com/wp-content/uploads/2016/06/720x480.png"
            alt="Progress Icon"
          />
          <p>
            Keep engaging and enjoying the benefits of being part of the Scrolly
            community.
          </p>
          <button
            class="slide-button"
            @click="navigateToLink('https://example.com/step6')"
          >
            Learn More
          </button>
        </div>
      </SwiperSlide>
    </Swiper>

    <button class="claim-button" @click="navigateToClaim">Claim Badge</button>
  </div>
</template>

<script>
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Pagination } from "swiper/modules";

export default {
  name: "GetStartedCarousel",
  setup() {
    return {
      Navigation,
      Pagination,
    };
  },
  methods: {
    navigateToClaim() {
      this.$router.push("/badge");
    },
    navigateToLink(url) {
      window.open(url, "_blank");
    },
  },
  components: {
    Swiper,
    SwiperSlide,
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
  width: 70%; /* Réduit la largeur du composant */
  margin: 0 auto;
}

.slide-content {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.slide-content h2 {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: #333;
}

.slide-content p {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 15px;
}

.slide-content img {
  width: 100%;
  height: auto;
  max-width: 100%;
  margin-bottom: 15px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  margin-bottom: 20px;
}

.slide-button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
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
