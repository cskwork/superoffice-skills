#!/usr/bin/env bash
# doc-env.sh - DOCS 모드 bash 편의 래퍼 (macOS/Linux/Git-Bash).
# 실제 OS 분기/변환은 doc-env.py에 위임한다. Windows 네이티브는 doc-env.py를 직접 쓰는 게 안전.
#
# 사용:
#   bash doc-env.sh soffice_convert <src> [fmt=pdf] [outdir=.]
#   bash doc-env.sh chrome_to_pdf <html> <out.pdf>
#   bash doc-env.sh font
# venv 사용 시: PYTHON=/path/to/venv/bin/python bash doc-env.sh ...
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
PY="${PYTHON:-python3}"

case "${1:-}" in
  soffice_convert) shift; exec "$PY" "$HERE/doc-env.py" soffice-convert "$@" ;;
  chrome_to_pdf)   shift; exec "$PY" "$HERE/doc-env.py" chrome-pdf "$@" ;;
  font)            exec "$PY" "$HERE/doc-env.py" font ;;
  *) echo "usage: doc-env.sh {soffice_convert|chrome_to_pdf|font} ..." >&2; exit 2 ;;
esac
