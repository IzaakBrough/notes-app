# Goal conditions — copy/paste reference

`/goal` sets a completion condition for the current session: Claude keeps
taking turns until a separate evaluator model judges the condition met (or
impossible), or you run `/goal clear`. It does **not** replace `/loop` — the
usual pattern for an overnight run in this template is:

```
/goal every item in TODO.md is implemented, tested, and has an open PR against main
/loop
```

`/goal` starts the work; `/loop` keeps a turn coming after the session goes
idle so the goal has something to keep evaluating against. Run `/goal` in
[auto mode](https://code.claude.com/docs/en/auto-mode-config) (or with
`acceptEdits`, as this template's `.claude/settings.json` sets by default) or
turns will stop to ask for approvals that never come overnight.

Conditions can be up to 4,000 characters. Write them so Claude's own
transcript output (test results, exit codes, file diffs) can prove them —
the evaluator doesn't run commands or read files on its own.

## Copy-paste conditions

**Clear the whole backlog:**

```
/goal every item in TODO.md is implemented, tested, and has an open PR against main, or has a note explaining why it's blocked
```

**Pass a specific suite:**

```
/goal the test suite in tests/ passes at 100% via `bash scripts/verify.sh`, with no test skipped or deleted to get there
```

**Documentation coverage:**

```
/goal every exported function in src/ has a docstring describing its parameters and return value
```

**Bounded cleanup pass:**

```
/goal src/legacy/ has no files over 300 lines, split along existing module boundaries, or stop after 15 turns
```

**Migration:**

```
/goal every call site of the old `fetchUser` API is migrated to `fetchUserV2`, `bash scripts/verify.sh` passes, and no call site is left mixing both APIs
```

**Single bug, verified fix:**

```
/goal the bug described in TODO.md's first item is fixed, a regression test for it exists in tests/, and `bash scripts/verify.sh` passes
```

## Tips

- Add `or stop after N turns` (or a time clause) to bound a goal that might
  otherwise run indefinitely on a fuzzy condition.
- `/goal` with no argument shows the status of the active (or most recently
  achieved) goal. `/goal clear` removes it early.
- Check on scheduled `/loop` tasks with plain language ("what scheduled tasks
  do I have?", "cancel the deploy check job") — see `README.md` for the full
  session lifecycle.
