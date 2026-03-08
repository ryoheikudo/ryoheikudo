import readline from "readline/promises"

export interface SensitiveFields {
  dateOfBirth: string
  address: string
  phone: string
  email: string
  motivation: string
  preferences: string
}

async function readMultiline(rl: readline.Interface, promptText: string): Promise<string> {
  console.log(promptText)
  const lines: string[] = []
  while (true) {
    const line = await rl.question("> ")
    if (line === "") break
    lines.push(line)
  }
  return lines.join("\n")
}

export async function promptSensitiveFields(): Promise<{ fields: SensitiveFields; docType: "rirekisho" | "shokumu" | "both" }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log("\n=== 履歴書・職務経歴書 生成 ===\n")

  const dateOfBirth = await rl.question("[必須] 生年月日 (例: 1999年12月31日): ")
  const address = await rl.question("[必須] 現住所: ")
  const phone = await rl.question("[必須] 電話番号: ")
  const email = await rl.question("[任意] メールアドレス (空欄でスキップ): ")

  const motivation = await readMultiline(rl, "\n--- 志望動機（空行で入力終了）---")
  const preferences = await readMultiline(rl, "\n--- 本人希望記入欄（空行で入力終了）---")

  const docChoice = await rl.question("\n生成する書類: 1) 履歴書のみ  2) 職務経歴書のみ  3) 両方 [3]: ")

  rl.close()

  const docMap: Record<string, "rirekisho" | "shokumu" | "both"> = {
    "1": "rirekisho",
    "2": "shokumu",
    "3": "both",
    "": "both"
  }
  const docType = docMap[docChoice.trim()] ?? "both"

  return {
    fields: { dateOfBirth, address, phone, email, motivation, preferences },
    docType
  }
}
