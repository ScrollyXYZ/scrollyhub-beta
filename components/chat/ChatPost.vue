<template>
  <div class="post-wrapper" v-if="post">
    <!-- Profile Image Container -->
    <div class="profile-image-container">
      <NuxtLink :to="'/profile/?id=' + String(showDomainOrFullAddress)">
        <ProfileImage
          class="img-fluid rounded-circle"
          :address="authorAddress"
          :domain="authorDomain"
          :image="getOrbisImage"
        />
      </NuxtLink>
    </div>

    <!-- Main Post Content -->
    <div class="card mb-3 border">
      <div class="card-body row">
        <div class="col-12 post-sizing">
          <!-- Post author and timestamp -->
          <p class="card-subtitle mb-2 text-muted">
            <!--<UserLabel :address="authorAddress" :domain="authorDomain"> -->
            <NuxtLink
              class="link-without-color hover-color"
              :to="'/profile/?id=' + String(showDomainOrFullAddress)"
            >
              {{ showDomainOrAddressOrAnon }}
            </NuxtLink>
            <span v-if="post.timestamp">
              ·
              <NuxtLink
                class="link-without-color hover-color"
                :to="'/post/?id=' + post.stream_id"
              >
                {{ timeSince }}
              </NuxtLink>
            </span>
          </p>

          <!-- Post text -->
          <div @click="openPostDetails">
            <div v-if="parsedText.length > postLengthLimit && !showFullText">
              <p
                class="card-text text-break"
                v-html="
                  parsedText
                    .substring(0, postLengthLimit)
                    .replace(/(<br\s*\/?>)*$/g, '') + ' ... '
                "
              ></p>
              <span
                class="cursor-pointer hover-color"
                @click.stop="showFullText = true"
              >
                Read more
              </span>
            </div>
            <p
              v-if="parsedText.length < postLengthLimit || showFullText"
              class="card-text text-break"
              v-html="parsedText"
            ></p>
          </div>

          <!-- link preview -->
          <div v-if="linkPreview?.title" class="row mt-3 mb-3">
            <div class="card col-md-6">
              <a
                target="_blank"
                :href="linkPreview.url"
                class="text-decoration-none text-reset"
              >
                <img :src="linkPreview.image.url" class="card-img-top" />
                <div
                  class="card-body bg-body rounded-bottom-3 border-end border-bottom border-start"
                >
                  <h5 class="card-title text-break">{{ linkPreview.title }}</h5>
                  <p class="card-text text-break text-reset">
                    {{ linkPreview.description }}
                  </p>
                </div>
              </a>
            </div>
          </div>
          <!-- END link preview -->

          <!-- New NFT collection created -->
          <div
            v-if="customDataType === 'nftCollectionCreated' && collection"
            class="row mt-3 mb-3"
          >
            <div class="card col-md-6">
              <NuxtLink
                :to="'/nft/collection?id=' + collection.address"
                class="text-decoration-none text-reset"
              >
                <Image
                  :url="collection?.image"
                  :alt="collection?.name"
                  cls="card-img-top"
                />
                <div
                  class="card-body bg-body rounded-bottom-3 border-end border-bottom border-start"
                >
                  <h5 class="card-title text-break">{{ collection?.name }}</h5>
                  <p
                    v-if="collection?.description"
                    class="card-text text-break text-reset"
                  >
                    {{ getNftCollectionDescription }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
          <!-- New NFT collection created -->

          <!-- Minted Post Image -->
          <div v-if="customDataType === 'mintedPost'" class="row mt-2">
            <div class="col-10 col-sm-8 col-md-4">
              <MintedPostImage :id="getMintedPostTokenId" />
            </div>
          </div>

          <!-- quoted post (replied) -->
          <ChatQuote class="mt-3 mb-3" :post="quotePost" v-if="showQuote" />

          <!-- post actions -->
          <p class="card-subtitle mt-3 text-muted">
            <span>
              <i
                @click="likePost"
                class="cursor-pointer hover-color"
                :class="
                  alreadyLiked ? 'bi bi-heart-fill text-primary' : 'bi bi-heart'
                "
              ></i>
              {{ post.count_likes }}
            </span>

            <NuxtLink
              v-if="!post.master"
              class="ms-3 link-without-color hover-color"
              :to="'/post/?id=' + post.stream_id"
            >
              <i class="bi bi-chat"></i>
              {{ post.count_replies }}
            </NuxtLink>

            <IggyPostMint
              :post="post"
              :parsedText="parsedText"
              v-if="isActivated"
            />

            <span
              v-if="
                isActivated &&
                !isCurrentUserAuthor &&
                $config.showFeatures.tipping
              "
              class="cursor-pointer hover-color ms-2"
              data-bs-toggle="modal"
              :data-bs-target="'#sendTipModal' + $.uid"
            >
              <i class="bi bi-coin" /> Tip
            </span>

            <span
              v-if="post.master"
              class="cursor-pointer hover-color ms-2"
              data-bs-toggle="modal"
              :data-bs-target="'#replyModal' + post.stream_id"
            >
              <i class="bi bi-reply" /> Reply
            </span>

            <span
              v-if="isCurrentUserAuthor"
              class="cursor-pointer hover-color ms-2"
              data-bs-toggle="modal"
              :data-bs-target="'#deleteModal' + post.stream_id"
            >
              <i class="bi bi-trash" /> Delete
            </span>
          </p>
        </div>
      </div>
    </div>

    <TokenTipModal
      :componentId="$.uid"
      :masterPostId="post.master"
      :postContext="getOrbisContext"
      :recipientDomain="authorDomain"
      :recipientAddress="authorAddress"
      :repliedPostId="post.stream_id"
      tokenAddress="0xb65ad8d81d1e4cb2975352338805af6e39ba8be8"
      tokenName="Scrolly"
      tokenSymbol="SCROLLY"
      :tokenDecimals="18"
      :tokenAmount="69"
    />

    <!-- Reply Modal -->
    <div
      class="modal fade"
      :id="'replyModal' + post.stream_id"
      tabindex="-1"
      :aria-labelledby="'replyModalLabel' + post.stream_id"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1
              class="modal-title fs-5"
              :id="'replyModalLabel' + post.stream_id"
            >
              Reply to comment
            </h1>
            <button
              type="button"
              class="btn-close"
              :id="'closeReplyModal' + post.stream_id"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="!userStore.getIsConnectedToOrbis">
              <p>First connect to Ceramic before you can reply:</p>

              <button class="btn btn-primary" @click="connectToOrbis">
                Connect to Ceramic
              </button>
            </div>

            <div
              class="form-group mt-2 mb-2"
              v-if="userStore.getIsConnectedToOrbis"
            >
              <textarea
                v-model="replyText"
                class="form-control"
                rows="3"
                placeholder="Enter your reply"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              :disabled="!userStore.getIsConnectedToOrbis"
              type="button"
              class="btn btn-primary"
              @click="replyPost"
            >
              Submit reply
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- END Reply Modal -->

    <!-- Delete Modal -->
    <div
      class="modal fade"
      :id="'deleteModal' + post.stream_id"
      tabindex="-1"
      :aria-labelledby="'deleteModalLabel' + post.stream_id"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1
              class="modal-title fs-5"
              :id="'deleteModalLabel' + post.stream_id"
            >
              Delete post
            </h1>
            <button
              type="button"
              class="btn-close"
              :id="'closeDeleteModal' + post.stream_id"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">Do you really want to delete this post?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="deletePost"
              :disabled="waitingDeletePost"
            >
              <span
                v-if="waitingDeletePost"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- END Delete Modal -->
  </div>
</template>

<script>
import { ethers } from "ethers";
import sanitizeHtml from "sanitize-html";
import { useEthers, shortenAddress } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import { useUserStore } from "~/store/user";
import Image from "~/components/Image.vue";
import TokenTipModal from "~/components/TokenTipModal.vue";
import ProfileImage from "~/components/profile/ProfileImage.vue";
import IggyPostMint from "~/components/minted-posts/IggyPostMint.vue";
import MintedPostImage from "~/components/minted-posts/MintedPostImage.vue";
import ChatQuote from "~/components/chat/ChatQuote.vue";
import { getDomainName } from "~/utils/domainUtils";
import {
  getTextWithoutBlankCharacters,
  findFirstCollectionUrl,
  findFirstUrl,
  imgParsing,
  imgWithoutExtensionParsing,
  urlParsing,
  youtubeParsing,
} from "~/utils/textUtils";
import {
  fetchCollection,
  fetchUsername,
  storeCollection,
  storeUsername,
} from "~/utils/storageUtils";
import { getActivityPoints } from "~/utils/balanceUtils";

export default {
  name: "ChatPost",
  emits: ["insertReply", "removePost"],
  props: ["orbisContext", "post", "showQuotedPost"],

  components: {
    ChatQuote,
    IggyPostMint,
    MintedPostImage,
    ProfileImage,
    TokenTipModal,
    Image,
  },

  data() {
    return {
      alreadyLiked: false,
      authorAddress: null,
      authorDomain: null,
      collection: null,
      customDataType: null,
      firstLink: null,
      linkPreview: null,
      parsedText: null,
      postLengthLimit: 550,
      quotePost: null,
      quoteLimit: 200,
      replyText: null,
      showFullText: false,
      waitingDeletePost: false,
      balanceAp: 0,
      userTier: "Unknown",
    };
  },

  created() {
    if (this.post.creator_details.metadata) {
      this.fetchAuthorDomain();
    }

    this.parsePostText();
    this.fetchActivityPointsAndTier();

    if (
      this.route.href === "/post/?id=" + this.post.stream_id ||
      this.route.href === "/post?id=" + this.post.stream_id
    ) {
      this.showFullText = true;
    }

    // check if there is custom data attached to a post
    if (this.post?.content?.data) {
      this.customDataType = this.post.content.data?.type;

      this.collection = fetchCollection(
        window,
        this.post.content.data.collectionAddress,
      );

      if (!this.collection) {
        this.collection = {};
      }

      this.collection["address"] = this.post.content.data.collectionAddress;
      this.collection["name"] = this.post.content.data.collectionName;
      this.collection["description"] =
        this.post.content.data.collectionDescription;
      this.collection["image"] = this.post.content.data.collectionImage;

      storeCollection(
        window,
        this.post.content.data.collectionAddress,
        this.collection,
      );
    }

    // create quote post object
    if (this.post.reply_to_details) {
      this.quotePost = {
        body: this.post.reply_to_details.body,
        stream_id: this.post.reply_to,
      };

      if (
        this.post.reply_to_creator_details.profile &&
        this.post.reply_to_creator_details.profile.pfp
      ) {
        this.quotePost["pfp"] = this.post.reply_to_creator_details.profile.pfp;
      }

      if (
        this.post.reply_to_creator_details.profile &&
        this.post.reply_to_creator_details.profile.username
      ) {
        this.quotePost["username"] =
          this.post.reply_to_creator_details.profile.username;
      }

      if (
        this.post.reply_to_creator_details.metadata &&
        this.post.reply_to_creator_details.metadata.address
      ) {
        this.quotePost["address"] =
          this.post.reply_to_creator_details.metadata.address;
      }
    }
  },

  computed: {
    getMintedPostTokenId() {
      if (this.customDataType === "mintedPost") {
        return String(this.post.content.data.nftTokenId);
      }

      return null;
    },

    getNftCollectionDescription() {
      if (this.customDataType === "nftCollectionCreated") {
        const maxLength = 100;

        if (this.collection.description.length > maxLength) {
          return this.collection.description.substring(0, maxLength) + "...";
        } else {
          return this.collection.description;
        }
      }

      return null;
    },

    getOrbisContext() {
      if (this.post?.context) {
        return this.post.context;
      } else if (this.post?.content.context) {
        return this.post.content.context;
      } else if (this.post?.context_details?.context_id) {
        return this.post.context_details.context_id;
      } else if (this.post?.stream_id) {
        return this.post.stream_id;
      } else {
        return this.orbisContext;
      }
    },

    getOrbisImage() {
      if (this.post.creator_details.profile) {
        return this.post.creator_details.profile.pfp;
      }

      return null;
    },

    isCurrentUserAuthor() {
      return (
        String(this.authorAddress).toLowerCase() ===
        String(this.address).toLowerCase()
      );
    },

    isUserConnectedOrbis() {
      return this.userStore.getIsConnectedToOrbis;
    },

    showDomainOrAddressOrAnon() {
      if (this.authorDomain) {
        return getTextWithoutBlankCharacters(this.authorDomain);
      } else if (this.post.creator_details.metadata) {
        return this.shortenAddress(this.post.creator_details.metadata.address);
      } else {
        return "Anon";
      }
    },

    showDomainOrFullAddress() {
      if (this.authorDomain) {
        return this.authorDomain;
      } else if (this.post.creator_details.metadata) {
        return this.post.creator_details.metadata.address;
      }

      return null;
    },

    showQuote() {
      if (this.post.master && this.post.master !== this.post.reply_to) {
        return true;
      }

      if (this.post.master && this.showQuotedPost) {
        return true;
      }

      return false;
    },

    timeSince() {
      if (!isNaN(this.post.timestamp)) {
        const timePosted = new Date(this.post.timestamp * 1000);
        const now = new Date();
        const secondsPast = (now.getTime() - timePosted.getTime()) / 1000;

        if (secondsPast < 60) return "now";
        if (secondsPast < 3600) return parseInt(secondsPast / 60) + "min";
        if (secondsPast <= 86400) return parseInt(secondsPast / 3600) + "h";
        if (secondsPast <= 2628000) return parseInt(secondsPast / 86400) + "d";
        if (secondsPast <= 31536000)
          return parseInt(secondsPast / 2628000) + "mo";
        if (secondsPast > 31536000)
          return parseInt(secondsPast / 31536000) + "y";
      }

      return null;
    },
  },

  methods: {
    async fetchActivityPointsAndTier() {
      if (this.post.creator_details.metadata.address) {
        const provider = this.$getFallbackProvider(
          this.$config.supportedChainId,
        );
        this.balanceAp = await getActivityPoints(
          this.post.creator_details.metadata.address,
          provider,
        );
        this.userTier = this.getUserTier(this.balanceAp);
      }
    },

    getUserTier(points) {
      const tiers = [
        { name: "Scrolly Baby", points: 1 },
        { name: "Scrolly Novice", points: 333 },
        { name: "Scrolly Explorer", points: 777 },
        { name: "Scrolly Mapper", points: 1337 },
        { name: "Carto Maestro", points: 2442 },
        { name: "Grand Cartographer of Scrolly", points: 4200 },
      ];

      for (let i = tiers.length - 1; i >= 0; i--) {
        if (points >= tiers[i].points) {
          return tiers[i].name;
        }
      }
      return "Unknown";
    },

    async checkIfAlreadyLiked() {
      if (this.userStore.getIsConnectedToOrbis) {
        let res = await this.$orbis.getReaction(
          String(this.post.stream_id),
          String(this.userStore.getDidParent),
        );

        if (res.status == 200) {
          if (res.data && res.data.type === "like") {
            this.alreadyLiked = true;
          }
        }
      }
    },

    async connectToOrbis() {
      let res = await this.$orbis.connect_v2({
        provider: this.signer.provider.provider,
        lit: false,
      });

      if (res.status == 200) {
        this.userStore.setIsConnectedToOrbis(true);

        if (this.$orbis.session) {
          this.userStore.setDid(this.$orbis.session.did._id);
          this.userStore.setDidParent(this.$orbis.session.did._parentId);
        }
      } else {
        console.log("Error connecting to Ceramic: ", res);
        this.toast(res.result, { type: "error" });
      }
    },

    async deletePost() {
      if (this.userStore.getIsConnectedToOrbis) {
        this.waitingDeletePost = true;

        let res = await this.$orbis.deletePost(String(this.post.stream_id));

        if (res.status == 200) {
          this.toast("Post deleted successfully", { type: "success" });
          this.$emit("removePost", this.post.stream_id);
          document
            .getElementById("closeDeleteModal" + this.post.stream_id)
            .click();
          this.waitingDeletePost = false;
        } else {
          this.toast("Error deleting post", { type: "error" });
          console.log("Error posting via Orbis to Ceramic: ", res);
          this.waitingDeletePost = false;
        }
      } else {
        this.toast("Please sign into chat to be able to delete your post.", {
          type: "error",
        });
        this.waitingDeletePost = false;
      }
    },

    async fetchAuthorDomain() {
      this.authorAddress = this.post.creator_details.metadata.address;

      if (this.authorAddress) {
        const storedDomain = fetchUsername(window, this.authorAddress);

        if (storedDomain) {
          this.authorDomain = storedDomain;
        } else {
          let provider = this.$getFallbackProvider(
            this.$config.supportedChainId,
          );

          if (
            this.isActivated &&
            this.chainId === this.$config.supportedChainId
          ) {
            provider = this.signer;
          }

          const domainName = await getDomainName(this.authorAddress, provider);

          if (domainName) {
            this.authorDomain = domainName + this.$config.tldName;
            storeUsername(window, this.authorAddress, this.authorDomain);
          }
        }
      }
    },

    async fetchCollectionData(cAddress) {
      this.customDataType = "nftCollectionCreated";

      this.collection = fetchCollection(window, cAddress);

      if (!this.collection) {
        let provider = this.$getFallbackProvider(this.$config.supportedChainId);

        if (
          this.isActivated &&
          this.chainId === this.$config.supportedChainId
        ) {
          provider = this.signer;
        }

        const nftInterface = new ethers.utils.Interface([
          "function collectionPreview() public view returns (string memory)",
          "function name() public view returns (string memory)",
        ]);

        const nftContract = new ethers.Contract(
          cAddress,
          nftInterface,
          provider,
        );

        const collectionName = await nftContract.name();
        const collectionImage = await nftContract.collectionPreview();

        this.collection = {
          address: cAddress,
          name: collectionName,
          description: null,
          image: collectionImage,
        };
      } else {
        this.collection["address"] = cAddress;
      }
    },

    async fetchLinkPreview() {
      if (this.$config.linkPreviews) {
        const thisAppUrl = window.location.origin;
        const firstLinkHttps = this.firstLink.replace("http://", "https://");

        if (
          firstLinkHttps.startsWith(thisAppUrl.replace("http://", "https://"))
        ) {
          return;
        }

        const storedLinkPreviewString = localStorage.getItem(this.firstLink);

        if (storedLinkPreviewString) {
          this.linkPreview = JSON.parse(storedLinkPreviewString);
        } else {
          let fetcherService;

          if (this.$config.linkPreviews === "netlify") {
            fetcherService =
              thisAppUrl +
              "/.netlify/functions/linkPreviews?url=" +
              this.firstLink;
          } else if (this.$config.linkPreviews === "vercel") {
            fetcherService =
              thisAppUrl + "/api/linkPreviews?url=" + this.firstLink;
          } else if (this.$config.linkPreviews === "microlink") {
            fetcherService = "https://api.microlink.io/?url=" + this.firstLink;
          }

          if (fetcherService) {
            try {
              const resp = await $fetch(fetcherService).catch(
                (error) => error.data,
              );

              let response = resp;

              if (typeof resp === "string") {
                response = JSON.parse(resp);
              }

              if (response?.error) {
                console.log("Error fetching link preview: ", response["error"]);
                return;
              }

              if (response?.data) {
                this.linkPreview = response["data"];

                if (this.linkPreview?.title) {
                  localStorage.setItem(
                    this.firstLink,
                    JSON.stringify(this.linkPreview),
                  );
                }
              }
            } catch (e) {
              console.log("Error fetching link preview: ", e);
            }
          }
        }
      }
    },

    async likePost() {
      if (this.userStore.getIsConnectedToOrbis && !this.alreadyLiked) {
        this.alreadyLiked = true;
        this.post.count_likes++;

        let res = await this.$orbis.react(this.post.stream_id, "like");

        if (res.status !== 200) {
          this.alreadyLiked = false;
          this.post.count_likes--;
          console.log("Error liking the post: ", res);
          this.toast(res.result, { type: "error" });
        }
      } else if (this.userStore.getIsConnectedToOrbis && this.alreadyLiked) {
        this.alreadyLiked = false;
        this.post.count_likes--;

        let res = await this.$orbis.react(this.post.stream_id, "none");

        if (res.status !== 200) {
          this.alreadyLiked = true;
          this.post.count_likes++;
          console.log("Error un-liking the post: ", res);
          this.toast(res.result, { type: "error" });
        }
      } else {
        await this.connectToOrbis();

        this.toast("Signed into chat, now please try to like the post again.", {
          type: "success",
        });
      }
    },

    async replyPost() {
      if (this.userStore.getIsConnectedToOrbis) {
        const options = {
          master: this.post.master,
          reply_to: this.post.stream_id,
          body: this.replyText,
          context: this.getOrbisContext,
        };

        let res = await this.$orbis.createPost(options);

        if (res.status == 200) {
          this.toast("Reply successfully posted", { type: "success" });
          this.$emit(
            "insertReply",
            res.doc,
            this.post.stream_id,
            this.replyText,
            this.parsedText,
            this.post.creator_details.metadata.address,
          );
          document
            .getElementById("closeReplyModal" + this.post.stream_id)
            .click();
          this.replyText = null;
        } else {
          console.log("Error posting via Orbis to Ceramic: ", res);
          this.toast(res.result, { type: "error" });
        }
      } else {
        this.toast("Please sign into chat to be able to reply to a post.", {
          type: "error",
        });
      }
    },

    openPostDetails() {
      this.$router.push({ name: "post", query: { id: this.post.stream_id } });
    },

    parsePostText() {
      let postText = this.post.content.body;

      postText = sanitizeHtml(postText, {
        allowedTags: ["li", "ul", "ol", "br", "em", "strong", "i", "b"],
        allowedAttributes: {},
      });

      if (this.$config.linkPreviews) {
        this.firstLink = findFirstUrl(postText);
        if (this.firstLink) {
          this.fetchLinkPreview();
        }
      }

      postText = imgParsing(postText);
      postText = imgWithoutExtensionParsing(postText);
      postText = youtubeParsing(postText);
      postText = urlParsing(postText);

      this.parsedText = postText.replace(/(\r\n|\n|\r)/gm, "<br/>");

      const collectionUrl = findFirstCollectionUrl(postText);

      if (collectionUrl) {
        this.fetchCollectionData(collectionUrl);
      }
    },
  },

  setup() {
    const route = useRoute();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const userStore = useUserStore();

    return {
      address,
      chainId,
      isActivated,
      route,
      shortenAddress,
      signer,
      toast,
      userStore,
    };
  },

  watch: {
    isUserConnectedOrbis(newVal, oldVal) {
      if (newVal) {
        this.checkIfAlreadyLiked();
      }
    },
  },
};
</script>
<style scoped>
.post-wrapper {
  display: flex;
  align-items: start; /* Align items at the top */
  gap: 15px; /* Space between elements */
}

.profile-image-container {
  flex-shrink: 0; /* Prevent the image container from shrinking */
  width: 50px; /* Set the width of the image container */
  height: 50px; /* Set the height of the image container */
  overflow: hidden; /* Hide any overflow */
  border-radius: 50%; /* Optional: makes it circular */
  margin: 10px;
}

.profile-image-container img {
  width: 100%; /* Ensure the image fills the container */
  height: auto; /* Maintain aspect ratio */
  border-radius: 50%; /* Optional: makes the image circular */
}

.card {
  border-radius: 30px; /* Larger radius for more pronounced rounded corners */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Optional: adds a subtle shadow for depth */
  flex-grow: 1; /* Allow the card to take up the remaining space */
  margin: 10px;
}

@media (max-width: 768px) {
  .post-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .profile-image-container {
    display: none; /* Masque le conteneur de l'image de profil */
  }

  .card {
    width: 100%; /* Ensure the card expands to the full width */
  }
}
</style>
