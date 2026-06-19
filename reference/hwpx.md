# hwpx - 한글 문서 1급 지원 (생성·편집·읽기·검증·변환)

Load from `reference/office.md` when 형식 = .hwpx. 한국 공공기관·기업의 사실상 표준(보고서·공문·사내 문서).

## 범위 - .hwpx O, 구포맷 .hwp X (먼저 읽을 것)

- **.hwpx** (HWP 2018+, ZIP+XML/OWPML): 전 OS에서 생성·편집·읽기·검증·변환 가능. "1급 풀 지원"은 이쪽이다.
- **.hwp** (구 바이너리 OLE): 직접 생성 불가(포맷 비공개). 한컴 COM 자동화(`pyhwpx`)는 **Windows + 한컴오피스 설치 전용** - macOS 불가. .hwp를 받으면 한컴/LibreOffice로 .hwpx 변환 후 처리하거나, Windows에서만 pyhwpx 경로. cross-platform 약속은 .hwpx 기준임을 사용자에게 먼저 알린다.

라이브러리: `python-hwpx` (PyPI `python-hwpx`, import `hwpx`, **Apache-2.0**, 순수 Python). 실측: 2.11.1에서 생성·라운드트립·검증 확인. 설치: venv에 `pip install python-hwpx`.

> 실행 시 stderr로 "manifest에서 masterPage/version 못 찾아 fallback" 경고가 날 수 있다 - 동작에 무해(빈 문서 기본 구조). 로그에 섞이면 무시하거나 stderr를 분리한다.

## 생성·편집 (실측 API)

```python
from hwpx import HwpxDocument
doc = HwpxDocument.new()                                  # 빈 문서 (classmethod)
doc.add_paragraph("2026년 1분기 실적 보고")               # -> HwpxOxmlParagraph
doc.add_paragraph("본문입니다.", style_id_ref=None)
tbl = doc.add_table(rows=2, cols=2, width=40000)          # -> HwpxOxmlTable
doc.set_header_text("사내 한정", page_type="BOTH")
doc.set_page_size(...); doc.set_page_margins(...)          # 페이지 설정
doc.add_picture("chart.png")                              # 실제 파일만
doc.save_to_path("report.hwpx")                           # save()는 deprecated -> save_to_path 사용
```

주요 메서드(실측 존재): `add_paragraph/add_table/add_picture/add_image/add_footnote/add_endnote/add_hyperlink/add_memo/add_shape`, `set_header_text/set_footer_text/set_page_size/set_page_margins/set_page_number`, `merge_table_cells/find_cell_by_label/get_table_map`, `replace_text_in_runs`(치환), `ensure_run_style/char_property`. 고급 모듈 헬퍼: `hwpx.create_document_from_plan`(plan->문서), `hwpx.mail_merge`/`load_mail_merge_rows`(메일머지), `hwpx.list_templates`/`describe_template`(템플릿), `hwpx.inspect_official_document_style`(공문서 양식 점검).

brand-kit 적용 - 제목/헤더/상태 색은 `ensure_run_style(color=, bold=, size=)`에 `brand-kit.json` 색을 넣어 일괄 적용한다(HWPX color-limit 준수, `reference/brand-kit.md`).

## 읽기

```python
from hwpx import HwpxDocument
doc = HwpxDocument.open("in.hwpx")
text = doc.export_text()                 # 실측: 본문 텍스트 정확 복원
md   = doc.export_markdown()             # 실측: 표를 | --- | 마크다운으로
html = doc.export_html()                 # 실측: 본문 포함 HTML
paras = list(doc.paragraphs)
images = doc.list_images()
```

## 검증

```python
report = doc.validate()                  # -> ValidationReport (실측: Contents/header.xml, section0.xml 검증)
```
생성/편집 후 항상 `validate()`로 OWPML 정합성 확인 - 한컴오피스에서 못 여는 문서를 사전 차단.

## Lean fallback (라이브러리 부재/깨짐)

.hwpx = ZIP + XML(실측: `mimetype`, `Contents/section0.xml`에 `<hp:t>`, `header.xml`, `content.hpf`, `META-INF/manifest.xml`). python-hwpx가 없거나 깨지면 표준 라이브러리로 텍스트만 추출:
```python
import zipfile
from xml.etree import ElementTree as ET
with zipfile.ZipFile("in.hwpx") as z:
    root = ET.fromstring(z.read("Contents/section0.xml"))
    print("".join(e.text or "" for e in root.iter() if e.tag.endswith("}t")))
```
표를 CSV로 뽑을 때는 `<hp:tbl>/<hp:tr>/<hp:tc>` 순회(BeautifulSoup `xml` 파서가 네임스페이스 편의). 쓰기는 lean 경로로 하지 않는다(정합성 위험) - 템플릿 .hwpx 복제 후 `replace_text_in_runs`가 안전.

## 변환 (cross-platform, 2경로)

1. **export_html -> Chromium PDF (primary, H2Orestart·Java 불필요, 실측 OK).** 가장 가볍고 전 OS.
   ```python
   open("doc.html","w").write(HwpxDocument.open("in.hwpx").export_html())
   ```
   이후 `templates/doc-env.sh chrome_to_pdf doc.html out.pdf`. 서식 충실도는 한컴 원본보다 단순화될 수 있음 - 특히 `ensure_run_style` 색/굵기는 hwpx(header.xml charPr)에 정확히 적용되나(한컴에서 보임) `export_html`은 그 색을 inline으로 내보내지 않아 이 경로의 PDF는 흑백이 된다(실측). 컬러 PDF가 필요하면 LibreOffice+H2Orestart 직접 변환 또는 한컴 인쇄를 쓴다.

2. **LibreOffice + H2Orestart 확장 (직접 변환, 원본 서식 보존 강함).** 실측: 확장 **미설치 시 `soffice --convert-to`가 hwpx를 "source file could not be loaded"로 거부**. 따라서 H2Orestart(GPLv3, Java 필요)를 LibreOffice에 설치해야 동작:
   ```bash
   # H2Orestart.oxt 다운로드(ebandal/H2Orestart releases) 후
   unopkg add H2Orestart.oxt
   soffice --headless --convert-to pdf --outdir out in.hwpx   # 설치 후 hwpx -> pdf/docx
   ```
   확장 설치는 사용자 LibreOffice 환경 변경 - 동의 후 진행. 미설치 환경에서는 1번(export_html) 경로로 강등하고 `doc-claims.md`에 기록.

변환 도구가 모두 없으면 .hwpx 원본 + "한컴오피스/LibreOffice+H2Orestart에서 수동 변환" 안내를 남긴다(위조 금지).

## 게이트

업무 한글 문서 -> `templates/office-gate.sh <vault> <txt files>`. 본문 텍스트 근거는 `export_text()`로 .txt를 만들어 korean-gate에 통과(맞춤법/띄어쓰기). 수치·날짜는 `facts.json` 출처. 학생/학부모 배포 교육 문서는 이 레포 범위 밖(supercontent).
