import { defineStore } from 'pinia'
export const useMainStore = defineStore('main', {
  state: () => ({
    user: null as any,      // Authユーザー
    profile: null as any,   // DB上のプロフィール
    users: [] as any[],     // 全社員リスト(管理者用)
    punches: [] as any[],
    shifts: {} as any,
    apps: [] as any[],
    holidays: {} as any,
    monthlies: {} as any
  }),
  actions: {
    // データ初期ロード
    async fetchAllData() {
      const client = useSupabaseClient()
      
      // 並列でデータを取得
      const [pRes, sRes, aRes, hRes, mRes, uRes] = await Promise.all([
        client.from('punches').select('*'),
        client.from('shifts').select('*'),
        client.from('applications').select('*'),
        client.from('holidays').select('*'),
        client.from('monthlies').select('*'),
        client.from('profiles').select('*') // 管理者用
      ])

      if (pRes.data) this.punches = pRes.data
      if (sRes.data) {
        // 配列をオブジェクト形式 {Date_ID: Name} に変換
        this.shifts = {}
        sRes.data.forEach((s: any) => {
          this.shifts[`${s.date}_${s.user_id}`] = s.name
        })
      }
      if (aRes.data) this.apps = aRes.data
      if (hRes.data) {
        this.holidays = {}
        hRes.data.forEach((h: any) => this.holidays[h.date] = h.name)
      }
      if (mRes.data) {
        this.monthlies = {}
        mRes.data.forEach((m: any) => this.monthlies[m.id] = m.status)
      }
      if (uRes.data) this.users = uRes.data
    },

    // ログイン中のユーザー情報を取得
    async fetchMyProfile() {
      const client = useSupabaseClient()
      const user = useSupabaseUser()
      if (user.value) {
        this.user = user.value
        const { data } = await client.from('profiles').select('*').eq('id', user.value.id).single()
        this.profile = data
        await this.fetchAllData()
      }
    },

    // 打刻
    async addPunch(type: string) {
      const client = useSupabaseClient()
      const { data, error } = await client.from('punches').insert({
        user_id: this.user.id,
        type: type,
        timestamp: new Date().toISOString()
      }).select().single()
      
      if (!error && data) this.punches.push(data)
    },

    // 申請
    async addApp(type: string, date: string, reason: string) {
      const client = useSupabaseClient()
      const { data, error } = await client.from('applications').insert({
        user_id: this.user.id, type, date, reason
      }).select().single()
      
      if (!error && data) this.apps.unshift(data)
    },

    // ユーザー管理(保存)
    async saveUser(profileData: any) {
      const client = useSupabaseClient()
      // プロフィールの更新
      const { error } = await client.from('profiles').upsert(profileData)
      if(!error) await this.fetchAllData()
    },

    // シフト保存
    async saveShift(userId: string, date: string, name: string) {
      const client = useSupabaseClient()
      if(!name) {
        await client.from('shifts').delete().match({ user_id: userId, date })
      } else {
        await client.from('shifts').upsert({ user_id: userId, date, name }, { onConflict: 'user_id,date' })
      }
      await this.fetchAllData()
    },

    // ログアウト
    async logout() {
      const client = useSupabaseClient()
      await client.auth.signOut()
      this.user = null
      this.profile = null
    }
  }
})