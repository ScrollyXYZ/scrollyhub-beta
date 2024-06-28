<template>
  <div class="quest-dm-modal-overlay" @click="close">
    <div
      class="quest-dm-modal-content animate__animated animate__zoomIn"
      @click.stop
      :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
    >
      <h5>Quest: {{ quest.title }} Details</h5>
      <div class="quest-dm-modal-body">
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
          <p v-if="loadingStatus">Loading status...</p>
          <div v-else>
            <p v-if="quest.claimStatus">
              You have already claimed this reward.
            </p>
            <p v-else-if="quest.eligible">
              You are eligible to claim your reward!
            </p>
            <p v-else>You are not eligible to claim this reward yet.</p>
          </div>
        </div>
        <NuxtLink
          v-if="quest.id === 1"
          to="https://sns.scrolly.xyz/#/"
          target="_blank"
        >
          Mint your domain
        </NuxtLink>
      </div>
      <div class="button-group">
        <button
          v-if="
            !loadingStatus && !quest.validated && quest.eligible && !quest.ended
          "
          class="quest-dm-claim-button"
          @click="claim"
        >
          Claim Reward
        </button>
        <button @click="close" class="quest-dm-modal-close-button">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useQuestStore } from "~/store/questStore";
import { useThemeStore } from "~/store/theme";

export default {
  props: {
    quest: {
      type: Object,
      required: true,
    },
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const themeStore = useThemeStore();
    const questStore = useQuestStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);
    const loadingStatus = ref(true);

    // Simulate loading state for the eligibility check
    setTimeout(() => {
      loadingStatus.value = false;
    }, 2000); // Replace with actual async call

    return {
      isDarkMode,
      questStore,
      loadingStatus,
    };
  },
  computed: {
    questStatusClass() {
      if (!this.quest) return "";
      return {
        "quest-dm-validated-check": this.quest.validated && !this.quest.ended,
        "quest-dm-not-validated-check":
          !this.quest.validated && !this.quest.ended,
        "quest-dm-ended-check": this.quest.ended && !this.quest.validated,
        "quest-dm-validated-ended-check":
          this.quest.validated && this.quest.ended,
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
    claimStatus() {
      return this.quest.claimStatus;
    },
    eligibilityStatus() {
      return this.quest.eligible;
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
.quest-dm-modal-overlay {
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

.quest-dm-modal-content {
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  width: 80%;
  z-index: 2500;
}

.quest-dm-modal-content.light-mode {
  background-color: #ffffff;
  color: #000;
}

.quest-dm-modal-content.dark-mode {
  background-color: #2c2c2c;
  color: #ffffff;
}

.quest-dm-modal-content h5 {
  margin-top: 0;
  color: inherit;
}

.quest-dm-modal-body {
  text-align: left;
}

.quest-dm-validated-check::before {
  content: "✔️";
  color: green;
}

.quest-dm-not-validated-check::before {
  content: "❌";
  color: red;
}

.quest-dm-ended-check::before {
  content: "⌛";
  color: #ff9800;
}

.quest-dm-validated-ended-check::before {
  content: "✔️⌛";
  color: green;
}

.quest-dm-modal-close-button {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  display: block;
}

.quest-dm-modal-close-button.light-mode {
  background-color: #888888; /* Gris */
  color: #ffffff;
}

.quest-dm-modal-close-button.light-mode:hover {
  background-color: #aaaaaa; /* Gris clair */
}

.quest-dm-modal-close-button.dark-mode {
  background-color: #888888; /* Gris */
  color: #ffffff;
}

.quest-dm-modal-close-button.dark-mode:hover {
  background-color: #aaaaaa; /* Gris clair */
}

.quest-dm-claim-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.quest-dm-claim-button:hover {
  background-color: #45a049;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

/* Responsive Styles for Mobile */
@media (max-width: 767px) {
  .quest-dm-modal-content {
    width: 90%; /* Augmente la largeur pour les écrans mobiles */
  }
  .quest-dm-modal-close-button,
  .quest-dm-claim-button {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
