<template>
  <Head>
    <Title>Activity Points | {{ $config.projectMetadataTitle }}</Title>
    <Meta
      property="og:title"
      :content="'Activity Points | ' + $config.projectMetadataTitle"
    />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i
          class="bi bi-arrow-left-circle cursor-pointer"
          @click="$router.back()"
        ></i>
      </p>

      <h3 class="mb-3 mt-3">Mappy Points</h3>

      <p class="text-break mt-3">Your current Activity Points balance:</p>

      <!-- Input field -->
      <div class="row">
        <div class="col-md-5">
          <div class="input-group">
            <input
              :value="userStore.getCurentUserActivityPoints"
              type="text"
              class="form-control"
              disabled
            />

            <button
              class="btn btn-primary disabled"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Activity Points
            </button>
          </div>
        </div>
      </div>

      <p class="text-break mt-4 mb-3">
        By actively using {{ $config.projectName }} features, you can earn more
        Mappy Points.
      </p>

      <!-- FAQ Section for Mappy Points -->
      <div class="accordion" id="activityPointsFAQ">
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingOne">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="true"
              aria-controls="collapseOne"
            >
              What are Mappy Points?
            </button>
          </h2>
          <div
            id="collapseOne"
            class="accordion-collapse collapse show"
            aria-labelledby="headingOne"
          >
            <div class="accordion-body">
              Mappy Points, quantified in Gwei, provide a uniform system to
              measure and compare user actions...
            </div>
          </div>
        </div>
        <div class="accordion-item">
          <h2 class="accordion-header" id="headingTwo">
            <button
              class="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseTwo"
              aria-expanded="false"
              aria-controls="collapseTwo"
            >
              How to earn more Mappy Points?
            </button>
          </h2>
          <div
            id="collapseTwo"
            class="accordion-collapse collapse"
            aria-labelledby="headingTwo"
          >
            <div class="accordion-body">
              Earn additional activity points by using features, referring
              friends, and participating in community activities...
            </div>
          </div>
        </div>
        <!-- Additional FAQ items can be added here -->
      </div>

      <hr />

      <h5 class="text-break mt-4 mb-3">Share referral link to earn more MPs</h5>

      <p class="text-break mt-2 mb-3">
        Earn additional Mappy points (and referral fees) by sharing your
        referral link:
      </p>

      <div class="row mt-2">
        <div class="col-md-6">
          <ShareReferralLink />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEthers } from "vue-dapp";
import { useUserStore } from "~/store/user";
import { getActivityPoints } from "~/utils/balanceUtils";
import ShareReferralLink from "~/components/referrals/ShareReferralLink.vue";

export default {
  name: "ActivityPoints",

  components: {
    ShareReferralLink,
  },

  mounted() {
    this.fetchActivityPoints();
  },

  methods: {
    getActivityPoints,

    async fetchActivityPoints() {
      if (this.$config.activityPointsAddress && this.address) {
        const activityPoints = await this.getActivityPoints(this.address);
        this.userStore.setCurrentUserActivityPoints(activityPoints);
      }
    },
  },

  setup() {
    const { address } = useEthers();
    const userStore = useUserStore();

    return { address, userStore };
  },
};
</script>
