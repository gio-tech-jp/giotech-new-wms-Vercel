<template>
  <div class="flex flex-col gap-6">
    
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2>シフト種別設定</h2>
      </div>
      <p class="text-xs text-sub mb-4">「日勤」「早番」などのシフトパターンを定義します。</p>

      <div class="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
        <div class="text-sm font-bold mb-2 text-primary">
          {{ isEditing ? 'シフト情報の編集' : '新規シフト追加' }}
        </div>
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <label>名称</label>
            <input type="text" v-model="formShift.name" placeholder="例: 遅番A" class="mb-0">
          </div>
          <div class="flex-1">
            <label>開始時間</label>
            <input type="time" v-model="formShift.s" class="mb-0">
          </div>
          <div class="flex-1">
            <label>終了時間</label>
            <input type="time" v-model="formShift.e" class="mb-0">
          </div>
          
          <template v-if="isEditing">
            <button class="btn btn-success" @click="updateShift">更新</button>
            <button class="btn btn-secondary" @click="cancelEdit">キャンセル</button>
          </template>
          <template v-else>
            <button class="btn btn-primary" @click="addShift">追加</button>
          </template>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>時間</th>
              <th>稼働時間(休憩1h除く)</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(shift, index) in store.settings.shiftTypes" :key="index" :class="{'bg-blue-50': editingIndex === index}">
              <td class="font-bold">{{ shift.name }}</td>
              <td>
                <span v-if="shift.s && shift.e">{{ shift.s }} ～ {{ shift.e }}</span>
                <span v-else class="text-xs text-sub">時間設定なし (公休など)</span>
              </td>
              <td>
                {{ calcDuration(shift.s, shift.e) }}
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <button class="btn btn-info btn-sm" @click="editShift(index)">編集</button>
                  <button class="btn btn-danger btn-sm" @click="deleteShift(index)">削除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2>年間カレンダー設定 (祝日・特別休暇)</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="border border-blue-200 bg-blue-50 p-4 rounded">
          <h3 style="margin:0 0 10px 0; border:none; padding:0; font-size:14px;" class="text-blue-700">① 一般祝日の一括登録</h3>
          <p class="text-xs text-sub mb-2">選択した年の国民の祝日を自動で登録します。</p>
          <div class="flex gap-2">
            <select v-model="targetYear" class="mb-0">
              <option value="2025">2025年</option>
              <option value="2026">2026年</option>
              <option value="2027">2027年</option>
            </select>
            <button class="btn btn-info btn-sm whitespace-nowrap" @click="generatePublicHolidays">祝日を反映</button>
          </div>
        </div>

        <div class="border border-orange-200 bg-orange-50 p-4 rounded">
          <h3 style="margin:0 0 10px 0; border:none; padding:0; font-size:14px;" class="text-orange-700">② 特別休暇の期間登録</h3>
          <p class="text-xs text-sub mb-2">夏季休暇や年末年始など、連続する日付を登録します。</p>
          <div class="form-group mb-2">
            <input type="text" v-model="rangeName" placeholder="休暇名 (例: 夏季休暇)" class="mb-2">
            <div class="flex gap-2 items-center">
              <input type="date" v-model="rangeStart" class="mb-0">
              <span>～</span>
              <input type="date" v-model="rangeEnd" class="mb-0">
            </div>
          </div>
          <button class="btn btn-warning btn-sm w-full" @click="addRangeHoliday">期間を登録</button>
        </div>
      </div>

      <h3>登録済み休日一覧</h3>
      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>曜日</th>
              <th>名称</th>
              <th class="text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in sortedHolidays" :key="h.date">
              <td>{{ h.date }}</td>
              <td :class="h.wkColor">{{ h.wk }}</td>
              <td>{{ h.name }}</td>
              <td class="text-center">
                <button class="btn btn-danger btn-sm" @click="deleteHoliday(h.date)">削除</button>
              </td>
            </tr>
            <tr v-if="sortedHolidays.length === 0">
              <td colspan="4" class="text-center text-sub py-4">登録された休日がありません</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useMainStore } from '~/stores/index'
const store = useMainStore()

// --- 1. シフト設定ロジック ---
const formShift = ref({ name: '', s: '', e: '' })
const editingIndex = ref(-1) // -1:新規作成モード, 0以上:編集モード
const isEditing = computed(() => editingIndex.value !== -1)

// 新規追加
const addShift = () => {
  if (!formShift.value.name) return alert('名称を入力してください')
  store.settings.shiftTypes.push({ ...formShift.value })
  resetForm()
}

// 編集モード開始
const editShift = (index) => {
  editingIndex.value = index
  // 該当データをコピーしてフォームに入れる
  formShift.value = { ...store.settings.shiftTypes[index] }
}

