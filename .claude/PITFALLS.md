# Pitfalls

A running log of mistakes, gotchas, and non-obvious fixes discovered during
`/loop` runs. This exists so an unattended session doesn't burn an iteration
rediscovering something a previous iteration already learned the hard way —
`.claude/loop.md` reads this at the start of every iteration and appends to
it when something's worth remembering.

This is a log of _reusable_ lessons, not a changelog or a TODO list:

- Good entry: "`npm run build` silently succeeds even when the TypeScript
  config is broken — check its exit code, not just that it printed
  something."
- Bad entry: "Fixed the signup form bug." (that's what the commit message and
  PR are for — this file is for the _lesson_, not the change)

Keep entries short. If this file grows past a page or two, that's a signal
some of these should become permanent rules in `CLAUDE.md` instead — a
recurring pitfall is really a missing convention.

## Log

<!-- Newest entries at the top. Format:

### <short title>
<one or two sentences: what went wrong, and what to do instead>

-->

### `npm`/`npx` can EPERM in a bash shell on this machine — not a repo bug

On this machine, `C:\nvm4w\nodejs` is a symlink into a _different_ Windows
user profile's AppData (an admin account used to install Node via nvm for
Windows) that the normal account can't traverse. `node --version` works, but
running `npm`/`npx` (including through `scripts/verify.sh`) fails with
`EPERM: operation not permitted, lstat 'C:\Users\<other-profile>\AppData'`,
because Node's module loader tries to fully resolve the real path of its own
entry script. Don't try to fix PATH, reinstall Node, or touch repo files
over this — it's a local machine quirk, not something wrong with the
project. Work around it for the current shell only:

```bash
node --preserve-symlinks --preserve-symlinks-main "/c/nvm4w/nodejs/node_modules/npm/bin/npm-cli.js" "$@"
```

i.e. put a tiny `npm` shim script on `PATH` ahead of the broken one that
calls `node` with those two flags (they skip the realpath resolution that
was EPERM-ing) and forwards all arguments — then `bash scripts/verify.sh`
runs normally.

### The placeholder-marker scan in `verify.sh` can false-positive on lockfiles

`package-lock.json`'s generated integrity hashes are arbitrary base64 and can
coincidentally contain "TODO"/"FIXME"/"HACK"/"XXX" as a substring, failing
the scan for no real reason. Lockfiles (`package-lock.json`,
`npm-shrinkwrap.json`, `yarn.lock`, `pnpm-lock.yaml`) are now excluded from
the scan in `scripts/verify.sh` — if a similar generated file trips this
again, exclude it the same way rather than touching real source.

### A blank line before a bold-prefixed note in a TODO.md bullet breaks prettier

Writing a `TODO.md` note as a separate paragraph under a list item (blank
line, then `**Blocked:** ...` at the same indent as the bullet's other
lines) makes prettier treat it as a new nested paragraph and reindent it —
non-idempotently: every `prettier --write` pass indents it deeper than the
last, so `format:check` never stabilizes. Fold the note into the same
paragraph as the rest of the bullet (no blank line) instead, matching how
every other multi-line item in this file is written; `prettier --write`
then converges on the first pass. Always run `npm run format:check` (or
`bash scripts/verify.sh` and actually read its output, not just an
exit-code summary from a backgrounded run) before committing a `TODO.md`
edit — a passing local run that wasn't actually inspected is not a passing
run.

### `git worktree remove` can fail with "Permission denied" on Windows/OneDrive

On a repo synced through OneDrive (or similar), `git worktree remove` can
fail to delete the directory even after git has otherwise finished with it —
usually a sync client briefly holding a file handle. Don't treat that as the
removal having failed: run `git worktree prune`, then check `git worktree
list` — if the worktree is already gone from that list, it's safe to
`rm -rf` the leftover directory and `.git/worktrees/<name>` by hand.
