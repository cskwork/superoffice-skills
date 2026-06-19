#!/usr/bin/env bash
# office-gate - 회사/업무 문서 preflight. Exit 0 = ship-ready; 1 = violation; 2 = usage.
# 교육 게이트(curriculum/read-level)는 의도적으로 제외 - 이 레포는 직장인 업무 문서 전용이다.
# "vault" = 문서 한 건의 작업 디렉토리. 반드시 포함:
#   doc-claims.md         (형식/대상/변환 타깃 선언 + 브랜드킷 참조)
#   facts.json            (수치/날짜/통계 출처, [] 허용 -> integrity-gate)
# 선택:
#   contrast-pairs.json   (표지/도표/배지 색을 declare했을 때 -> contrast-gate)
# 검사 대상 = 본문 텍스트 근거(.md/.txt/.html/.csv). 바이너리 문서(.docx/.pptx/.xlsx/.pdf/.hwpx)는
#   export_text / 셀 덤프 등으로 텍스트를 뽑아 vault에 두고 그 파일을 검사한다(바이너리 직접 스캔 금지).
#   - docx: paragraphs, pptx: text_frame, xlsx: 셀값을 .csv/.txt로, pdf: pdfplumber, hwpx: export_text
# 재사용 게이트: safety(--band 없이 = emoji/PII/링크/universal 금지어), korean(맞춤법/띄어쓰기),
#   integrity(수치/날짜 출처), contrast(pairs). 새 검증 로직은 만들지 않는다.
#
# NEVER edit a gate to make failing content pass - fix the content.

set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
fail() { echo "office-gate: $*" >&2; echo "== OFFICE PREFLIGHT: FAIL =="; exit 1; }
usage() { echo "usage: office-gate.sh <vault> [<text source files>]" >&2; exit 2; }

VAULT="${1:-}"
[ -n "$VAULT" ] || usage
[ -d "$VAULT" ] || fail "vault not found: $VAULT"
shift || true

# 1. doc-claims.md (형식/대상/변환 타깃/브랜드킷 선언).
CLAIMS="$VAULT/doc-claims.md"
[ -f "$CLAIMS" ] || fail "doc-claims.md missing (형식/대상/변환 타깃/브랜드킷을 선언)"

# 2. facts.json 필수 (업무 문서의 미출처 수치가 더 위험).
FACTS="$VAULT/facts.json"
[ -f "$FACTS" ] || fail "facts.json missing (수치/날짜 출처를 선언, 없으면 [])"

# 3. 텍스트 근거 수집 (args, 또는 vault 자동 탐색). 바이너리 deliverable은 export 텍스트로 대체.
SRC=()
if [ "$#" -gt 0 ]; then
  SRC=("$@")
else
  while IFS= read -r f; do SRC+=("$f"); done < <(find "$VAULT" -type f \
    \( -name '*.md' -o -name '*.txt' -o -name '*.html' -o -name '*.csv' \) \
    ! -name 'doc-claims.md' \
    -not -path '*/node_modules/*')
fi
TXT=()
for f in "${SRC[@]:-}"; do case "$f" in *.md|*.txt|*.html|*.csv) [ -f "$f" ] && TXT+=("$f");; esac; done
[ "${#TXT[@]}" -gt 0 ] || fail "검사할 텍스트 근거 없음 - 본문을 .txt/.md/.csv로 추출해 vault에 두고 재실행 (바이너리 문서는 export_text/pdfplumber/셀덤프 등)"

# 4. safety-gate (band 없이 = emoji/PII/insecure link/universal 금지어; 성인 대상이라 band별 어휘는 미적용).
echo "-- safety-gate (universal, no band) --"
node "$HERE/safety-gate.mjs" "${TXT[@]}" || fail "safety violations (이모지/PII/링크 - 정당한 연락처 등은 해당 줄 끝에 edu-ok 주석으로 억제)"

# 5. korean-gate (맞춤법/띄어쓰기 high-confidence).
echo "-- korean-gate --"
node "$HERE/korean-gate.mjs" "${TXT[@]}" || fail "Korean spacing/spelling violations"

# 6. integrity-gate (수치/날짜/통계는 facts.json 출처).
echo "-- integrity-gate --"
node "$HERE/integrity-gate.mjs" "$FACTS" "${TXT[@]}" || fail "integrity violations (수치/날짜는 facts.json 출처 또는 삭제)"

# 7. contrast-gate (색을 declare했을 때만).
PAIRS="$VAULT/contrast-pairs.json"
if [ -f "$PAIRS" ]; then
  echo "-- contrast-gate --"
  node "$HERE/contrast-gate.mjs" "$PAIRS" || fail "contrast below threshold"
fi

echo "== OFFICE PREFLIGHT: PASS == (${#TXT[@]} text source file(s))"
exit 0
