# Project conventions

These rules apply on every run, whether you're driving interactively or this
is an unattended `/loop`/`/goal` session. They exist so overnight work is safe
to merge without a human having watched it happen.

## The one rule that overrides convenience

**Never push directly to `main`. Ever.** All work happens on a branch, and a
branch's work isn't finished until a PR is open against `main`. This holds
even for a one-line fix, even if it would be faster to just push, and even if
a check can't be made to pass — in that last case, open the PR as a draft (or
leave the branch pushed) and leave a note explaining what's blocking it,
rather than pushing to `main` to "just get it done."

Nothing in this repo auto-merges. A human reviews and merges every PR.

## Branching

- Branch names: `feature/<slug>` for new functionality, `fix/<slug>` for bug
  fixes, `chore/<slug>` for cleanup/refactors. `<slug>` is a short
  kebab-case description, e.g. `feature/signup-email-validation`.
- One backlog item (see `TODO.md`) = one branch = one PR. Don't stack
  unrelated changes onto an existing branch — cut a new one.
- Before starting new work, make sure you're branched from an up-to-date
  `main`, not from whatever branch you happen to be on.
- Push explicitly, always: `git push origin <branch-name>` (adding `-u` the
  first time). Never a bare `git push` relying on upstream tracking, and
  never refspec syntax (`git push origin <src>:<dst>`) — both are harder for
  `.claude/settings.json`'s deny rules to reliably pattern-match than a plain
  `git push origin <branch-name>`, so using them defeats a safety net that's
  there for exactly this kind of mistake.

## Commit messages

- Format: `<type>: <short summary>`, imperative mood, no trailing period.
  Types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`.
  Example: `feat: reject invalid emails on signup form`
- Body (optional, blank line after summary): explain _why_, not _what_ — the
  diff already shows what changed.
- Only commit when the verification suite (see below) passes. A commit that
  doesn't pass verification doesn't happen — fix it first, or stop and leave
  a note instead of committing broken work.

## Verification

- The single source of truth for "is this done" is the verify script:
  `bash scripts/verify.sh` (see `scripts/verify.sh` for what it runs for this
  stack). `/loop` and `/goal` both refer to it by this name — don't invent a
  parallel check.
- Frontend tests are Vitest specs colocated with the code they test (e.g.
  `src/App.test.tsx`), run via `npm test`. `tests/smoke.test.sh` still exists
  as `scripts/verify.sh`'s fallback for a stack that hasn't wired in its own
  tests yet (see that script), and a `server/` directory keeps its own tests
  alongside its own code.
- `scripts/verify.sh` also scans changed non-doc files for leftover
  `TODO`/`FIXME`/`HACK`/`XXX` markers and fails if it finds one. Resolve the
  marker or turn it into a real `TODO.md` entry — don't work around the scan.
- If verification can't be made to pass after a reasonable, focused attempt,
  stop. Don't relax the check, don't skip it, don't comment it out. Leave a
  clear note in `TODO.md` under the relevant item describing what's blocking
  it, and move on to the next thing.
- A `TODO.md` item isn't done on your say-so — it needs a receipt. Run
  `bash scripts/verify.sh --receipt "<branch-name>"` before checking an item
  off; see `.claude/loop.md` for exactly when this runs in the loop.

## Boundaries

- **`.claude/settings.json` and `.claude/receipts/` are structurally
  off-limits, not just by convention.** `.claude/settings.json` denies its
  own `Edit`/`Write` access, and `.claude/receipts/**` denies `Edit`/`Write`
  too — so nothing but `scripts/verify.sh --receipt` (which writes receipts
  as a subprocess, not through those tools) can touch either. If a tool call
  reports one of these paths as denied, that's this guardrail working as
  intended — don't look for a way around it; it means stop and leave a note.
  If you ever _do_ find a way to write to one of these paths (e.g. through a
  Bash command the deny rules don't happen to cover), that's exactly the kind
  of gap worth an immediate `.claude/PITFALLS.md` entry, not something to use.
- **Never loosen any guardrail in this repo** to get around a blocked action
  more generally, even one that isn't hard-enforced the way the two above
  are. A blocked action means stop and leave a note — not "fix" the
  guardrail — even if you're confident the specific case is safe.
- **Don't edit generated/vendored directories** once they exist:
  `node_modules/`, `dist/`, `build/`, `.venv/`, or any other directory your
  stack's tooling owns. Change the source and regenerate instead.
- **`.git/` and `.claude/worktrees/`** are Claude Code's own bookkeeping —
  don't hand-edit anything under them.

## Project structure

Every project generated from this template keeps the same `src/` layout, so
switching between projects doesn't mean relearning where things live:

- `src/components/` — reusable UI components
- `src/pages/` — top-level route/page components
- `src/hooks/` — custom React hooks
- `src/lib/` — utilities, API clients, helpers
- `src/types/` — shared TypeScript types
- `src/assets/` — images, svgs, static files
- `src/App.tsx`, `src/main.tsx`, `src/index.css` — app entry point, stay at
  the top level of `src/`

If a project needs a backend, create a `server/` directory at the repo root
with its own `package.json`, kept independent from the frontend's
dependencies and scripts. The template doesn't mandate a specific backend
stack — pick whatever fits that project's actual needs — but the `server/`
location is mandatory: `scripts/verify.sh` looks for `server/package.json`
and verifies it alongside the root project when it exists.

## Glossary

No project-specific terminology exists yet — this is a stack-agnostic
template. Once real domain concepts show up (e.g. specific entity names, an
internal API's vocabulary), add a short glossary here rather than letting new
contributors (human or Claude) infer meaning from context each time.

## Learning from past runs

Before starting a backlog item, check `.claude/PITFALLS.md` for anything
relevant to what you're about to touch. If you hit a mistake worth avoiding
next time — a gotcha in the verify suite, a misleading file, a fix that took
real effort to find — add a short entry there. See that file for format.

## Coding style

- Match the style already present in the surrounding file before applying any
  general preference.
- No speculative abstraction: solve the backlog item in front of you, not the
  version of it you imagine might exist later.
- No dead code, no commented-out code, no TODO comments that duplicate an
  entry already tracked in `TODO.md`.
- Don't add comments that restate what the code does. Only comment on the
  non-obvious _why_.

## When something is ambiguous

If a `TODO.md` entry doesn't have a clear, testable "done" signal, or the
right implementation choice genuinely depends on information you don't have
(a design decision, a missing credential, a judgment call about UX), don't
guess and don't pick an arbitrary default silently. Stop, leave a specific
note under that item in `TODO.md` describing exactly what's unclear or
missing, and move to the next item. A human will resolve it in the morning.
