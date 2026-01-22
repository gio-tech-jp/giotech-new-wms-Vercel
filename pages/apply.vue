<template>
  <div class="card">
    <h2>各種申請</h2>
    <div class="form-group">
      <label>申請種別</label>
      <select v-model="type">
        <option value="">選択してください</option>
        <option value="holiday">有給・休日・欠勤</option>
        <option value="work_holiday">休日出勤</option>
        <option value="transport">交通費一括</option>
        <option value="beauty">美容手当</option>
        <option value="housing">住宅手当</option>
      </select>
    </div>

    <div v-if="type" class="p-4 border border-dashed border-slate-300 rounded mt-4 bg-slate-50">
      
      <div v-if="type==='holiday'">
        <div class="form-group">
          <label>休暇区分</label>
          <select v-model="holType">
            <option value="1日有給">1日有給</option>
            <option value="午前半休">午前半休 (AM有給)</option>
            <option value="午後半休">午後半休 (PM有給)</option>
            <option value="振替休日">振替休日</option>
            <option value="欠勤">欠勤</option>
            <option value="特別休暇">特別休暇 (慶弔など)</option>
          </select>
        </div>
        <div class="form-group">
          <label>対象日</label>
          <input type="date" v-model="date">
        </div>
        <div class="form-group">
          <label>理由・備考</label>
          <input type="text" v-model="reason" placeholder="私用のため、通院のため 等">
        </div>
      </div>

      <div v-else-if="type==='transport'">
        <p class="text-xs text-sub mb-2">1ヶ月分の交通費をまとめて入力してください。</p>
        <div class="flex gap-2 items-end mb-2">
          <input type="date" v-model="trDate">
          <input type="text" v-model="trRoute" placeholder="経路 (例: 新宿-東京 往復)">
          <input type="number" v-model="trCost" placeholder="金額">
          <button class="btn btn-info btn-sm" @click="addTrans">追加</button>
        </div>
        <div v-for="(t,i) in transList" :key="i" class="flex justify-between items-center bg-white p-2 border mb-1 rounded">
          <span class="text-sm">{{t.date}} : {{t.route}}</span>
          <span>
            ¥{{t.cost}} 
            <button class="text-red-500 font-bold ml-2 px-2" @click="transList.splice(i,1)">×</button>
          </span>
        </div>
        <div class="text-right font-bold mt-2 text-lg text-primary">合計: ¥{{ transTotal.toLocaleString() }}</div>
      </div>

      <div v-else-if="type==='housing'">
        <label>申請区分</label>
        <select v-model="hType"><option>新規申請</option><option>登録内容変更</option></select>
        <label>変更日/入居日</label>
        <input type="date" v-model="date">
        <label>賃貸契約書 (アップロード)</label>
        <input type="file" class="bg-white">
      </div>

      <div v-else>
        <div v-if="type==='work_holiday'">
          <label>出勤日</label><input type="date" v-model="date">
          <label>振替予定日</label><input type="date">
        </div>
        <div v-else>
          <label>日付</label><input type="date" v-model="date">
        </div>
        
        <label>内容・詳細</label>
        <input type="text" v-model="reason">
        
        <div v-if="type==='beauty'">
          <label>金額</label><input type="number" placeholder="円">
          <label>領収書</label><input type="file" class="bg-white">
        </div>
      </div>

      <button class="btn btn-primary btn-full mt-6" @click="submit">申請する</button>
    </div>
  </div>

  <div class="card">
    <h3>申請履歴</h3>
    <div class="table-responsive">
      <table>
        <thead><tr><th>日付</th><th>種別</th><th>内容</th><th>状態</th></tr></thead>
        <tbody>
          <tr v-for="a in myApps" :key="a.id">
            <td>{{ a.date }}</td><td>{{ a.type }}</td><td>{{ a.summary }}</td>
            <td><span class="badge" :class="a.status==='承認'?'badge-app':'badge-sub'">{{ a.status }}</span></td>
          </tr>
          <tr v-if="myApps.length===0"><td colspan="4" class="text-center text-sub">履歴はありません</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()

const type = ref('')
const date = ref('')
const reason = ref('')
// 有給用
const holType = ref('1日有給')
// 住宅用
const hType = ref('新規申請')
// 交通費用
const trDate = ref(''), trRoute = ref(''), trCost = ref('')
const transList = ref([])

const myApps = computed(() => store.apps.filter(a => a.uid === store.currentUser.id).sort((a,b)=>b.id-a.id))
const transTotal = computed(() => transList.value.reduce((a,b)=>a+parseInt(b.cost),0))

const addTrans = () => {
  if(trDate.value && trCost.value) {
    transList.value.push({date: trDate.value, route: trRoute.value, cost: parseInt(trCost.value)})
    trRoute.value=''; trCost.value='';
  }
}

const submit = () => {
  let summary = reason.value
  let d = date.value

  // 有給の場合のサマリー作成
  if(type.value === 'holiday') {
    if(!d) return alert('日付を選択してください')
    summary = `【${holType.value}】${reason.value}`
  }
  // 交通費の場合
  else if(type.value === 'transport') {
    if(!transList.value.length) return alert('明細を追加してください')
    summary = `交通費一括 計¥${transTotal.value.toLocaleString()} (${transList.value.length}件)`
    d = transList.value[0].date
    transList.value = []
  }
  else if(!d) {
    return alert('日付を選択してください')
  }

  store.addApp(type.value, summary, d)
  alert('申請しました')
  reason.value = ''
  date.value = ''
}
</script>