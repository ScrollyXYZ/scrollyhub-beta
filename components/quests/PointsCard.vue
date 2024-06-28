<template>
  <div class="points-display animate__animated animate__fadeInDown">
    <div :class="['points-card', { 'dark-mode': isDarkMode }]">
      <div class="mappy-points-header">
        <h2 class="mappy-point">Mappy Points</h2>
      </div>
      <p>
        {{ activityPoints }}
        <img
          src="@/assets/img/icon/mappy_icon.png"
          alt="Mappy Points"
          class="mappy-icon"
        />
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useThemeStore } from "~/store/theme";

export default {
  props: {
    activityPoints: Number,
  },
  setup() {
    const themeStore = useThemeStore();
    const isDarkMode = computed(() => themeStore.getIsDarkMode);

    return {
      isDarkMode,
    };
  },
};
</script>

<style scoped>
.points-display {
  text-align: center;
}

.points-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.points-card.dark-mode {
  background: rgba(51, 51, 51, 0.9);
  color: #fff;
}

.mappy-points-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.mappy-icon {
  width: 24px;
  height: 24px;
  margin-left: 10px;
}

.mappy-point {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.points-card.dark-mode .mappy-point {
  color: #fff;
}

.points-card p {
  margin: 0;
  font-size: 1em;
  font-weight: bold;
}
</style>
