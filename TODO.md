# TODO

This is the backlog that an autonomous `/loop` run works through, one item at a
time, top to bottom. Claude cannot read your mind about what "done" means, so
the quality of this file is the single biggest factor in whether an overnight
run produces something useful or a pile of guesses.

## How to write a good entry

A good entry is:

- **Concrete** — names the file, feature, or behavior to change, not a vague
  area of the codebase.
- **Scoped** — small enough to land as one PR. If you're tempted to write
  "and also," split it into two entries.
- **Verifiable** — states exactly how Claude (and you, in the morning) can
  tell it's actually done. "Looks right" is not a done signal; a passing
  test, a specific error code, or an observable behavior is.

Template:

```
- [ ] <what to do> — done when <verifiable signal>.
```

If a real requirement turns out to be ambiguous once work starts, the loop
will stop and leave a note under that item instead of guessing — so the more
precisely you write the "done when" clause up front, the less that happens.

## Examples (delete these once you've read them)

- [ ] (example) Add input validation to the signup form — done when invalid
      emails are rejected with a 400 and a test covers it.
- [ ] (example) Extract the duplicated retry logic in `src/http/*.ts` into a
      shared `withRetry()` helper — done when all three call sites use it and
      the existing HTTP tests still pass.
- [ ] (example) Add a `--dry-run` flag to the CLI's `sync` command — done when
      `sync --dry-run` prints the planned actions without making any network
      calls, and a test asserts no network calls happen.

## Backlog

<!-- Add real items below this line, oldest/highest-priority first. -->
