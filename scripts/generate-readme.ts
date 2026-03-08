import fs from "fs"
import yaml from "js-yaml"

const profile = yaml.load(fs.readFileSync("data/profile.yaml", "utf8"))

const levelLabel = {
  primary: "メイン",
  working: "実務経験あり",
  familiar: "学習・個人利用"
}

function renderSkills(skills) {
  const groups = {
    primary: [],
    working: [],
    familiar: []
  }

  for (const lang of skills.languages) {
    groups[lang.level].push(lang)
  }

  let md = ""

  for (const level of ["primary", "working", "familiar"]) {
    if (!groups[level].length) continue

    md += `### ${levelLabel[level]}\n`

    for (const lang of groups[level]) {
      md += `- **${lang.name}**\n`

      if (lang.frameworks?.length) {
        for (const fw of lang.frameworks) {
          md += `  - ${fw}\n`
        }
      }
    }

    md += "\n"
  }

  return md
}

function renderExperience(experience) {
  return experience
    .slice()
    .reverse()
    .map(exp => {
      const end = exp.end === "present" ? "現在" : exp.end
      const tech = exp.tech?.join(" · ")

      let md = `### ${exp.role} — ${exp.company}\n`
      md += `${exp.start} – ${end}\n\n`

      if (tech) md += `使用技術: ${tech}\n\n`

      if (exp.description) {
        for (const d of exp.description) {
          md += `- ${d}\n`
        }
      }

      return md
    })
    .join("\n---\n\n")
}

function renderEducation(education) {
  return education
    .map(e => {
      return `**${e.institution}**
${e.degree}
${e.start} – ${e.end}`
    })
    .join("\n\n")
}

const readme = `# ${profile.profile.name}

**${profile.profile.title}**
${profile.profile.location}

---

## 👋 About

${profile.profile.location}を拠点に活動するソフトウェアエンジニアです。
**TypeScript・Java・Python** を用いたWebアプリケーション開発を得意としています。

---

## 🛠 スキル

${renderSkills(profile.skills)}

---

## 💼 職務経歴

${renderExperience(profile.experience)}

---

## 🎓 学歴

${renderEducation(profile.education)}

---

## 🔗 リンク

- GitHub: ${profile.links.github}
`

fs.writeFileSync("README.md", readme)

console.log("README generated 🚀")
