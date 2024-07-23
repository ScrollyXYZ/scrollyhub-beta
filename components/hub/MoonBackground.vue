<template>
  <div class="background-container">
    <img
      ref="backgroundImage"
      :src="fullImageUrl"
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
      baseUrl: useRuntimeConfig().public.r2BaseUrl,
      imagePath: "/backgroundhub.jpg",
    };
  },
  computed: {
    fullImageUrl() {
      return `${this.baseUrl}${this.imagePath}`;
    },
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
