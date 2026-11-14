# dev-workflow

OpenCode plugin that installs the **`/dev`** development pipeline: Phase-0 explore → grilling → plan (cross-critique) → tickets → TDD implement ↔ review → final gates (incl. Modern Web Guidance) → report.

## Install (one command)

```bash
opencode plugin add github:taskinnasif144/dev-workflow
```

Then **restart OpenCode once** (agent files are written to `~/.config/opencode/agents/` on first load).

## Update (after you fine-tune on GitHub)

```bash
opencode plugin update
```

Restart OpenCode once. Command, skills, and agents all refresh from the package.

## What you get

| Piece | Location |
|-------|----------|
| `/dev` command | registered by the plugin |
| Agents: `dev-drafter`, `dev-reviewer`, `dev-implementer`, `dev-critic` | written to `~/.config/opencode/agents/` |
| Skills: `grilling`, `wait-what`, `cross-critique`, `to-tickets`, `tdd`, `code-review`, `frontend-design`, `modern-web-guidance` | registered from `bundle/skills/` |

### Modern Web Guidance (Google Chrome)

Bundled skill `modern-web-guidance` (Apache-2.0). On UI/full-stack runs the `/dev` pipeline loads it during UI grilling, planning, implementation, and final review. Guides are fetched on demand (network required):

```bash
npx modern-web-guidance@latest search "animate dialog"
npx modern-web-guidance@latest retrieve "<guide-id>"
npx modern-web-guidance@latest legacy-scan .
```

### Optional (not bundled — no license to redistribute)

`figma-design-to-code` (Figma official, license not stated). Install yourself if you use Figma MCP:

```bash
npx skills add figma/mcp-server-guide --skill figma-design-to-code -a opencode
```

## Pipeline (summary)

1. Setup via **question tool** (single project or `.code-workspace`, repo, run type, scope)
2. **Phase-0** explore (always)
3. **Functionality** grilling (wait-what restatements)
4. **UI/UX** grilling if in scope
5. Plain text **`okay` / `go`** → automated sequence
6. Plan loop (2 independent drafts → cross-critique → 9-point leak checklist, self-cert)
7. Ticket loop → `docs/tickets/` (self-cert, sequential)
8. Branch `dev/<feature-slug>` → strict red→green implement ↔ read-only review
9. Four hard gates (tests, typecheck, whole-diff reviewer, restatement match) + UI soft gate (`modern-web-guidance`) → report

## Editing instructions

Fine-tune anything under `bundle/` on GitHub, push, then run `opencode plugin update` + restart.

## License

MIT (see [LICENSE](LICENSE)). Bundled third-party skills keep their own licenses (MIT / Apache-2.0), including Modern Web Guidance (Apache-2.0, Google Chrome).
