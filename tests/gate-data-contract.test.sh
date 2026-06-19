#!/usr/bin/env bash
# /superoffice - gate-data contract. The deterministic gates read seed data from
# reference/. This verifies that seed data is present and valid JSON, so the gates
# can never silently run against a missing or malformed input. Each case asserts
# BOTH exit code and a substring.
# Run from repo root: bash tests/gate-data-contract.test.sh
set -u

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REF="$SKILL_DIR/reference"
TPL="$SKILL_DIR/templates"
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

# ---- korean-rules.json: read by korean-gate.mjs (../reference/korean-rules.json) ----
run_case "korean-rules.json is valid JSON" 0 "valid" \
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log("valid")' \
  "$REF/korean-rules.json"

# ---- forbidden-topics.json: read by safety-gate.mjs (../reference/forbidden-topics.json) ----
run_case "forbidden-topics.json is valid JSON" 0 "valid" \
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log("valid")' \
  "$REF/forbidden-topics.json"

# ---- the four gates the office-gate.sh wires must parse ----
for g in korean-gate safety-gate integrity-gate contrast-gate; do
  run_case "$g.mjs parses" 0 "-" node --check "$TPL/$g.mjs"
done

# ---- example seeds the templates ship ----
run_case "facts.example.json is valid JSON" 0 "valid" \
  node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log("valid")' \
  "$TPL/facts.example.json"

echo
printf "RESULT: %d passed, %d failed\n" "$PASS" "$FAIL"
[ "$FAIL" = 0 ]
