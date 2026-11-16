---
description: Full dev pipeline — Phase-0 explore, grill requirements, plan with cross-critique, ticket, TDD implement, review, ship
---

# /dev — automated development workflow

You are the orchestrator of a fixed pipeline. Follow the phases in order. Do not skip a gate. Do not invent extra human gates.

## Interaction rules (non-negotiable)

- **Setup questions, mid-run decisions, 3-iteration escapes, overrides → always use the question tool.**
- **After ALL grilling is done** (functionality, plus UI/UX if in scope): stop and wait for the user to type plain text **`okay`** or **`go`**. That single confirmation starts the fully automated sequence (plan → tickets → implement → final gates → report). Never proceed past grilling without it.
- **Final report** is automatic — no accept prompt.
- Print a short phase banner before each phase, e.g. `Phase 2/6 — functionality grilling`.

## Skills to load by phase (invoke the skill tool)

| Phase | Skills |
|-------|--------|
| Phase-0 explore | none required; explore with read/grep/glob |
| Grilling | `grilling`, `wait-what` |
| Plan loop | `cross-critique` |
| Ticket slicing | follow `to-tickets` vertical-slice rules, but write files under `docs/tickets/` (see below) |
| Implement | `tdd`; for UI tickets also `frontend-design`, `modern-web-guidance`, and `figma-design-to-code` if a Figma URL was given |
| Final review | `code-review`; for UI/full-stack also `modern-web-guidance` |

**When scope includes UI** (UI or full-stack): also load `modern-web-guidance` during UI grilling, plan loop, implement, and final review. It teaches the agent to fetch expert web guides on demand:

```bash
npx modern-web-guidance@latest search "<action query>"
npx modern-web-guidance@latest retrieve "<guide-id>"
npx modern-web-guidance@latest legacy-scan .
```

On Windows use `npx.cmd` if `npx` fails. Network required for guide fetch; if offline, note it in the report and continue without blocking.

## Phase 0 — Setup (question tool, every run)

Ask via question tool, one batch where possible:

1. **Scope of work:** single project (use current folder) **or** multi-root workspace (user pastes a `*.code-workspace` path — never assume).
2. **Primary repo:** if multi-root or ambiguous, list folders and ask which repo is primary. Tickets, plan, and feature branch live only there. Other folders get commits only if the feature changes them.
3. **Run type:** `new feature` | `modify existing` | `bugfix` | `docs/chores/refactor`.
4. **Stack scope:** `backend` | `UI` | `full-stack`. Auto-detect from repo files (pubspec.yaml → Flutter, package.json → web/backend) but always confirm.

Print a banner after setup: `Phase 1/6 — Phase-0 explore`.

## Phase 1 — Phase-0 explore (ALWAYS, every run type)

Read and understand before asking requirements. Structure later grilling questions from what you find.

**Always:**
- Map architecture, conventions, naming, layering, and where similar features live.
- Find test layout and how tests run (e.g. `npm test`, `flutter test`).
- Identify seams (public boundaries) suitable for tests.
- Read `GLOSSARY.md` if it exists; otherwise plan to seed it.
- Classify the repo: **fresh** (clear layering/conventions) vs **messy** (tangled, duplicated, inconsistent). If ambiguous, ask via question tool; user can always override.

**Also for `modify existing`:**
- Document current behavior of the feature being changed.
- List **must-not-regress** behaviors and existing tests that cover them.
- Seed/update `GLOSSARY.md` from code vocabulary.

**Also for `bugfix`:**
- Locate the failure path; note how to reproduce.

**Also for `modify existing` when scope includes UI:**
- Run `npx modern-web-guidance@latest legacy-scan .` (or `npx.cmd`) over the UI code in scope; record hits as must-modernize candidates for the plan (not automatic rewrites).

**Also for docs/chores:** confirm what files are in scope.

Banner: `Phase 2/6 — functionality grilling`.

## Phase 2 — Functionality grilling

Use the `grilling` skill (rounds, frontier questions, recommendations) and the `wait-what` skill for every restatement you give back: easy language, ASD-STE100 simplified technical English, terms from `GLOSSARY.md`.

Questions must be shaped by Phase-0 findings (which seam, what to reuse, what must not regress).

Cover: what the feature/change does, edge cases, errors, security, scalability, test seams, out-of-scope items.

If run type is **bugfix**: short diagnose path — restate “bug is X, fix should do Y” plus any clarifying questions. Keep it short.

When functionality is clear, give the wait-what-style restatement and ask for confirmation via **question tool** only if something is still ambiguous; otherwise proceed to UI grilling if in scope.

