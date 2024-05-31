<template>
  <div>
    <h5>Add Image To Collection</h5>
    <div v-if="!imageUrl && $config.fileUploadEnabled">
      <p>Upload additional image (and then click Submit below):</p>
      <FileUploadInput
        btnCls="btn btn-primary"
        storageType="ipfs"
        :maxFileSize="$config.fileUploadSizeLimit"
        @processUploadedFileUrl="insertImageLink"
      />
      <p class="mt-3">Or paste image link here:</p>
    </div>
    <p v-if="!$config.fileUploadEnabled">Paste image link here:</p>
    <input v-model="imageUrl" type="text" class="form-control" />
    <div v-if="imageUrl" class="mt-3">
      <Image
        :url="imageUrl"
        alt="Image"
        cls="img-thumbnail img-fluid"
        style="max-width: 100px"
      />
      <br />
      <small
        >If image didn't appear above, then something is wrong with the link you
        added.</small
      >
    </div>
    <button
      @click="addNewImage"
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
import Image from "~/components/Image.vue";
import FileUploadInput from "~/components/storage/FileUploadInput.vue";

export default {
  name: "AddImageToCollectionModal",
  props: ["cAddress", "mdAddress"],
  components: { FileUploadInput, Image },
  emits: ["saveCollection"],

  data() {
    return {
      componentId: null,
      imageUrl: null,
      waiting: false,
    };
  },

  mounted() {
    this.componentId = this.$.uid;
  },

  methods: {
    async addNewImage() {
      this.waiting = true;
      console.log(
        "Adding new image for",
        this.cAddress,
        "with URL",
        this.imageUrl,
      );

      const metadataInterface = new ethers.utils.Interface([
        "function addImageToCollection(address nftAddress_, string memory imageUrl_) external",
      ]);

      const metadataContract = new ethers.Contract(
        this.mdAddress,
        metadataInterface,
        this.signer,
      );

      try {
        const tx = await metadataContract.addImageToCollection(
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
          this.toast(
            "You have successfully added new image URL to the NFT collection.",
            { type: "success" },
          );
          this.$emit("saveCollection", { imageUrl: this.imageUrl });
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
