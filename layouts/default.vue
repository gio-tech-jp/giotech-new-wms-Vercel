<template>
  <div class="layout" v-if="store.profile">
    <aside class="sidebar">
      <div style="padding:20px; font-weight:bold;">GIO CLOUD</div>
      <div style="flex:1;">
        <NuxtLink to="/">ホーム</NuxtLink>
        <NuxtLink to="/attendance">勤怠打刻</NuxtLink>
        <NuxtLink to="/apply">申請・明細</NuxtLink>
        
        <div v-if="store.profile.role === 'admin'" style="margin-top:20px; border-top:1px solid #334155;">
          <div style="padding:10px 20px; font-size:12px; color:#64748b;">管理者メニュー</div>
          <NuxtLink to="/admin/users">ユーザ管理</NuxtLink>
          <NuxtLink to="/admin/shift">シフト設定</NuxtLink>
        </div>
      </div>
      <div style="padding:20px;">
        <div style="font-size:12px;">{{ store.profile.name }}</div>
        <button class="btn btn-gray btn-sm w-full" @click="store.logout(); navigateTo('/login')">ログアウト</button>
      </div>
    </aside>
    <div class="main">
      <slot />
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-screen">Loading...</div>
</template>
<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const user = useSupabaseUser()

// 画面ロード時にプロフィール取得
onMounted(async () => {
  if (!user.value) return navigateTo('/login')
  await store.fetchMyProfile()
})
</script>