// 更新実行
const updateShift = () => {
  if (!formShift.value.name) return alert('名称を入力してください')
  // 配列の該当インデックスを上書き
  store.settings.shiftTypes[editingIndex.value] = { ...formShift.value }
  resetForm()
}

// 編集キャンセル
const cancelEdit = () => {
  resetForm()
}

// 削除
const deleteShift = (index) => {
  if (confirm('このシフト種別を削除しますか？\n※使用中のシフト表には影響しませんが、新規登録時に選択できなくなります。')) {
    store.settings.shiftTypes.splice(index, 1)
    // もし編集中のものを削除したらフォームもリセット
    if (editingIndex.value === index) resetForm()
  }
}

// フォームリセット用
const resetForm = () => {
  formShift.value = { name: '', s: '', e: '' }
  editingIndex.value = -1
}

// 稼働時間の計算 (簡易表示用)
const calcDuration = (s, e) => {
  if (!s || !e) return '-'
  const [sh, sm] = s.split(':').map(Number)
  const [eh, em] = e.split(':').map(Number)
  let mins = (eh * 60 + em) - (sh * 60 + sm)
  // 休憩1時間 (60分) を引くロジック
  if (mins > 60) mins -= 60
  if (mins < 0) mins = 0
  return (mins / 60).toFixed(1) + 'h'
}

// --- 2. カレンダー設定ロジック ---
const targetYear = ref('2026')
const rangeName = ref('')
const rangeStart = ref('')
const rangeEnd = ref('')

const sortedHolidays = computed(() => {
  const holidays = store.settings.holidays
  if (!holidays) return []
  return Object.entries(holidays).map(([date, name]) => {
    const d = new Date(date)
    const wkIdx = d.getDay()
    return {
      date: date,
      name: name,
      wk: ['日', '月', '火', '水', '木', '金', '土'][wkIdx],
      wkColor: wkIdx === 0 ? 'text-red' : (wkIdx === 6 ? 'text-blue' : ''),
      ts: d.getTime()
    }
  }).sort((a, b) => a.ts - b.ts)
})

const generatePublicHolidays = () => {
  const y = targetYear.value
  if (!confirm(`${y}年の日本の祝日を一括登録しますか？`)) return

  const list = {}
  list[`${y}/01/01`] = "元日"
  list[`${y}/02/11`] = "建国記念の日"
  list[`${y}/02/23`] = "天皇誕生日"
  list[`${y}/04/29`] = "昭和の日"
  list[`${y}/05/03`] = "憲法記念日"
  list[`${y}/05/04`] = "みどりの日"
  list[`${y}/05/05`] = "こどもの日"
  list[`${y}/08/11`] = "山の日"
  list[`${y}/11/03`] = "文化の日"
  list[`${y}/11/23`] = "勤労感謝の日"
  if (y === '2026') {
    list[`${y}/03/20`] = "春分の日"
    list[`${y}/09/23`] = "秋分の日"
  } else {
    list[`${y}/03/20`] = "春分の日(仮)"
    list[`${y}/09/23`] = "秋分の日(仮)"
  }

  const setHappyMonday = (month, weekNum, name) => {
    let d = new Date(y, month - 1, 1)
    let count = 0
    while (d.getMonth() === month - 1) {
      if (d.getDay() === 1) {
        count++
        if (count === weekNum) {
          const fmt = `${y}/${String(month).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`
          list[fmt] = name
          break
        }
      }
      d.setDate(d.getDate() + 1)
    }
  }

  setHappyMonday(1, 2, "成人の日")
  setHappyMonday(7, 3, "海の日")
  setHappyMonday(9, 3, "敬老の日")
  setHappyMonday(10, 2, "スポーツの日")

  store.settings.holidays = { ...store.settings.holidays, ...list }
  alert(`${Object.keys(list).length}件の祝日を登録しました。`)
}

const addRangeHoliday = () => {
  if (!rangeName.value || !rangeStart.value || !rangeEnd.value) {
    return alert('名称と期間をすべて入力してください')
  }
  const start = new Date(rangeStart.value)
  const end = new Date(rangeEnd.value)
  if (start > end) return alert('期間の設定が正しくありません')

  let count = 0
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const fmt = `${y}/${m}/${day}`
    store.settings.holidays[fmt] = rangeName.value
    count++
  }
  alert(`${count}日間の休暇(${rangeName.value})を登録しました。`)
}

const deleteHoliday = (dateKey) => {
  if (confirm(`${dateKey} の設定を削除しますか？`)) {
    delete store.settings.holidays[dateKey]
  }
}
</script>