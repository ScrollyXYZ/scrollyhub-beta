import { defineStore } from "pinia";
import { ethers } from "ethers";

export const useNftStore = defineStore("nftStore", {
  state: () => ({
    nfts: [],
    provider: null,
    nftDirectoryContract: null,
    isFetching: false,
  }),
  actions: {
    async initializeProvider() {
      let retries = 3;
      while (retries > 0) {
        try {
          console.log("Initializing provider... (attempt ", retries, ")");
          const scrollRpcUrl = "https://rpc.scroll.io";
          this.provider = new ethers.providers.JsonRpcProvider(scrollRpcUrl);

          const nftDirectoryAddress =
            "0xD48e9b2D25CEe123be1d01c09645A0a355174db0";
          const nftDirectoryAbi = [
            "function getNftContractsArrayLength() external view returns (uint256)",
            "function allNftContracts(uint256) external view returns (address)",
          ];
          this.nftDirectoryContract = new ethers.Contract(
            nftDirectoryAddress,
            nftDirectoryAbi,
            this.provider,
          );
          console.log(
            "Provider and NFT directory contract initialized successfully!",
          );
          return;
        } catch (error) {
          console.warn("Provider initialization failed:", error.message);
          retries--;
          if (retries > 0) {
            console.log("Retrying in 3 seconds...");
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } else {
            throw new Error(
              "Provider initialization failed after multiple attempts.",
            );
          }
        }
      }
    },

    async checkNetwork() {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      const network = await this.provider.getNetwork();
      if (network.chainId !== 534352) {
        // Scroll chain ID
        throw new Error("Incorrect network, please connect to Scroll network");
      }
      return network;
    },

    async getRandomNft() {
      this.isFetching = true;

      if (!this.provider || !this.nftDirectoryContract) {
        console.error("Provider or NFT directory contract not initialized");
        this.isFetching = false;
        return;
      }

      try {
        // Verify network connection
        const network = await this.checkNetwork();
        console.log("Connected to network:", network);

        const arrayLengthBigNumber =
          await this.nftDirectoryContract.getNftContractsArrayLength();
        const arrayLength = arrayLengthBigNumber.toNumber();
        console.log("NFT Contract Array Length (Number):", arrayLength);

        if (arrayLength === 0) {
          console.warn("No NFT contracts found in the registry.");
          this.isFetching = false;
          return;
        }

        const randomIndex = Math.floor(Math.random() * arrayLength);
        console.log("Random Index:", randomIndex);

        const nftContractAddress =
          await this.nftDirectoryContract.allNftContracts(randomIndex);
        console.log("NFT Contract Address:", nftContractAddress);

        // Check if this NFT contract has already been fetched
        const existingNft = this.nfts.find(
          (nft) => nft.address === nftContractAddress,
        );
        if (existingNft) {
          console.warn("NFT already fetched:", existingNft);
          this.isFetching = false;
          return;
        }

        const nftInterface = new ethers.utils.Interface([
          "function getBurnPrice() public view returns (uint256)",
          "function getMintPrice() public view returns (uint256)",
          "function metadataAddress() public view returns (address)",
          "function name() public view returns (string memory)",
          "function owner() public view returns (address)",
          "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
          "function totalSupply() public view returns (uint256)",
        ]);
        const nftContract = new ethers.Contract(
          nftContractAddress,
          nftInterface,
          this.provider,
        );

        // Fetch all NFT data concurrently using Promise.all() with error handling
        const [
          priceSellWei,
          priceBuyWei,
          metadataAddress,
          name,
          authorAddress,
          supply,
        ] = await Promise.all([
          nftContract.getBurnPrice().catch((error) => {
            console.error("Error fetching getBurnPrice:", error);
            return ethers.BigNumber.from(0); // Default to 0 if there's an error
          }),
          nftContract.getMintPrice().catch((error) => {
            console.error("Error fetching getMintPrice:", error);
            return ethers.BigNumber.from(0);
          }),
          nftContract.metadataAddress().catch((error) => {
            console.error("Error fetching metadataAddress:", error);
            return null; // Or some default address if needed
          }),
          nftContract.name().catch((error) => {
            console.error("Error fetching name:", error);
            return "Unknown Name";
          }),
          nftContract.owner().catch((error) => {
            console.error("Error fetching owner:", error);
            return "0x0";
          }),
          nftContract.totalSupply().catch((error) => {
            console.error("Error fetching totalSupply:", error);
            return ethers.BigNumber.from(0);
          }),
        ]);

        console.log("NFT Data (Before Metadata Fetch):", {
          priceSellWei: priceSellWei.toString(),
          priceBuyWei: priceBuyWei.toString(),
          metadataAddress,
          name,
          authorAddress,
          supply: supply.toString(),
        });

        let description = null;
        let image = null;

        if (metadataAddress) {
          const metadataInterface = new ethers.utils.Interface([
            "function getCollectionDescription(address) public view returns (string memory)",
            "function getCollectionMetadataType(address nftAddress_) external view returns (uint256)",
            "function getCollectionPreviewImage(address) public view returns (string memory)",
          ]);
          const metadataContract = new ethers.Contract(
            metadataAddress,
            metadataInterface,
            this.provider,
          );

          try {
            [description, image] = await Promise.all([
              metadataContract.getCollectionDescription(nftContractAddress),
              metadataContract.getCollectionPreviewImage(nftContractAddress),
            ]);
            console.log("Metadata Fetched:", { description, image });
          } catch (error) {
            console.error("Error fetching metadata:", error);
          }
        }

        if (image && image.includes(".ipfs.sphn.link/")) {
          const linkParts = image.split(".ipfs.sphn.link/");
          const cid = linkParts[0].replace("https://", "");
          image = `https://ipfs.io/ipfs/${cid}/${linkParts[1]}`;
        }

        const nft = {
          address: nftContractAddress,
          name,
          description,
          image,
          priceBuyWei,
          priceSellWei,
          supply,
          authorAddress,
        };

        console.log("Fetched NFT (Complete):", nft);

        this.nfts.push(nft);
        console.log("NFT added to state");
      } catch (error) {
        console.error("Error fetching random NFT:", error.message, error);
        if (error.code === "NETWORK_ERROR") {
          console.warn("Network error detected. Refreshing provider...");
          await this.initializeProvider();
          await this.getRandomNft();
        } else {
          this.isFetching = false;
          throw error;
        }
      } finally {
        this.isFetching = false;
      }
    },
  },
  getters: {
    currentNft: (state) => state.nfts[state.nfts.length - 1],
  },
});
