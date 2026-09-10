#!/usr/bin/env bash
# The single verification entry point that CLAUDE.md and .claude/loop.md
# refer to as "the verify script". Run it with: bash scripts/verify.sh
# Add --receipt "<branch-name>" to write a proof-of-work file to
# .claude/receipts/ on success, which .claude/loop.md requires before
# checking a TODO.md item off.
#
# It auto-detects the project's stack and runs that stack's test/lint/build
# commands. Until a real stack is added, it falls back to the smoke test in
# tests/, so an autonomous loop always has something real to check against.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

receipt_for=""
if [ "${1:-}" = "--receipt" ]; then
  receipt_for="${2:?--receipt requires a branch name}"
fi

echo "==> Scanning for leftover placeholder markers (TODO/FIXME/HACK/XXX)"
# .md files are excluded because TODO.md, CLAUDE.md, etc. legitimately talk
# about these markers in prose. verify.sh and smoke.test.sh are excluded
# because this check and the smoke test's file-existence assertions have to
# name the markers/TODO.md literally to implement/check for them. Lockfiles
# are excluded because their generated integrity hashes can coincidentally
# contain these substrings (e.g. a base64 hash containing "XXXX").
placeholder_hits=$(grep -rnE '(TODO|FIXME|HACK|XXX)' \
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.claude \
  --exclude-dir=.venv --exclude-dir=dist --exclude-dir=build \
  --exclude='*.md' --exclude='verify.sh' --exclude='smoke.test.sh' \
  --exclude='package-lock.json' --exclude='npm-shrinkwrap.json' \
  --exclude='yarn.lock' --exclude='pnpm-lock.yaml' \
  . 2>/dev/null || true)
if [ -n "$placeholder_hits" ]; then
  echo "==> FAIL: placeholder markers found (resolve them, or turn them into a TODO.md entry):"
  echo "$placeholder_hits" | sed 's/^/    /'
  exit 1
fi

ran_something=0

verify_node_project() {
  local dir="$1"
  echo "==> Detected Node.js project ($dir/package.json)"
  (
    cd "$dir"
    if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
      npm ci
    elif [ -f pnpm-lock.yaml ]; then
      pnpm install --frozen-lockfile
    elif [ -f yarn.lock ]; then
      yarn install --frozen-lockfile
    else
      npm install
    fi
    npm run --if-present lint
    npm run --if-present format:check
    npm run --if-present build
    npm test
  )
}

if [ -f package.json ]; then
  ran_something=1
  verify_node_project "."
fi

if [ -f server/package.json ]; then
  ran_something=1
  verify_node_project "server"
fi

verify_python_project() {
  local dir="$1"
  echo "==> Detected Python project ($dir/pyproject.toml)"
  (
    cd "$dir"
    if [ ! -d .venv ]; then
      python -m venv .venv
    fi
    if [ -f .venv/Scripts/python.exe ]; then
      venv_python=".venv/Scripts/python.exe"
    else
      venv_python=".venv/bin/python"
    fi
    "$venv_python" -m pip install -q --upgrade pip
    "$venv_python" -m pip install -q -e ".[dev]"
    "$venv_python" -m ruff check .
    "$venv_python" -m ruff format --check .
    "$venv_python" -m pytest
  )
}

# server/'s Python backend gets its own venv-backed check, same pattern as
# the Node blocks above. A bare root-level pyproject.toml/requirements.txt
# is not expected in this template (the frontend owns the repo root), so it
# only gets a best-effort check using whatever's already on PATH.
if [ -f server/pyproject.toml ]; then
  ran_something=1
  verify_python_project "server"
fi

if [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f setup.py ]; then
  echo "==> Detected Python project (root)"
  ran_something=1
  if command -v ruff >/dev/null 2>&1; then ruff check .; fi
  if command -v mypy >/dev/null 2>&1; then mypy .; fi
  if command -v pytest >/dev/null 2>&1; then
    pytest
  else
    python -m pytest
  fi
fi

if [ -f Makefile ] && grep -qE '^verify:' Makefile; then
  echo "==> Detected Makefile 'verify' target"
  ran_something=1
  make verify
fi

if [ "$ran_something" -eq 0 ]; then
  echo "==> No stack detected yet — running the placeholder smoke test."
  echo "    Once a real language/stack is added, wire its test/lint/build"
  echo "    commands into this script (see the stack blocks above for the"
  echo "    pattern) so this fallback stops being the only check."
  bash tests/smoke.test.sh
fi

echo "==> Verification passed."

if [ -n "$receipt_for" ]; then
  mkdir -p .claude/receipts
  safe_name=$(printf '%s' "$receipt_for" | tr -c 'A-Za-z0-9._-' '-')
  receipt_file=".claude/receipts/${safe_name}.md"
  {
    echo "# Verification receipt"
    echo
    echo "- branch: $receipt_for"
    echo "- commit: $(git rev-parse --verify -q HEAD 2>/dev/null || echo '(no commit yet)')"
    echo "- timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "- result: PASS"
  } > "$receipt_file"
  echo "==> Receipt written: $receipt_file"
fi
