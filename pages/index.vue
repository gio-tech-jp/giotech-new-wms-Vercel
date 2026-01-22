<template>
  <div class="card">
    <h2>ダッシュボード</h2>
    <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
      <h3>ようこそ、GIO SYSTEMへ</h3>
      <p>システムは正常に稼働しています。</p>
      
      <ul style="margin-top:10px; padding-left:20px;">
        <li>現在時刻: {{ new Date().toLocaleString() }}</li>
        <li>ユーザー名: {{ store.currentUser?.name || '未ログイン' }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
</script>