import type { SensitiveFields } from "../lib/prompt.ts"

interface WorkExperience {
  company: string
  role: string
  type: string
  start: string | number
  end: string | number
  tech?: string[]
  description?: string[]
}

interface ShokumuData {
  name: string
  experience: WorkExperience[]
  shokumu: { summary: string }
}

function formatPeriod(start: string | number, end: string | number): string {
  const s = String(start).replaceAll("-", "年") + "月"
  if (end === "present") return `${s} ～ 現在`
  const e = String(end).replaceAll("-", "年") + "月"
  return `${s} ～ ${e}`
}

function buildExperienceSection(experience: WorkExperience[]): string {
  return experience
    .map(exp => {
      const period = formatPeriod(exp.start, exp.end)
      const techList = exp.tech?.map(t => `<li>${t}</li>`).join("") ?? ""
      const descList = exp.description?.map(d => `<li>${d}</li>`).join("") ?? ""

      return `
      <div class="job-block">
        <table class="job-table">
          <tr>
            <th class="job-label">会社名</th>
            <td>${exp.company}</td>
            <th class="job-label">雇用形態</th>
            <td>${exp.type}</td>
          </tr>
          <tr>
            <th class="job-label">職種</th>
            <td>${exp.role}</td>
            <th class="job-label">在籍期間</th>
            <td>${period}</td>
          </tr>
          <tr>
            <th class="job-label">使用技術</th>
            <td colspan="3"><ul class="inline-list">${techList}</ul></td>
          </tr>
          <tr>
            <th class="job-label">業務内容</th>
            <td colspan="3"><ul>${descList}</ul></td>
          </tr>
        </table>
      </div>`
    })
    .join("")
}

export function renderShokumuKeirekisho(data: ShokumuData, sensitive: SensitiveFields): string {
  const experienceSection = buildExperienceSection([...data.experience].reverse())

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>職務経歴書</title>
  <style>
    @page { size: A4; margin: 12mm 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
      font-size: 9pt;
      color: #000;
      line-height: 1.5;
    }
    h1.doc-title {
      text-align: center;
      font-size: 15pt;
      margin-bottom: 3mm;
      letter-spacing: 0.3em;
    }
    .meta { text-align: right; font-size: 8pt; margin-bottom: 4mm; }
    h2.section-title {
      font-size: 11pt;
      border-bottom: 2px solid #000;
      margin: 5mm 0 2mm;
      padding-bottom: 1mm;
    }
    .summary { margin-bottom: 4mm; font-size: 9pt; white-space: pre-wrap; }
    .job-block { border: 1px solid #555; margin-bottom: 4mm; overflow: hidden; }
    .job-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    .job-table td, .job-table th {
      border-right: 1px solid #555;
      border-bottom: 1px solid #555;
      padding: 1.5mm 2mm;
      vertical-align: top;
    }
    .job-table td:last-child, .job-table th:last-child { border-right: none; }
    .job-table tr:last-child td, .job-table tr:last-child th { border-bottom: none; }
    .job-label {
      background: #e8e8e8;
      width: 18mm;
      font-weight: bold;
      white-space: nowrap;
    }
    .job-table ul { padding-left: 4mm; }
    .inline-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 2mm; }
    .inline-list li {
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 2px;
      padding: 0 2mm;
      font-size: 8pt;
    }
    .preference-box {
      border: 1px solid #555;
      padding: 2mm 3mm;
      min-height: 15mm;
      font-size: 9pt;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>

  <h1 class="doc-title">職務経歴書</h1>
  <div class="meta">
    氏名：${data.name}　／　作成日：${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
  </div>

  <!-- 職務要約 -->
  <h2 class="section-title">職務要約</h2>
  <div class="summary">${data.shokumu.summary.trim()}</div>

  <!-- 職務経歴 -->
  <h2 class="section-title">職務経歴</h2>
  ${experienceSection}

  <!-- 本人希望 -->
  <h2 class="section-title">希望条件・その他</h2>
  <div class="preference-box">${sensitive.preferences || "特になし"}</div>

</body>
</html>`
}
