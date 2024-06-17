<template>
  <div class="voting-container">
    <Head>
      <Title>Vote | {{ $config.projectMetadataTitle }}</Title>
      <Meta
        name="description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
      <Meta
        property="og:image"
        :content="$config.projectUrl + $config.previewImagePostNft"
      />
      <Meta
        property="og:description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
      <Meta
        name="twitter:image"
        :content="$config.projectUrl + $config.previewImagePostNft"
      />
      <Meta
        name="twitter:description"
        :content="'Participate in the vote on ' + $config.projectName + '!'"
      />
    </Head>

    <div v-if="loading">
      <div class="loading">
        <i class="bi bi-hourglass-split"></i> Loading proposal...
      </div>
    </div>

    <div v-else-if="proposalId && currentProposal">
      <div>
        <h2>{{ currentProposal.title }}</h2>
        <p :class="{ ongoing: !isVoteEnded, ended: isVoteEnded }">
          {{ isVoteEnded ? "This vote has ended" : "This vote is ongoing" }}
        </p>
        <p>
          {{ currentProposal.description }}
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
            <h2>{{ currentProposal.overview.title }}</h2>
            <p>{{ currentProposal.overview.content }}</p>
          </section>
          <section class="section">
            <h2>{{ currentProposal.details.title }}</h2>
            <p>{{ currentProposal.details.content }}</p>
          </section>
          <section class="section">
            <h2>{{ currentProposal.steps.title }}</h2>
            <ul class="steps-list">
              <li
                v-for="(step, index) in currentProposal.steps.steps"
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
              v-for="(option, index) in currentProposal.options"
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
                    option.showFullDescription &&
                    option.description.length > 200
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

      <div>
        <h2>{{ proposal.description }}</h2>
        <p>
          End Time: {{ new Date(proposal.endTime * 1000).toLocaleString() }}
        </p>
        <p>
          Status:
          <span :class="{ ongoing: !isVoteEnded, ended: isVoteEnded }">
            {{ isVoteEnded ? "Vote Ended" : "Vote Ongoing" }}
          </span>
        </p>
        <p v-if="!isVoteEnded">Time Remaining: {{ timeRemaining }}</p>
        <div
          v-for="(vote, index) in proposal.votes"
          :key="index"
          class="vote-bar"
        >
          <div class="vote-header">
            <p>
              {{ currentProposal.options[index].name }}:
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
                {{ currentProposal.options[index].name }}
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

      <div v-if="currentProposal && currentProposal.footer" class="footer-info">
        <p>{{ currentProposal.footer.snapshot }}</p>
        <p>{{ currentProposal.footer.eligibility }}</p>
        <p>{{ currentProposal.footer.disclaimer }}</p>
        <p>
          <a :href="currentProposal.footer.moreDetails" target="_blank"
            >More details</a
          >
        </p>
      </div>
    </div>

    <div v-else>
      <p>Loading proposal...</p>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import { useEthers } from "vue-dapp";
import VotingTokenABI from "~/assets/abi/VotingToken.json";
import ERC20ABI from "~/assets/abi/Erc20Abi.json";
import Toastification from "vue-toastification";
const { useToast } = Toastification;
import votingInfoData from "~/assets/votingInfo.json";
import { useRouter, useRoute } from "vue-router";

const RPC_URL = "https://scroll.drpc.org";
const VOTING_CONTRACT_ADDRESS = "0x31f77C3b3b643bc8aF4779b0D0a3a87cF747B089";
const TOKEN_CONTRACT_ADDRESS = "0xb65aD8d81d1E4Cb2975352338805AF6e39BA8Be8";
const ACTIVITY_POINTS_CONTRACT_ADDRESS =
  "0x9904CE72Cd7427F59bBe53bc69211081159fcf0a";

