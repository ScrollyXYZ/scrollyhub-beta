<template>
  <div>
    <Head>
      <Meta
        name="description"
        :content="'Check out this chat post on ' + $config.projectName + '!'"
      />
      <Meta
        property="og:image"
        :content="$config.projectUrl + $config.previewImagePost"
      />
      <Meta
        property="og:description"
        :content="'Check out this chat post on ' + $config.projectName + '!'"
      />
      <Meta
        name="twitter:image"
        :content="$config.projectUrl + $config.previewImagePost"
      />
      <Meta
        name="twitter:description"
        :content="'Check out this chat post on ' + $config.projectName + '!'"
      />
    </Head>

    <button @click="goBack" class="back-button">
      <i class="fas fa-arrow-left"></i>
    </button>

    <ChatPost
      class="m-4"
      v-if="masterPost"
      :post="masterPost"
      :orbisContext="getOrbisContext"
    />
    <ChatPost v-if="post" :post="post" :orbisContext="getOrbisContext" />
    <ChatFeed
      v-if="post"
      :id="post.stream_id"
      :master="post.master"
      :masterPost="post"
      :orbisContext="getOrbisContext"
    />
  </div>
</template>

<script>
import ChatPost from "~/components/chat/ChatPost.vue";
import ChatFeed from "~/components/chat/ChatFeed.vue";
import { useToast } from "vue-toastification/dist/index.mjs";

export default {
  data() {
    return {
      hasMaster: false,
      masterPost: null,
      post: null,
      replyNotMaster: false,
    };
  },

  components: {
    ChatFeed,
    ChatPost,
  },

  created() {
    this.getPostObject();
  },

  computed: {
    getOrbisContext() {
      if (this.post?.context) {
        return this.post.context;
      } else if (this.post?.content.context) {
        return this.post.content.context;
      } else if (this.post?.context_details.context_id) {
        return this.post.context_details.context_id;
      } else {
        if (this.$config.orbisTest) {
          return this.$config.orbisTestContext;
        } else {
          return this.$config.chatChannels.general;
        }
      }
    },

    getPostAuthor() {
      if (this.post) {
        return this.post.creator_details.metadata.address;
      }

      return null;
    },

    getQueryId() {
      return this.route.query.id;
    },
  },

  methods: {
    async getPostObject() {
      this.post = null;
      this.masterPost = null;
      this.hasMaster = false;
      this.replyNotMaster = false;

      let { data, error } = await this.$orbis.getPost(this.route.query.id);

      this.post = data;

      if (error) {
        console.log("Orbis error");
        console.log(error);
        this.toast("Orbis error", { type: "error" });
        this.toast(error, { type: "error" });
      } else {
        if (this.post.master) {
          // fetch master post
          this.hasMaster = true;

          if (this.post.master !== this.post.reply_to) {
            this.replyNotMaster = true;
          }

          let { data, error } = await this.$orbis.getPost(this.post.master);

          this.masterPost = data;

          if (error) {
            console.log("Orbis error");
            console.log(error);
            this.toast("Orbis error", { type: "error" });
            this.toast(error, { type: "error" });
          }
        }
      }
    },

    goBack() {
      this.$router.go(-1);
    },
  },

  setup() {
    const route = useRoute();
    const toast = useToast();

    return {
      route,
      toast,
    };
  },

  watch: {
    getQueryId(val, oldVal) {
      // refresh post object if id in query has changed
      this.getPostObject();
    },
  },
};
</script>

<style scoped>
.back-button {
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1.5rem;
  margin: 1rem;
}
</style>
