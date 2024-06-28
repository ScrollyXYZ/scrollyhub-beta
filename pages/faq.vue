<template>
  <div :class="['faq-container', { 'dark-mode': isDarkMode }]">
    <header :class="['header-section', { 'dark-mode': isDarkMode }]">
      <div class="header-content">
        <h1 class="faq-title">FAQ: Scrolly Badges</h1>
        <p class="faq-intro">
          Find answers to common questions about Scrolly Badges, how to earn
          them, their benefits, and more.
        </p>
      </div>
    </header>

    <section class="faq-section">
      <div class="faq-frame">
        <div class="faq">
          <div
            class="faq-category"
            v-for="(category, index) in faqData"
            :key="index"
          >
            <button @click="toggleCategory(index)" class="category-title">
              {{ category.title }}
              <span
                class="toggle-icon"
                :class="{ open: activeCategory === index }"
              ></span>
            </button>
            <div v-if="showAll || activeCategory === index">
              <details
                v-for="(item, idx) in category.items"
                :key="idx"
                class="faq-item"
                @toggle="handleToggle($event, index, idx)"
              >
                <summary class="faq-question">{{ item.question }}</summary>
                <p class="faq-answer">{{ item.answer }}</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useThemeStore } from "~/store/theme";

export default {
  name: "FAQPage",
  data() {
    return {
      showAll: false,
      activeCategory: null,
      activeDetail: null,
      faqData: [
        {
          title: "General Information",
          items: [
            {
              question: "What are Scrolly Badges?",
              answer:
                "Scrolly Badges are rewards for active participants in the Scrolly community, recognizing significant contributions and achievements.",
            },
            {
              question: "Who is behind Scrolly Badges?",
              answer:
                "Scrolly Badges are created in collaboration with Scroll, a decentralized ecosystem.",
            },
            {
              question: "What is the Scroll Canvas?",
              answer:
                "Scroll Canvas is a platform where users can showcase on-chain credentials, statuses, and achievements issued and collected across the Scroll ecosystem.",
            },
          ],
        },
        {
          title: "Earning Mappy Points",
          items: [
            {
              question: "How do I earn Mappy Points?",
              answer:
                "Join the Hub, mint a .Scrolly Domain, and earn points through quests, contests, on-chain activities, and referrals.",
            },
            {
              question: "What are the different ways to earn Mappy Points?",
              answer:
                "There are three main ways:\n1. Quests and Contests\n2. On-chain Activities\n3. Referrals",
            },
            {
              question:
                "What activities earn Mappy Points and how many points do they provide?",
              answer:
                "Create an NFT collection: 1 MP, unlimited\nMint/Sell an NFT: 1 MP, unlimited\nMint a .SCROLLY: 169 MP, up to 3 times\nMint a user post: 1 MP, unlimited\nSocial Hub Contest: 100-0 AP, unlimited\nMini-game hosted by Scrolly Team: 100-0 AP, unlimited\nAMA: 100-0 AP, up to 3 times",
            },
          ],
        },
        {
          title: "Badge Evolution",
          items: [
            {
              question: "How do Scrolly Badges evolve?",
              answer:
                "Scrolly Badges are evolutive, automatically upgrading as you earn more Mappy Points, up to a maximum of 6000 points.",
            },
            {
              question:
                "What are the different tiers of Scrolly Badges and their requirements?",
              answer:
                "Scrolly Baby: 1 MP\nScrolly Novice: 667 MP\nScrolly Explorer: 1221 MP\nScrolly Mapper: 2442 MP\nCarto Maestro: 4200 MP\nGrand Cartographer of Scrolly: 6000 MP",
            },
          ],
        },
        {
          title: "Tracking and Claiming Badges",
          items: [
            {
              question: "How can I track my progress?",
              answer:
                "Track your progress and Mappy Points on your profile page.",
            },
            {
              question: "How do I claim my badge?",
              answer:
                "You can mint the badge by clicking on the Skelly popup at the bottom or directly on Scroll Canvas.",
            },
          ],
        },
        {
          title: "Referral Program",
          items: [
            {
              question: "How does the referral program work?",
              answer:
                "Share your referral link to earn Mappy Points when your friends join and participate. You earn 5% commission on the points your referrals earn.",
            },
          ],
        },
        {
          title: "Benefits and Usage",
          items: [
            {
              question: "What are the benefits of having Scrolly Badges?",
              answer:
                "Enjoy various rewards and benefits within the Scrolly community, including recognition and potential future perks.",
            },
            {
              question: "Can badges be transferred?",
              answer:
                "No, badges are wallet-bound and non-transferable attestations.",
            },
            {
              question: "How does my activity affect community votes?",
              answer:
                "Your activity can influence community votes, with a power cap up to 4200 points, allowing up to 300% voting power based on your Mappy Points.",
            },
          ],
        },
        {
          title: "Technical Information",
          items: [
            {
              question: "What frameworks and technologies are used in Scrolly?",
              answer:
                "Scrolly is built on top of various decentralized and open-source technologies such as IPFS, Ceramic Network, Orbis, Punk Domains, Iggy Social (modified by the Scrolly team), and custom voting and quest systems developed by Scrolly.",
            },
            {
              question: "What is the role of Scroll in the Scrolly ecosystem?",
              answer:
                "Scroll is a Layer 2 solution. Scrolly is a community token on the Scroll Layer 2 network, with a team working to develop and grow the community.",
            },
          ],
        },
        {
          title: "Additional Resources",
          items: [
            {
              question: "Where can I find more information?",
              answer: "More information is available on Scroll.io.",
            },
          ],
        },
      ],
    };
  },
  computed: {
    isDarkMode() {
      const themeStore = useThemeStore();
      return themeStore.getIsDarkMode;
    },
  },
  methods: {
    toggleCategory(categoryIndex) {
      if (this.activeCategory === categoryIndex) {
        this.activeCategory = null;
      } else {
        this.activeCategory = categoryIndex;
        this.activeDetail = null;
      }
    },
    handleToggle(event, categoryIndex, itemIndex) {
      if (!this.showAll && event.target.open) {
        this.activeDetail = { category: categoryIndex, item: itemIndex };
        this.$nextTick(() => {
          const detailsElements = document.querySelectorAll(".faq-item");
          detailsElements.forEach((detail) => {
            if (detail !== event.target) {
              detail.removeAttribute("open");
            }
          });
        });
      }
    },
  },
};
definePageMeta({
  layout: "quests",
});
</script>
<style scoped>
.faq-container {
  margin: 0 auto;
  padding: 20px;
  max-width: 800px;
  font-family: Arial, sans-serif;
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-section {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--card-bg);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.main-content {
  padding: 20px;
}

.box {
  margin-bottom: 20px;
}

.faq-frame {
  padding: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.faq-title,
.faq-intro,
.faq-header {
  color: var(--card-text);
}

.faq-category {
  margin-bottom: 1rem;
}

.category-title {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--card-text);
  text-align: left;
  width: 100%;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--accordion-bg);
  border-radius: 5px;
  margin-bottom: 10px;
  transition:
    background-color 0.3s,
    transform 0.3s;
}

