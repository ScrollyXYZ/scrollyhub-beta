import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("Swiper", Swiper);
  nuxtApp.vueApp.component("SwiperSlide", SwiperSlide);
});
