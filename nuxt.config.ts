// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  server: {
    host: "0.0.0.0",
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  components: true,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
    },
  },
  modules: ["@element-plus/nuxt", "@nuxtjs/tailwindcss", "@pinia/nuxt", "@pinia-plugin-persistedstate/nuxt", "nuxt-swiper"],
  imports: {
    dirs: ["types/*.ts", "types/**/*.ts"],
  },
  css: ["quill/dist/quill.core.css", "~/assets/css/global.css"],
});