Banner (if UI in scope): `Phase 3/6 — UI/UX grilling`.

## Phase 3 — UI/UX grilling (only if scope is UI or full-stack)

Deep grilling on: layout, information hierarchy, branding/visual direction, motion, accessibility, responsive behavior, loading/empty/error states, and modern UI standards.

- If the user pastes a Figma URL, load `figma-design-to-code` and treat that URL as source of truth for layout.
- Load `frontend-design` for aesthetic direction.
- Load `modern-web-guidance`; when a grilling answer touches motion, a11y, forms, dialogs, performance, or modern CSS/HTML, `search` + `retrieve` the relevant guide and let it shape your questions and restatement.
- Shape questions with Phase-0 knowledge of existing UI patterns.

Skip this entire phase for backend-only or docs-only runs.

## Gate — start automated sequence

After ALL grilling (and UI if any) is complete:

> Requirements and UI decisions are settled. Type **`okay`** or **`go`** to start the automated sequence (plan → tickets → code → review → report).

Wait for that text. Do not use the question tool for this gate. Do not proceed on any other word.

Banner: `Phase 4/6 — plan loop`.

## Phase 4 — Plan loop (self-certifying)

**Artifact:** `docs/plans/<feature-slug>.md` in the primary repo (committed later with the feature). Independent drafts are discarded after synthesis — never commit drafts.

### Steps

1. Spawn **two** `dev-drafter` subagents in parallel. Each drafts a **full unified plan** independently (API + UI together when full-stack). Instruct them to explore different approaches; fresh sessions; do not let them see each other’s work.
2. Load `cross-critique`. Circulate each draft to the other drafter for structured pros/cons (reuse the same subagent sessions).
3. Synthesize **one unified plan** yourself from drafts + critiques.
4. Run the **9-point leak checklist** (below) against the synthesized plan.
5. Fix every leak. If a leak reveals an unclear requirement or missing decision that only the user can settle → **question tool**. Otherwise fix the plan yourself and re-check.
6. Max **3 leak-fix iterations**. If still leaking on the 4th pass → stop and surface the stuck disagreement via **question tool**.
7. When clean: write `docs/plans/<feature-slug>.md`, mark plan self-certified, create branch `dev/<feature-slug>` in the primary repo (from current default branch). No push unless the user asks.

**UI/full-stack plans:** load `modern-web-guidance`. Where the plan uses platform APIs (dialog/popover, view transitions, container queries, INP/perf, a11y focus, forms, etc.), `search` + `retrieve` the matching guides and cite guide IDs in the plan. Prefer platform-native solutions over heavy libraries when a guide exists. Include `legacy-scan` hits from Phase-0 as explicit plan steps when run type is `modify existing`.

### 9-point leak checklist (plan AND tickets)

1. Restatement drifted from what the user said.
2. Missing edge cases (empty, null, boundary, concurrent, failure paths).
3. Missing error handling / rollback.
4. Untestable or untested path (no seam or no test mentioned) — for docs/chores, this point is N/A.
5. Security hole (auth, injection, secrets).
6. Scalability / performance concern ignored.
7. Ticket set will not cover every plan step, or would add extra scope (check at ticket phase).
8. UI work missing loading / empty / error / responsive states (when frontend in scope).
9. **Quality charter:** fresh repo → plan must enforce strict structure, scalability, readability, and newbie-readable intent+why comments on all workflow-written code; messy repo → plan must fit the existing architecture with **no whole-architecture rewrite**, and only touch neighbors when unavoidable. Comments still required on all newly written code in plain newbie-readable intent+why form.

Banner: `Phase 5/6 — ticket loop`.

## Phase 5 — Ticket loop (self-certifying)

Slice the plan into vertical tracer-bullet tickets using `to-tickets` rules, but publish as:

```
docs/tickets/NN-<slug>.md
```

Number from `01` in dependency order. One file per ticket. Adapt the to-tickets template: **What to build**, **Blocked by**, **Status** (`ready-for-agent` | `in-progress` | `review` | `done`), acceptance criteria checkboxes.

- Sequential execution only — never parallel tickets.
- UI tickets blocked by API tickets where they depend on them.
- Run the same **9-point leak checklist** on the ticket set (point 7 is the focus). Fix; max **3 iterations**, then **question tool** if still stuck.
- **Size guard (hard rules at self-certification):**
  - One behavior / one seam per ticket.
  - At most ~3 acceptance criteria per ticket — split beyond that.
  - A ticket that names more than 2 unrelated modules → split before certifying.
  - A UI ticket = one screen-state flow (loading / empty / error may be separate tickets).
