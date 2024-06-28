import { defineStore } from "pinia";
import { ethers, BigNumber } from "ethers";
import { useQuestStore } from "~/store/questStore";

export const useUserStore = defineStore({
  id: "user",

  state: () => {
    return {
      activityPoints: 0, // not in wei
      address: null as string | null,
      chatTokenBalanceWei: BigInt(0),
      defaultDomain: null as string | null,
      did: null as string | null,
      didParent: null as string | null,
      followers: 0,
      following: 0,
      isConnectedToOrbis: false,
      lastActivityTimestamp: null as number | null,
      lpTokenBalanceWei: BigInt(0),
      orbisImage: null as string | null,
      stakeTokenBalanceWei: BigInt(0), // receipt token from the staking contract (aka governance token)
    };
  },

  getters: {
    getCurentUserActivityPoints(state) {
      return state.activityPoints;
    },

    getCurrentUserAddress(state) {
      return state.address;
    },

    getChatTokenBalance(state) {
      const balance = ethers.utils.formatEther(state.chatTokenBalanceWei);
      const formatter = Intl.NumberFormat("en", { notation: "compact" });
      return formatter.format(Number(balance));
    },

    getChatTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.chatTokenBalanceWei);
    },

    getDefaultDomain(state) {
      return state.defaultDomain;
    },

    getDid(state) {
      return state.did;
    },

    getDidParent(state) {
      return state.didParent;
    },

    getFollowers(state) {
      return state.followers;
    },

    getFollowing(state) {
      return state.following;
    },

    getIsConnectedToOrbis(state) {
      return state.isConnectedToOrbis;
    },

    getLastActivityTimestamp(state) {
      return state.lastActivityTimestamp;
    },

    getLpTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.lpTokenBalanceWei);
    },

    getOrbisImage(state) {
      return state.orbisImage;
    },

    getStakeTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.stakeTokenBalanceWei);
    },
  },

  actions: {
    addToChatTokenBalanceWei(balance: BigNumber) {
      this.chatTokenBalanceWei += balance.toBigInt();
    },

    addToLpTokenBalanceWei(balance: BigNumber) {
      this.lpTokenBalanceWei += balance.toBigInt();
    },

    addToStakeTokenBalanceWei(balance: BigNumber) {
      this.stakeTokenBalanceWei += balance.toBigInt();
    },

    setChatTokenBalanceWei(balance: BigNumber) {
      this.chatTokenBalanceWei = balance.toBigInt();
    },

    setCurrentUserActivityPoints(points: number) {
      this.activityPoints = points;
    },

    setCurrentUserAddress(address: string) {
      this.address = address;
    },

    setDefaultDomain(domain: string) {
      this.defaultDomain = domain;
    },

    setDid(did: string) {
      this.did = did;
    },

    setDidParent(didParent: string) {
      this.didParent = didParent;
    },

    setFollowers(followers: number) {
      this.followers = followers;
    },

    setFollowing(following: number) {
      this.following = following;
    },

    setIsConnectedToOrbis(isConnected: boolean) {
      this.isConnectedToOrbis = isConnected;
    },

    setLastActivityTimestamp(timestamp: number) {
      this.lastActivityTimestamp = timestamp;
    },

    setLpTokenBalanceWei(balance: BigNumber) {
      this.lpTokenBalanceWei = balance.toBigInt();
    },

    setOrbisImage(image: string) {
      this.orbisImage = image;
    },

    setStakeTokenBalanceWei(balance: BigNumber) {
      this.stakeTokenBalanceWei = balance.toBigInt();
    },

    async login(userAddress: string) {
      this.address = userAddress;
      const questStore = useQuestStore();
      await questStore.initializeQuests(this);
    },
  },
});
