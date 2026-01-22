export default defineNuxtConfig({
  ssr: false, // SPAモード
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
// ▼▼ ここを追加してください ▼▼
  nitro: {
    preset: 'vercel',
  },
  // ▲▲ ここまで ▲▲
  supabase: {
    redirect: false // ログインリダイレクトは手動制御します
  },
  app: {
    head: { title: 'GIO Cloud System' }
  }
})