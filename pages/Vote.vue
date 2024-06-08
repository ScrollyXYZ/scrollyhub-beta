<template>
  <div>
    <VotingComponent :proposalId="$route.query.id" />
    <ChatFeed
      v-if="true"
      class="mt-3 scroll-500"
      :orbisContext="'vote:' + $route.query.id"
    />
  </div>
</template>

<script>
import VotingComponent from "~/components/VotingComponent.vue";
import ChatFeed from "~/components/chat/ChatFeed.vue";

export default {
  components: {
    VotingComponent,
    ChatFeed,
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
