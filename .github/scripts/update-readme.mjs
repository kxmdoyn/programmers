// README의 풀이 현황을 백준허브가 올린 문제별 README.md에서 다시 만든다.
// GitHub Actions(.github/workflows/readme.yml)가 풀이가 올라올 때마다 실행한다.
// 학습 사이트가 API 한도 없이 읽도록 풀이 파일 목록도 coach/solved.json 으로 남긴다.
// README에서 <!-- AUTO:START --> ~ <!-- AUTO:END --> 사이만 바꾸므로, 그 위아래는 자유롭게 고쳐도 된다.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '프로그래머스'
const README = 'README.md'
const START = '<!-- AUTO:START -->'
const END = '<!-- AUTO:END -->'
const TZ = 'Asia/Seoul'

// 프로그래머스 레벨 색
const LEVEL_COLOR = ['8B95A1', '1BBAFF', '47C84C', 'FFA800', 'FF4545', 'C658E1']
const LANG = {
  py: ['Python', '3776AB', 'python'],
  sql: ['SQL', '4479A1', 'mysql'],
  js: ['JavaScript', 'F7DF1E', 'javascript'],
  java: ['Java', 'ED8B00', 'openjdk'],
  cpp: ['C++', '00599C', 'cplusplus'],
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })

const field = (text, heading) =>
  text
    .split(`### ${heading}`)[1]
    ?.split('###')[0]
    .replace(/<[^>]+>/g, ' ')
    .trim() ?? ''

function parseProblem(readmePath) {
  // 백준허브는 공백으로 U+2005를 쓰고, 한글이 NFD로 올 때가 있다
  const text = readFileSync(readmePath, 'utf8').normalize('NFC')
  const head = /^# \[level (\d+)\] (.+?) - (\d+)\s*$/m.exec(text)
  if (!head) return null
  const [, level, title, id] = head
  const dir = readmePath.split(/[\\/]/).slice(0, -1).join('/')
  const code = readdirSync(dir).find((f) => f !== 'README.md')
  const date = /(\d{4})년 (\d{1,2})월 (\d{1,2})일/.exec(field(text, '제출 일자'))
  return {
    id,
    level: Number(level),
    title: title.replace(/\s+/g, ' ').trim(),
    category: field(text, '구분')
      .replace(/^코딩테스트\s*연습\s*>\s*/, '')
      .replace(/\s+/g, ' '),
    date: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : '',
    time: /시간:\s*([\d.]+ ms)/.exec(field(text, '성능 요약'))?.[1] ?? '',
    lang: code?.split('.').pop() ?? '',
    codePath: code ? `${dir}/${code}` : dir,
  }
}

const link = (path) => encodeURI(path.replace(/\\/g, '/')).replace(/#/g, '%23')
const cell = (s) => s.replace(/\|/g, '\\|')
const badgeText = (s) => encodeURIComponent(String(s).replace(/-/g, '--').replace(/_/g, '__'))
const badge = (label, message, color, extra = '') =>
  `https://img.shields.io/badge/${badgeText(label)}-${badgeText(message)}-${color}?style=flat-square${extra}`
const problemUrl = (id) => `https://school.programmers.co.kr/learn/courses/30/lessons/${id}`
const levelBadge = (lv) => `<img src="${badge('', `Lv.${lv}`, LEVEL_COLOR[lv] ?? '555')}" />`

const problems = walk(ROOT)
  .filter((p) => p.endsWith('README.md'))
  .map(parseProblem)
  .filter(Boolean)
// 같은 문제가 여러 번 올라오면 가장 최근 제출만
const byId = new Map()
for (const p of problems) if (!byId.has(p.id) || byId.get(p.id).date < p.date) byId.set(p.id, p)
const list = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id)

