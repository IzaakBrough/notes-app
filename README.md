# react-template

A React + Vite + TypeScript starting point for AI-assisted "vibe coding"
website projects. Copy this repo to start a new project and you get a
working build, lint, format, and test setup, a small real app shell
(routing + header/footer) to build from, and an automation workflow
(`/loop`/`/goal`) that can pick up backlog items, implement them, verify
them, and open PRs on its own.

## Getting started

```
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm test         # run the Vitest suite
npm run lint     # run ESLint
npm run format   # format the codebase with Prettier
```

`bash scripts/verify.sh` runs lint, format check, build, and test together —
see [Verification](#verification-and-ci) below.

## Tech stack

- **React 19** with the React Compiler enabled (via
  `babel-plugin-react-compiler`)
- **React Router** for routing (`react-router-dom`)
- **Vite 8** (Rolldown-based) + `@vitejs/plugin-react`
- **TypeScript**
- **ESLint** (flat config, `typescript-eslint` + React hooks/refresh rules)
  - **Prettier** for formatting (`eslint-config-prettier` disables the
    ESLint rules that would fight it)
- **Vitest** + `@testing-library/react` + `jsdom` for tests

## Project structure

```
src/
├── components/   # reusable UI components (Header, Footer, Layout, ...)
├── pages/        # top-level route/page components (Home, ...)
├── hooks/        # custom React hooks
├── lib/          # utilities, API clients, helpers
├── types/        # shared TypeScript types
├── assets/       # images, svgs, static files
├── App.tsx       # route definitions (createBrowserRouter)
├── main.tsx
└── index.css

server/           # only added when a project needs a backend — own package.json
```

`App.tsx` defines routes with `react-router-dom`'s `createBrowserRouter`; the
default route renders `components/Layout.tsx` (which wraps `Header` +
`Outlet` + `Footer`) around `pages/Home.tsx`. Add new pages under `pages/`
and wire them into the router in `App.tsx`.

Component styling is plain CSS colocated next to its component (e.g.
`Header.tsx` + `Header.css`) — follow that convention for new components.
Shared design tokens (colors, fonts) live in `src/index.css`.

This structure is the same across every project generated from this
template — see `CLAUDE.md`'s "Project structure" section for the full rule,
including what to do when a project needs a backend.

## Session lifecycle

This repo is set up to run as an unattended `/loop` or `/goal` session, not
just interactively:

1. Backlog items live in `TODO.md`, one concrete/scoped/verifiable task per
   entry.
2. Running `/loop` (or `/goal` with a completion condition) works through
   `TODO.md` top to bottom: it branches from `main` per `CLAUDE.md`'s naming
   rules, implements exactly what an item describes, and runs
   `bash scripts/verify.sh` — the single source of truth for "is this done."
3. On a pass, it commits (with a `scripts/verify.sh --receipt` proof of
   work), pushes the branch explicitly, and opens or updates a PR — never
   pushing to `main` directly.
4. A human reviews and merges every PR; nothing in this repo auto-merges.
5. If verification can't be made to pass, or a task is ambiguous, the run
   stops and leaves a note in `TODO.md` instead of guessing or relaxing the
   check.

See `CLAUDE.md` for the full rules (branching, commits, verification,
boundaries), `.claude/loop.md` for exactly what a `/loop` iteration does, and
`.claude/PITFALLS.md` for lessons learned from past runs.

## Verification and CI

`bash scripts/verify.sh` is the single source of truth for "is this done" —
it installs dependencies, then runs lint, `format:check`, build, and test.
`.github/workflows/verify.yml` runs the same script on every push and on
pull requests targeting `main`, so an overnight `/loop`/`/goal` run gets an
independent, clean-checkout confirmation before a human reviews the PR.

## Frontend tooling notes

- **React Compiler**: enabled by default. See
  [the React docs](https://react.dev/learn/react-compiler) — this impacts
  dev/build performance somewhat. The experimental native compiler support
  in `@vitejs/plugin-react` (`compiler: true` instead of the Babel plugin) is
  also an option.
- **Expanding ESLint**: for stricter type-aware rules, extend
  `tseslint.configs.recommendedTypeChecked` (or `strictTypeChecked`) plus
  `stylisticTypeChecked` in `eslint.config.js`, and set
  `parserOptions.project` to `['./tsconfig.node.json', './tsconfig.app.json']`.
  `eslint-plugin-react-x` and `eslint-plugin-react-dom` add further
  React-specific rules if needed.
