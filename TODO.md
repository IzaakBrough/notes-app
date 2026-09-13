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

- [x] Scaffold `server/` — a FastAPI backend for the encrypted notes app, in
      its own self-contained Python environment (`server/pyproject.toml`,
      `.venv/` inside `server/`, isolated from the root `package.json`).
      Include: a `GET /health` endpoint returning `{"status": "ok"}`; local
      SQLite file creation on startup (path from config, e.g.
      `server/data/notes.db`, directory created if missing, gitignored); and
      `.env`/config loading (e.g. `pydantic-settings` or `python-dotenv`) for
      the DB path and any other runtime settings. Wire `scripts/verify.sh`'s
      existing Python-detection block to actually run this project's
      lint/format/test commands (ruff + pytest) rather than only running them
      if the tools happen to be globally installed. Done when
      `bash scripts/verify.sh` runs the FastAPI backend's lint and tests
      (a `server/tests/` smoke test hitting `/health` and asserting the DB
      file gets created), and starting the app locally
      (`uvicorn app.main:app`) and requesting `/health` returns 200.

- [ ] Password setup + unlock flow — Argon2 password hashing
      (`argon2-cffi`) with a stored verification hash plus a separately
      stored KDF salt used to derive a Fernet key from the password (raw key
      and plaintext password are never persisted). Add `POST /setup` (sets
      the initial password; done only if no password is set yet, else 409),
      `POST /unlock` (verifies the password against the stored hash, derives
      the Fernet key, and returns a session token; the derived key is held
      server-side in memory keyed by that token, never written to disk or
      returned to the client), and session-token handling (an
      `Authorization` header the CRUD endpoints below will require). Done
      when `server/tests/` covers: `/setup` succeeds once and 409s on a
      second call, `/unlock` with the right password returns a token and
      with the wrong password returns 401, and an unauthenticated request to
      a protected route returns 401 — all passing under
      `bash scripts/verify.sh`.

- [ ] Notes CRUD API with field-level encryption — SQLite `notes` table
      (plain columns for `id`, `created_at`, `tags` for fast filtering; the
      note body stored only as Fernet ciphertext, encrypted using the
      session's in-memory derived key before insert). Implement
      `POST /notes` (body encrypted before insert; `created_at` is always
      server-generated, any client-supplied timestamp is ignored),
      `GET /notes` (list metadata only — id, created_at, tags, and a
      short plaintext preview decrypted per-row — with `tag` and
      date-range query params), `GET /notes/{id}` (fetch one note,
      decrypted), and `GET /notes/search?q=...` (decrypt-and-match against
      note bodies in memory for the unlocked session). All four require a
      valid session token from `/unlock`. Done when `server/tests/` covers
      create/list/get/search plus the tag and date-range filters, confirms
      the raw SQLite row for a note's body is not plaintext, and confirms
      each endpoint 401s without a valid session token — all passing under
      `bash scripts/verify.sh`.

- [ ] Frontend: unlock screen + Tailwind setup — add Tailwind CSS to the
      Vite/React template (per the Tailwind v4 Vite plugin, since this repo
      already uses Vite's rolldown-based tooling) and build
      `src/pages/Unlock.tsx`: a password field that calls `POST /unlock` (or
      `POST /setup` when the backend reports no password set yet), stores
      the returned session token in memory (a React context/hook, never
      `localStorage`/`sessionStorage`), and routes to the main app on
      success while showing an inline error on a wrong password. Done when
      `npm test` covers the unlock form's success and failure paths (mocked
      fetch) and `npm run build` succeeds with Tailwind's utility classes
      taking effect (no more colocated `Unlock.css`).

- [ ] Frontend: capture bar + note list, wired to the API — an
      always-visible capture textarea at the top of the main page
      (`src/pages/Home.tsx` or a new `src/pages/Notes.tsx`) that posts to
      `POST /notes` on Enter (Shift+Enter for a newline), recognizes
      `#tag`-style tokens in the text and submits them as tags, and clears
      on success; below it, a date-grouped (newest day first) note list
      pulling from `GET /notes`, showing tag chips per note, with
      click-to-expand fetching and rendering the full decrypted body from
      `GET /notes/{id}`. Done when `npm test` covers capture-and-refresh
      (a new note submitted via the capture bar appears in the list, mocked
      fetch) and the date-grouping logic, and `npm run build` succeeds.
      **Blocked:** every `/notes` request here needs the session token from
      `useAuthSession()` (added in "Frontend: unlock screen + Tailwind
      setup" above, on the still-unmerged
      `feature/unlock-screen-tailwind`) to send a valid `Authorization`
      header, and that item's backend counterpart (Notes CRUD) is itself
      blocked on the unmerged password/unlock PR — see the note on that item
      above. Branching from `main` right now has neither piece; wiring this
      up would mean either omitting the auth header (violating the API
      contract) or re-implementing the auth context here and conflicting
      with the other branch once it merges. Revisit once both of those land.

- [ ] Frontend: search and tag filtering — a search/filter bar above the
      note list with a text input hitting `GET /notes/search?q=...`
      (debounced) and a tag filter control hitting `GET /notes` with the
      `tag` query param, both re-rendering the note list from their
      results and returning to the unfiltered list when cleared. Done when
      `npm test` covers entering a search term filtering the rendered list
      and selecting a tag filtering it by tag (both with mocked fetch), and
      `npm run build` succeeds. **Blocked:** this filters the note list
      built in "Frontend: capture bar + note list" above, which is itself
      blocked on the same unmerged auth work — see that item's note.

<!-- Out of scope for this pass — deferred on purpose, not forgotten. -->

- [ ] (deferred) Jira "create ticket from note" integration — not started;
      no API shape or auth decided yet. Needs a design pass before it's
      scoped into a verifiable entry.
- [ ] (deferred) Quick-capture global keyboard shortcut (e.g. summon the
      capture bar from anywhere on the OS, not just when the browser tab is
      focused) — not started; likely needs something outside a browser tab
      (a native shim or OS-level hotkey), which is a bigger architectural
      decision than this pass covers.
- [ ] (deferred) Multi-user accounts / auth beyond the single shared
      password — not started; out of scope for a single-user local tool.
