<template>
  <div class="badge-sticker-container">
    <div class="tooltip-container">
      <img src="/skelly/tooltip.svg" alt="Tooltip" class="tooltip-img" />
      <span class="rainbow-text">You are eligible to mint the Scrolly Badge</span>
      <NuxtLink to="/badge">
        <button class="mint-button">Mint Badge</button>
      </NuxtLink>
    </div>
    <NuxtLink to="/badge">
      <img src="/skelly/sticker.svg" alt="Badge Sticker" class="img-fluid" />
    </NuxtLink>
  </div>
</template>

<script>
export default {
  name: "BadgeSticker",
}
</script>

<style>
.badge-sticker-container {
  padding: 10px;
  height: auto;
  width: 300px;
  bottom: 10px;
  right: 20px;
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
}

.tooltip-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-direction: column;
}

.rainbow-text {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
  background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rainbow 5s ease-in-out infinite;
  width: 100%; 
  height: auto; 
  box-sizing: border-box; 
  padding: 5px 10px; 
}


@keyframes rainbow {
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.mint-button {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 10px;
  background-color: var(--bs-purple);
  color: white;
  cursor: pointer;
  width: 90%; 
  height: auto; 
  box-sizing: border-box; 
}

/* Mobile only */
@media only screen and (max-width: 767px) {
  .badge-sticker-container {
    padding: 5px;
    height: auto;
    width: 100px;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
  }
}
</style>
