<template>
  <div class="proposals-container">
    <h1>Proposals List</h1>
    <div v-if="proposals.length">
      <ul class="proposals-list">
        <li
          v-for="proposal in proposals"
          :key="proposal.id"
          class="proposal-item"
        >
          <div class="proposal-card">
            <nuxt-link
              :to="{ path: '/vote', query: { id: proposal.id } }"
              class="proposal-link"
            >
              <div class="proposal-content">
                <h2>Proposal {{ proposal.id }}</h2>
                <p>{{ proposal.title }}</p>
                <p
                  :class="{
                    ongoing: !isProposalEnded(proposal.endTime),
                    ended: isProposalEnded(proposal.endTime),
                  }"
                >
                  {{ isProposalEnded(proposal.endTime) ? "Ended" : "Ongoing" }}
                </p>
                <p v-if="!isProposalEnded(proposal.endTime)">
                  Time Remaining: {{ getTimeRemaining(proposal.endTime) }}
                </p>
              </div>
            </nuxt-link>
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Loading proposals...</p>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";
import VotingTokenABI from "~/assets/abi/VotingToken.json";
import proposalsData from "~/assets/votingInfo.json";
const RPC_URL = "https://scroll.drpc.org";
const VOTING_CONTRACT_ADDRESS = "0x31f77C3b3b643bc8aF4779b0D0a3a87cF747B089";
export default {
  data() {
    return {
      proposals: [],
      intervalId: null,
    };
  },
  async mounted() {
    await this.loadProposals();
    this.intervalId = setInterval(this.updateRemainingTimes, 1000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  methods: {
    async loadProposals() {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VotingTokenABI,
        provider,
      );
      const proposalPromises = proposalsData.map(async (proposal) => {
        const [description, endTime] = await contract.getProposalDetails(
          proposal.id,
        );
        return {
          id: proposal.id,
          title: proposal.title,
          endTime: parseInt(endTime.toString(), 10),
        };
      });
      this.proposals = await Promise.all(proposalPromises);
    },
    isProposalEnded(endTime) {
      return Date.now() / 1000 > endTime;
    },
    getTimeRemaining(endTime) {
      const now = Date.now() / 1000;
      const timeDiff = endTime - now;
      if (timeDiff <= 0) return "0h 0m 0s";
      const hours = Math.floor(timeDiff / 3600);
      const minutes = Math.floor((timeDiff % 3600) / 60);
      const seconds = Math.floor(timeDiff % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    },
    updateRemainingTimes() {
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
.proposals-container {
  padding: 20px;
  background-color: var(--bs-body-bg);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow);
  font-family: var(--bs-body-font-family);
  max-width: 800px;
  margin: 0 auto;
}
h1 {
  color: var(--bs-heading-color);
  text-align: center;
}
.proposals-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.proposal-item {
  margin-bottom: 20px;
}
.proposal-card {
  padding: 15px;
  background: var(--bs-white);
  border-radius: var(--bs-border-radius);
  box-shadow: var(--bs-box-shadow-sm);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.proposal-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bs-box-shadow-lg);
}
.proposal-link {
  text-decoration: none;
  color: inherit;
}
.proposal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
h2 {
  font-size: 1.5em;
  margin-bottom: 0.5em;
}
p {
  margin: 0.5em 0;
}
.ongoing {
  color: var(--bs-success);
}
.ended {
  color: var(--bs-danger);
}
</style>
