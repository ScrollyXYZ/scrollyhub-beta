<template>
  <div>
    <h5>Remove Image From Collection</h5>
    <div>
      <button
        class="btn btn-primary"
        @click="loadImages"
        :disabled="waitingLoad"
      >
        <span
          v-if="waitingLoad"
          class="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
        Load images
      </button>
    </div>

    <div class="row mt-3" v-if="images.length > 0">
      <div v-for="(image, index) in images" :key="image" class="col-md-4 mb-3">
        <div class="card">
          <Image :url="image" alt="Image" cls="card-img-top" />
          <div class="card-body">
            <button
              class="btn btn-danger"
              @click="removeImage(index)"
              :disabled="waitingRemove || images.length == 1"
            >
              <span
                v-if="waitingRemove"
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

    <button type="button" class="btn btn-secondary mt-3" @click="closeModal">
      Close
    </button>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import Image from "~/components/Image.vue";
import WaitingToast from "~/components/WaitingToast";

export default {
  name: "RemoveImageFromCollectionModal",
  props: ["cAddress", "mdAddress"],
  emits: ["saveCollection"],

  data() {
    return {
      componentId: null,
      images: [],
      imageUrl: null,
      waitingLoad: false,
      waitingRemove: false,
    };
  },
  components: {
    Image,
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async loadImages() {
      this.waitingLoad = true;

      const metadataInterface = new ethers.utils.Interface([
        "function getCollectionImages(address nftAddress_) external view returns (string[] memory)",
      ]);

      const metadataContract = new ethers.Contract(
        this.mdAddress,
        metadataInterface,
        this.signer,
      );

      try {
        this.images = await metadataContract.getCollectionImages(this.cAddress);
        this.waitingLoad = false;
      } catch (e) {
        console.error(e);
        this.waitingLoad = false;
      }
    },

    async removeImage(imageIndex) {
      this.waitingRemove = true;

      const metadataInterface = new ethers.utils.Interface([
        "function removeImageFromCollectionByIndex(address nftAddress_, uint256 index_) external",
      ]);

      const metadataContract = new ethers.Contract(
        this.mdAddress,
        metadataInterface,
        this.signer,
      );

      try {
        const tx = await metadataContract.removeImageFromCollectionByIndex(
          this.cAddress,
          imageIndex,
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.",
            },
          },
          {
            type: "info",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          },
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast(
            "You have successfully removed an image from the NFT collection.",
            {
              type: "success",
              onClick: () =>
                window
                  .open(
                    this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                    "_blank",
                  )
                  .focus(),
            },
          );

          // remove image from array by index
          const newImgArray = [...this.images];
          newImgArray.splice(imageIndex, 1);
          this.images = newImgArray;

          this.$emit("saveCollection", { images: this.images });

          this.waitingRemove = false;
        } else {
          this.toast.dismiss(toastWait);
          this.waitingRemove = false;
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });
          console.log(receipt);
        }
      } catch (e) {
        console.error(e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace(
            "execution reverted:",
            "Error:",
          );

          console.log(extractMessage);

          this.toast(extractMessage, { type: "error" });
        } catch (e) {
          this.toast("Transaction has failed.", { type: "error" });
        }

        this.waitingRemove = false;
      }
    },

    closeModal() {
      document.getElementById("closeModal-" + this.componentId).click();
    },
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();

    return { signer, toast };
  },
};
</script>
