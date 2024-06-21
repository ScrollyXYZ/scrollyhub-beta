<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content animate__animated animate__zoomIn" @click.stop>
      <h5>Quest: {{ quest.title }} Details</h5>
      <div class="modal-body">
        <p>
          <span :class="questStatusClass"></span>
          Status: {{ questStatusText }}
        </p>
        <p v-if="quest.validated && quest.ended">
          Congratulations! You have successfully claimed
          {{ quest.points }} Mappy Points and the quest has ended!
        </p>
        <p v-else-if="quest.validated">
          Congratulations! You have successfully claimed
          {{ quest.points }} Mappy Points!
        </p>
        <p>Max points: {{ quest.points }} MP</p>
        <p>Description: {{ quest.description }}</p>
        <div v-if="quest.contractAddress && !quest.validated && !quest.ended">
          <p v-if="claimStatus">You have already claimed this reward.</p>
          <p v-else-if="eligibilityStatus">
            You are eligible to claim your reward!
            <button class="claim-button" @click="claim">Claim Reward</button>
          </p>
          <p v-else>You are not eligible to claim this reward yet.</p>
        </div>
        <NuxtLink
          v-if="quest.id === 1"
          to="https://sns.scrolly.xyz/#/"
          target="_blank"
        >
          Mint your domain
        </NuxtLink>
      </div>
      <button @click="close" class="modal-close-button">Close</button>
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
      default: () => ({}),
    },
  },
  computed: {
    ...mapState(useQuestStore, ["claimStatus", "eligibilityStatus"]),
    questStatusClass() {
      if (!this.quest) return "";
      return {
        "validated-check": this.quest.validated && !this.quest.ended,
        "not-validated-check": !this.quest.validated && !this.quest.ended,
        "ended-check": this.quest.ended && !this.quest.validated,
        "validated-ended-check": this.quest.validated && this.quest.ended,
      };
    },
    questStatusText() {
      if (!this.quest) return "";
      if (this.quest.validated && this.quest.ended)
        return "Validated + Quest Ended";
      if (this.quest.validated) return "Validated";
      if (this.quest.ended) return "Quest Ended";
      return "Not validated";
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    claim() {
      this.$emit("claim");
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
  max-width: 400px;
  width: 80%;
  z-index: 2500;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-body {
  text-align: left;
}

.validated-check::before {
  content: "✔️";
  color: green;
}

.not-validated-check::before {
  content: "❌";
  color: red;
}

.ended-check::before {
  content: "⌛";
  color: #ff9800;
}

.validated-ended-check::before {
  content: "✔️⌛";
  color: green;
}

.modal-close-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.modal-close-button:hover {
  background-color: #555;
}
</style>
