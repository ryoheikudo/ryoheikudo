import fs from "fs"
import yaml from "js-yaml"

const profile = yaml.load(fs.readFileSync("data/profile.yaml", "utf8"))

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

    md += `### ${level.charAt(0).toUpperCase() + level.slice(1)}\n`

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
      const end = exp.end === "present" ? "Present" : exp.end
      const tech = exp.tech?.join(" · ")

      let md = `### ${exp.role} — ${exp.company}\n`
      md += `${exp.start} – ${end}\n\n`

      if (tech) md += `Tech: ${tech}\n\n`

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
${profile.profile.location} · ${profile.profile.timezone}

---

## 👋 About

Software engineer based in ${profile.profile.location}.  
Experienced in building web applications using **TypeScript, Java, and Python**.

---

## 🛠 Skills

${renderSkills(profile.skills)}

---

## 💼 Experience

${renderExperience(profile.experience)}

---

## 🎓 Education

${renderEducation(profile.education)}

---

## 🔗 Links

- GitHub: ${profile.links.github}
`

fs.writeFileSync("README.md", readme)

console.log("README generated 🚀")