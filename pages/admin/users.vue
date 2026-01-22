<template>
  <div class="card">
    <h2>ユーザ管理</h2>
    <table>
      <thead><tr><th>Email</th><th>氏名</th><th>権限</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="u in store.users" :key="u.id">
          <td>{{ u.email }}</td>
          <td><input v-model="u.name" class="border p-1"></td>
          <td>
            <select v-model="u.role">
              <option value="user">一般</option>
              <option value="admin">管理者</option>
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-primary" @click="store.saveUser(u)">保存</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
</script>