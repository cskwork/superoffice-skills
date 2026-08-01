# markdown - 마크다운 <-> office 변환 (.md 소스/산출)

Load from `reference/office.md` when 마크다운(.md)을 office 문서로 만들거나, 기존 문서를 .md로 뽑을 때. 메모/노션/깃 마크다운을 보고서로 올리거나, 받은 문서를 깔끔한 텍스트로 재가공하는 경로다.

## 도구 (graceful fallback)

- **pandoc** (1순위, 변환 충실도 최고): md<->docx/pptx 양방향. OS 경로 탐지는 `templates/doc-env.py find_pandoc()`(환경변수 PANDOC > PATH > Windows `%LOCALAPPDATA%\Pandoc`). 래퍼 `pandoc_convert(src, out, extra)`.
- **chrome_to_pdf** (PDF 폴백, soffice/LaTeX 불필요): md -> HTML -> Chromium PDF. 전 OS 가장 가벼움.
- **python `markdown`** (MIT, MD->HTML): pandoc 없이 PDF/HTML이 필요할 때. `pip install markdown`. 부재 시 raw .md를 `<pre>`로 감싸 최소 렌더(서식 없음 - 명시).
- pandoc/markdown이 모두 없으면 .md 원본 + "pandoc 설치 후 변환" 안내를 남긴다(가짜 산출 금지).

## MD -> office (생성)

```bash
# docx / pptx (pandoc 1순위)
python templates/doc-env.py pandoc in.md out.docx
python templates/doc-env.py pandoc in.md out.pptx
```

```python
from importlib import import_module                       # doc-env는 하이픈 파일명
import importlib.util, os
spec = importlib.util.spec_from_file_location("denv", "templates/doc-env.py")
denv = importlib.util.module_from_spec(spec); spec.loader.exec_module(denv)

denv.pandoc_convert("in.md", "out.docx")                  # pandoc 있으면 변환
```

- **PDF**: pandoc도 되지만 PDF 엔진(LaTeX 등) 의존이 크다. 권장 경로는 **md -> HTML -> `chrome_to_pdf`**:
  ```python
  import markdown                                          # 또는 denv.pandoc_convert("in.md","x.html")
  html = "<meta charset='utf-8'><style>body{font-family:'Malgun Gothic','Nanum Gothic',sans-serif}</style>" + markdown.markdown(open("in.md", encoding="utf-8").read(), extensions=["tables"])
  open("doc.html","w",encoding="utf-8").write(html)
  denv.chrome_to_pdf("doc.html", "out.pdf")               # 한글 폰트는 시스템 폰트(CSS)
  ```
- **hwpx**: pandoc은 hwpx를 직접 못 만든다. 2단 경로 - md -> docx(pandoc) -> hwpx(LibreOffice + H2Orestart, `reference/hwpx.md` 변환 섹션). H2Orestart 미설치면 docx까지만 내고 안내(강등 기록).
- **브랜드**: pandoc 산출 docx/pptx 위에 brand-kit을 후처리로 얹는다 - `Document(out)`/`Presentation(out)`을 다시 열어 헤딩 색·폰트·표 헤더를 `brand-kit.json`으로 칠한다(`reference/brand-kit.md`, `reference/docx.md`/`pptx.md`). pandoc 단계는 구조, 브랜드 단계는 스타일.

## office -> MD (추출/재가공)

| 원본 | 경로 | 비고 |
|---|---|---|
| .hwpx | `HwpxDocument.open(p).export_markdown()` | 실측: 표를 `\| --- \|`로. 가장 깔끔 |
| .docx / .pptx | `pandoc in.docx -o out.md` (`doc-env.py pandoc`) | pandoc 없으면 `reference/doc-ingest.md` 추출 후 수동 MD |
| .xlsx | openpyxl `iter_rows` -> `\| a \| b \|` 표 | 시트별 MD 표. 수식은 `data_only` 주의 |
| .pdf (텍스트층) | pdfplumber 텍스트 -> MD | 러프(레이아웃 손실). 스캔 PDF는 OCR 별도 |

```python
# xlsx -> markdown 표
from openpyxl import load_workbook
ws = load_workbook("in.xlsx", data_only=True).active
rows = list(ws.iter_rows(values_only=True))
md = "| " + " | ".join(map(str, rows[0])) + " |\n| " + " | ".join(["---"]*len(rows[0])) + " |\n"
md += "".join("| " + " | ".join("" if c is None else str(c) for c in r) + " |\n" for r in rows[1:])
```

## 게이트

MD 소스와 office->MD 산출은 텍스트라 `bash templates/office-gate.sh <vault> in.md out.md` 그대로 검사된다(safety 이모지/PII + korean 맞춤법/띄어쓰기 + integrity 출처). MD->office로 만든 바이너리 문서는 본문을 .txt로 뽑아 검사(`reference/office.md`). 표의 수치/날짜는 `facts.json` 출처.
