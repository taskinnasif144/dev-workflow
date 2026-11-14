import { Plugin, Skill } from "@opencode/plugin"
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { homedir } from "node:os"

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const bundleRoot = join(packageRoot, "bundle")

function read(path: string): string {
  return readFileSync(path, "utf8")
}

function parseFrontmatter(raw: string): { name?: string; description?: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const block = match[1]
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "")
  const description = block
    .match(/^description:\s*(.+)$/m)?.[1]
    ?.trim()
    .replace(/^["']|["']$/g, "")
  return { name, description }
}

function frontmatterField(raw: string, field: string): string | undefined {
  const match = raw.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))
  return match?.[1]?.trim().replace(/^["']|["']$/g, "")
}

export default Plugin.define({
  id: "dev-workflow",
  async setup(ctx) {
    const rawCommand = read(join(bundleRoot, "commands", "dev.md"))
    const commandBody = rawCommand.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")

    await ctx.command.transform((editor) => {
      editor.add({
        name: "dev",
        description:
          "Full dev pipeline — Phase-0 explore, grill requirements, plan with cross-critique, ticket, TDD implement, review, ship",
        execute: async ({ sessionID, prompt, delivery }) => {
          await ctx.session.prompt({
            ...prompt,
            sessionID,
            text: commandBody,
            delivery,
          })
        },
      })
    })

    const skillsRoot = join(bundleRoot, "skills")
    const skillDirs = readdirSync(skillsRoot).filter((entry) =>
      statSync(join(skillsRoot, entry)).isDirectory(),
    )

    await ctx.skill.transform((editor) => {
      for (const id of skillDirs) {
        const skillPath = join(skillsRoot, id, "SKILL.md")
        if (!existsSync(skillPath)) continue
        const content = read(skillPath)
        const fm = parseFrontmatter(content)
        editor.add({
          id: Skill.ID.make(id),
          name: Skill.Name.make(fm.name ?? id),
          description: fm.description ?? `Skill ${id}`,
          path: Skill.Info.fields.path.make(skillPath),
          content,
        })
      }
    })

    const agentsRoot = join(bundleRoot, "agents")
    const agentsDir = join(homedir(), ".config", "opencode", "agents")
    mkdirSync(agentsDir, { recursive: true })
    for (const file of readdirSync(agentsRoot)) {
      if (!file.endsWith(".md")) continue
      const source = join(agentsRoot, file)
      const destination = join(agentsDir, file)
      writeFileSync(destination, read(source), "utf8")
    }
  },
})
