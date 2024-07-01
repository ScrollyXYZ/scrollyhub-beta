<template>
  <div
    class="quest-card"
    :class="['quest-card', questStatusClasses, { 'dark-mode': isDarkMode }]"
    @click="quest.tbd ? null : showDetails(quest)"
  >
    <div class="quest-card-inner">
      <div class="quest-card-image">
        <img :src="quest.image" alt="Quest Image" />
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
      return this.quest.validated;
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

.quest-card-image img {
  width: 100%;
  height: auto;
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
