// nuxt.config.ts
export default defineNuxtConfig({
  // 1. Nuxt 4 の動作モードとディレクトリ構造の有効化
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',

  // 2. モジュールの登録
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt'
  ],

  // 3. CSSの設定（パス解決エラーを回避するため @ ではなく ~/ を使用）
  css: [
    '~/assets/css/main.css'
  ],

  // 4. Supabaseの設定（型定義エラーの解消）
  supabase: {
    // ログインリダイレクトの設定（適宜変更してください）
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/'], // 未認証でもアクセス可能なページ
    },
    // database.types.ts へのパスを指定
    types: './types/database.types.ts'
  },

  // 5. Vercel 500エラー（ERR_MODULE_NOT_FOUND）の徹底対策
  nitro: {
    // 全ての依存関係を可能な限りバンドルに含める
    node: true,
    externals: {
      inline: [
        'vue-bundle-renderer',
        '@vue/shared',
        'ufo',
        'h3',
        'devalue',
        'destr',
        'ofetch',
        'hookable',
        'unenv'
      ]
    }
  },

  // 6. Viteの最適化設定
  vite: {
    optimizeDeps: {
      include: ['vue-bundle-renderer', '@vue/shared']
    },
    // ファイルパス解決の安全策
    resolve: {
      alias: {
        '~': '/app',
        '@': '/app'
      }
    }
  },

  // 7. 開発ツール（任意）
  devtools: { enabled: true }
})