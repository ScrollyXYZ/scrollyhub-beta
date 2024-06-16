<template>
  <div class="scrolly-page">
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
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: #6a11cb; stop-opacity: 1" />
            <stop offset="100%" style="stop-color: #2575fc; stop-opacity: 1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad1)"
          fill-opacity="1"
          d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,213.3C672,203,768,149,864,122.7C960,96,1056,96,1152,101.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </header>

    <main class="main-content">
      <section class="onboarding-section box">
        <h2>Get Started</h2>
        <GetStartedCarousel />
      </section>

      <section class="tiers-section box">
        <h2>Badge Tiers</h2>
        <BadgeTiers />
      </section>
    </main>
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
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

:root {
  --primary-color: #333;
  --secondary-color: #4caf50;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
  --wave-color: #c3cfe2;
}

body {
  font-family: "Roboto", sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.scrolly-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
}

.header-section {
  width: 100%;
  background-color: var(--wave-color);
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 2s;
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
  font-size: 3em;
  color: var(--primary-color);
  font-weight: bold;
  margin: 0;
  padding: 0;
}

.header-section p {
  font-size: 1.2em;
  color: var(--text-color);
  margin: 20px 0 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.box {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  width: 90%;
  max-width: 1000px;
  text-align: center;
  transition: box-shadow 0.3s;
}

.onboarding-section h2,
.tiers-section h2 {
  font-size: 2.2em;
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 20px;
  animation: fadeIn 2s;
}

@media (max-width: 768px) {
  .header-section h1 {
    font-size: 2.2em;
  }

  .header-section p {
    font-size: 1em;
  }

  .box {
    width: 95%;
    padding: 20px;
  }
}

/* Keyframes for animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
