<template>
  <div class="card relative">
    <div class="flex justify-between items-center" style="margin-bottom:20px;">
      <h2>月次勤怠</h2>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm" @click="mode='list'">表</button>
        <button class="btn btn-secondary btn-sm" @click="mode='stamp'">打刻</button>
      </div>
    </div>

    <div v-if="mode==='stamp'" class="text-center" style="padding:40px 0;">
      <div style="font-size:48px; font-weight:700; margin-bottom:30px;">{{ timeStr }}</div>
      <div class="stamp-panel">
        <button class="stamp-btn bg-in" @click="store.stamp('出勤')">出勤</button>
        <button class="stamp-btn bg-out" @click="store.stamp('退勤')">退勤</button>
      </div>
      <div style="display:flex; justify-content:center; gap:10px;">
        <button class="btn btn-warning" @click="store.stamp('休憩開始')">休憩開始</button>
        <button class="btn btn-success" @click="store.stamp('休憩終了')">休憩終了</button>
      </div>
    </div>

    <div v-else>
      <div class="toolbar">
        <input type="month" v-model="targetMonth">
        
        <div v-if="submitStatus === 'submitted'" class="badge badge-sub text-sm">提出済み</div>
        <div v-else-if="submitStatus === 'approved'" class="badge badge-app text-sm">承認済み</div>
        <div v-else-if="submitStatus === 'remanded'" class="badge badge-rem text-sm">差戻し (再提出可)</div>
        <button v-else class="btn btn-success btn-sm" @click="doSubmit">月締め提出</button>
      </div>

      <div v-if="errorCount > 0" class="error-alert">
        <span>⚠️ 打刻漏れ等の不備が {{ errorCount }} 件あります。修正申請を行ってください。</span>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>日</th><th>曜</th><th>シフト</th>
              <th>出勤</th><th>退勤</th><th>稼働</th>
              <th>状態/操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in days" :key="d.date" :class="{'bg-holiday': d.hol}">
              <td>{{ d.day }}</td>
              <td :class="d.col">{{ d.week }}</td>
              <td>{{ d.shift }}</td>
              <td :class="{'tentative': d.isTs}">{{ d.start }}</td>
              <td :class="{'tentative': d.isTe}">{{ d.end }}</td>
              <td>{{ d.work }}</td>
              <td>
                <div v-if="d.errorType" class="flex items-center gap-2">
                  <span class="badge badge-rem">{{ d.errorType }}</span>
                  <button class="btn btn-secondary btn-sm" @click="openFixModal(d)">修正</button>
                </div>
                <div v-else-if="d.pendingApp" class="text-xs text-blue font-bold">
                  申請中: {{ d.pendingApp.type }}
                </div>
                <div v-else class="text-xs text-green font-bold">OK</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3 style="margin-top:0;">打刻修正申請</h3>
        <p class="text-sm text-sub mb-4">対象日: <b>{{ fixTarget.date }}</b> ({{ fixTarget.errorType }})</p>
        
        <div class="form-group">
          <label>正しい出勤時刻</label>
          <input type="time" v-model="fixStart">
        </div>
        <div class="form-group">
          <label>正しい退勤時刻</label>
          <input type="time" v-model="fixEnd">
        </div>
        <div class="form-group">
          <label>理由</label>
          <input type="text" v-model="fixReason" placeholder="打刻忘れ、電車遅延など">
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button class="btn btn-secondary" @click="closeModal">キャンセル</button>
          <button class="btn btn-primary" @click="submitFix">申請する</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()
const mode = ref('list')
const targetMonth = ref(new Date().toISOString().slice(0,7))
const timeStr = ref('')

// モーダル用データ
const showModal = ref(false)
const fixTarget = ref(null)
const fixStart = ref('')
const fixEnd = ref('')
const fixReason = ref('')

setInterval(() => timeStr.value = new Date().toLocaleTimeString(), 1000)