// ---------- 날짜 ----------
const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
const today = ymd(new Date())
const addDays = (s, n) => {
  const d = new Date(`${s}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const perDay = new Map()
for (const p of list) if (p.date) perDay.set(p.date, (perDay.get(p.date) ?? 0) + 1)
const days = perDay.size

// 연속 풀이: 오늘(또는 어제)부터 거꾸로 이어진 날 수
let streak = 0
for (let d = perDay.has(today) ? today : addDays(today, -1); perDay.has(d); d = addDays(d, -1))
  streak++

// 최근 5주 잔디 (월요일 시작)
const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7
const firstMonday = addDays(today, -dow - 7 * 4)
const grass = (n) => (n === undefined ? '⬜' : n >= 3 ? '🟩' : '🟢')
const grassRows = Array.from({ length: 5 }, (_, w) => {
  const cells = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(firstMonday, w * 7 + i)
    if (d > today) return '　'
    return grass(perDay.get(d))
  })
  return `| ${addDays(firstMonday, w * 7).slice(5).replace('-', '/')} | ${cells.join(' | ')} |`
})

// ---------- 표 ----------
const row = (p) => {
  const [name, color, logo] = LANG[p.lang] ?? [p.lang, '555', '']
  return `| ${p.date.slice(5).replace('-', '.')} | ${levelBadge(p.level)} | [${cell(p.title)}](${problemUrl(p.id)}) | ${cell(p.category)} | [<img src="${badge('', name, color, logo ? `&logo=${logo}&logoColor=white` : '')}" />](${link(p.codePath)}) |`
}
const table = (rows) =>
  ['| 날짜 | 레벨 | 문제 | 유형 | 풀이 |', '|:---:|:---:|---|---|:---:|', ...rows.map(row)].join(
    '\n',
  )

const levels = [...new Set(list.map((p) => p.level))].sort((a, b) => a - b)
const maxLevelCount = Math.max(1, ...levels.map((lv) => list.filter((p) => p.level === lv).length))
const bar = (n, max, width = 10) => {
  const filled = Math.max(n ? 1 : 0, Math.round((n / max) * width))
  return '🟦'.repeat(filled) + '⬜'.repeat(width - filled)
}

const categories = [...list.reduce((m, p) => m.set(p.category, (m.get(p.category) ?? 0) + 1), new Map())]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 8)

const lastDate = list[0]?.date ?? '-'

const auto = [
  START,
  '<div align="center">',
  '',
  `<img src="${badge('solved', `${list.length}문제`, '1BBAFF')}" /> ` +
    `<img src="${badge('풀이한 날', `${days}일`, '47C84C')}" /> ` +
    `<img src="${badge('연속', `${streak}일 🔥`, 'FF7A00')}" /> ` +
    `<img src="${badge('최근 풀이', lastDate, '8B95A1')}" />`,
  '',
  '</div>',
  '',
  '## 📊 레벨별',
  '',
  '| 레벨 | 문제 수 | |',
  '|:---:|:---:|---|',
  ...levels.map((lv) => {
    const n = list.filter((p) => p.level === lv).length
    return `| ${levelBadge(lv)} | **${n}** | ${bar(n, maxLevelCount)} |`
  }),
  '',
  '## 🌱 최근 5주',
  '',
  '| 주 | 월 | 화 | 수 | 목 | 금 | 토 | 일 |',
  '|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|',
  ...grassRows,
  '',
  '<sub>🟢 1~2문제 · 🟩 3문제 이상 · ⬜ 쉰 날</sub>',
  '',
  '## 🏷️ 많이 푼 유형',
  '',
  categories.map(([c, n]) => `\`${c} ${n}\``).join(' · '),
  '',
  '## 🕒 최근 풀이',
  '',
  table(list.slice(0, 10)),
  '',
  '## 📚 전체 목록',
  '',
  ...levels.flatMap((lv) => {
    const rows = list.filter((p) => p.level === lv)
    return [
      `<details>`,
      `<summary><b>Lv.${lv}</b> · ${rows.length}문제</summary>`,
      '',
      table(rows),
      '',
      `</details>`,
      '',
    ]
  }),
  `<sub>마지막 갱신 ${today} · 이 영역은 GitHub Actions가 자동으로 만듭니다.</sub>`,
  END,
].join('\n')

const DEFAULT_TOP = `<div align="center">

# 🧩 Programmers Coding Test

**Python으로 하루 한 문제씩, 코딩테스트 준비 기록**

<img src="${badge('', 'Python', '3776AB', '&logo=python&logoColor=white')}" /> <img src="${badge('', 'MySQL', '4479A1', '&logo=mysql&logoColor=white')}" /> <img src="${badge('', 'BaekjoonHub', '0F172A', '&logo=github&logoColor=white')}" />

<a href="https://ai-coding-coach-lite.vercel.app/"><img src="https://img.shields.io/badge/%F0%9F%90%B1%20%ED%95%99%EC%8A%B5%20%EC%82%AC%EC%9D%B4%ED%8A%B8-AI%20Coding%20Coach%20Lite-1BBAFF?style=flat-square" alt="학습 사이트" /></a>

</div>

> 프로그래머스에서 정답을 제출하면 [백준허브](https://github.com/BaekjoonHub/BaekjoonHub)가 자동으로 올리고,
> 아래 현황은 GitHub Actions가 갱신합니다.
`

let current = ''
try {
  current = readFileSync(README, 'utf8')
} catch {
  // README가 없으면 새로 만든다
}
const next =
  current.includes(START) && current.includes(END)
    ? current.slice(0, current.indexOf(START)) + auto + current.slice(current.indexOf(END) + END.length)
    : `${current.trim() ? current.trim() + '\n\n' : DEFAULT_TOP + '\n'}${auto}\n`

// 학습 사이트(AI Coding Coach Lite)용 풀이 파일 목록
const files = walk(ROOT).map((p) => p.split('\\').join('/')).sort()
// dates: 문제 번호 → 제출일 (사이트의 연속 풀이·고양이 상태 계산용)
const dates = Object.fromEntries(
  [...byId.values()].filter((p) => p.date).sort((a, b) => a.id - b.id).map((p) => [p.id, p.date]),
)
const index = `${JSON.stringify({ paths: files, dates }, null, 2)}\n`
mkdirSync('coach', { recursive: true })
let oldIndex = ''
try {
  oldIndex = readFileSync('coach/solved.json', 'utf8')
} catch {
  // 처음 만드는 경우
}
if (index !== oldIndex) writeFileSync('coach/solved.json', index)

if (next !== current) {
  writeFileSync(README, next)
  console.log(`README 갱신: ${list.length}문제`)
} else console.log('변경 없음')
