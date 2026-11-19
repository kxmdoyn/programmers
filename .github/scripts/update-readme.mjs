// README의 풀이 목록을 백준허브가 올린 문제별 README.md에서 다시 만든다.
// GitHub Actions(.github/workflows/readme.yml)가 풀이가 올라올 때마다 실행한다.
// README에서 <!-- AUTO:START --> ~ <!-- AUTO:END --> 사이만 바꾸므로, 그 위아래는 자유롭게 고쳐도 된다.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = '프로그래머스'
const README = 'README.md'
const START = '<!-- AUTO:START -->'
const END = '<!-- AUTO:END -->'
const LEVEL_NAME = (lv) => `Lv.${lv}`

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
  const text = readFileSync(readmePath, 'utf8').normalize('NFC')
  const head = /^# \[level (\d+)\] (.+?) - (\d+)\s*$/m.exec(text)
  if (!head) return null
  const [, level, title, id] = head
  const dir = readmePath.split(/[\\/]/).slice(0, -1).join('/')
  const code = readdirSync(dir).find((f) => f !== 'README.md')
  const date = /(\d{4})년 (\d{1,2})월 (\d{1,2})일/.exec(field(text, '제출 일자'))
  const perf = field(text, '성능 요약')
  return {
    id,
    level: Number(level),
    title: title.trim(),
    category: field(text, '구분').replace(/^코딩테스트\s*연습\s*>\s*/, ''), // 백준허브는 공백으로 U+2005를 쓴다
    date: date ? `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}` : '',
    time: /시간:\s*([\d.]+ ms)/.exec(perf)?.[1] ?? '',
    lang: code?.split('.').pop() ?? '',
    codePath: code ? `${dir}/${code}` : dir,
  }
}

const link = (path) => encodeURI(path.replace(/\\/g, '/')).replace(/#/g, '%23')
const cell = (s) => s.replace(/\|/g, '\\|')
const problemUrl = (id) => `https://school.programmers.co.kr/learn/courses/30/lessons/${id}`
const LANG = { py: 'Python', sql: 'SQL', js: 'JavaScript', java: 'Java', cpp: 'C++' }

const problems = walk(ROOT)
  .filter((p) => p.endsWith('README.md'))
  .map(parseProblem)
  .filter(Boolean)
// 같은 문제가 여러 번 올라오면 가장 최근 제출만
const byId = new Map()
for (const p of problems) if (!byId.has(p.id) || byId.get(p.id).date < p.date) byId.set(p.id, p)
const list = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id)

const levels = [...new Set(list.map((p) => p.level))].sort((a, b) => a - b)
const row = (p) =>
  `| ${p.date} | [${cell(p.title)}](${problemUrl(p.id)}) | ${cell(p.category)} | [${LANG[p.lang] ?? p.lang}](${link(p.codePath)}) | ${p.time} |`
const table = (rows) =>
  ['| 날짜 | 문제 | 유형 | 풀이 | 시간 |', '|---|---|---|---|---|', ...rows.map(row)].join('\n')

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
const days = new Set(list.map((p) => p.date).filter(Boolean)).size

const auto = [
  START,
  '',
  `**${list.length}문제** 해결 · ${days}일 동안 풀이 · 마지막 갱신 ${today}`,
  '',
  '| ' + levels.map(LEVEL_NAME).join(' | ') + ' |',
  '|' + levels.map(() => ':---:').join('|') + '|',
  '| ' + levels.map((lv) => list.filter((p) => p.level === lv).length).join(' | ') + ' |',
  '',
  '## 최근 풀이',
  '',
  table(list.slice(0, 10)),
  '',
  ...levels.flatMap((lv) => {
    const rows = list.filter((p) => p.level === lv)
    return [
      `<details>`,
      `<summary><b>${LEVEL_NAME(lv)}</b> · ${rows.length}문제</summary>`,
      '',
      table(rows),
      '',
      `</details>`,
      '',
    ]
  }),
  END,
].join('\n')

const DEFAULT_TOP = `# 프로그래머스 코딩테스트 풀이

Python으로 푼 프로그래머스 문제 모음입니다.
정답 제출 시 [백준허브](https://github.com/BaekjoonHub/BaekjoonHub)가 자동으로 올리고, 아래 목록은 GitHub Actions가 갱신합니다.
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

if (next !== current) {
  writeFileSync(README, next)
  console.log(`README 갱신: ${list.length}문제`)
} else console.log('변경 없음')
