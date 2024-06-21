<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content animate__animated animate__zoomIn" @click.stop>
      <h5>{{ category.category }} Details</h5>
      <Swiper
        :slides-per-view="1"
        pagination
        navigation
        class="main-swiper"
        @slideChange="updateSlideIndex"
      >
        <SwiperSlide v-for="(quest, index) in category.quests" :key="quest.id">
          <div class="slide-content">
            <div
              class="slide-background"
              :style="{ backgroundImage: `url(${quest.image})` }"
            ></div>
            <div class="overlay">
              <h2 class="quest-title">{{ quest.title }}</h2>
              <p>{{ quest.description }}</p>
              <p>{{ quest.points }} MP</p>
              <p>Status: {{ getQuestStatusText(quest) }}</p>
              <button
                v-if="!quest.validated && eligibilityStatus"
                @click="claimReward(quest)"
              >
                Claim Points
              </button>
              <button
                v-else-if="!quest.validated && !eligibilityStatus"
                @click="refreshQuestStatus(quest)"
              >
                Refresh
              </button>
              <p
                v-if="
                  !quest.validated && !eligibilityStatus && showRefreshWarning
                "
              >
                Please wait 20 seconds before refreshing again.
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div class="slide-indicator">
        Slide {{ currentSlide + 1 }} / {{ category.quests.length }}
      </div>
      <div class="modal-buttons">
        <button @click="refreshAllQuests" class="refresh-button">
          Refresh
        </button>
        <button @click="close" class="modal-close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Navigation, Pagination } from "swiper/modules";
import { mapState } from "pinia";
import { useQuestStore } from "~/store/questStore";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    category: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      lastRefreshTime: null,
      showRefreshWarning: false,
      currentSlide: 0,
    };
  },
  computed: {
    ...mapState(useQuestStore, ["eligibilityStatus", "claimStatus"]),
  },
  methods: {
    getQuestStatusText(quest) {
      if (quest.validated && quest.ended) return "Validated + Quest Ended";
      if (quest.validated) return "Validated";
      if (quest.ended) return "Quest Ended";
      return "Not validated";
    },
    async claimReward(quest) {
      const { contractAddress, functions, points } = quest;
      await this.$emit("claim", quest);
    },
    refreshQuestStatus(quest) {
      const now = new Date().getTime();
      if (this.lastRefreshTime && now - this.lastRefreshTime < 20000) {
        this.showRefreshWarning = true;
        setTimeout(() => (this.showRefreshWarning = false), 2000);
        return;
      }
      this.lastRefreshTime = now;
      this.$emit("refresh", quest);
    },
    refreshAllQuests() {
      this.$emit("refresh");
    },
    close() {
      this.$emit("close");
    },
    updateSlideIndex(swiper) {
      this.currentSlide = swiper.activeIndex;
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--bs-mode);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #333;
  max-width: 800px;
  width: 80%;
  z-index: 2500;
}

.slide-content {
  position: relative;
  text-align: center;
  border-radius: 10px;
  overflow: hidden;
  height: 300px;
  max-width: 100%;
}

.slide-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: -1;
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

.slide-indicator {
  margin-top: 10px;
  font-size: 1em;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.refresh-button,
.modal-close-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.refresh-button:hover,
.modal-close-button:hover {
  background-color: #555;
}
</style>
