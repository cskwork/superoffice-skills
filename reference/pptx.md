# pptx - PowerPoint 정밀 제어 (python-pptx)

Load from `reference/office.md` when 형식 = .pptx. 모든 .pptx(생성·읽기·디자인·변환·브랜드킷 상속)는 이 파일이 소유한다.

라이브러리: `python-pptx` (MIT, 순수 Python, Windows/macOS 동일). 설치: `pip install python-pptx`. 실측: 1.0.2에서 생성·읽기 확인.

## 생성

```python
from pptx import Presentation
from pptx.util import Inches, Pt
prs = Presentation()                               # 또는 Presentation("회사템플릿.pptx")
s = prs.slides.add_slide(prs.slide_layouts[5])     # 5 = 제목만/빈, 6 = 완전 빈
tf = s.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(1)).text_frame
tf.text = "분기 실적"; tf.paragraphs[0].font.size = Pt(28); tf.paragraphs[0].font.name = "Malgun Gothic"
tbl = s.shapes.add_table(3, 2, Inches(1), Inches(2.5), Inches(8), Inches(2)).table
tbl.cell(0,0).text = "지표"; tbl.cell(0,1).text = "값"
s.shapes.add_picture("chart.png", Inches(1), Inches(5))   # 실제 파일만
prs.save("deck.pptx")
```

한글 폰트: docx와 같은 원리지만 python-pptx는 `font.name`만으로 동작하는 경우가 많다. 깨질 때는 단락의 `rPr`에 eastAsia를 다는 패턴을 `templates/doc-env.py`에서 가져온다. 폰트는 이름만 임베드되므로 협업 시 범용 폰트 권장.

## 브랜드킷 적용 (두 경로)

회사 스타일은 두 방식으로 동일하게 적용한다 - 자세한 건 `reference/brand-kit.md`.

1. 템플릿 파일 상속: `Presentation("회사템플릿.pptx")`로 열면 슬라이드 마스터·레이아웃·테마색·기본 폰트를 그대로 물려받는다. 회사 양식을 처음부터 다시 그리지 말고 상속 후 텍스트만 채운다.
2. brand-kit.json 우선: 인터뷰로 한 번 캡처한 색/폰트/로고/푸터를 모든 형식에 재사용. 표지 primary, accent 바, 헤더색을 brand-kit.json 값으로 치환.

브랜드 색도 `contrast-gate.mjs` AA 필수: 회사 색이 흰 배경에서 미달이면 경고하고 더 어두운 변형을 제안한다. 눈대중 금지.

## 비즈니스 보고 덱 디자인 (경영/대표 보고용)

업무 보고 PPT는 기본 텍스트박스 나열로는 부족하다 - 경영진은 한눈에 읽히는 비주얼 위계를 기대한다. 메시지 작법(action title, storyline-first, executive summary SCQA, RAG, 차트 takeaway)은 `reference/biz-report.md`를 먼저 적용한다 - 디자인보다 메시지 구조가 우선. 아래는 그 위에 얹는 비주얼이며 색은 반드시 `contrast-gate.mjs`로 검증한다(눈대중 금지).

색 팔레트 - 1 primary + 1 accent + 중립:
- primary(표지/헤더 배경): 진한 중립색. 그 위 텍스트는 흰색이어야 AA 통과(예 딥 슬레이트 `#273340`). anti-slop: 채도 높은 코퍼레이트색보다 절제된 슬레이트/차콜이 세련되다.
- accent(강조 바/포인트): 절제된 단일 색(예 블루 `#3D5A80`), 슬라이드당 극소량(60-30-10의 10). accent 위 흰 텍스트는 AA 미달일 수 있으니 장식 바·번호에만, 강조 텍스트/KPI 숫자는 accent를 흰/연회색 배경에 둔다(색 한두 개로 절제 = anti-slop).
- 중립: 본문 ink(거의 검정 `#202428`), 배경 흰/연회색(`#F1F4F7`), muted 회색.
- 상태 배지색: 완료/진행/예정·RAG를 일관 색으로. 밝은 배지(골드 `#E3A82B`)는 **다크 텍스트**, 진한 배지(초록 `#2E6F5E` / 적 `#B0413E` / 회색 `#6B7280`)는 흰 텍스트. 골드를 어둡게 눌러 갈색(머스타드)으로 만들지 말 것 - AI slop의 대표 신호.

슬라이드 패턴:
- 표지: primary 풀블리드 배경 + 큰 제목(흰) + accent 구분 바 + 메타(보고일/부서/보고자).
- 본문: 상단 primary 띠(제목 흰) + 좌측 accent 세로 바 + 흰 바탕 ink 본문. 슬라이드당 한 메시지, 6줄 이내.
- 요약/강조: 연회색 박스 + accent 좌측 바. KPI 숫자는 크게 + primary색.
- 표: 헤더 primary 배경 + 흰 텍스트, 본문 행 줄무늬(연회색), 상태 셀은 배지색.

타이포: 제목 28-36pt bold, 소제목 18-22pt, 본문 14-18pt, 캡션 10-12pt. 한글 폰트 일관(`doc-env.py korean_font_name`), 어절 줄바꿈(`word_wrap`).

python-pptx 구현:
- 색 띠/바: `shapes.add_shape(MSO_SHAPE.RECTANGLE, ...)` 후 `shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(...)`, `shp.line.fill.background()`, `shp.shadow.inherit = False`.
- 배지: `MSO_SHAPE.ROUNDED_RECTANGLE` + 상태색 fill + 흰 텍스트.
- 표 셀 색: `cell.fill.solid(); cell.fill.fore_color.rgb = ...`. 텍스트색: `run.font.color.rgb = RGBColor(...)`.
- 와이드(16:9): `prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)`.

contrast(필수): 모든 텍스트-배경 쌍(표지 제목/primary, 본문/흰, 표 헤더/primary, 배지 텍스트/배지색, KPI/흰)을 `contrast-pairs.json`에 enumerate하고 `node contrast-gate.mjs contrast-pairs.json`으로 WCAG AA 검증. 흰 텍스트는 충분히 진한 배경에만 둔다. 이 덱은 업무 문서이므로 게이트는 `office-gate.sh`(검증된 본문 텍스트 + contrast-pairs.json).

## 읽기

```python
from pptx import Presentation
prs = Presentation("in.pptx")
for i, slide in enumerate(prs.slides):
    for sh in slide.shapes:
        if sh.has_text_frame: print(i, sh.text_frame.text)
        if sh.has_table:
            for r in sh.table.rows: print([c.text for c in r.cells])
```

한계(실측): 레이아웃 placeholder가 빈 텍스트박스로 함께 읽힌다(필터 필요). 표는 `shape.has_table`로 접근하지만 SmartArt·그룹 도형·차트 데이터는 고수준 API로 안 잡혀 XML 직접 파싱이 필요하다. 스피커 노트는 `slide.notes_slide.notes_text_frame.text`.

## 변환

`soffice --headless --convert-to pdf deck.pptx` (H2Orestart 불필요). 경로 래퍼는 `templates/doc-env.sh`.

## 게이트

업무 발표자료 -> `office-gate.sh`. 텍스트 근거는 `doc-claims.md`/별도 .txt로 옮겨 korean-gate. 표의 수치는 `facts.json` 출처. 배지·헤더 색쌍은 contrast-pairs.json -> contrast-gate AA.
