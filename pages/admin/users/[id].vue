<template>
  <div>
    <div class="flex items-center gap-2 mb-4 text-sm text-sub">
      <NuxtLink to="/admin/users" class="hover:underline">社員一覧</NuxtLink>
      <span>&gt;</span>
      <span class="font-bold text-main">{{ targetUser?.name }} の管理</span>
    </div>

    <div class="card bg-slate-50 border-blue-200 p-4 mb-4 flex justify-between items-center">
      <div>
        <h2 style="border:none; margin:0; padding:0; font-size:18px;">{{ targetUser?.name }} <span class="text-sm font-normal text-sub">({{ targetUser?.id }})</span></h2>
        <div class="text-xs text-sub mt-1">基本給: ¥{{ targetUser?.base?.toLocaleString() }} | 権限: {{ targetUser?.role }}</div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary btn-sm">編集</button>
      </div>
    </div>

    <div class="flex gap-2 mb-4 border-b border-border pb-1">
      <button class="px-4 py-2 text-sm font-bold border-b-2 transition-colors" 
        :class="tab==='att'?'border-primary text-primary':'border-transparent text-sub hover:text-main'" 
        @click="tab='att'">① 勤怠・月次承認</button>
      <button class="px-4 py-2 text-sm font-bold border-b-2 transition-colors" 
        :class="tab==='shift'?'border-primary text-primary':'border-transparent text-sub hover:text-main'" 
        @click="initShiftTab">② 個別シフト設定</button>
      <button class="px-4 py-2 text-sm font-bold border-b-2 transition-colors" 
        :class="tab==='app'?'border-primary text-primary':'border-transparent text-sub hover:text-main'" 
        @click="tab='app'">③ 申請承認</button>
      <button class="px-4 py-2 text-sm font-bold border-b-2 transition-colors" 
        :class="tab==='doc'?'border-primary text-primary':'border-transparent text-sub hover:text-main'" 
        @click="tab='doc'">④ 給与・書類</button>
    </div>

    <div v-if="tab==='att'" class="card">
      <div class="toolbar">
        <div class="flex gap-2 items-center">
          <input type="month" v-model="targetMonth">
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold">状態:</span>
          <span v-if="submitStatus==='approved'" class="badge badge-app">承認済</span>
          <span v-else-if="submitStatus==='submitted'" class="badge badge-sub">提出済</span>
          <span v-else-if="submitStatus==='remanded'" class="badge badge-rem">差戻し</span>
          <span v-else class="text-xs text-sub">未提出</span>
          
          <div v-if="submitStatus==='submitted'" class="flex gap-1 ml-2">
            <button class="btn btn-primary btn-sm" @click="judgeMonth('approved')">承認</button>
            <button class="btn btn-danger btn-sm" @click="judgeMonth('remanded')">差戻し</button>
          </div>
        </div>
      </div>

      <div v-if="attErrors.length" class="bg-red-50 border border-red-200 p-3 rounded mb-4 text-sm text-red-700">
        <div class="font-bold mb-1">⚠️ 以下の不備があります</div>
        <ul class="list-disc pl-5">
          <li v-for="e in attErrors" :key="e">{{ e }}</li>
        </ul>
      </div>

      <div class="table-responsive" style="max-height:500px;">
        <table>
          <thead><tr><th>日</th><th>曜</th><th>シフト</th><th>出勤</th><th>退勤</th><th>稼働</th><th>判定</th></tr></thead>
          <tbody>
            <tr v-for="d in attDays" :key="d.date" :class="{'bg-holiday': d.hol}">
              <td>{{ d.day }}</td><td :class="d.col">{{ d.wk }}</td>
              <td>{{ d.sv }}</td>
              <td :class="{'tentative': d.isTs}">{{ d.s }}</td>
              <td :class="{'tentative': d.isTe}">{{ d.e }}</td>
              <td>{{ d.w }}</td>
              <td>
                <span v-if="d.err" class="badge badge-rem">{{ d.err }}</span>
                <span v-else class="text-green-600 text-xs">OK</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tab==='shift'" class="card">
      <div class="flex justify-between mb-2">
        <h3>{{ targetUser.name }} 専用シフト設定</h3>
        <button class="btn btn-primary btn-sm" @click="saveUserShift">この内容で保存</button>
      </div>
      
      <div class="toolbar bg-blue-50 border-blue-100">
        <div class="flex gap-2 items-center">
          <span class="text-xs font-bold">平日:</span>
          <select v-model="wdVal" class="p-1 text-sm"><option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option></select>
          <button class="btn btn-info btn-sm" @click="fillUserShift('wd')">適用</button>
        </div>
        <div class="flex gap-2 items-center ml-4">
          <span class="text-xs font-bold text-red">休日:</span>
          <select v-model="holVal" class="p-1 text-sm"><option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option></select>
          <button class="btn btn-danger btn-sm" @click="fillUserShift('hol')">適用</button>
        </div>
      </div>

      <div class="table-responsive" style="max-height:400px;">
        <table>
          <thead><tr><th>日</th><th>曜</th><th>シフト</th></tr></thead>
          <tbody>
            <tr v-for="r in shiftRows" :key="r.date" :class="{'bg-holiday': r.isHol}">
              <td>{{ r.day }}</td><td :class="r.col">{{ r.wk }}</td>
              <td>
                <select v-model="tempShifts[r.date]" class="border p-1 rounded">
                  <option v-for="t in store.settings.shiftTypes" :value="t.name">{{t.name}}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tab==='app'" class="card">
      <div class="table-responsive">
        <table>
          <thead><tr><th>日付</th><th>種別</th><th>内容</th><th>状態</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="a in userApps" :key="a.id">
              <td>{{ a.date }}</td><td>{{ a.type }}</td><td>{{ a.summary }}</td>
              <td><span class="badge" :class="a.status==='承認'?'badge-app':'badge-sub'">{{ a.status }}</span></td>
              <td><button v-if="a.status==='申請中'" class="btn btn-primary btn-sm" @click="store.approveApp(a.id)">承認</button></td>
            </tr>
            <tr v-if="!userApps.length"><td colspan="5" class="text-center">なし</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="tab==='doc'" class="card">
      <h3>給与・源泉徴収票 管理</h3>
      <p class="text-xs text-sub mb-4">この社員に公開するファイルをアップロードします。</p>
      
      <div class="border p-4 rounded bg-slate-50 mb-4">
        <div class="flex gap-2 items-center mb-2">
          <select v-model="docType" class="w-auto">
            <option value="給与明細">給与明細</option>
            <option value="源泉徴収票">源泉徴収票</option>
            <option value="その他">その他</option>
          </select>
          <input type="text" v-model="docMonth" placeholder="対象月 (例: 2026-01)" class="w-32">
          <input type="file" id="file-input" class="text-sm">
        </div>
        <button class="btn btn-primary btn-sm" @click="uploadDoc">アップロード＆公開</button>
      </div>

      <div class="table-responsive">
        <table>
          <thead><tr><th>公開日</th><th>書類名</th><th>ファイル</th></tr></thead>
          <tbody>
            <tr v-for="(d, i) in (targetUser.docs || [])" :key="i">
              <td>{{ d.date }}</td>
              <td>{{ d.name }}</td>
              <td><a href="#" class="text-blue hover:underline">ダウンロード</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const route = useRoute()
