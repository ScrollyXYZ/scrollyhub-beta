<template>
  <div class="voting-container">
    <div v-if="currentVotingInfo">
      <h1>{{ currentVotingInfo.title }}</h1>
      <p :class="{ ongoing: !isVoteEnded, ended: isVoteEnded }">
        {{ isVoteEnded ? "This vote has ended" : "This vote is ongoing" }}
      </p>
      <p>
        {{ currentVotingInfo.description }}
        <a
          href="#"
          @click.prevent="toggleMoreDetails"
          class="more-details-link"
        >
          See more details
          <i
            :class="{
              'bi bi-chevron-down': !showMoreDetails,
              'bi bi-chevron-up': showMoreDetails,
            }"
          ></i>
        </a>
      </p>

      <div v-if="showMoreDetails" class="animated fadeIn">
        <section class="section">
          <h2>{{ currentVotingInfo.overview.title }}</h2>
          <p>{{ currentVotingInfo.overview.content }}</p>
        </section>

        <section class="section">
          <h2>{{ currentVotingInfo.details.title }}</h2>
          <p>{{ currentVotingInfo.details.content }}</p>
        </section>

        <section class="section">
          <h2>{{ currentVotingInfo.steps.title }}</h2>
          <ul class="steps-list">
            <li
              v-for="(step, index) in currentVotingInfo.steps.steps"
              :key="index"
            >
              {{ step }}
            </li>
          </ul>
        </section>
      </div>

      <section class="section options-section">
        <h2>Options</h2>
        <ul class="options-list">
          <li
            v-for="(option, index) in currentVotingInfo.options"
            :key="index"
            class="option-item"
          >
            <div class="option-card">
              <strong>{{ option.name }}</strong>
              <p class="option-description">
                {{ truncatedDescription(option.description) }}
                <template v-if="option.description.length > 200">
                  <a
                    href="#"
                    @click.prevent="toggleOptionDetails(index)"
                    class="option-link"
                  >
                    <span v-if="!option.showFullDescription">See more</span>
                    <span v-else>Show less</span>
                  </a>
                </template>
              </p>
              <div
                v-if="
                  option.showFullDescription && option.description.length > 200
                "
                class="animated fadeIn"
              >
                <p>{{ option.description }}</p>
              </div>
              <template v-if="option.url">
                <a :href="option.url" target="_blank" class="option-link">
                  <i class="bi bi-link-45deg"></i> More information
                </a>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <div v-if="proposal">
      <h2>{{ proposal.description }}</h2>
      <p>End Time: {{ new Date(proposal.endTime * 1000).toLocaleString() }}</p>
      <p>
        Status:
        <span :class="{ ongoing: !isVoteEnded, ended: isVoteEnded }">{{
          isVoteEnded ? "Vote Ended" : "Vote Ongoing"
        }}</span>
      </p>
      <p v-if="!isVoteEnded">Time Remaining: {{ timeRemaining }}</p>
      <div
        v-for="(vote, index) in proposal.votes"
        :key="index"
        class="vote-bar"
      >
        <div class="vote-header">
          <p>
            {{ currentVotingInfo.options[index].name }}:
            {{ getPercentage(vote) }}% ({{ formatEther(vote) }} votes)
          </p>
          <template v-if="!isLoading && !isVoteEnded">
            <button
              v-if="!hasVoted"
              @click="castVote(proposal.id, index)"
              :disabled="!isEligible || isLoading"
              class="vote-button"
            >
              <i class="bi bi-check-circle"></i> Vote for
              {{ currentVotingInfo.options[index].name }}
            </button>
          </template>
        </div>
        <div class="progress">
          <div
            class="progress-bar"
            :class="'progress-bar-' + (index + 1)"
            role="progressbar"
            :style="{ width: getPercentage(vote) + '%' }"
            :aria-valuenow="getPercentage(vote)"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <p>Total Votes: {{ formatEther(totalVotes) }}</p>
      <p v-if="isEligible">
        Your Activity Points give you a voting bonus of: +{{
          (multiplier / 10 - 1) * 100
        }}%
      </p>
    </div>
    <div v-else>
      <p>Loading proposal...</p>
    </div>
    <transition name="fade">
      <div>
        <div v-if="isLoading" class="loading-indicator">
          <i class="bi bi-hourglass-split"></i> Waiting for transaction to
          confirm...
        </div>
        <div
          v-if="showVoteConfirmation && !isLoading"
          class="vote-confirmation"
        >
          <i class="bi bi-check-circle"></i> Your vote has been counted!
        </div>
      </div>
    </transition>
    <div
      v-if="currentVotingInfo && currentVotingInfo.footer"
      class="footer-info"
    >
      <p>{{ currentVotingInfo.footer.snapshot }}</p>
      <p>{{ currentVotingInfo.footer.eligibility }}</p>
      <p>{{ currentVotingInfo.footer.disclaimer }}</p>
      <p>
        <a :href="currentVotingInfo.footer.moreDetails" target="_blank"
          >More details</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import VotingTokenABI from "~/assets/abi/VotingToken.json";
