<template>
  <div class="login-wrap">
    <div class="login-box">
      <h2>GIO CLOUD</h2>
      <p class="text-xs mb-4 text-gray-500">初回は「登録」、2回目以降は「ログイン」</p>
      
      <input v-model="email" type="email" placeholder="メールアドレス" class="w-full mb-2">
      <input v-model="password" type="password" placeholder="パスワード(6文字以上)" class="w-full mb-4">
      
      <div class="flex gap-2">
        <button class="btn btn-primary w-full" @click="signIn">ログイン</button>
        <button class="btn btn-secondary w-full" @click="signUp">新規登録</button>
      </div>
      <p v-if="msg" class="text-red-500 text-xs mt-2">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'login' })
const client = useSupabaseClient()
const router = useRouter()
const email = ref('')
const password = ref('')
const msg = ref('')

const signIn = async () => {
  const { error } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
  if (error) msg.value = error.message
  else router.push('/')
}

const signUp = async () => {
  const { error } = await client.auth.signUp({ email: email.value, password: password.value })
  if (error) msg.value = error.message
  else alert('登録しました！ログインしてください。')
}
</script>