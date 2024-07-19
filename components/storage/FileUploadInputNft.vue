<template>
  <div>
    <div v-if="!filePreview">
      <input
        @change="handleFileInput"
        type="file"
        class="form-control form-control-lg mb-3"
        :id="'file-input-' + componentId"
      />
      <p class="info-text">Upload your NFT image</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
    <div v-else class="preview-container">
      <img :src="filePreview" alt="Selected file" class="preview-image" />
      <button class="delete-button" @click="removeFile">🗑️</button>
    </div>
    <button
      type="button"
      :class="[btnCls, 'upload-button']"
      @click="uploadFile"
      :disabled="waitingUpload || !file || fileTooBig"
    >
      <span
        v-if="waitingUpload"
        class="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      <span v-else>🌟 Choose Your NFT Image 🌟</span>
    </button>
  </div>
</template>

<script>
import ImageKit from "imagekit-javascript";
import { uploadFileToThirdWeb } from "~/utils/ipfsUtils";

export default {
  name: "FileUploadInput",
  props: ["btnCls", "maxFileSize", "storageType"],
  emits: ["processUploadedFileUrl"],
  data() {
    return {
      componentId: null,
      file: null,
      newFileName: null,
      uploadedFileSize: null,
      uploadToken: null,
      waitingUpload: false,
      filePreview: null,
      errorMessage: null, // Variable to store error message
    };
  },
  mounted() {
    this.componentId = this.$.uid;
  },
  computed: {
    fileTooBig() {
      if (this.uploadedFileSize) {
        return this.maxFileSize && this.uploadedFileSize > this.maxFileSize;
      }
    },
  },
  methods: {
    // Handle fallback upload in case of IPFS upload failure
    async fallbackUpload() {
      const thisAppUrl = window.location.origin;
      let fetcherService;
      if (this.$config.fileUploadTokenService === "netlify") {
        fetcherService =
          thisAppUrl + "/.netlify/functions/imageUploaderFallback";
      } else if (this.$config.fileUploadTokenService === "vercel") {
        fetcherService = thisAppUrl + "/api/imageUploaderFallback";
      }
      const resp = await $fetch(fetcherService).catch((error) => error.data);
      let authParams = resp;
      if (typeof resp === "string") {
        authParams = JSON.parse(resp);
      }
      const imagekit = new ImageKit({
        publicKey: this.$config.imagekitPublicKey,
        urlEndpoint: this.$config.imagekitEndpoint,
      });
      const result = await imagekit.upload({
        file: this.file,
        fileName: this.newFileName,
        signature: authParams.data.signature,
        expire: authParams.data.expire,
      });
      this.$emit("processUploadedFileUrl", result.url);
      this.waitingUpload = false;
    },
    // Handle file input and validation
    handleFileInput(event) {
      const uploadedFile = event.target.files[0];

      // Validate file type
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(uploadedFile.type)) {
        this.errorMessage =
          "Invalid file type. Please upload an image file (JPEG, PNG, GIF).";
        console.error(
          "Invalid file type. Please upload an image file (JPEG, PNG, GIF).",
        );
        return;
      } else {
        this.errorMessage = null; // Clear any previous error message
      }

      this.uploadedFileSize = uploadedFile.size;
      // Check file size
      if (this.maxFileSize && uploadedFile.size > this.maxFileSize) {
        const maxSizeMb = this.maxFileSize / 1024 / 1024;
        this.errorMessage =
          "File is too large (max size is " + maxSizeMb + " MB)";
        console.error("File is too large (max size is " + maxSizeMb + " MB)");
        return;
      } else {
        this.errorMessage = null; // Clear any previous error message
      }

      // Get file name
      const fileName = uploadedFile.name;
      // Change file name
      const fileExtension = fileName.split(".").pop();
      // Generate random alphanumeric string for name
      this.newFileName =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        "." +
        fileExtension;
      // Create new file with new name
      const newFile = new File([uploadedFile], this.newFileName, {
        type: uploadedFile.type,
      });
      this.file = newFile;
      // Set file preview
      this.filePreview = URL.createObjectURL(uploadedFile);
    },
    // Remove the selected file and reset related data
    removeFile() {
      this.file = null;
      this.filePreview = null;
      this.uploadedFileSize = null;
      this.newFileName = null;
      this.errorMessage = null; // Clear any error message
    },
    // Handle the file upload process
    async uploadFile() {
      this.waitingUpload = true;
      if (this.storageType === "ipfs") {
        try {
          // Upload to IPFS
          const fileUri = await uploadFileToThirdWeb(
            this.file,
            this.maxFileSize,
          );
          // Emit file URL
          this.$emit("processUploadedFileUrl", fileUri);
        } catch (error) {
          console.error("Error uploading file to IPFS", error);
          this.errorMessage = error.message;
          console.log("Falling back to centralized storage service");
          await this.fallbackUpload();
        }
      } else {
        // Upload to a centralized storage service (imagekit)
        await this.fallbackUpload();
      }
      this.waitingUpload = false;
    },
  },
};
</script>

<style scoped>
.upload-button {
  background-color: #4caf50; /* Green background */
  border: none; /* Remove borders */
  color: white; /* White text */
  padding: 10px 20px; /* Some padding */
  text-align: center; /* Centered text */
  text-decoration: none; /* Remove underline */
  display: inline-block; /* Get it to display like a button */
  font-size: 16px; /* Increase font size */
  margin: 4px 2px; /* Some margin */
  cursor: pointer; /* Pointer/hand icon */
  border-radius: 12px; /* Rounded corners */
  transition:
    background-color 0.3s ease,
    transform 0.3s ease; /* Animation */
}

.upload-button:hover {
  background-color: #45a049; /* Darker green */
  transform: scale(1.05); /* Slightly larger */
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  margin-bottom: 10px;
  border-radius: 10px;
}

.delete-button {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.delete-button:hover {
  transform: scale(1.2);
}

.info-text {
  margin-bottom: 10px;
  color: #495057;
  text-align: center;
  font-size: 1rem;
}

.error-text {
  color: #dc3545; /* Red color for error messages */
  text-align: center;
  font-size: 1rem;
  margin-top: -10px;
  margin-bottom: 10px;
}
</style>
