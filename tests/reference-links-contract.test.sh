#!/usr/bin/env bash
# /superoffice - reference-link contract. Every reference/*.md path mentioned in
# SKILL.md must exist on disk. A dangling link in SKILL.md sends a reader (or a
# routed producer) to a file that is not there. Each case asserts BOTH an exit code
# and a substring. Run from repo root: bash tests/reference-links-contract.test.sh
set -u

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_MD="$SKILL_DIR/SKILL.md"
PASS=0; FAIL=0

run_case() {
  local label="$1" exp="$2" substr="$3" out rc ok=1
  shift 3
  out="$("$@" 2>&1)"; rc=$?
  [ "$rc" = "$exp" ] || ok=0
  if [ "$substr" != "-" ]; then echo "$out" | grep -qF "$substr" || ok=0; fi
  if [ "$ok" = 1 ]; then PASS=$((PASS+1)); echo "  ok   $label"
  else FAIL=$((FAIL+1)); echo "FAIL   $label (rc=$rc exp=$exp; wanted substr: $substr)"; fi
}

# SKILL.md itself must exist.
run_case "SKILL.md present" 0 "found" bash -c '[ -f "'"$SKILL_MD"'" ] && echo found'

# Collect every reference/*.md path mentioned in SKILL.md (dedup), then verify each.
check_links() {
  local md="$1" missing=0 found=0 p
  [ -f "$md" ] || { echo "SKILL.md not found: $md"; return 2; }
  local paths
  paths="$(grep -oE 'reference/[A-Za-z0-9._/-]+\.md' "$md" | sort -u)"
  [ -n "$paths" ] || { echo "no reference/*.md links found in SKILL.md"; return 1; }
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ -f "$SKILL_DIR/$p" ]; then
      found=$((found+1))
    else
      missing=$((missing+1)); echo "MISSING: $p"
    fi
  done <<< "$paths"
  echo "checked: $found present, $missing missing"
  [ "$missing" = 0 ]
}
export -f check_links
export SKILL_DIR

run_case "every reference/*.md link in SKILL.md exists" 0 "0 missing" \
  bash -c 'check_links "'"$SKILL_MD"'"'

echo
printf "RESULT: %d passed, %d failed\n" "$PASS" "$FAIL"
[ "$FAIL" = 0 ]
