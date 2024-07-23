<template>
  <div class="background-container">
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
    <img
      ref="backgroundImage"
      :src="fullImageUrl"
      alt="Background"
      class="background-image"
      v-if="!videoLoaded"
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
      baseUrl: useRuntimeConfig().public.r2BaseUrl,
      videoPath: "/backgroundnft1.mp4",
      imagePath: "/backgroundnft.png",
    };
  },
  computed: {
    fullVideoUrl() {
      return `${this.baseUrl}${this.videoPath}`;
    },
    fullImageUrl() {
      return `${this.baseUrl}${this.imagePath}`;
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
    this.$refs.backgroundVideo.playbackRate = 0.4;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
