<template>
  <div class="badge-sticker-container">
    <div class="tooltip-container">
      <img src="/skelly/tooltip.svg" alt="Tooltip" class="tooltip-img" />
      <span class="rainbow-text"
        >You are eligible to mint the Scrolly Badge</span
      >
    </div>
    <NuxtLink to="/badge">
      <img src="/skelly/sticker.svg" alt="Badge Sticker" class="img-fluid" />
    </NuxtLink>
  </div>
</template>

<script>
export default {
  name: "BadgeSticker",
};
</script>

<style>
.badge-sticker-container {
  padding: 10px;
  height: 400px;
  width: 400px;
}

/* Mobile only */
@media only screen and (max-width: 767px) {
  .badge-sticker-container {
    padding: 5px;
    height: 100px;
    width: 100px;
  }
}
</style>
