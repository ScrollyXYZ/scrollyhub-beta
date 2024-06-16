<template>
  <div>
    <header class="header-section">
      <div class="header-content">
        <h1>Introduction to Scrolly Badges</h1>
        <p>
          Rewarding active participants of the Scrolly Community with special
          badges. These badges acknowledge significant contributions and
          represent Scrolly's commitment to community engagement.
        </p>
      </div>
      <svg
        class="header-wave"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#c3cfe2"
          fill-opacity="1"
          d="M0,160L80,165.3C160,171,320,181,480,176C640,171,800,149,960,122.7C1120,96,1280,64,1360,48L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        ></path>
      </svg>
    </header>

    <section class="onboarding-section box">
      <h2>Get Started</h2>
      <GetStartedCarousel />
    </section>

    <section class="tiers-section box">
      <BadgeTiers />
    </section>

    <!-- Other sections -->
  </div>
</template>

<script>
import GetStartedCarousel from "~/components/quests/onboarding.vue";
import BadgeTiers from "~/components/quests/tiers.vue";

export default {
  components: {
    GetStartedCarousel,
    BadgeTiers,
  },
};
</script>

<style scoped>
.header-section {
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 0;
}

.header-section h1 {
  font-size: 2.8em;
  color: var(--primary-color);
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.header-section p {
  font-size: 1.4em;
  color: var(--text-color);
  max-width: 800px;
  margin: 0 auto;
}

.onboarding-section {
  margin-bottom: 40px;
}

.onboarding-section h2 {
  font-size: 2.2em;
  color: var(--primary-color);
  font-weight: bold;
}

.tiers-section {
  margin-bottom: 40px;
}

.tiers-section h2 {
  font-size: 2em;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
