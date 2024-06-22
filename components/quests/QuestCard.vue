<template>
  <div
    class="quest-card"
    :class="questStatusClasses"
    @click="quest.tbd ? null : showDetails(quest)"
  >
    <div class="quest-card-inner">
      <div class="quest-image">
        <img :src="quest.image" alt="Quest Image" />
      </div>
      <div class="quest-info">
        <h3 class="quest-title">{{ quest.title }}</h3>
        <div class="points-display">
          <img
            src="~/assets/img/icon/mappy_icon.png"
            alt="Mappy Points"
            class="mappy-icon"
          />
          <span class="points-text">{{ quest.points }} MP</span>
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
  },
  computed: {
    ...mapState(useQuestStore, ["eligibilityStatus", "claimStatus"]),
    isEligible() {
      return (
        this.quest.functions &&
        this.eligibilityStatus !== null &&
        this.eligibilityStatus === true
      );
    },
    hasUserClaimed() {
      return this.quest.validated;
    },
    questStatusClasses() {
      return {
        claimed: this.hasUserClaimed,
        claimable: !this.quest.validated && this.isEligible,
        notClaimable:
          !this.quest.validated && !this.isEligible && !this.quest.ended,
        greyed: this.quest.tbd,
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
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  width: 150px;
  height: 150px;
  position: relative;
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

.quest-image img {
  width: 100%;
  height: auto;
}

.quest-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.quest-card:hover .quest-info {
  opacity: 1;
}

.quest-title {
  margin: 0;
  font-size: 1.2em;
  color: #fff;
}

.points-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mappy-icon {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.points-text {
  font-size: 1.1em;
  color: #fff;
}

.claimed {
  border: 3px solid green !important;
}

.claimable {
  border: 3px solid orange !important;
}

.notClaimable {
  border: 3px solid red !important;
}

.greyed {
  filter: grayscale(100%);
}
</style>
