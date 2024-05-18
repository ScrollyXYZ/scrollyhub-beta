<template>
  <span class="user-label">
    <slot></slot>
    <span v-if="isAdmin" class="badge admin-badge">Admin</span>
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
      console.log("Checking address:", this.address);
      console.log("Checking domain:", this.domain);
      console.log("Admin addresses:", adminAddresses);
      console.log("Admin domains:", adminDomains);
      return (
        adminAddresses.includes(this.address.toLowerCase()) ||
        adminDomains.includes(this.domain.toLowerCase())
      );
    },
  },
};
</script>

<style scoped>
.user-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.admin-badge {
  font-size: 0.75em;
  padding: 0.2em 0.5em;
  background-color: red;
  color: white;
}
</style>
