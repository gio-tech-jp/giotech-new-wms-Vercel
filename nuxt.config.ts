export default defineNuxtConfig({
  ssr: false, // SPAモード
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
// ▼▼ ここを追加してください ▼▼
  nitro: {
    preset: 'vercel',
    // 依存関係を確実に含めるための設定
    externals: {
      inline: ['vue-bundle-renderer', '@vue/shared']
    }
  },
  // ▲▲ ここまで ▲▲
  supabase: {
    redirect: false // ログインリダイレクトは手動制御します
  },
  app: {
    head: { title: 'GIO Cloud System' }
  }
})