<template>
  <div class="card">
    <div class="flex justify-between mb-4">
      <h2>明細・書類</h2>
    </div>
    
    <div v-if="docs.length">
      <div class="table-responsive">
        <table>
          <thead><tr><th>登録日</th><th>書類名</th><th>確認</th></tr></thead>
          <tbody>
            <tr v-for="(d, i) in docs" :key="i">
              <td>{{ d.date }}</td>
              <td>{{ d.name }}</td>
              <td>
                <button class="btn btn-secondary btn-sm">PDF表示</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-10 bg-slate-50 text-sub">
      まだアップロードされた書類はありません。
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const docs = computed(() => store.currentUser?.docs || [])
</script>