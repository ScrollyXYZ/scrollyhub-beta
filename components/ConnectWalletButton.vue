<template>
  <button
    class="connect-wallet-button"
    data-bs-toggle="modal"
    data-bs-target="#connectModal"
  >
    <i class="bi bi-wallet2"></i>
    {{ btnText }}
  </button>
</template>
<script>
export default {
  name: "ConnectWalletButton",
  props: ["btnText"],
};
</script>
