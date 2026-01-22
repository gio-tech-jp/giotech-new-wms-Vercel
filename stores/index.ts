import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    user: null as any,
    // 仮のユーザーデータ
    mockUsers: [
      { id: 'admin', pass: 'admin', name: '管理者', role: 'admin' },
      { id: 'user01', pass: '1234', name: '山田 太郎', role: 'user' }
    ]
  }),
  actions: {
    login(id: string, pass: string) {
      // 本来はここでサーバー通信するが、今は仮データと照合するだけ
      const target = this.mockUsers.find(u => u.id === id && u.pass === pass)
      if (target) {
        this.user = target
        return true
      }
      return false
    },
    logout() {
      this.user = null
    }
  }
})