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
  padding: 20px 40px;
}

.header-section {
  width: 100%;
  text-align: center;
  padding: 40px 20px;
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
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header-section h1 {
  font-size: 3.5em;
  color: var(--primary-color);
  font-weight: bold;
  margin: 0;
  padding: 0;
  animation: fadeInDown 2s;
}

.header-section p {
  font-size: 1.5em;
  color: var(--text-color);
  margin: 20px 0 0;
  animation: fadeInUp 2s;
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
    font-size: 2.5em;
  }

  .header-section p {
    font-size: 1.2em;
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
