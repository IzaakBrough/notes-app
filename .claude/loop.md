This is the default prompt for a bare `/loop` in this repo. Follow `CLAUDE.md`
for all conventions (branch naming, commit format, the never-push-to-main
rule). Do the following, in order, and stop after handling exactly one thing.

## 0. Re-anchor — don't trust what you remember from earlier turns

A `/loop` session can run for many iterations. Conversation memory of what
you did three iterations ago can drift from what's actually true on disk now
(a human may have edited something, a previous iteration's commit may not
have landed the way it seemed to, etc.). Before doing anything else this
iteration:

- Re-read `TODO.md` and `CLAUDE.md` fresh — don't rely on a remembered
  summary of them.
- Skim `.claude/PITFALLS.md` for anything relevant to what you're about to
  touch.
- Run `git status` and `git branch --show-current` to get the real current
  state, not the state you expect from earlier in the session.
- Confirm you're in an isolated worktree, not the main checkout: run
  `git rev-parse --git-dir`. If it prints exactly `.git`, or an absolute path
  that doesn't contain `worktrees` in it, you're in the main checkout. Stop
  and say so instead of doing multi-file autonomous work there — ask to be
  restarted with `--worktree <name>` (see `README.md`).

## 1. Is there unfinished work on the current branch?

If you're already on a feature/fix/chore branch with uncommitted or unpushed
work from a previous iteration, finish it first: run
`bash scripts/verify.sh`, fix anything broken, commit, push, and update the
PR. Then stop for this iteration — don't also start a new item.

## 2. Otherwise, pull the next unchecked item from TODO.md

Read `TODO.md` top to bottom and take the first unchecked (`- [ ]`) item under
the "Backlog" section that doesn't already have a note under it saying it's
blocked.

If you find one:

1. Create and switch to a new branch for it, named per `CLAUDE.md`
   (`feature/<slug>`, `fix/<slug>`, or `chore/<slug>`), branched from an
   up-to-date `main`.
2. Implement exactly what the item describes — nothing broader, and nothing
   narrower (see "Scope enforcement" below). While implementing, reality
   sometimes won't quite match the plan; handle that with the deviation
   tiers below instead of defaulting to either blind guessing or stopping
   for everything.
3. Run `bash scripts/verify.sh --receipt "<branch-name>"`.
   - If it passes: the command writes a receipt to `.claude/receipts/`.
     Commit that receipt together with your change (per the commit format in
     `CLAUDE.md`), push the branch, and open a PR against `main` if one
     doesn't exist yet for this branch, or push updates to the existing one.
     Then check the item off in `TODO.md` (`- [x]`) on the branch and include
     that in the commit. **Don't check an item off without a passing receipt
     for that branch** — a receipt is what makes "done" checkable by someone
     reading the repo later, instead of just Claude's say-so in a
     transcript no one will read.
   - If it doesn't pass after a focused attempt to fix it: do **not** commit
     broken work and do **not** relax or skip the check. Leave the branch as
     a starting point (commit what's safe to commit, if anything actually
     passes verification on its own — but don't generate a passing receipt
     for a state that doesn't fully pass), and add a note directly under the
     `TODO.md` item explaining what's blocking it and what you tried. Do not
     check the item off.
4. If the item is ambiguous — no clear "done" signal, or a genuine judgment
   call you can't make safely — don't guess. Add a note under the item in
   `TODO.md` describing exactly what's unclear, don't check it off, and stop.
5. If you learned something during this item that would save a future
   iteration time (a gotcha, a misleading file, a fix that took real
   digging), append a short entry to `.claude/PITFALLS.md`. Skip this step if
   nothing surprising came up — don't pad the file.

Only work on one backlog item per iteration.

### Deviation tiers — when reality doesn't match the plan

A `TODO.md` item describes an outcome; it can't anticipate every detail
you'll hit while implementing it. Use the lowest tier that honestly applies,
and don't let "just proceed" quietly become "quietly change what was asked
for":

1. **Trivial, in-scope fix** (a typo, an obviously-missing import, an
   off-by-one you can prove with the test you're already writing): fix it
   inline, no note needed.
2. **Edge case the item didn't mention** (an unexpected input, a boundary
   condition): add validation/handling for it, and say so in one line in the
   PR description — don't silently expand scope without a trace.
3. **Small blocker with a pragmatic fix** (a missing dev dependency, a config
   value that needs setting, a flaky-but-fixable local issue): fix the
   blocker, but call it out explicitly in the PR description and consider
   whether it's worth a `.claude/PITFALLS.md` entry.
4. **Anything architectural or a genuine judgment call** (the item implies a
   design decision, conflicts with existing code in a way that isn't a
   simple fix, or touches something outside the file/feature it named): this
   is the ambiguous case in step 4 above — stop, leave a note, don't guess.

### Scope enforcement

- Never silently drop a backlog item in favor of an easier one. Work items in
  the order `TODO.md` lists them unless one is explicitly marked blocked.
- Never delete or reword a backlog item to make it "done" — if the item as
  written is wrong or no longer needed, say so in a note under it and leave
  it for a human to resolve; don't edit it away.
- If you find a `TODO.md` item that was checked off in a previous iteration
  with no receipt in `.claude/receipts/` for its branch, treat that as a bug
  in a prior run, not as done — uncheck it and add a note.

## 3. If TODO.md has nothing pending

Tend to the current branch's PR, if one is open: check CI status, address any
review comments left since the last pass, and resolve merge conflicts with
`main` if there are any. Push fixes and re-run `bash scripts/verify.sh`
before pushing.

## 4. If there's truly nothing pending and no PR needs attention

Run `bash scripts/verify.sh` against `main` and fix the _first_ failure only
— don't sweep for unrelated issues. Open a `fix/<slug>` branch and PR for it
following the same rules as any other change. If verification is already
fully clean, say so in one line and let the loop self-pace to a longer
interval.

## Non-negotiables (repeated from CLAUDE.md because these matter most here)

- Never push to `main` directly, for any reason, ever. Push explicitly
  (`git push origin <branch-name>`) — never a bare `git push`, never refspec
  (`src:dst`) syntax. `.claude/settings.json`'s deny rules are written for
  the explicit form; the other forms are harder to pattern-match reliably.
- Never force-push.
- Never delete a branch other than one you created and finished within this
  same iteration.
- Never commit something that fails `bash scripts/verify.sh`.
- Never check off a `TODO.md` item without a matching passing receipt in
  `.claude/receipts/`.
- Never try to write or edit `.claude/settings.json` or anything under
  `.claude/receipts/` directly — both deny their own `Edit`/`Write` access,
  so only `scripts/verify.sh --receipt` can produce a receipt. A denied write
  to either path is that guardrail working, not a bug to route around.
- Never silently drop, reword, or reorder a backlog item to dodge it.
- When in doubt, stop and leave a note in `TODO.md` rather than guessing.
