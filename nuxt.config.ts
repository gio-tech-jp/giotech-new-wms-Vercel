// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 1. Nuxt 4 の挙動を安定させるための設定
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',

  // 2. 使用するモジュールの登録
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt'
  ],

  // 3. CSSの設定（エイリアスを ~/ に統一）
  css: [
    '~/assets/css/main.css'
  ],

  // 4. Supabaseの設定
  supabase: {
    // ログイン後のリダイレクト設定（必要に応じて変更）
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/'], // トップページなどは除外
    },
    // 先ほど作成した型定義ファイルのパス
    types: './types/database.types.ts'
  },

  // 5. Vercelでの「ERR_MODULE_NOT_FOUND」対策
  nitro: {
    externals: {
      inline: ['vue-bundle-renderer']
    }
  },

  // 6. 開発ツール（任意）
  devtools: { enabled: true }
})