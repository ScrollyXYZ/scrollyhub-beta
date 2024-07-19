<template>
  <div class="background-container">
    <img
      ref="backgroundImage"
      src="@/assets/img/badge/backgroundquest.png"
      alt="Background"
      class="background-image"
    />
    <div class="overlay" v-if="isDarkMode"></div>
  </div>
</template>

<script>
export default {
  name: "MoonBackground",
  props: {
    isDarkMode: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      videoLoaded: false,
    };
  },
  methods: {
    onVideoLoad() {
      this.videoLoaded = true;
      this.$refs.backgroundImage.style.display = "none";
    },
  },
  mounted() {
    // Removed the video playbackRate setting as there is no video anymore
  },
};
</script>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  z-index: -1;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -2;
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0.5;
  z-index: -1;
}
</style>
