<template>
  <div
    class="nft-hs-section"
    :class="{
      'nft-hs-dark-mode': isDarkMode,
      'nft-hs-light-mode': !isDarkMode,
    }"
  >
    <div class="nft-hs-title">
      Nft + Social = <span class="nft-hs-heart">❤️</span>
    </div>
    <div class="nft-hs-search-bar" ref="searchBar">
      <input
        v-model="searchQuery"
        type="text"
        class="form-control"
        placeholder="Find a collection"
        @input="search"
      />
      <div class="nft-hs-search-results" v-if="results.length">
        <div
          v-for="(result, index) in limitedResults"
          :key="result._id"
          class="nft-hs-result-item"
          @click="navigateToCollection(result.contract_address)"
        >
          <img
            :src="convertIpfsUrl(result.collectionPreview)"
            alt="Preview"
            class="nft-hs-result-image"
          />
          <p>{{ result.name }}</p>
        </div>
        <div v-if="results.length > 3" class="nft-hs-view-all">
          <button class="btn btn-link" @click="viewAllResults">
            View all results
          </button>
        </div>
      </div>
      <div v-else-if="searched && !results.length">No results found.</div>
    </div>
    <div class="nft-hs-cta-buttons"></div>
  </div>
</template>
<script>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useThemeStore } from "~/store/theme"; // Import your theme store

export default {
  name: "HeroSection",
  data() {
    return {
      searchQuery: "",
      results: [],
      searched: false,
      showAllResults: false,
    };
  },
  computed: {
    limitedResults() {
      return this.showAllResults ? this.results : this.results.slice(0, 3);
    },
    isDarkMode() {
      const themeStore = useThemeStore();
      return themeStore.getIsDarkMode;
    },
  },
  methods: {
    async search() {
      if (this.searchQuery) {
        try {
          const response = await fetch(
            `https://nftfinder-rho.vercel.app/api/search?query=${this.searchQuery}`,
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("Search response:", data);
          this.results = data;
          this.searched = true;
          this.showAllResults = false;
        } catch (error) {
          console.error("Error during search:", error);
          this.results = [];
          this.searched = true;
        }
      } else {
        this.results = [];
      }
    },
    convertIpfsUrl(url) {
      if (url.startsWith("ipfs://")) {
        return url.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return url;
    },
    navigateToCollection(contractAddress) {
      this.$router.push(`/nft/collection?id=${contractAddress}`);
    },
    viewAllResults() {
      this.showAllResults = true;
    },
    closeSearch() {
      this.results = [];
      this.searched = false;
    },
    handleClickOutside(event) {
      const searchBar = this.$refs.searchBar;
      if (searchBar && !searchBar.contains(event.target)) {
        this.closeSearch();
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
<style scoped>
.nft-hs-section {
  margin: 20px 0;
  text-align: center;
}

.nft-hs-title {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #fff; /* Default color */
}

.nft-hs-search-bar {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.nft-hs-search-bar input {
  width: 50%;
  margin-bottom: 10px;
}

.nft-hs-search-results {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  width: 50%;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.nft-hs-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.nft-hs-result-item:hover {
  background-color: var(--hover-background-color);
}

.nft-hs-result-image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.nft-hs-view-all {
  text-align: center;
  padding: 10px;
}

.nft-hs-cta-buttons {
  margin-top: 20px;
}

.nft-hs-cta-buttons .btn {
  margin: 0 10px;
}

.nft-hs-light-mode {
  --background-color: #ffffff;
  --border-color: #ccc;
  --hover-background-color: #f0f0f0;
  color: #000;
}

.nft-hs-dark-mode {
  --background-color: #2c2c2c;
  --border-color: #555;
  --hover-background-color: #3c3c3c;
  color: #fff;
}

.nft-hs-light-mode .nft-hs-title {
  color: #fff; /* White color for light mode */
}

.nft-hs-heart {
  color: red;
}
</style>