const submitStatus = computed(() => store.submissions[`${targetMonth.value}_${store.currentUser.id}`])
const errorCount = computed(() => days.value.filter(d => d.errorType).length)

const days = computed(() => {
  const [y, m] = targetMonth.value.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const list = []
  
  const today = new Date()
  const isPastOrToday = (d) => new Date(y, m-1, d) <= today

  for(let d=1; d<=last; d++) {
    const f = `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`
    const wk = new Date(y, m-1, d).getDay()
    const hol = store.settings.holidays[f]
    
    const shiftKey = `${f}_${store.currentUser.id}`
    const sv = store.shifts[shiftKey] || {name:'-'}
    const svMeta = store.settings.shiftTypes.find(x=>x.name===sv.name)
    
    const logs = store.logs.filter(l => l.uid === store.currentUser.id && new Date(l.ts).getDate() === d && new Date(l.ts).getMonth() === m-1)
    const sLog = logs.find(l=>l.type==='出勤')
    const eLog = logs.find(l=>l.type==='退勤')

    const pendingApp = store.apps.find(a => a.uid === store.currentUser.id && a.date === f && a.status === '申請中')

    let start='-', end='-', work='-', isTs=false, isTe=false
    let errorType = null

    if(svMeta?.s && !sLog) { start=svMeta.s; isTs=true }
    if(svMeta?.e && !eLog) { end=svMeta.e; isTe=true }
    
    if(sLog) { start=new Date(sLog.ts).toLocaleTimeString('ja-JP').slice(0,5); isTs=false }
    if(eLog) { end=new Date(eLog.ts).toLocaleTimeString('ja-JP').slice(0,5); isTe=false }
    
    if(sLog && eLog) {
      let min = Math.floor((eLog.ts - sLog.ts)/60000) - 60
      if(min<0) min=0
      work = (min/60).toFixed(1) + 'h'
    }

    // エラー判定
    const isWorkDay = svMeta?.s && !hol && !sv.name.includes('休')
    const targetDateObj = new Date(y, m-1, d)
    const isPast = targetDateObj.setHours(0,0,0,0) < today.setHours(0,0,0,0)

    if (!pendingApp) {
        if (isWorkDay && isPast) {
            if (!sLog && !eLog) errorType = '欠勤・打刻なし'
            else if (!sLog) errorType = '出勤打刻漏れ'
            else if (!eLog) errorType = '退勤打刻漏れ'
        }
    }

    list.push({
      date: f, day: d, week: ['日','月','火','水','木','金','土'][wk],
      hol, shift: sv.name,
      col: (wk===0||hol)?'text-red':(wk===6?'text-blue':''),
      start, end, work, isTs, isTe,
      errorType, pendingApp
    })
  }
  return list
})

const openFixModal = (day) => {
  fixTarget.value = day
  fixStart.value = day.start.includes(':') ? day.start : ''
  fixEnd.value = day.end.includes(':') ? day.end : ''
  fixReason.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  fixTarget.value = null
}

const submitFix = () => {
  if(!fixStart.value || !fixEnd.value || !fixReason.value) {
    return alert('時刻と理由を入力してください')
  }
  const summary = `打刻修正: ${fixStart.value}～${fixEnd.value} (${fixReason.value})`
  store.addApp('遅刻・早退', summary, fixTarget.value.date)
  alert('修正申請を提出しました')
  closeModal()
}

const doSubmit = () => {
  if (errorCount.value > 0) {
    alert(`打刻漏れ等の不備が ${errorCount.value} 件あります。修正申請を行ってください。`)
    return
  }
  if(confirm(`${targetMonth.value}月度を提出しますか？`)) {
    store.submitMonthly(targetMonth.value)
  }
}
</script>

<style scoped>
/* モーダル用CSS */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 半透明の黒背景 */
  z-index: 100; /* 最前面に */
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.error-alert {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 14px;
}
.text-green { color: #15803d; }
</style>