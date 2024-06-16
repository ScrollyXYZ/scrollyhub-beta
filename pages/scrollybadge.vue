<template>
  <div class="scrolly-page">
    <div class="header-section">
      <h1>Introduction to Scrolly Badges</h1>
      <p>
        Will reward users who actively participate in the Scrolly Community
        staking with a special badge to acknowledge their contribution. These
        badges represent Scrolly's commitment to community engagement and
        rewarding early acive community.
      </p>
    </div>

    <div class="badges-section">
      <div class="badge-card">
        <img
          src="https://scrolly.xyz/badges/1.png"
          alt="Pioneering Users Badge"
        />
        <div class="badge-description">
          <h2>Pioneering Users Badge</h2>
          <p>
            Awarded to pioneering users for their significant contributions to
            the Scrolly's Community. This badge recognizes their dedication and
            active involvement in community development.
          </p>
        </div>
      </div>

      <div class="badge-card">
        <img
          src="https://scrolly.xyz/badges/1.png"
          alt="Active Participants Badge"
        />
        <div class="badge-description">
          <h2>Active Participants Badge</h2>
          <p>
            Given to active participants for their consistent support and
            valuable contributions to Scrolly Community. This badge acknowledges
            their ongoing engagement and efforts within the community.
          </p>
        </div>
      </div>
    </div>

    <div class="tiers-section">
      <h2>Badge Tiers</h2>
      <div class="tier-cards">
        <div class="tier-card" v-for="tier in badgeTiers" :key="tier.id">
          <img :src="tier.image" :alt="`Tier ${tier.level} Badge`" />
          <p>Tier {{ tier.level }}</p>
        </div>
      </div>
    </div>

    <div class="event-rules">
      <button @click="showEventRules">Event Rules</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScrollyPage",
  data() {
    return {
      badgeTiers: [
        { id: 1, level: 1, image: "https://scrolly.xyz/badges/1.png" },
        { id: 2, level: 2, image: "https://scrolly.xyz/badges/2.png" },
        { id: 3, level: 3, image: "https://scrolly.xyz/badges/3.png" },
        { id: 4, level: 4, image: "https://scrolly.xyz/badges/4.png" },
        { id: 5, level: 5, image: "https://scrolly.xyz/badges/5.png" },
        { id: 6, level: 6, image: "https://scrolly.xyz/badges/6.png" },
      ],
    };
  },
  methods: {
    showEventRules() {
      // Logic to show event rules
    },
  },
};
</script>

<style scoped>
@import "animate.css";

:root {
  --primary-color: #333;
  --secondary-color: #4caf50;
  --background-color: #f5f5f5;
  --text-color: #333;
  --border-color: #ddd;
}

.scrolly-page {
  min-height: 100vh;
  padding: 20px;
  background-color: var(--background-color);
  text-align: center;
}

.header-section {
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 2em;
  color: var(--primary-color);
}

.header-section p {
  font-size: 1.2em;
  color: var(--text-color);
}

.badges-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}

.badge-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 45%;
}

.badge-card img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.badge-card .badge-description h2 {
  font-size: 1.5em;
  color: var(--primary-color);
}

.badge-card .badge-description p {
  font-size: 1em;
  color: var(--text-color);
}

.tiers-section {
  margin-bottom: 40px;
}

.tiers-section h2 {
  font-size: 1.8em;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.tier-cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.tier-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  width: 100px;
  text-align: center;
}

.tier-card img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.tier-card p {
  font-size: 1em;
  color: var(--text-color);
}

.event-rules {
  margin-top: 40px;
}

.event-rules button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--secondary-color);
  color: white;
  font-size: 1em;
  cursor: pointer;
}

.event-rules button:hover {
  background-color: var(--primary-color);
}
</style>
