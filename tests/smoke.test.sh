#!/usr/bin/env bash
# Minimal, dependency-free smoke test. This is the fallback check
# scripts/verify.sh runs until a real stack (with its own test runner) is
# wired in — see the comment at the bottom of that file. It's deliberately
# small, but it's a real check: an autonomous loop needs something that can
# actually fail, not a no-op.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

failures=0

assert_file_exists() {
  if [ -f "$1" ]; then
    echo "  ok - $1 exists"
  else
    echo "  FAIL - $1 is missing"
    failures=$((failures + 1))
  fi
}

assert_no_conflict_markers() {
  local hits
  hits=$(grep -rlE '^(<<<<<<<|=======$|>>>>>>>)' \
    --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.claude \
    . 2>/dev/null || true)
  if [ -z "$hits" ]; then
    echo "  ok - no unresolved merge conflict markers"
  else
    echo "  FAIL - merge conflict markers found in:"
    echo "$hits" | sed 's/^/    /'
    failures=$((failures + 1))
  fi
}

echo "Smoke test: repo structure"
assert_file_exists "TODO.md"
assert_file_exists "CLAUDE.md"
assert_file_exists "README.md"
assert_file_exists ".claude/loop.md"
assert_file_exists ".claude/PITFALLS.md"
assert_file_exists ".claude/settings.json"

echo "Smoke test: no leftover conflict markers"
assert_no_conflict_markers

if [ "$failures" -eq 0 ]; then
  echo "Smoke test passed."
  exit 0
else
  echo "Smoke test failed ($failures check(s))."
  exit 1
fi
