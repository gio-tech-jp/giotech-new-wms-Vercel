// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // サーバー機能を使わない（これでエラー回避）
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'GIO 勤怠システム',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ]
    }
  }
})