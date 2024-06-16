<template>
  <div class="badge-tiers">
    <div class="tier-cards">
      <div class="tier-card" v-for="tier in badgeTiers" :key="tier.id">
        <img :src="tier.image" :alt="`Tier ${tier.level} Badge`" />
        <p>Tier {{ tier.level }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BadgeTiers",
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
};
</script>

<style scoped>
.badge-tiers {
  text-align: center;
  padding: 20px;
}

.badge-tiers h2 {
  font-size: 1.8em;
  margin-bottom: 20px;
  color: #333;
}

.tier-cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.tier-card {
  text-align: center;
  padding: 20px;
  margin: 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.tier-card:hover {
  transform: scale(1.05);
}

.tier-card img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tier-card p {
  font-size: 1.2em;
  color: #666;
}
</style>
