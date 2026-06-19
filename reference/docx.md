# docx - Word 문서 생성·읽기 (python-docx)

Load from `reference/office.md` when 형식 = .docx. 본문 업무 문서(보고서·제안서·공문·회의록). 슬라이드는 pptx, 표·대시보드는 xlsx, 한컴은 hwpx.

라이브러리: `python-docx` (MIT, 순수 Python, Windows/macOS 동일). 설치: venv에 `pip install python-docx`. 실측: 1.2.0에서 생성·읽기·soffice PDF 변환 확인.

## 생성

```python
from docx import Document
from docx.shared import Pt, Inches
from docx.oxml.ns import qn

doc = Document()                                   # 또는 Document("회사양식.docx")로 회사 양식 상속
doc.add_heading("2026년 1분기 실적 보고", level=1)
doc.add_paragraph("본문 단락입니다.")
t = doc.add_table(rows=2, cols=2); t.style = "Table Grid"
t.cell(0,0).text = "지표"; t.cell(0,1).text = "값"
doc.add_picture("chart.png", width=Inches(5))      # 이미지는 실제 파일만 (no-fabrication)
doc.sections[0].header.paragraphs[0].text = "사내 한정"
doc.save("report.docx")
```

페이지 크기 기본값에 의존하지 말 것 - 한국 업무 관례는 A4. `doc.sections[0]`에 `page_width`/`page_height`를 명시한다.

## 한글 폰트 - w:eastAsia 필수

`run.font.name`은 OOXML의 `w:ascii`/`w:hAnsi`(라틴)만 설정한다. 한글 글리프는 `w:eastAsia` 속성을 따로 지정해야 의도한 폰트로 렌더된다. 미지정 시 뷰어 기본 한글 폰트로 떨어진다(깨지진 않으나 폰트 불일치).

```python
def set_korean_font(doc, name="Malgun Gothic"):       # Normal 스타일에 한 번
    st = doc.styles["Normal"]; st.font.name = name
    st.element.rPr.rFonts.set(qn("w:eastAsia"), name)
# run 단위로 줄 때도 동일하게 run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
```

OS별 안전 폰트명은 `templates/doc-env.py`(`korean_font_name()` / `set_docx_eastasia()`)에 위임 - Windows `Malgun Gothic`, macOS `AppleGothic`/`Apple SD Gothic Neo`, 공통 배포는 `Nanum Gothic`. 폰트는 파일이 아니라 **이름**으로만 들어가므로, 여는 쪽 PC에 그 폰트가 있어야 동일하게 보인다 - 협업 문서는 범용 폰트(맑은 고딕/나눔)를 권장.

## 회사 브랜드

두 경로를 모두 지원한다(상세: `reference/brand-kit.md`).

1. **템플릿 상속**: `Document("회사양식.docx")`로 열면 머리글/바닥글/스타일/로고를 그대로 물려받는다. 기존 회사 양식은 새로 그리지 말고 상속해 본문만 채운다(재생성 시 충실도 손실).
2. **brand-kit.json 적용**: 인터뷰로 한 번 캡처한 색/폰트/로고를 헤딩·표 헤더·상태 셀에 반영한다. 헤딩 색·표 헤더 음영은 `RGBColor.from_string(...)`, 상태 셀 음영은 `w:shd`로 칠한다.

```python
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def shade_cell(cell, hex_no_hash):                 # 상태 셀 음영 (RAG)
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:fill"), hex_no_hash)
    cell._tc.get_or_add_tcPr().append(shd)
# RAG 팔레트(앞 # 없음): Green 2E6F5E / Amber E3A82B / Red B0413E
# 텍스트 대비: Amber=밝은 골드면 다크 텍스트, Green·Red=진하므로 흰 텍스트
```

브랜드 색도 contrast-gate AA를 통과해야 한다 - 흰 배경에서 실패하면 경고하고 어두운 변형을 제안한다. 색보다 메시지 구조가 먼저(`reference/biz-report.md`).

## 결재 문서 (품의서·기안문)

품의서·기안문은 보고서와 구조가 다르다 - 상단에 결재란, 메타(문서번호·시행일·보존연한), 협조. 결재란은 **이미지가 아니라 표**로 만든다(게이트 텍스트 검사 + 편집 가능). 본문은 목적·내용·소요예산·기대효과. 결재선 직책/이름은 자리표시(`[직책]`/`[이름]`) - 승인 체계를 날조하지 않는다.

```python
appr = doc.add_table(rows=2, cols=3); appr.style = "Table Grid"   # 상단 결재란
for j, role in enumerate(["담당", "검토", "승인"]): appr.cell(0, j).text = role
# 2행 서명/날짜 칸은 비워 둠(실제 결재 시 채움)
```

메타는 본문 위 단락으로(`문서번호`/`시행일`/`보존연한`/`협조`). 소요예산·기대효과는 표 또는 불릿, 수치는 `facts.json` 출처. 결재 문서도 결론(목적) 먼저(`reference/biz-report.md`).

## 목차·페이지번호·머리말/바닥글 (다페이지 보고서)

3페이지 넘는 보고서·제안서는 페이지번호·머리말이 없으면 미완성으로 읽힌다.

```python
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def add_page_number(par):                              # 바닥글 페이지 번호 (Word 필드)
    fld = OxmlElement("w:fldSimple"); fld.set(qn("w:instr"), "PAGE")
    par._p.append(fld)
footer = doc.sections[0].footer; footer.paragraphs[0].alignment = 1   # 가운데
add_page_number(footer.paragraphs[0])
doc.sections[0].header.paragraphs[0].text = "사내 한정 · 2026 1분기 보고"   # 머리말
```

목차(TOC): python-docx는 TOC 필드를 자동 갱신하지 못한다 - (a) 정적 목차를 표/단락으로 직접 만들거나, (b) TOC 필드를 넣고 "한컴/Word에서 F9로 갱신" 안내를 남긴다(빈 목차를 채운 척 금지).

## 읽기

```python
from docx import Document
doc = Document("in.docx")
paras  = [p.text for p in doc.paragraphs]                    # 단락 텍스트
tables = [[[c.text for c in r.cells] for r in t.rows] for t in doc.tables]
meta   = doc.core_properties.author, doc.core_properties.title
```

한계(실측): `doc.paragraphs`와 `doc.tables`는 **분리 수집**되어 본문 내 등장 순서가 보존되지 않는다. 단락-표-단락 흐름을 그대로 재구성하려면 `doc.element.body` 자식을 순회해 타입을 직접 분기해야 한다. 병합 셀은 같은 셀 텍스트가 중복으로 읽힐 수 있다. 형식 무관 읽기 진입점은 `reference/doc-ingest.md`.

## 변환 (cross-platform)

LibreOffice headless는 H2Orestart 없이 docx를 처리한다(실측: docx -> pdf OK).
```bash
soffice --headless --convert-to pdf --outdir out report.docx   # docx -> pdf
soffice --headless --convert-to "hwp:Hwp Document" report.docx # docx -> hwp는 H2Orestart 필요
```
soffice 경로 OS 분기와 래퍼는 `templates/doc-env.sh`(`soffice_convert`). 변환 도구 부재 시 docx 원본 + 수동 변환 안내를 남긴다(위조 금지).

## 게이트

업무 문서 -> `templates/office-gate.sh <vault> report.docx`. korean-gate는 텍스트(.md/.txt) 대상이므로, 본문을 `doc-claims.md`에 근거로 옮겨 적거나 별도 .txt로 내보내 검사한다(이미지화된 docx 자체는 텍스트 스캔 불가). 수치·날짜는 `facts.json` 출처 필수.
