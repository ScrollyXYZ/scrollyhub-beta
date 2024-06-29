<template>
  <div class="empty-component"></div>
</template>

<script>
export default {
  name: "EmptyComponent",
};
</script>

<style scoped>
.empty-component {
  width: 400px; /* Adjust the width as needed */
  height: 600px; /* Adjust the height as needed */
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.dark-mode .empty-component {
  background: rgba(51, 51, 51, 0.5);
}
</style>
