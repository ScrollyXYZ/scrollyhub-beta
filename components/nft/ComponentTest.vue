<template>
  <div class="nft-container">
    <div v-if="loading" class="spinner-border" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-else>
      <div v-for="(nft, index) in nfts" :key="nft.cAddress" class="nft-card">
        <div class="card border mb-3">
          <div class="card-body">
            <div class="text-center mb-3">
              <h3 class="mb-0">{{ nft.cName || "NFT Collection Details" }}</h3>
            </div>
            <div class="nft-image text-center mb-3">
              <Image
                :url="nft.cImage"
                :alt="nft.cName"
                cls="img-fluid img-thumbnail rounded"
                @error="onImageError(index)"
                @load="onImageLoad(index)"
              />
            </div>
            <div class="nft-details mt-1 mb-4 muted-text text-center">
              <p class="me-4">
                <i class="bi bi-coin me-1"></i>Buy price:
                {{ formatPrice(nft.priceBuyWei) }} {{ tokenSymbol }}
              </p>
              <p class="me-4">
                <i class="bi bi-file-earmark-text-fill me-1"></i
                ><span v-html="nft.cDescription"></span>
              </p>
            </div>
          </div>
          <div class="card-footer text-center" v-if="!nft.minted">
            <button
              @click="buyNft(nft.cAddress, nft.priceBuyWei, index)"
              class="btn btn-success me-2"
              :disabled="waitingBuy"
            >
              <i class="bi bi-check-circle"></i> Buy
            </button>
            <button @click="rejectNft(index)" class="btn btn-danger">
              <i class="bi bi-x-circle"></i> Reject
            </button>
          </div>
          <div class="card-footer text-center" v-else>
            <p class="text-success">
              <i class="bi bi-check-circle"></i> NFT successfully minted!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers, shortenAddress } from "vue-dapp";
import { useToast } from "vue-toastification/dist/index.mjs";
import sanitizeHtml from "sanitize-html";
import Image from "~/components/Image.vue";
import WaitingToast from "~/components/WaitingToast.vue";

export default {
  name: "NftCollection",
  components: {
    Image,
    WaitingToast,
  },
  data() {
    return {
      nfts: [],
      loading: true,
      waitingBuy: false,
      tokenSymbol: "ETH",
    };
  },
  mounted() {
    if (window.ethereum) {
      this.preloadNftContracts(3);
    } else {
      console.error("MetaMask is not installed");
    }
  },
  methods: {
    async preloadNftContracts(count) {
      for (let i = 0; i < count; i++) {
        await this.getRandomNftContract();
      }
      this.loading = false;
    },
    async getRandomNftContract() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractAddress = "0xD48e9b2D25CEe123be1d01c09645A0a355174db0";
        const contractAbi = [
          "function getNftContractsArrayLength() view returns (uint256)",
          "function allNftContracts(uint256) view returns (address)",
        ];
        const contract = new ethers.Contract(
          contractAddress,
          contractAbi,
          provider,
        );
        const arrayLength = await contract.getNftContractsArrayLength();
        const randomIndex = Math.floor(Math.random() * arrayLength);
        const nftContractAddress = await contract.allNftContracts(randomIndex);

        const nftDetails = await this.getCollectionDetails(nftContractAddress);
        this.nfts.push(nftDetails);
      } catch (error) {
        console.error("Error fetching random NFT contract:", error);
      }
    },
    async getCollectionDetails(cAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const nftInterface = new ethers.utils.Interface([
        "function getBurnPrice() public view returns (uint256)",
        "function getMintPrice() public view returns (uint256)",
        "function metadataAddress() public view returns (address)",
        "function name() public view returns (string memory)",
      ]);
      const nftContract = new ethers.Contract(cAddress, nftInterface, provider);
      const priceBuyWei = await nftContract.getMintPrice();
      const mdAddress = await nftContract.metadataAddress();

      const metadataInterface = new ethers.utils.Interface([
        "function getCollectionDescription(address) public view returns (string memory)",
        "function getCollectionPreviewImage(address) public view returns (string memory)",
      ]);
      const metadataContract = new ethers.Contract(
        mdAddress,
        metadataInterface,
        provider,
      );

      const cImage = await metadataContract.getCollectionPreviewImage(cAddress);
      let cDescription =
        await metadataContract.getCollectionDescription(cAddress);
      const cName = await nftContract.name();

      // Sanitize the description
      cDescription = sanitizeHtml(cDescription);

      return {
        cAddress,
        cDescription,
        cImage,
        cName,
        priceBuyWei,
        minted: false,
      };
    },
    formatPrice(priceWei) {
      if (priceWei === null) {
        return null;
      }
      const price = Number(ethers.utils.formatEther(priceWei));
      if (price > 100) {
        return price.toFixed(0);
      } else if (price > 1) {
        return price.toFixed(2);
      } else if (price > 0.1) {
        return price.toFixed(4);
      } else if (price > 0.01) {
        return price.toFixed(5);
      } else if (price > 0.001) {
        return price.toFixed(6);
      } else if (price > 0.0001) {
        return price.toFixed(7);
      } else if (price > 0.00001) {
        return price.toFixed(8);
      } else if (price > 0.000001) {
        return price.toFixed(9);
      } else {
        return price;
      }
    },
    async buyNft(cAddress, priceBuyWei, index) {
      this.waitingBuy = true;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftInterface = new ethers.utils.Interface([
        "function mint(address to) external payable returns (uint256)",
      ]);
      const nftContract = new ethers.Contract(cAddress, nftInterface, signer);

      try {
        const tx = await nftContract.mint(await signer.getAddress(), {
          value: priceBuyWei,
        });
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
                .open(`https://scrollscan.com/tx/${tx.hash}`, "_blank")
                .focus(),
          },
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully bought the NFT! Congrats!", {
            type: "success",
            onClick: () =>
              window
                .open(`https://scrollscan.com/tx/${tx.hash}`, "_blank")
                .focus(),
          });
          this.nfts.splice(index, 1);
          await this.getRandomNftContract();
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: "error",
            onClick: () =>
              window
                .open(`https://scrollscan.com/tx/${tx.hash}`, "_blank")
                .focus(),
          });
        }
      } catch (e) {
        console.error(e);
        let errorMessage = "Transaction has failed.";
        if (e.message.includes("reason=")) {
          errorMessage = e.message
            .split("reason=")[1]
            .split(",")[0]
            .replace(/"/g, "");
        }
        this.toast(errorMessage, { type: "error" });
      }

      this.waitingBuy = false;
    },
    async rejectNft(index) {
      this.nfts.splice(index, 1);
      await this.getRandomNftContract();
    },
    onImageError(index) {
      return () => {
        this.nfts[index].validImage = false;
      };
    },
    onImageLoad(index) {
      return () => {
        this.nfts[index].validImage = true;
      };
    },
  },
  setup() {
    const { address, isActivated } = useEthers();
    const toast = useToast();
    return { address, isActivated, shortenAddress, toast };
  },
};
</script>

<style scoped>
.nft-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner-border {
  margin: auto;
  display: block;
}

.nft-card {
  width: 300px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.nft-card:hover {
  transform: scale(1.05);
}

.nft-image img {
  max-height: 300px;
  object-fit: contain;
  border-radius: 15px 15px 0 0;
}

.card-footer {
  display: flex;
  justify-content: space-around;
}

.btn {
  width: 45%;
}

.muted-text {
  color: #6c757d;
  font-size: 14px;
}
</style>
