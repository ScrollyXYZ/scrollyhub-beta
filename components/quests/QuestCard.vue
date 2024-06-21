<template>
  <div
    class="quest-card"
    :class="questStatusClasses"
    @click="quest.tbd ? null : showDetails(quest)"
  >
    <div class="quest-image">
      <img :src="quest.image" alt="Quest Image" />
    </div>
    <div class="quest-info">
      <div class="points-display">
        <img
          src="~/assets/img/icon/mappy_icon.png"
          alt="Mappy Points"
          class="mappy-icon"
        />
        <span class="points-text">{{ quest.points }} MP</span>
      </div>
      <div class="badges">
        <span v-if="quest.validated" class="badge badge-validated"
          >Completed</span
        >
        <span v-if="!quest.validated && quest.ended" class="badge badge-ended"
          >Ended</span
        >
        <span
          v-if="!quest.validated && isEligible"
          class="badge badge-claimable"
          >Claimable</span
        >
        <span
          v-if="!quest.validated && !isEligible && !quest.ended"
          class="badge badge-not-claimable"
          >Not Claimable</span
        >
      </div>
      <span class="quest-status">{{ getQuestStatusText(quest) }}</span>
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
      console.log("eligibilityStatus:", this.eligibilityStatus);
      console.log("claimStatus:", this.claimStatus);
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
    getQuestStatusText(quest) {
      if (!quest) return "";
      if (quest.validated && quest.ended) return "Validated + Quest Ended";
      if (quest.validated) return "Validated";
      if (quest.ended) return "Quest Ended";
      return "Not validated";
    },
    showDetails(quest) {
      this.$emit("showDetails", quest);
    },
  },
};
</script>

<style scoped>
.quest-card {
  border: none; /* Supprimer la bordure par défaut */
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  margin: 20px;
  width: 150px;
  height: 150px;
}

.quest-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
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

.quest-image img {
  width: 100%;
  height: auto;
}

.quest-info {
  padding: 15px;
  text-align: left;
}

.quest-info h3 {
  margin: 0;
  font-size: 1.2em;
}

.quest-info p {
  margin: 5px 0;
  color: #666;
}

.quest-status {
  display: block;
  margin-top: 10px;
  font-size: 0.9em;
  color: #fff;
}

.validated .quest-status {
  color: #4caf50;
}

.notValidated .quest-status {
  color: #f44336;
}

.tbd .quest-status {
  color: #9e9e9e;
}

.ended .quest-status {
  color: #ff9800;
}

.badges {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
  color: #fff;
}

.badge-validated {
  background-color: #4caf50;
}

.badge-ended {
  background-color: #ff9800;
}

.badge-claimable {
  background-color: #00bcd4;
}

.badge-not-claimable {
  background-color: #9e9e9e;
}
</style>
