import { defineVitestConfig } from '@nuxt/test-utils/config'
import path from 'node:path'

export default defineVitestConfig({
  resolve: {
    alias: {
      // '~' と '@' をプロジェクトのルートディレクトリに紐付ける設定
      '~': path.resolve(__dirname),
      '@': path.resolve(__dirname),
    },
  },
})