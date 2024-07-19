<template>
  <div class="background-container">
    <img
      ref="backgroundImage"
      src="@/assets/img/badge/backgroundquest.png"
      alt="Background"
      class="background-image"
    />
    <video
      ref="backgroundVideo"
      autoplay
      muted
      loop
      playsinline
      class="background-video"
      @canplaythrough="onVideoLoad"
    >
      <source :src="fullVideoUrl" type="video/mp4" />
      Your browser doesn't support video format.
    </video>
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
      baseVideoUrl: useRuntimeConfig().public.r2BaseUrl,
      videoPath: "/backgroundquest.mp4",
    };
  },
  computed: {
    fullVideoUrl() {
      return `${this.baseVideoUrl}${this.videoPath}`;
    },
  },
  methods: {
    onVideoLoad() {
      this.videoLoaded = true;
      if (this.$refs.backgroundImage) {
        this.$refs.backgroundImage.style.display = "none";
      }
    },
  },
  mounted() {
    this.$refs.backgroundVideo.playbackRate = 1;
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
.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: -3;
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
