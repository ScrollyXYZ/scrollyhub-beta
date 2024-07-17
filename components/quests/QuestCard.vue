<template>
  <div
    class="quest-card"
    :class="['quest-card', questStatusClasses, { 'dark-mode': isDarkMode }]"
    @click="quest.tbd ? null : showDetails(quest)"
  >
    <div class="quest-card-inner">
      <div class="quest-card-image-container">
        <img :src="quest.image" alt="Quest Image" class="quest-card-image" />
        <div v-if="quest.id === 7" class="quest-progress-overlay">
          <div
            v-for="i in 7"
            :key="i"
            :class="['quest-progress-part', { hidden: i <= quest.claimCount }]"
          ></div>
        </div>
      </div>
      <div class="quest-card-info">
        <h3 class="quest-card-title">{{ quest.title }}</h3>
        <div class="quest-card-points-display">
          <img
            src="~/assets/img/icon/mappy_icon.png"
            alt="Mappy Points"
            class="quest-card-mappy-icon"
          />
          <span class="quest-card-points-text">{{ quest.points }} MP</span>
        </div>
        <div
          v-if="quest.id === 7 && quest.claimCount !== undefined"
          class="quest-progress"
        >
          <p>{{ quest.claimCount }} / 7 days claimed</p>
          <p v-if="timeRemaining > 0">
            Next claim in: {{ timeRemaining }} hours
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useQuestStore } from "~/store/questStore";

export default {
  props: {
    quest: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      timeRemaining: 0,
    };
  },
  computed: {
    ...mapState(useQuestStore, ["eligibilityStatus", "claimStatus"]),
    isEligible() {
      return (
        this.quest.functions &&
        this.quest.eligible !== null &&
        this.quest.eligible === true
      );
    },
    hasUserClaimed() {
      return (
        this.quest.validated ||
        (this.quest.claimCount && this.quest.claimCount >= 7)
      );
    },
    questStatusClasses() {
      return {
        "quest-card-claimed": this.hasUserClaimed,
        "quest-card-claimable": !this.quest.validated && this.isEligible,
        "quest-card-not-claimable":
          !this.quest.validated && !this.isEligible && !this.quest.ended,
        "quest-card-greyed": this.quest.tbd,
      };
    },
  },
  methods: {
    showDetails(quest) {
      this.$emit("showDetails", quest);
    },
    calculateTimeRemaining() {
      const currentTime = Math.floor(Date.now() / 1000);
      const nextClaimTime = this.quest.lastClaimTime + 86400;
      const remainingTime = nextClaimTime - currentTime;
      if (remainingTime > 0) {
        this.timeRemaining = Math.ceil(remainingTime / 3600); // Convert seconds to hours
        console.log(
          `Time remaining for next claim: ${this.timeRemaining} hours`,
        );
      } else {
        this.timeRemaining = 0;
      }
    },
  },
  mounted() {
    this.calculateTimeRemaining();
  },
  watch: {
    quest: {
      handler(newQuest) {
        this.calculateTimeRemaining();
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style scoped>
.quest-card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  display: inline-block;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s,
    width 0.3s,
    height 0.3s;
  padding: 10px;
  width: 150px;
  height: 150px;
  position: relative;
  background: var(--quest-card-bg);
  color: var(--quest-card-text);
}

.quest-card:hover {
  transform: scale(1.2);
  z-index: 10;
}

.quest-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
}

.quest-card-image-container {
  position: relative;
}

.quest-card-image {
  width: 100%;
  height: auto;
}

.quest-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 1fr;
}

.quest-progress-part {
  background: rgba(0, 0, 0, 0.8);
}

.quest-progress-part.hidden {
  background: transparent;
}

.quest-card-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.quest-card:hover .quest-card-info {
  opacity: 1;
  z-index: 5;
}

.quest-card-title {
  margin: 0;
  font-size: 1.2em;
}

.quest-card-points-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quest-card-mappy-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.quest-card-points-text {
  font-size: 1.1em;
}

.quest-card-claimed {
  border: 3px solid green !important;
}

.quest-card-claimable {
  border: 3px solid orange !important;
}

.quest-card-not-claimable {
  border: 3px solid red !important;
}

.quest-card-greyed {
  filter: grayscale(100%);
}

.quest-card-badge-status {
  font-size: 0.8em;
  color: #4caf50;
}

/* Light Mode Styles */
body.light-mode .quest-card {
  --quest-card-bg: #ffffff;
  --quest-card-text: #000;
  background: var(--quest-card-bg);
  color: var(--quest-card-text);
}

body.light-mode .quest-card:hover .quest-card-info {
  background: rgba(0, 0, 0, 0.7);
}

body.light-mode .quest-card-title,
body.light-mode .quest-card-points-text {
  color: #fff;
}

/* Dark Mode Styles */
body:not(.light-mode) .quest-card {
  --quest-card-bg: #000000;
  --quest-card-text: #fff;
  background: var(--quest-card-bg);
  color: var(--quest-card-text);
}

body:not(.light-mode) .quest-card:hover .quest-card-info {
  background: rgba(255, 255, 255, 0.7);
}

body:not(.light-mode) .quest-card-title,
body:not(.light-mode) .quest-card-points-text {
  color: #000;
}
</style>
