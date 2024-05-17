<template>
  <div class="container">
    <h1>404 - Page non trouvée</h1>
    <p>La page que vous recherchez n'existe pas.</p>
    <nuxt-link to="/">Retour à l'accueil</nuxt-link>
  </div>
</template>

<script>
export default {
  layout: "default",
  props: ["error"],
};
</script>

<style scoped>
.container {
  text-align: center;
  margin-top: 50px;
}
h1 {
  font-size: 3em;
  margin-bottom: 20px;
}
</style>
