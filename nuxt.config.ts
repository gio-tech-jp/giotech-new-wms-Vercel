export default defineNuxtConfig({
  ssr: false, // SPAモード
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  supabase: {
    redirect: false // ログインリダイレクトは手動制御します
  },
  app: {
    head: { title: 'GIO Cloud System' }
  }
})