- When clean: self-certify; proceed immediately to implementation (no extra human gate).

Banner: `Phase 6/6 — implement`.

## Phase 6 — Implement (automated until final gates or an escape)

For each ticket in dependency order (frontier of unblocked tickets, strictly one at a time):

1. Set ticket Status to `in-progress`.
2. Spawn **`dev-implementer`** subagent with the ticket file path + plan path.
   - **Code work (new/modify/bugfix):** strict red→green TDD — write/update the failing test first, see it fail, then implement, see it pass. One slice at a time. Refactor only when reviewer asks.
   - **Docs/chores:** no TDD; write the content.
   - **Refactors:** existing suite must stay green; no new tests required unless behavior changes.
   - Comments: every non-trivial piece of newly written code gets a plain, newbie-readable comment stating **intent + why**. Match repo style; do not rewrite neighbors in a messy repo.
   - Quality bar: scalable and optimized. Fresh repos: strict structure. Messed-up repos: fit the existing architecture — never attempt a whole-architecture rewrite.
   - **UI tickets:** before writing UI code, load `modern-web-guidance` and `search` + `retrieve` guides for the interaction/layout you are building; follow the retrieved guide (modern platform APIs, a11y, performance). If the ticket plan cites guide IDs, retrieve those first.
3. Set Status to `review`. Spawn **`dev-reviewer`** (read-only) on the ticket diff.
4. If findings: send them back to the same implementer session → fix → reviewer re-reviews. Loop until clean. Max **3 rounds**, then **question tool** with the stuck findings.
5. Commit on `dev/<feature-slug>` with message = ticket title. Never push unless asked.
6. Set Status to `done`.

### Stuck-implementer recovery (Phase 6 only)

**Stuck definition:** the implementer subagent returns no report, times out, or comes back empty/failed with no usable file changes. **Silence is not success — treat it as stuck.**

Recovery ladder:

1. **One limited retry** with a **fresh** `dev-implementer` on the same ticket, with this instruction: “Previous attempt looped and never finished. Implement only acceptance criterion 1. Write the failing test first. Report even if partial — a partial report beats silence.”
2. **Stuck again → silent auto-slice (no question tool, no user gate):** rewrite the stuck ticket into 2–4 smaller tickets under `docs/tickets/` (one behavior/seam each, ≤3 acceptance criteria each, numbered in place, successors `Blocked by` the preceding pieces). Remove the original ticket file, then resume at the first slice with a fresh implementer.
3. **Any single slice stuck twice** → stop and surface via **question tool**: attempts history + proposed next split.

**Never** retire-and-retry the same uncut ticket with fresh agents beyond the one limited retry in step 1. If slicing was what fixed it every time in practice, slicing is the default fix here too.

### Final gates (loop until ALL green)

Run after every ticket is `done`: the four hard gates plus the UI soft gate above. Never report success on a red hard gate.

1. Full test suite green (project’s test command).
2. Typecheck green (`npm run typecheck` / `tsc --noEmit` / Flutter analyze as applicable).
3. Fresh whole-diff reviewer (`code-review` skill or `dev-reviewer` on full diff vs base) finds **zero** bugs or scalability issues.
4. Original wait-what restatement still matches what was built (you verify; if drifted → fix via implementer loop).
5. **UI/full-stack only:** whole-diff UI review against `modern-web-guidance` — retrieve guides for the areas touched and confirm the diff follows them. Soft gate: if network is unavailable, record `MWG skipped (offline)` in the report instead of blocking.

If any hard gate fails → return to implementer↔reviewer loop for the failing area → re-run **all gates**. Never report success on a red hard gate. Soft gate (MWG) failures → same fix loop when network allows; otherwise record `MWG skipped (offline)`.

### Finish (automatic)

- Print a concise report: what shipped, ticket list, gate results, branch name, plan path.
- Add **one** memory-graph observation on the project entity: dated, under 150 chars, pointing at `docs/plans/<feature-slug>` (e.g. `2026-11-14: /dev <feature> done — docs/plans/<slug>.md, branch dev/<slug>`).
- Do not ask for accept/confirm.

## Escape hatches (any loop)

After 3 failed leak-fix or review rounds: stop, summarize the disagreement via **question tool**. Never spin forever.

## File map (per feature)

| File | Purpose |
|------|---------|
| `GLOSSARY.md` (repo root) | Domain language; seeded/updated in Phase-0 and grilling |
| `docs/plans/<feature-slug>.md` | Self-certified unified plan |
| `docs/tickets/NN-<slug>.md` | Sequential tickets with Status |
| branch `dev/<feature-slug>` | All commits for the feature |
