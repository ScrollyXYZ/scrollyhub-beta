<template>
  <span class="user-label">
    <slot></slot>
    <span v-if="isAdmin" class="badge admin-badge">Admin</span>
    <span v-if="userTitle" class="badge title-badge">{{ userTitle }}</span>
  </span>
</template>

<script>
export default {
  name: "UserLabel",
  props: {
    address: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      userTitle: "",
    };
  },
  computed: {
    isAdmin() {
      const adminAddresses = [
        "0x8d534138a47575608a8E11dC279af7dB92e6fB82",
        // Add other admin addresses here
      ];
      const adminDomains = [
        "scrolly",
        "scrolly.scrolly",
        // Add other admin domains here
      ];
      return (
        adminAddresses.includes(this.address.toLowerCase()) ||
        adminDomains.includes(this.domain.toLowerCase())
      );
    },
  },
  methods: {
    async fetchUserTitle() {
      try {
        const response = await fetch(
          `https://leaderboard-scrolly.vercel.app/rank/${this.address}`,
        );
        const data = await response.json();
        if (data && data.title) {
          this.userTitle = data.title;
        }
      } catch (error) {
        console.error("Failed to fetch user title:", error);
      }
    },
  },
  mounted() {
    this.fetchUserTitle();
  },
};
</script>

<style scoped>
.user-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.admin-badge {
  font-size: 0.75em;
  padding: 0.2em 0.5em;
  background-color: #e74c3c;
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.title-badge {
  font-size: 0.75em;
  padding: 0.2em 0.8em;
  background-color: var(--bs-primary);
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
