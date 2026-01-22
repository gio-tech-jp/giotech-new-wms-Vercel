<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h2>社員管理</h2>
      <button class="btn btn-primary btn-sm" @click="showAddModal=true">＋ 社員追加</button>
    </div>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>社員ID</th>
            <th>氏名</th>
            <th>権限</th>
            <th>基本給</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in store.users" :key="u.id">
            <td class="font-bold">{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>
              <span class="badge" :class="u.role==='admin'?'badge-rem':'badge-sub'">
                {{ u.role==='admin'?'管理者':'一般' }}
              </span>
            </td>
            <td>¥{{ u.base ? u.base.toLocaleString() : '-' }}</td>
            <td>
              <NuxtLink :to="`/admin/users/${u.id}`">
                <button class="btn btn-secondary btn-sm">詳細・勤怠管理</button>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-box">
        <h3 style="margin-top:0;">社員アカウント追加</h3>
        <div class="form-group">
          <label>社員ID</label>
          <input v-model="newId" type="text" placeholder="例: user99">
        </div>
        <div class="form-group">
          <label>氏名</label>
          <input v-model="newName" type="text" placeholder="例: 新入 社員">
        </div>
        <div class="form-group">
          <label>初期パスワード</label>
          <input v-model="newPass" type="text" placeholder="初期値: 1234">
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button class="btn btn-secondary" @click="showAddModal=false">キャンセル</button>
          <button class="btn btn-primary" @click="addUser">登録</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const showAddModal = ref(false)
const newId = ref(''), newName = ref(''), newPass = ref('1234')

const addUser = () => {
  if(!newId.value || !newName.value) return alert('必須項目を入力してください')
  if(store.users.find(u => u.id === newId.value)) return alert('IDが重複しています')
  
  store.users.push({
    id: newId.value,
    name: newName.value,
    pass: newPass.value,
    role: 'user',
    base: 250000
  })
  alert('追加しました')
  showAddModal.value = false
  newId.value = ''; newName.value = '';
}
</script>

<style scoped>
/* モーダル用の簡易CSS */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.modal-box {
  background: white; padding: 20px; border-radius: 8px; width: 350px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
</style>