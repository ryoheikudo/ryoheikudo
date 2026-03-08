import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import puppeteer, { type Browser } from "puppeteer"
import { promptSensitiveFields } from "../lib/prompt.ts"
import { renderRirekisho } from "../templates/rirekisho.html.ts"
import { renderShokumuKeirekisho } from "../templates/shokumu-keirekisho.html.ts"

const rawProfile = yaml.load(fs.readFileSync("data/profile.yaml", "utf8")) as any

const resumeData = {
  name: rawProfile.profile.name,
  nameKana: rawProfile.profile.name_kana,
  title: rawProfile.profile.title,
  education: rawProfile.education,
  experience: rawProfile.experience,
  licenses: rawProfile.licenses ?? [],
  shokumu: rawProfile.shokumu
}

async function generatePdf(browser: Browser, html: string, outputPath: string): Promise<void> {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle0" })
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true
  })
  await page.close()
  console.log(`生成完了: ${outputPath}`)
}

async function main() {
  // CLI flag: --only=rirekisho / --only=shokumu
  const onlyFlag = process.argv.find(a => a.startsWith("--only="))
  let docTypeOverride: "rirekisho" | "shokumu" | null = null
  if (onlyFlag) {
    const val = onlyFlag.split("=")[1]
    if (val === "rirekisho" || val === "shokumu") {
      docTypeOverride = val
    }
  }

  const { fields, docType } = await promptSensitiveFields()
  const finalDocType = docTypeOverride ?? docType

  const outputDir = path.resolve("output")
  fs.mkdirSync(outputDir, { recursive: true })

  const browser = await puppeteer.launch({ headless: true })
  try {
    const tasks: Promise<void>[] = []

    if (finalDocType === "rirekisho" || finalDocType === "both") {
      tasks.push(generatePdf(browser, renderRirekisho(resumeData, fields), path.join(outputDir, "rirekisho.pdf")))
    }

    if (finalDocType === "shokumu" || finalDocType === "both") {
      tasks.push(generatePdf(browser, renderShokumuKeirekisho(resumeData, fields), path.join(outputDir, "shokumu-keirekisho.pdf")))
    }

    await Promise.all(tasks)
  } finally {
    await browser.close()
    // Clear sensitive data from memory (best effort in JS)
    Object.keys(fields).forEach(k => { (fields as any)[k] = "" })
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