const router = useRouter()
const store = useMainStore()

const uid = route.params.id
const targetUser = computed(() => store.users.find(u => u.id === uid))
if (!targetUser.value) router.push('/admin/users')

const tab = ref('att')
const targetMonth = ref(new Date().toISOString().slice(0, 7))

// --- 1. Attendance Logic ---
const submitStatus = computed(() => store.submissions[`${targetMonth.value}_${uid}`])
const attErrors = ref([])

const attDays = computed(() => {
  const [y, m] = targetMonth.value.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const list = []
  const errors = []
  
  for(let d=1; d<=last; d++) {
    const f = `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`
    const wk = new Date(y, m-1, d).getDay()
    const hol = store.settings.holidays[f]
    const shiftKey = `${f}_${uid}`
    const sv = store.shifts[shiftKey] || {name:'-'}
    const svMeta = store.settings.shiftTypes.find(x=>x.name===sv.name)
    
    const logs = store.logs.filter(l => l.uid === uid && new Date(l.ts).getDate() === d && new Date(l.ts).getMonth() === m-1)
    const sLog = logs.find(l=>l.type==='出勤'), eLog = logs.find(l=>l.type==='退勤')
    
    let s='-', e='-', w='-', err='', isTs=false, isTe=false
    
    // Check Logic
    const isWorkDay = svMeta?.s && !hol && !sv.name.includes('休')
    
    if(svMeta?.s && !sLog) { s=svMeta.s; isTs=true }
    if(svMeta?.e && !eLog) { e=svMeta.e; isTe=true }
    if(sLog) { s=new Date(sLog.ts).toLocaleTimeString('ja-JP').slice(0,5); isTs=false }
    if(eLog) { e=new Date(eLog.ts).toLocaleTimeString('ja-JP').slice(0,5); isTe=false }
    
    if(sLog && eLog) {
      let min = Math.floor((eLog.ts - sLog.ts)/60000) - 60
      if(min<0) min=0
      w = (min/60).toFixed(1)
      // Late Check (Simple)
      if(svMeta?.s) {
        const plan = parseInt(svMeta.s.split(':')[0])*60 + parseInt(svMeta.s.split(':')[1])
        const act = new Date(sLog.ts).getHours()*60 + new Date(sLog.ts).getMinutes()
        if(act > plan) err = '遅刻'
      }
    } else if(isWorkDay && (!sLog || !eLog)) {
      // 本来出勤日なのに打刻がない（かつ未来日でない）
      if(new Date(y,m-1,d) < new Date()) err = '打刻漏れ'
    }

    if(err) errors.push(`${m}/${d}: ${err}`)

    list.push({
      date: f, day: d, wk: ['日','月','火','水','木','金','土'][wk],
      hol, sv: sv.name, col: (wk===0||hol)?'text-red':(wk===6?'text-blue':''),
      s, e, w, isTs, isTe, err
    })
  }
  attErrors.value = errors
  return list
})

