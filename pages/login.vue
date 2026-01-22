<template>
  <div class="login-box">
    <div style="font-size:24px; font-weight:800; color:#0f172a; margin-bottom:20px;">GIO SYSTEM</div>
    
    <div v-if="step===1">
      <input v-model="id" type="text" placeholder="ID (admin / user01)">
      <input v-model="pass" type="password" placeholder="Pass (admin / 1234)">
      <button class="btn btn-primary btn-full" @click="check">次へ</button>
    </div>
    
    <div v-else>
      <p style="margin-bottom:15px;">認証コード: 1234</p>
      <input v-model="code" type="text" placeholder="Code" style="text-align:center;">
      <button class="btn btn-primary btn-full" @click="doLogin">ログイン</button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'login' })
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const step = ref(1), id = ref(''), pass = ref(''), code = ref('')

const check = () => {
  // 本来はストアのアクションでチェックするが簡易的に
  if(id.value && pass.value) step.value = 2
  else alert('IDとパスワードを入力してください')
}

const doLogin = async () => {
  if(code.value === '1234') {
    const success = await store.login(id.value, pass.value)
    if(success) navigateTo('/')
    else alert('ログイン失敗: IDまたはパスワードが違います')
  } else {
    alert('コードが違います')
  }
}
</script>