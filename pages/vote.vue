<template>
  <div>
    <VotingComponent v-if="proposalId" :proposalId="proposalId" />
    <ChatFeed
      v-if="proposalId"
      class="mt-3 scroll-500"
      :orbisContext="'vote:' + proposalId"
    />
    <div v-else>
      <p>Invalid or missing proposal ID. Redirecting...</p>
    </div>
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
  data() {
    return {
      proposalId: this.$route.query.id,
    };
  },
  mounted() {
    if (!this.proposalId) {
      this.$router.push("/vote/ProposalsList");
    } else {
      console.log("Proposal ID:", this.proposalId);
    }
  },
};
</script>