const judgeMonth = (res) => {
  if(confirm('実行しますか？')) store.judgeMonthly(`${targetMonth.value}_${uid}`, res)
}

// --- 2. Shift Logic ---
const wdVal = ref('日勤'), holVal = ref('公休')
const tempShifts = ref({})
const shiftRows = ref([])

const initShiftTab = () => {
  tab.value = 'shift'
  const [y, m] = targetMonth.value.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  const list = []
  
  for(let d=1; d<=last; d++) {
    const f = `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`
    const wk = new Date(y, m-1, d).getDay()
    const hol = store.settings.holidays[f]
    const isHol = (wk===0||wk===6||hol)
    
    // Load Personal Shift
    const k = `${f}_${uid}`
    if(!tempShifts.value[f]) tempShifts.value[f] = store.shifts[k]?.name || '-'

    list.push({
      date: f, day: d, wk: ['日','月','火','水','木','金','土'][wk],
      isHol, col: isHol?'text-red':''
    })
  }
  shiftRows.value = list
}

const fillUserShift = (mode) => {
  const v = mode==='wd' ? wdVal.value : holVal.value
  shiftRows.value.forEach(r => {
    if((mode==='wd' && !r.isHol) || (mode==='hol' && r.isHol)) {
      tempShifts.value[r.date] = v
    }
  })
}

const saveUserShift = () => {
  const data = {}
  for(const d in tempShifts.value) {
    data[d] = { name: tempShifts.value[d] }
  }
  store.saveUserShifts(uid, data)
  alert('この社員のシフトを更新しました')
}

// --- 3. App Logic ---
const userApps = computed(() => store.apps.filter(a => a.uid === uid))

// --- 4. Doc Logic ---
const docType = ref('給与明細'), docMonth = ref('2026-01')
const uploadDoc = () => {
  const file = document.getElementById('file-input').value
  if(!file) return alert('ファイルを選択してください')
  store.uploadDoc(uid, `${docType.value} (${docMonth.value})`)
  alert('アップロード完了')
  // Force update
  const u = store.users.find(x => x.id === uid)
  if(u) targetUser.value.docs = u.docs
}
</script>