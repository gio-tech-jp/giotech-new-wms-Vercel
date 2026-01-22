// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // サーバーサイドレンダリングを無効化
  devtools: { enabled: true },
  
  // 必要なモジュール
  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt'],
  
  // CSSの読み込み
  css: ['~/assets/css/main.css'],

  // ▼▼ 重要: サーバー機能を作らず、静的ファイルとして出力する設定 ▼▼
  nitro: {
    preset: 'static', 
  },
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  app: {
    head: {
      title: 'GIO 勤怠システム',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})