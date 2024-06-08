<template>
  <div>
    <VotingComponent v-if="$route.query.id" :proposalId="$route.query.id" />
    <ChatFeed
      v-if="$route.query.id"
      class="mt-3 scroll-500"
      :orbisContext="'vote:' + $route.query.id"
    />
    <ProposalsList v-else />
  </div>
</template>

<script>
import VotingComponent from "~/components/VotingComponent.vue";
import ChatFeed from "~/components/chat/ChatFeed.vue";
import ProposalsList from "~/pages/vote/ProposalsList.vue";

export default {
  components: {
    VotingComponent,
    ChatFeed,
    ProposalsList,
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