.category-title:hover {
  background: var(--accordion-hover-bg);
  transform: translateY(-2px);
}

.toggle-icon {
  transition: transform 0.3s;
}

.toggle-icon::after {
  content: "▼";
}

.toggle-icon.open::after {
  content: "▲";
}

.faq-question {
  font-weight: bold;
  margin: 0.5rem 0;
  cursor: pointer;
}

.faq-answer {
  margin: 0.5rem 0;
  line-height: 1.5;
}

details {
  margin: 0.5rem 0;
  cursor: pointer;
  padding: 10px;
  transition: background-color 0.3s ease-in-out;
}

details[open] .faq-answer {
  animation: fadeIn 0.5s;
  background-color: rgba(245, 245, 245, 0.9);
}

.dark-mode details[open] .faq-answer {
  background-color: rgba(70, 70, 70, 0.9);
}

details summary::after {
  content: " \25BC";
}

details[open] summary::after {
  content: " \25B2";
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.category-separator {
  height: 2px;
  background-color: var(--primary-color);
  margin: 20px 0;
}

/* Light Mode Styles */
.faq-container:not(.dark-mode),
.header-section:not(.dark-mode),
.modal-content:not(.dark-mode) {
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-text: #000000;
  --primary-color: #007bff;
  --accordion-bg: #f8f9fa;
  --accordion-hover-bg: #e9ecef;
}

/* Dark Mode Styles */
.faq-container.dark-mode,
.header-section.dark-mode,
.modal-content.dark-mode {
  --card-bg: rgba(30, 30, 30, 0.9);
  --card-text: #e0e0e0;
  --primary-color: #4caf50;
  --accordion-bg: #3a3b3c;
  --accordion-hover-bg: #484a4d;
}
</style>
