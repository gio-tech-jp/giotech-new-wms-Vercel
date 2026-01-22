<template>
  <div class="card">
    <h2>シフト一括登録</h2>
    <div class="toolbar">
      <input type="month" v-model="tm">
      <button class="btn btn-primary btn-sm" @click="refresh">表示</button>
    </div>
    <div class="flex gap-2" style="background:#f0fdf4; padding:10px; border:1px solid #bbf7d0; border-radius:6px; margin-bottom:15px;">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-blue">平日:</span>
        <select v-model="wd" style="width:auto; padding:4px;"><option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option></select>
        <button class="btn btn-info btn-sm" @click="fill('wd')">適用</button>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-red">休日:</span>
        <select v-model="hol" style="width:auto; padding:4px;"><option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option></select>
        <button class="btn btn-danger btn-sm" @click="fill('hol')">適用</button>
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto;" @click="save">保存</button>
    </div>
    <div class="table-responsive" style="max-height:500px;">
      <table><thead><tr><th>日</th><th>曜</th><th>シフト</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.date">
            <td>{{ r.day }}</td><td :class="r.col">{{ r.wk }}</td>
            <td><select v-model="temp[r.date]" style="padding:4px;"><option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option></select></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const tm = ref(new Date().toISOString().slice(0,7))
const rows = ref([]), temp = ref({}), wd = ref('日勤'), hol = ref('公休')

const refresh = () => {
  const [y, m] = tm.value.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const r = []
  for(let d=1; d<=last; d++) {
    const f = `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`
    const wk = new Date(y, m-1, d).getDay()
    const isH = store.settings.holidays[f] || wk===0 || wk===6
    if(!temp.value[f]) temp.value[f] = store.shifts[f]?.name || '-'
    r.push({date: f, day: d, wk: ['日','月','火','水','木','金','土'][wk], isH, col: isH?'text-red':''})
  }
  rows.value = r
}
const fill = (mode) => {
  rows.value.forEach(d => { if((mode==='wd' && !d.isH) || (mode==='hol' && d.isH)) temp.value[d.date] = (mode==='wd'?wd.value:hol.value) })
}
const save = () => {
  const s = {}
  for(const k in tempShifts.value) {
    s[k] = { name: tempShifts.value[k] }
  }
  // ★修正: 全員分保存アクションを呼ぶ
  store.saveAllShifts(s) 
  alert('全社員のシフトを更新しました')
}
onMounted(refresh)
</script>