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
        <div v-if="quest.id === 7">
          <p>Days claimed: {{ quest.claimCount }} / 7</p>
          <p v-if="timeRemaining > 0">
            Next claim available in: {{ formattedTimeRemaining }}
          </p>
          <div v-if="loadingStatus">Loading status...</div>
          <div v-else>
            <p v-if="quest.claimCount >= 7">
              You have completed this quest by claiming 7 days!
            </p>
            <p v-else-if="quest.claimStatus && timeRemaining > 0">
              You have claimed today. Come back after the cooldown period.
            </p>
            <p v-else-if="quest.eligible">
              You are eligible to claim your reward today!
            </p>
            <p v-else>You are not eligible to claim this reward yet.</p>
          </div>
        </div>
        <div v-if="quest.id === 1">
          <button
            class="nuxt-link-button"
            :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
          >
            <NuxtLink to="https://sns.scrolly.xyz/#/" target="_blank"
              >Mint my Scrolly Domains</NuxtLink
            >
          </button>
        </div>
        <div v-if="quest.id === 5">
          <button
            class="nuxt-link-button"
            :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
          >
            <NuxtLink
              to="https://app.zprotocol.xyz/liquidity/add/0x5300000000000000000000000000000000000004/0xb65aD8d81d1E4Cb2975352338805AF6e39BA8Be8"
              target="_blank"
              >Add Liquidity on Zprotocol</NuxtLink
            >
          </button>
        </div>
        <div v-if="quest.id === 4">
          <button
            class="nuxt-link-button"
            :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
          >
            <NuxtLink to="/nft/create">Create my collection</NuxtLink>
          </button>
        </div>
        <div v-if="quest.id === 7">
          <button
            class="nuxt-link-button"
            :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }"
          >
            <NuxtLink to="https://app.zprotocol.xyz/earn/pool/9" target="_blank"
              >Access to the Scrolly Pool
            </NuxtLink>
          </button>
        </div>
      </div>
      <div class="button-group">
        <button
          v-if="
            !loadingStatus &&
            !quest.validated &&
            quest.eligible &&
            !quest.ended &&
            (quest.id !== 7 || quest.claimCount < 7)
          "
          :class="{
            'quest-dm-claim-button': true,
            disabled: timeRemaining > 0,
          }"
          :disabled="timeRemaining > 0"
          @click="claim"
        >
          <span v-if="timeRemaining > 0">{{ formattedTimeRemaining }}</span>
          <span v-else>Claim Reward</span>
        </button>
        <button @click="close" class="quest-dm-modal-close-button">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watchEffect } from "vue";
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
    const timeRemaining = ref(0);

    const calculateTimeRemaining = () => {
      if (props.quest.id === 7 && props.quest.lastClaimTime) {
        const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
        const nextClaimTime = parseInt(props.quest.lastClaimTime) + 86400; // Add 24 hours to the last claim time
        const remainingTime = nextClaimTime - currentTime;
        if (remainingTime > 0) {
          timeRemaining.value = remainingTime;
        } else {
          timeRemaining.value = 0;
        }
      }
    };

    const formattedTimeRemaining = computed(() => {
      const hours = Math.floor(timeRemaining.value / 3600);
      const minutes = Math.floor((timeRemaining.value % 3600) / 60);
      return `${hours}h ${minutes}m`;
    });

    watchEffect(() => {
      calculateTimeRemaining();
      loadingStatus.value = false;
    });

    return {
      isDarkMode,
      questStore,
      loadingStatus,
      timeRemaining,
      formattedTimeRemaining,
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
  background-color: #888888; /* Grey */
  color: #ffffff;
}

.quest-dm-modal-close-button.light-mode:hover {
  background-color: #aaaaaa; /* Light grey */
}

.quest-dm-modal-close-button.dark-mode {
  background-color: #888888; /* Grey */
  color: #ffffff;
}

.quest-dm-modal-close-button.dark-mode:hover {
  background-color: #aaaaaa; /* Light grey */
}

.quest-dm-claim-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.quest-dm-claim-button.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.quest-dm-claim-button:hover:not(.disabled) {
  background-color: #45a049;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.nuxt-link-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
}

.nuxt-link-button.light-mode {
  background-color: #007bff;
}

.nuxt-link-button.dark-mode {
  background-color: #375a7f;
}

.nuxt-link-button a {
  color: white;
  text-decoration: none;
}

.nuxt-link-button.light-mode:hover {
  background-color: #0056b3;
}

.nuxt-link-button.dark-mode:hover {
  background-color: #23395d;
}

/* Responsive Styles for Mobile */
@media (max-width: 767px) {
  .quest-dm-modal-content {
    width: 90%; /* Increase width for mobile screens */
  }
  .quest-dm-modal-close-button,
  .quest-dm-claim-button {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
