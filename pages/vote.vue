<template>
  <div>
    <Head>
      <Title>Vote | {{ $config.projectMetadataTitle }}</Title>
      <Meta
        property="og:title"
        :content="'Vote | ' + $config.projectMetadataTitle"
      />
      <Meta
        name="description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
      <Meta
        property="og:image"
        :content="$config.projectUrl + $config.previewImagePostNft"
      />
      <Meta
        property="og:description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
      <Meta
        name="twitter:image"
        :content="$config.projectUrl + $config.previewImagePostNft"
      />
      <Meta
        name="twitter:description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
    </Head>

    <div v-if="$route.query.id">
      <VotingComponent :proposalId="$route.query.id" />
      <ChatFeed
        class="mt-3 scroll-500"
        :orbisContext="'vote:' + $route.query.id"
      />
    </div>
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
