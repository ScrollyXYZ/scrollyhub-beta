<template>
  <span class="user-label">
    <slot></slot>
    <span v-if="isAdmin" class="badge admin-badge">Admin</span>
    <span v-if="userTitle && !isAdmin" class="badge title-badge">{{
      userTitle
    }}</span>
  </span>
</template>

<script>
const adminDomains = new Set([
  "scrolly",
  "scrolly.scrolly",
  // add domains names there
]);

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
      isAdmin: false,
    };
  },
  watch: {
    domain: {
      immediate: true,
      handler(newDomain) {
        this.checkIfAdmin(newDomain);
      },
    },
  },
  methods: {
    checkIfAdmin(domain) {
      this.isAdmin = adminDomains.has(domain.toLowerCase());
      if (!this.isAdmin) {
        this.fetchUserTitle();
      }
    },
    async fetchUserTitle() {
      try {
        const response = await fetch(
          `https://leaderboard-scrolly.vercel.app/rank/${this.address}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
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
    this.checkIfAdmin(this.domain);
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