import ERC20ABI from "~/assets/abi/Erc20Abi.json";
import { useToast } from "vue-toastification";
import votingInfoData from "~/assets/votingInfo.json";
import { useRouter } from "vue-router";

const RPC_URL = "https://scroll.drpc.org";
const VOTING_CONTRACT_ADDRESS = "0x31f77C3b3b643bc8aF4779b0D0a3a87cF747B089";
const TOKEN_CONTRACT_ADDRESS = "0xb65aD8d81d1E4Cb2975352338805AF6e39BA8Be8";
const ACTIVITY_POINTS_CONTRACT_ADDRESS =
  "0x9904CE72Cd7427F59bBe53bc69211081159fcf0a";

export default {
  props: ["proposalId"],
  data() {
    return {
      currentVotingInfo: null,
      proposal: null,
      totalVotes: ethers.BigNumber.from(0),
      isEligible: false,
      hasVoted: false,
      userVoteChoice: null,
      multiplier: 10,
      isLoading: false,
      showVoteConfirmation: false,
      timeRemaining: "",
      isVoteEnded: false,
      showMoreDetails: false,
    };
  },
  async mounted() {
    this.loadVotingInfo();
    if (!this.currentVotingInfo) {
      this.redirectToProposalsList();
      return;
    }
    await this.fetchProposalDetails();
    await this.checkEligibility();
    await this.checkHasVoted();
    await this.fetchMultiplier();
    this.updateTimeRemaining();
    this.timer = setInterval(this.updateTimeRemaining, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    loadVotingInfo() {
      const proposalId = parseInt(this.proposalId);
      this.currentVotingInfo = votingInfoData.find(
        (info) => info.id === proposalId,
      );
      if (this.currentVotingInfo && this.currentVotingInfo.options) {
        this.currentVotingInfo.options.forEach(
          (option) => (option.showFullDescription = false),
        );
      }
    },
    redirectToProposalsList() {
      this.$router.push("/vote/ProposalsList");
    },
    async fetchProposalDetails() {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          provider,
        );
        const proposalId = parseInt(this.proposalId);

        console.log("Fetching proposal details...");
        const [description, endTime, numResponses, votes] =
          await contract.getProposalDetails(proposalId);

        console.log("Proposal details fetched", {
          description,
          endTime,
          numResponses,
          votes,
        });

        const votesBN = votes.map((vote) => ethers.BigNumber.from(vote));
        const totalVotes = votesBN.reduce(
          (acc, val) => acc.add(val),
          ethers.BigNumber.from(0),
        );

        this.proposal = {
          id: proposalId,
          description,
          endTime,
          numResponses,
          votes: votesBN,
        };
        this.totalVotes = totalVotes;
        this.isVoteEnded = Date.now() / 1000 > endTime;

        console.log("Total votes calculated", totalVotes.toString());
      } catch (error) {
        console.error("Error fetching proposal details:", error);
      }
    },
    updateTimeRemaining() {
      if (this.proposal) {
        const now = Date.now() / 1000;
        const endTime = this.proposal.endTime;
        if (now > endTime) {
          this.timeRemaining = "Vote ended";
          this.isVoteEnded = true;
          clearInterval(this.timer);
        } else {
          const timeDiff = endTime - now;
          const hours = Math.floor(timeDiff / 3600);
          const minutes = Math.floor((timeDiff % 3600) / 60);
          const seconds = Math.floor(timeDiff % 60);
          this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
        }
      }
    },
    async checkEligibility() {
      try {
        const { address } = useEthers();
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const tokenContract = new ethers.Contract(
          TOKEN_CONTRACT_ADDRESS,
          ERC20ABI,
          provider,
        );
        console.log("Checking eligibility...");
        const balance = await tokenContract.balanceOf(address.value);
        console.log("User balance:", balance.toString());
        this.isEligible = balance.gt(0);
        console.log("Is eligible:", this.isEligible);
      } catch (error) {
        console.error("Error checking eligibility:", error);
      }
    },
    async checkHasVoted() {
      try {
        const { address } = useEthers();
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          provider,
        );
        const currentSnapshotId = await contract.currentSnapshotId();
        console.log("Current snapshot ID:", currentSnapshotId.toString());
        this.hasVoted = await contract.hasVoted(
          currentSnapshotId,
          address.value,
        );
        console.log("Has voted:", this.hasVoted);
      } catch (error) {
        console.error("Error checking if user has voted:", error);
      }
    },
    async fetchMultiplier() {
      try {
        const { address } = useEthers();
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const activityPointsContract = new ethers.Contract(
          ACTIVITY_POINTS_CONTRACT_ADDRESS,
          ["function getPoints(address user) view returns (uint256)"],
          provider,
        );
        console.log("Fetching activity points...");
        const activityPoints = await activityPointsContract.getPoints(
          address.value,
        );
        console.log("Activity points:", activityPoints.toString());
        const contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          provider,
        );
        this.multiplier = await contract.getMultiplier(activityPoints);
        console.log("Multiplier:", this.multiplier.toString());
      } catch (error) {
        console.error("Error fetching multiplier:", error);
      }
    },
    async castVote(proposalId, responseIndex) {
      const toast = useToast();

      try {
        if (!window.ethereum) {
          alert(
            "MetaMask is not installed. Please install MetaMask and try again.",
          );
          return;
        }

        console.log("Requesting MetaMask account access...");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("MetaMask account access granted.");

        const { address } = useEthers();
        console.log("User address:", address.value);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        if (!signer) {
          console.error(
            "Signer not found. Please ensure MetaMask is connected and authorized.",
          );
          return;
        }

        console.log("Signer found. Proceeding with the transaction...");
        const votingContract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          signer,
        );

        console.log(
          "Voting for proposalId:",
          proposalId,
          "responseIndex:",
          responseIndex,
        );

        this.isLoading = true;

        const tx = await votingContract.vote(proposalId, responseIndex);
        console.log("Transaction sent:", tx);

        const toastWait = toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see the transaction in the block explorer.",
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
        console.log("Transaction receipt:", receipt);

        if (receipt.status === 1) {
          toast.dismiss(toastWait);

          toast("Vote successful!", {
            type: "success",
            onClick: () =>
              window
                .open(
                  this.$config.blockExplorerBaseUrl + "/tx/" + tx.hash,
                  "_blank",
                )
                .focus(),
          });

          this.hasVoted = true;
          this.userVoteChoice = responseIndex + 1;
          this.showVoteConfirmation = true;
          setTimeout(() => {
            this.showVoteConfirmation = false;
          }, 3000);

          await this.fetchProposalDetails();
        } else {
          toast.dismiss(toastWait);
          toast("Transaction failed.", {
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
        console.error("Error voting:", e);

        try {
          let extractMessage = e.message.split("reason=")[1];
          extractMessage = extractMessage.split(", method=")[0];
          extractMessage = extractMessage.replace(/"/g, "");
          extractMessage = extractMessage.replace(
            "execution reverted:",
            "Error:",
          );

          console.log(extractMessage);

          toast(extractMessage, { type: "error" });
        } catch (e) {
          toast("Transaction failed.", { type: "error" });
        }
      } finally {
        this.isLoading = false;
      }
    },
    getPercentage(vote) {
      if (this.totalVotes.isZero()) {
        return 0;
      }
      return vote.mul(100).div(this.totalVotes).toNumber();
    },
    formatEther(value) {
      const formatted = ethers.utils.formatEther(value);
      return parseFloat(formatted).toFixed(2);
    },
    truncatedDescription(description) {
      return description.length > 200
        ? description.substring(0, 200) + "..."
        : description;
    },
    toggleOptionDetails(index) {
      this.currentVotingInfo.options[index].showFullDescription =
        !this.currentVotingInfo.options[index].showFullDescription;
    },
    toggleMoreDetails() {
      this.showMoreDetails = !this.showMoreDetails;
    },
  },
};
</script>

<style scoped>
.voting-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;
  max-width: 800px;
  margin: 0 auto;
}
h1,
h2 {
  color: #333;
}
.section {
  margin-bottom: 20px;
}
.section.options-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}
.option-item {
  margin-bottom: 15px;
  list-style: none;
}
.option-card {
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.option-card:hover {
  transform: translateY(-2px);
}
.option-description {
  color: #555;
}
.option-link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}
.option-link:hover {
  text-decoration: underline;
}
.footer-info {
  margin-top: 20px;
  background-color: #f1f1f1;
  padding: 15px;
  border-radius: 8px;
}
.vote-bar {
  margin-bottom: 20px;
}
.vote-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f1f1f1;
  border-radius: 5px;
}
.vote-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 5px;
}
.vote-button:hover {
  background-color: #0056b3;
}
.vote-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.progress {
  height: 20px;
  background-color: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}
.progress-bar {
  background-color: #007bff;
  transition: width 0.5s ease;
}
.progress-bar-1 {
  background-color: #ff5733;
}
.progress-bar-2 {
  background-color: #33c1ff;
}
.progress-bar-3 {
  background-color: #33ff77;
}
.progress-bar-4 {
  background-color: #ff33a1;
}
.loading-indicator {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
}
.vote-confirmation {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
}
.user-vote-choice {
  margin-top: 20px;
  font-weight: bold;
  color: #155724;
}
.ongoing {
  color: green;
}
.ended {
  color: red;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.more-details-link {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  font-weight: bold;
}
.more-details-link:hover {
  text-decoration: underline;
}
</style>
