import type { SensitiveFields } from "../lib/prompt.ts"

interface ResumeData {
  name: string
  nameKana: string
  education: Array<{ institution: string; degree: string; start: number; end: number | string; location: string }>
  experience: Array<{ company: string; role: string; type: string; start: string | number; end: string | number }>
  licenses: Array<{ name: string; date: string }>
}

function buildAcademicRows(education: ResumeData["education"]): string {
  return education
    .map(e => {
      const [startYear, startMonth = "4"] = String(e.start).split("-")
      const [endYear, endMonth = "3"] = String(e.end).split("-")
      return `
      <tr>
        <td class="year">${startYear}</td>
        <td class="month">${startMonth}</td>
        <td>${e.institution} ${e.degree} 入学</td>
      </tr>
      <tr>
        <td class="year">${endYear}</td>
        <td class="month">${endMonth}</td>
        <td>${e.institution} ${e.degree} 卒業</td>
      </tr>`
    })
    .join("")
}

interface WorkGroup {
  company: string
  start: string | number
  end: string | number
}

function mergeWorkEntries(experience: ResumeData["experience"]): WorkGroup[] {
  const filtered = experience.filter(e => e.type !== "インターンシップ")
  const groups: WorkGroup[] = []
  for (const exp of filtered) {
    const last = groups[groups.length - 1]
    if (last && last.company === exp.company) {
      last.end = exp.end
    } else {
      groups.push({ company: exp.company, start: exp.start, end: exp.end })
    }
  }
  return groups
}

function buildWorkRows(experience: ResumeData["experience"]): string {
  return mergeWorkEntries(experience)
    .map(exp => {
      const [startYear, startMonth = "4"] = String(exp.start).split("-")
      const [endYear, endMonth] = exp.end === "present" ? ["", ""] : String(exp.end).split("-")

      const entryRow = `
      <tr>
        <td class="year">${startYear}</td>
        <td class="month">${startMonth}</td>
        <td>${exp.company}　入社</td>
      </tr>`

      if (exp.end === "present") {
        return entryRow + `
      <tr>
        <td class="year"></td>
        <td class="month"></td>
        <td>現在に至る</td>
      </tr>`
      }

      const exitRow = `
      <tr>
        <td class="year">${endYear}</td>
        <td class="month">${endMonth ?? "10"}</td>
        <td>${exp.company}　退社</td>
      </tr>`

      return entryRow + exitRow
    })
    .join("")
}

function buildLicenseRows(licenses: ResumeData["licenses"]): string {
  if (!licenses?.length) {
    return `
      <tr><td class="year" style="height:7mm;"></td><td class="month"></td><td></td></tr>
      <tr><td class="year" style="height:7mm;"></td><td class="month"></td><td></td></tr>`
  }
  return licenses.map(l => {
    const [year, month = ""] = l.date.split("-")
    return `
      <tr>
        <td class="year" style="height:7mm;">${year}</td>
        <td class="month">${month}</td>
        <td>${l.name}　取得</td>
      </tr>`
  }).join("")
}

export function renderRirekisho(data: ResumeData, sensitive: SensitiveFields): string {
  const academicRows = buildAcademicRows(data.education)
  const workRows = buildWorkRows(data.experience)
  const licenseRows = buildLicenseRows(data.licenses)

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>履歴書</title>
  <style>
    @page { size: A4; margin: 10mm 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif;
      font-size: 9pt;
      color: #000;
    }
    .page { width: 100%; padding: 4mm; }
    .page-break { page-break-after: always; }
    h1.doc-title {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 4mm;
      letter-spacing: 0.5em;
    }
    .date-line { text-align: right; font-size: 8pt; margin-bottom: 3mm; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
    td, th { border: 1px solid #000; padding: 1.5mm 2mm; vertical-align: top; }
    .name-block td { height: 14mm; }
    .name-large { font-size: 16pt; font-weight: bold; }
    .name-kana { font-size: 8pt; }
    .photo-cell { width: 28mm; text-align: center; vertical-align: middle; font-size: 7pt; color: #555; }
    .label-cell { width: 22mm; background: #f0f0f0; font-size: 8pt; }
    .year { width: 12mm; text-align: center; }
    .month { width: 8mm; text-align: center; }
    .section-header td {
      background: #d0d0d0;
      font-weight: bold;
      font-size: 9pt;
      text-align: center;
    }
    .history-table td { height: 7mm; }
    .textarea-cell { height: 28mm; vertical-align: top; }
    .small { font-size: 7.5pt; }
  </style>
</head>
<body>

<!-- Page 1 -->
<div class="page page-break">
  <h1 class="doc-title">履　歴　書</h1>
  <div class="date-line">作成日：${new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}</div>

  <!-- 氏名・写真 -->
  <table class="name-block" style="margin-bottom:2mm;">
    <tr>
      <td style="width:50%;">
        <div class="name-kana">ふりがな：${data.nameKana}</div>
        <div class="name-large">${data.name}</div>
      </td>
      <td rowspan="2" class="photo-cell" style="width:28mm;height:36mm;">
        写真貼付欄<br>(縦4cm×横3cm)
      </td>
    </tr>
    <tr>
      <td>
        <span class="label-cell" style="display:inline-block;padding:0 2mm;">生年月日</span>
        ${sensitive.dateOfBirth}
      </td>
    </tr>
  </table>

  <!-- 住所・連絡先 -->
  <table style="margin-bottom:2mm;">
    <tr>
      <td class="label-cell" style="width:22mm;">現住所</td>
      <td colspan="3">${sensitive.address}</td>
    </tr>
    <tr>
      <td class="label-cell">電話番号</td>
      <td style="width:40%;">${sensitive.phone}</td>
      <td class="label-cell">E-mail</td>
      <td>${sensitive.email || "―"}</td>
    </tr>
  </table>

  <!-- 学歴・職歴 -->
  <table class="history-table">
    <tr class="section-header"><td colspan="3">学　　歴</td></tr>
    ${academicRows}
    <tr class="section-header"><td colspan="3">職　　歴</td></tr>
    ${workRows}
    <tr>
      <td class="year"></td>
      <td class="month"></td>
      <td style="text-align:right;font-size:8pt;">以上</td>
    </tr>
  </table>
</div>

<!-- Page 2 -->
<div class="page">
  <!-- 免許・資格 -->
  <table style="margin-bottom:3mm;">
    <tr class="section-header"><td colspan="3">免許・資格</td></tr>
    ${licenseRows}
  </table>

  <!-- 志望動機 -->
  <table style="margin-bottom:3mm;">
    <tr class="section-header"><td>志望動機・自己PR・趣味・特技など</td></tr>
    <tr>
      <td class="textarea-cell" style="height:60mm;white-space:pre-wrap;">${sensitive.motivation || ""}</td>
    </tr>
  </table>

  <!-- 本人希望 -->
  <table>
    <tr class="section-header"><td>本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</td></tr>
    <tr>
      <td class="textarea-cell" style="height:25mm;white-space:pre-wrap;">${sensitive.preferences || ""}</td>
    </tr>
  </table>
</div>

</body>
</html>`
}
