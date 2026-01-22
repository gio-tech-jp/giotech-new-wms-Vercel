<template>
  <div class="card">
    <h2>申請承認</h2>
    <div class="table-responsive">
      <table><thead><tr><th>ID</th><th>内容</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in list" :key="a.id">
            <td>{{ a.uid }}</td><td>{{ a.summary }}</td>
            <td><button class="btn btn-primary btn-sm" @click="store.approveApp(a.id)">承認</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const list = computed(() => store.apps.filter(a => a.status === '申請中'))
</script>