export default {
  data() {
    return {
      proposalId: null,
      currentProposal: null,
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
      loading: true,
    };
  },
  async mounted() {
    await this.loadProposal();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    async loadProposal() {
      const route = useRoute();
      const proposalId = parseInt(route.query.id);
      this.proposalId = proposalId;
      this.currentProposal = votingInfoData.find(
        (info) => info.id === proposalId,
      );
      if (!this.currentProposal) {
        this.redirectToProposalsList();
        return;
      }
      if (this.currentProposal.options) {
        this.currentProposal.options.forEach(
          (option) => (option.showFullDescription = false),
        );
      }
      await this.fetchProposalDetails();
      await this.checkEligibility();
      await this.checkHasVoted();
      await this.fetchMultiplier();
      this.updateTimeRemaining();
      this.timer = setInterval(this.updateTimeRemaining, 1000);
      this.loading = false;
    },
    redirectToProposalsList() {
      const router = useRouter();
      router.push("/elector");
    },
    async fetchProposalDetails() {
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          provider,
        );
        const [description, endTime, numResponses, votes] =
          await contract.getProposalDetails(this.proposalId);
        const votesBN = votes.map((vote) => ethers.BigNumber.from(vote));
        const totalVotes = votesBN.reduce(
          (acc, val) => acc.add(val),
          ethers.BigNumber.from(0),
        );
        this.proposal = {
          id: this.proposalId,
          description,
          endTime: parseInt(endTime.toString(), 10),
          numResponses: parseInt(numResponses.toString(), 10),
          votes: votesBN,
        };
        this.totalVotes = totalVotes;
        this.isVoteEnded = Date.now() / 1000 > endTime;
      } catch (error) {
        console.error("Error fetching proposal details:", error);
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
        const balance = await tokenContract.balanceOf(address.value);
        this.isEligible = balance.gt(0);
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
        const hasVoted = await contract.hasVoted(
          address.value,
          this.proposalId,
        );
        this.hasVoted = hasVoted;
      } catch (error) {
        console.error("Error checking if user has voted:", error);
      }
    },
    async fetchMultiplier() {
      try {
        const { address } = useEthers();
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const apContract = new ethers.Contract(
          ACTIVITY_POINTS_CONTRACT_ADDRESS,
          ERC20ABI,
          provider,
        );
        const multiplier = await apContract.multiplier(address.value);
        this.multiplier = parseInt(multiplier.toString(), 10);
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
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const { address } = useEthers();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const votingContract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VotingTokenABI,
          signer,
        );
        this.isLoading = true;
        const tx = await votingContract.vote(proposalId, responseIndex);
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
      this.currentProposal.options[index].showFullDescription =
        !this.currentProposal.options[index].showFullDescription;
    },
    toggleMoreDetails() {
      this.showMoreDetails = !this.showMoreDetails;
    },
    updateTimeRemaining() {
      if (this.proposal && !this.isVoteEnded) {
        const now = Date.now() / 1000;
        const timeDiff = this.proposal.endTime - now;
        if (timeDiff <= 0) {
          this.timeRemaining = "0h 0m 0s";
          this.isVoteEnded = true;
        } else {
          const hours = Math.floor(timeDiff / 3600);
          const minutes = Math.floor((timeDiff % 3600) / 60);
          const seconds = Math.floor(timeDiff % 60);
          this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
        }
      }
    },
  },
};
</script>

<style scoped>
.voting-container {
  padding: 20px;
  background-color: var(--bs-light);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}
h1 {
  font-size: 2em;
  margin-bottom: 20px;
}
.ongoing {
  color: #28a745;
}
.ended {
  color: #dc3545;
}
.more-details-link {
  color: #007bff;
  cursor: pointer;
}
.section {
  margin-top: 20px;
}
.options-section {
  margin-top: 30px;
}
.option-item {
  margin-bottom: 20px;
}
.option-card {
  padding: 15px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 5px;
}
.vote-bar {
  margin-top: 10px;
}
.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.vote-button {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}
.vote-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.progress {
  height: 20px;
  background-color: #e9ecef;
  border-radius: 5px;
}
.progress-bar {
  height: 100%;
  background-color: #007bff;
  transition: width 0.6s ease;
}
.loading-indicator {
  margin-top: 20px;
  text-align: center;
}
.vote-confirmation {
  margin-top: 20px;
  text-align: center;
  color: #28a745;
}
.footer-info {
  margin-top: 30px;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}
</style>