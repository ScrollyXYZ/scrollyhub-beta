<template>
  <!-- Modal -->
  <div class="fu-modal-overlay" v-if="isOpen" @click="close">
    <div class="fu-modal-dialog" @click.stop>
      <div class="fu-modal-content">
        <div class="fu-modal-header">
          <h1
            class="fu-modal-title fs-5"
            :id="'fileUploadModalLabel' + componentId"
          >
            {{ getTitle }}
          </h1>
          <button
            :id="'closeFileUploadModal' + componentId"
            type="button"
            class="fu-btn-close"
            @click="close"
            aria-label="Close"
          ></button>
        </div>

        <div class="fu-modal-body fu-mb-4">
          <p class="info-text">
            You can upload files up to 1MB. Use the upload button or drag and
            drop your files below.
          </p>
          <!-- Tabs Navigation -->
          <ul class="fu-nav fu-nav-tabs fu-nav-fill">
            <li class="fu-nav-item">
              <button
                :disabled="!fileUploadEnabled"
                class="fu-nav-link"
                :class="currentTab === 'upload' ? 'fu-active' : ''"
                @click="currentTab = 'upload'"
              >
                🌟 Upload
              </button>
            </li>
            <li class="fu-nav-item">
              <button
                class="fu-nav-link"
                :class="currentTab === 'paste' ? 'fu-active' : ''"
                @click="currentTab = 'paste'"
              >
                🔗 Paste Link
              </button>
            </li>
          </ul>
          <!-- END Tabs Navigation -->

          <!-- Tabs Content -->
          <div class="fu-tab-content fu-mt-3">
            <!-- Upload Tab -->
            <div v-if="currentTab === 'upload'">
              <p v-if="infoText">{{ infoText }}</p>

              <FileUploadInput
                ref="fileUploadInput"
                btnCls="fu-btn fu-btn-primary"
                :maxFileSize="maxFileSize"
                :storageType="storageType"
                @processUploadedFileUrl="processUploadedFileUrl"
              />
            </div>

            <!-- Paste Link Tab -->
            <div v-if="currentTab === 'paste'">
              <p>Paste file link</p>
              <input
                v-model="pastedLink"
                type="text"
                class="fu-form-control fu-mb-3"
                placeholder="Enter http link to file"
              />
              <button
                class="fu-btn fu-btn-primary"
                @click="processUploadedFileUrl(pastedLink)"
                :disabled="!pastedLink"
              >
                🚀 Submit link
              </button>
            </div>
          </div>
          <!-- END Tabs Content -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSiteStore } from "~/store/site";
import FileUploadInput from "~/components/storage/FileUploadInputNft.vue";

export default {
  name: "FileUploadModal",
  props: [
    "title",
    "componentId",
    "infoText",
    "maxFileSize",
    "storageType",
    "isOpen",
  ],
  emits: ["processFileUrl", "close"],
  components: { FileUploadInput },

  data() {
    return {
      currentTab: "upload",
      pastedLink: null,
    };
  },

  computed: {
    fileUploadEnabled() {
      return this.siteStore.getFileUploadEnabled;
    },

    getTitle() {
      return this.title || "Upload file";
    },
  },

  methods: {
    processUploadedFileUrl(fileUrl) {
      console.log("Emitting file URL:", fileUrl); // Debugging
      this.$emit("processFileUrl", fileUrl);
      document
        .getElementById("closeFileUploadModal" + this.componentId)
        .click();
    },

    close() {
      this.$emit("close");
    },
  },

  watch: {
    fileUploadEnabled() {
      if (!this.fileUploadEnabled) {
        this.currentTab = "paste";
      } else {
        this.currentTab = "upload";
      }
    },
  },

  setup() {
    const siteStore = useSiteStore();
    return {
      siteStore,
    };
  },
};
</script>

<style scoped>
.fu-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.fu-modal-dialog {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: 100%;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.fu-modal-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.fu-modal-header,
.fu-modal-body {
  padding: 20px;
}

.fu-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.fu-modal-title {
  margin: 0;
  font-size: 1.5rem;
}

.fu-btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.fu-nav {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 1rem;
  padding: 0;
  list-style: none;
}

.fu-nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.fu-nav-item {
  margin-bottom: -1px;
}

.fu-nav-link {
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #e9ecef;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 5px;
}

.fu-nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
  background-color: #dee2e6;
}

.fu-nav-link.fu-active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.fu-tab-content {
  padding: 20px;
}

.fu-form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.fu-form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.fu-btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  background-color: #007bff;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.fu-btn-fun {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.fu-btn-fun:hover {
  background-color: #218838;
  border-color: #1e7e34;
  transform: scale(1.05);
}

.fu-btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.fu-btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}

.fu-btn-upload {
  margin-top: 10px;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.fu-btn-upload:hover {
  background-color: #0056b3;
  border-color: #004085;
  transform: scale(1.05);
}

.fu-btn-delete {
  margin-top: 10px;
  margin-left: 10px;
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: bold;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.fu-btn-delete:hover {
  background-color: #c82333;
  border-color: #bd2130;
  transform: scale(1.05);
}

.fu-mb-3 {
  margin-bottom: 1rem;
}

.fu-mb-4 {
  margin-bottom: 1.5rem;
}

.fu-fs-5 {
  font-size: 1.25rem;
}

.fu-mt-3 {
  margin-top: 1rem;
}

.upload-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  border: 2px dashed #28a745;
  border-radius: 10px;
  background-color: #f8f9fa;
  cursor: pointer;
  text-align: center;
}

.upload-container p {
  margin-top: 10px;
  color: #495057;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  margin-bottom: 10px;
  border-radius: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  color: #495057;
}
</style>
