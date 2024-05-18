<template>
  <div>
    <h5>Change Collection Preview Image</h5>
    <div v-if="!imageUrl && $config.fileUploadEnabled">
      <p>Upload new image (and then click Submit below):</p>
      <FileUploadInput
        btnCls="btn btn-primary"
        :maxFileSize="$config.fileUploadSizeLimit"
        @processUploadedFileUrl="insertImageLink"
      />
      <p class="mt-3">Or paste image link here:</p>
    </div>
    <p v-if="!$config.fileUploadEnabled">Paste image link here:</p>
    <input v-model="imageUrl" type="text" class="form-control" />
    <div v-if="imageUrl" class="mt-3">
      <img
        :src="imageUrl"
        class="img-thumbnail img-fluid"
        style="max-width: 100px"
      />
      <br />
      <small
        >If image didn't appear above, then something is wrong with the link you
        added.</small
      >
    </div>
    <button
      @click="updateImage"
      type="button"
      class="btn btn-primary mt-3"
      :disabled="!imageUrl || waiting"
    >
      <span
        v-if="waiting"
        class="spinner-border spinner-border-sm mx-1"
        role="status"
        aria-hidden="true"
      ></span>
      Submit to blockchain
    </button>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import FileUploadInput from "~/components/storage/FileUploadInput.vue";

export default {
  name: "ChangeCollectionPreviewModal",
  props: ["cAddress", "mdAddress"],
  emits: ["saveCollection"],
  components: { FileUploadInput },

  data() {
    return {
      imageUrl: null,
      waiting: false,
    };
  },

  methods: {
    async updateImage() {
      this.waiting = true;
      console.log(
        "Updating image for",
        this.cAddress,
        "with URL",
        this.imageUrl,
      );

      const metadataInterface = new ethers.utils.Interface([
        "function setCollectionPreview(address nftAddress_, string memory collectionPreview_) external",
      ]);

      const metadataContract = new ethers.Contract(
        this.mdAddress,
        metadataInterface,
        this.signer,
      );

      try {
        const tx = await metadataContract.setCollectionPreview(
          this.cAddress,
          this.imageUrl,
        );
        console.log("Transaction sent:", tx);

        const toastWait = this.toast(
          "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.",
          { type: "info" },
        );
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have updated the NFT collection preview image.", {
            type: "success",
          });
          this.$emit("saveCollection", { image: this.imageUrl });
          this.imageUrl = null;
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", { type: "error" });
          this.waiting = false;
        }
      } catch (e) {
        console.error("Transaction failed:", e);
        this.toast("Transaction has failed.", { type: "error" });
        this.waiting = false;
      }
    },

    insertImageLink(fileUrl) {
      console.log("File uploaded:", fileUrl);
      this.imageUrl = fileUrl;
    },
  },

  setup() {
    const { signer } = useEthers();
    const toast = useToast();
    return { signer, toast };
  },
};
</script>
