<template>
  <div class="app-container">
    <div v-if="!store.user" style="display: flex; flex-direction: column; justify-content: center; padding: 20px; height: 100vh; box-sizing: border-box;">
      <div class="card" style="text-align: center;">
        <h1 style="color:var(--primary);">GIO SYSTEM</h1>
        <p style="color:#64748b; margin-bottom: 20px;">クラウド勤怠管理 (デモ版)</p>
        
        <input v-model="loginId" placeholder="ID (admin または user01)">
        <input v-model="loginPass" type="password" placeholder="Password">
        <button class="btn btn-primary" @click="handleLogin">ログイン</button>
        
        <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; text-align: left;">
          <p>管理者: admin / admin</p>
          <p>一般: user01 / 1234</p>
        </div>
      </div>
    </div>

    <div v-else>
      <header class="header">
        <div style="font-weight: bold;">GIO SYSTEM</div>
        <div style="font-size: 14px;">{{ store.user.name }}</div>
      </header>

      <div class="content">
        <div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto;">
          <button class="btn btn-sm" :class="page==='home'?'btn-primary':'btn-outline'" @click="page='home'">打刻・申請</button>
          <button v-if="store.user.role==='admin'" class="btn btn-sm" :class="page==='admin'?'btn-primary':'btn-outline'" @click="page='admin'">管理者</button>
          <button class="btn btn-sm btn-outline" @click="store.logout">ログアウト</button>
        </div>

        <div v-if="page === 'home'">
          <div class="card" style="text-align: center;">
            <p style="color: #64748b;">{{ dateStr }}</p>
            <h2 style="font-size: 32px; margin: 10px 0;">{{ timeStr }}</h2>
            <div class="grid-2">
              <button class="btn btn-primary" @click="alert('出勤しました（デモ）')">出勤</button>
              <button class="btn btn-secondary" @click="alert('退勤しました（デモ）')">退勤</button>
            </div>
          </div>
        </div>

        <div v-if="page === 'admin'">
          <div class="card">
            <h2>社員管理</h2>
            <div class="list-item" v-for="u in store.mockUsers" :key="u.id">
              <div>
                <div style="font-weight: bold;">{{ u.name }}</div>
                <div style="font-size: 12px; color: #64748b;">ID: {{ u.id }}</div>
              </div>
              <span class="badge">{{ u.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ★ここが重要: Supabaseではなく、ストアだけを読み込む
import { useMainStore } from '~/stores/index'
const store = useMainStore()

const loginId = ref('')
const loginPass = ref('')
const page = ref('home')
const dateStr = ref('')
const timeStr = ref('')

setInterval(() => {
  const now = new Date()
  dateStr.value = now.toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  timeStr.value = now.toLocaleTimeString('ja-JP')
}, 1000)

const handleLogin = () => {
  if (!store.login(loginId.value, loginPass.value)) {
    alert('ログイン失敗')
  }
}
const alert = (msg) => window.alert(msg)
</script>