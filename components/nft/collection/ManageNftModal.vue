<template>
  <div class="custom-modal" v-if="show">
    <div class="custom-modal-backdrop"></div>
    <div class="custom-modal-content">
      <div class="custom-modal-header">
        <h5 class="custom-modal-title">
          Manage Collection: {{ selectedNft.name }}
        </h5>
        <button
          type="button"
          class="custom-modal-close"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
      <div class="custom-modal-body">
        <ul class="nav nav-tabs" id="manageTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="description-tab"
              data-bs-toggle="tab"
              data-bs-target="#description"
              type="button"
              role="tab"
              aria-controls="description"
              aria-selected="true"
            >
              Description
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="preview-tab"
              data-bs-toggle="tab"
              data-bs-target="#preview"
              type="button"
              role="tab"
              aria-controls="preview"
              aria-selected="false"
            >
              Preview Image
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="images-tab"
              data-bs-toggle="tab"
              data-bs-target="#images"
              type="button"
              role="tab"
              aria-controls="images"
              aria-selected="false"
            >
              Images
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="metadata-tab"
              data-bs-toggle="tab"
              data-bs-target="#metadata"
              type="button"
              role="tab"
              aria-controls="metadata"
              aria-selected="false"
            >
              Metadata
            </button>
          </li>
        </ul>
        <div class="tab-content" id="manageTabContent">
          <div
            class="tab-pane fade show active"
            id="description"
            role="tabpanel"
            aria-labelledby="description-tab"
          >
            <change-description-modal
              :cAddress="selectedNft.address"
              :cDescription="selectedNft.description"
              :mdAddress="selectedNft.mdAddress"
              @saveCollection="saveCollection"
            ></change-description-modal>
          </div>
          <div
            class="tab-pane fade"
            id="preview"
            role="tabpanel"
            aria-labelledby="preview-tab"
          >
            <change-collection-preview-modal
              :cAddress="selectedNft.address"
              :mdAddress="selectedNft.mdAddress"
              storageType="ipfs"
              @saveCollection="saveCollection"
            ></change-collection-preview-modal>
          </div>
          <div
            class="tab-pane fade"
            id="images"
            role="tabpanel"
            aria-labelledby="images-tab"
          >
            <div class="row">
              <div class="col-md-6">
                <add-image-to-collection-modal
                  :cAddress="selectedNft.address"
                  :mdAddress="selectedNft.mdAddress"
                  storageType="ipfs"
                  @saveCollection="saveCollection"
                ></add-image-to-collection-modal>
              </div>
              <div class="col-md-6">
                <remove-image-from-collection-modal
                  :cAddress="selectedNft.address"
                  :mdAddress="selectedNft.mdAddress"
                  @saveCollection="saveCollection"
                ></remove-image-from-collection-modal>
              </div>
            </div>
          </div>
          <div
            class="tab-pane fade"
            id="metadata"
            role="tabpanel"
            aria-labelledby="metadata-tab"
          >
            <change-nft-type-modal
              :cAddress="selectedNft.address"
              :cType="selectedNft.type"
              :mdAddress="selectedNft.mdAddress"
              @saveCollection="saveCollection"
            ></change-nft-type-modal>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ManageNftModal",
  props: {
    selectedNft: Object,
    saveCollection: Function,
    show: Boolean,
  },
};
</script>

<style scoped>
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.custom-modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1060; /* Assurez-vous que ce chiffre est supérieur au z-index du modal backdrop */
  width: 90%;
  max-width: 800px;
  overflow: hidden;
}

.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.custom-modal-title {
  margin: 0;
}

.custom-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.custom-modal-body {
  padding: 1rem;
}
</style>
