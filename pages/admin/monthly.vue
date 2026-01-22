<template>
  <div class="card">
    <h2>月次勤怠承認</h2>
    <p class="text-sm text-sub mb-4">
      社員から提出された月次勤怠を確認します。<br>
      「詳細・確認」ボタンを押すと、その社員の勤怠表や申請内容を確認できる画面へ移動します。
    </p>

    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>対象月</th>
            <th>社員名 (ID)</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(status, key) in store.submissions" :key="key">
            <template v-if="status === 'submitted' || status === 'approved' || status === 'remanded'">
              <td class="font-bold">{{ key.split('_')[0] }}</td>
              <td>
                {{ getUserName(key.split('_')[1]) }} 
                <span class="text-xs text-sub">({{ key.split('_')[1] }})</span>
              </td>
              <td>
                <span v-if="status === 'approved'" class="badge badge-app">承認済み</span>
                <span v-else-if="status === 'submitted'" class="badge badge-sub">提出済み</span>
                <span v-else class="badge badge-rem">差戻し中</span>
              </td>
              <td>
                <div class="flex gap-2 items-center">
                  <NuxtLink :to="`/admin/users/${key.split('_')[1]}`">
                    <button class="btn btn-secondary btn-sm">
                      詳細・確認
                    </button>
                  </NuxtLink>

                  <template v-if="status === 'submitted'">
                    <button class="btn btn-primary btn-sm" @click="store.judgeMonthly(key, 'approved')">承認</button>
                    <button class="btn btn-danger btn-sm" @click="store.judgeMonthly(key, 'remanded')">差戻</button>
                  </template>
                </div>
              </td>
            </template>
          </tr>
          <tr v-if="Object.keys(store.submissions).length === 0">
            <td colspan="4" class="text-center py-4 text-sub">提出された勤怠はありません</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()

// ユーザーIDから名前を引くヘルパー関数
const getUserName = (uid) => {
  const u = store.users.find(user => user.id === uid)
  return u ? u.name : '不明なユーザー'
}
</script>