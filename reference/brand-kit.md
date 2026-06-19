# brand-kit - 회사 템플릿/스타일 적용

Load from `reference/office.md` when 회사 템플릿/스타일을 반영할 때. 이 repo의 차별점: 한 회사의 스타일을 **두 방식**으로 모든 형식·문서에 일관 적용한다.

1. **템플릿 파일 상속** - 회사가 준 `.pptx`/`.docx`/`.xlsx`를 베이스로 열어 테마·레이아웃·스타일을 물려받는다(형식별).
2. **brand-kit.json** - 짧은 인터뷰로 한 번 캡처한 색·폰트·로고·정책을 `.superoffice/brand-kit.json`에 저장해 모든 형식·문서에서 재사용한다.

둘은 배타적이지 않다 - 템플릿 파일로 골격을, brand-kit.json으로 색/배지/정책을 얹는다. 색은 무조건 `contrast-gate.mjs`로 검증한다(눈대중 금지).

**회사 자체 양식이 있으면 그 파일 분석이 1순위다**(없으면 방식 2 인터뷰 또는 하우스 기본). 양식 파일은 브랜드(색/폰트)뿐 아니라 **형식 예시**(레이아웃·섹션 구조)이기도 하다 - 형식 따라하기는 `reference/examples.md`.

## 방식 1: 템플릿 파일 상속 (형식별)

회사 양식이 있으면 새로 만들지 말고 베이스로 연다 - 재생성은 헤더/푸터/테마 fidelity를 잃는다.

```python
from pptx import Presentation
prs = Presentation("회사.pptx")        # 슬라이드 마스터·레이아웃·테마색·폰트·placeholder 상속
from docx import Document
doc = Document("회사.docx")            # 스타일(Heading/Normal)·섹션·머리말/꼬리말·테마 상속
from openpyxl import load_workbook
wb = load_workbook("회사.xlsx")        # 셀 스타일·named style·열폭·인쇄설정 상속
```

상속되는 것 / **안** 되는 것(실측 주의):

- pptx: 마스터/레이아웃/테마색·폰트·placeholder는 상속. 단, `add_slide(layout)`로 새 슬라이드를 추가해야 테마가 적용되고, 본문 텍스트박스에 직접 색을 박으면 테마와 어긋날 수 있다.
- docx: 명명 스타일(`doc.styles['Heading 1']`)·섹션·머리말/꼬리말은 상속. 단, 새 단락에 스타일을 명시 적용해야(`p.style = '...'`) 물려받는다 - 그냥 `add_paragraph(text)`는 Normal로 떨어진다.
- xlsx: named style·열폭·조건부서식·인쇄영역은 상속. 단, 새 셀에는 회사 named style을 다시 지정해야 한다. `load_workbook`은 수식/서식을 보존하지만 `data_only=True`면 수식이 캐시값으로 영구 치환되니 편집엔 쓰지 말 것.

기존 양식의 **빈칸 채우기/in-place 편집**은 run 단위 텍스트 치환으로 fidelity를 보존한다 - 자세한 편집 경로는 형식별 `reference/docx.md` / `reference/pptx.md`를 본다. 회사 색·폰트를 brand-kit.json으로 별도 캡처하려면 아래 인터뷰를 양식 파일에서 먼저 추출해 채운다.

### 회사 양식 분석 (상호작용 - 양식 있을 때만)

회사 자체 양식 파일이 있으면 그걸 분석해 브랜드를 잡는 게 1순위다(추상 질문보다 정확). 흐름:

1. **추출**: 양식 파일에서 뽑을 수 있는 색·폰트·레이아웃을 추출(위 형식별 코드). 못 뽑는 건 추측하지 않는다.
2. **사용자 확인 (상호작용)**: 뽑은 brand-kit 초안과 추출 출처를 사용자에게 보여 확인·수정받는다. subagent는 직접 못 물으니 `brand-interviewer`가 conductor/메인 루프로 surface한다. 못 뽑은 항목만 질문에 포함.
3. **저장**: 확정본을 `.superoffice/brand-kit.json`에 저장. 추출한 레이아웃·섹션 구조는 `format_skeleton`으로 함께 기록해 `reference/examples.md`의 형식 예시로도 쓴다(양식 = 브랜드 + 형식 이중 소스).

양식이 없으면 이 분석을 건너뛰고 아래 방식 2(인터뷰) 또는 하우스 기본으로 간다.

## 방식 2: brand-kit.json - 짧은 인터뷰로 캡처 (양식이 없을 때)

인터뷰 규율은 supergoal의 인터뷰 게이트 패턴을 따른다(ambiguity-gated, 5문항 이하, 한 번에 하나씩, 추천답 동봉).

- **ambiguity-gated**: 회사 스타일이 명확하거나 양식 파일/기존 brand-kit.json에서 읽어낼 수 있으면 묻지 않는다. 모호할 때만 인터뷰.
- **code/file-first**: 묻기 전에 제공된 템플릿 파일에서 추출한다 - pptx는 `prs.slide_masters[0]` 테마색·`...font.name`, docx는 `doc.styles` 폰트, xlsx는 named style·테마색. 추출로 풀리는 값은 질문에서 뺀다.
- **<=5문항, 한 번에 하나씩, 추천답 제시**: 직렬로 묻고 매 질문에 권장값을 붙여 확인/수정이 싸게. 한 라운드.
- **subagent 경계**: subagent는 사용자에게 직접 물을 수 없다 - 인터뷰 질문은 conductor/메인 루프로 surface하고 답을 vault에 받아 적는다(supergoal conductor 패턴).

질문 소스(필요한 것만): 회사명/로고 경로, primary·accent 색, 한글·라틴 폰트, 푸터/대외비 문구, 날짜·숫자 형식, 페이지 크기(A4 vs Letter). 추출로 채운 필드는 묻지 않는다.

## brand-kit.json 스키마

```json
{
  "company_name": "string",
  "logo_path": "string|null",
  "colors": {
    "primary": "#RRGGBB",
    "accent": "#RRGGBB",
    "ink": "#RRGGBB",
    "bg": "#RRGGBB",
    "rag": { "green": "#RRGGBB", "amber": "#RRGGBB", "red": "#RRGGBB" }
  },
  "fonts": { "ko": "맑은 고딕", "latin": "Calibri" },
  "footer": "string",
  "confidentiality": "string|null",
  "conventions": {
    "date_format": "yyyy-mm-dd",
    "number_format": "₩#,##0",
    "page_size": "A4"
  }
}
```

구체 예시는 `templates/brand-kit.example.json`(하우스 팔레트를 기본값으로). 색 hex는 표기 일관을 위해 `#` 포함으로 저장하고, 형식별로 소비할 때 변환한다(openpyxl은 `#` 제거).

## 형식별 소비 (한 brand-kit.json, 모든 형식)

`templates/doc-env.py`의 함수를 재사용하고 OS/폰트 분기를 다시 하드코딩하지 않는다.

- **docx**: 헤딩에 `fonts.ko`·`colors.primary`. 표 헤더 배경은 `w:shd`(셀 XML)에 `colors.primary`(# 제거). 본문 폰트 eastAsia는 `set_docx_eastasia(doc, fonts.ko)`로.
- **pptx**: 표지/상단 띠 = `add_shape(RECTANGLE).fill.fore_color.rgb = RGBColor.from_string(primary[1:])`, accent 세로 바 = `colors.accent`, 상태 배지 = `colors.rag.*`. 배지 위 텍스트색 규칙은 아래 대비.
- **xlsx**: 3단 RAG는 `CellIsRule` x3에 `colors.rag.green/amber/red`(openpyxl hex는 **선두 # 없음**). 폰트는 `Font(name=fonts.ko)`. 숫자서식은 `conventions.number_format`.
- **pdf**: WeasyPrint CSS 변수로 주입 - `--primary: #...; --accent: #...; --ink: #...`. 한글 폰트는 `register_reportlab_korean` 경로/`korean_font_name`. 페이지 크기는 `@page { size: A4; }`에 `conventions.page_size`.
- **hwpx**: 색 제약이 있다(형식 한계 - `reference/hwpx.md`의 색 제한 준수). run 스타일은 `ensure_run_style`에 `fonts.ko`·`colors.primary`를 넘기되, HWPX가 못 받는 색은 가장 가까운 허용색으로 낮추고 doc-claims.md에 `[substitution]` 기록.

## 대비 안전 (필수)

회사 색도 예외 없이 WCAG AA를 통과해야 한다. brand-kit.json의 모든 텍스트-배경 쌍(헤딩/primary, 본문/bg, 표헤더/primary, 배지텍스트/배지색)을 `contrast-pairs.json`에 enumerate하고 `node templates/contrast-gate.mjs contrast-pairs.json`으로 검증.

- 배지 텍스트 규칙: 밝은 골드(amber `#E3A82B`)엔 **다크** 텍스트, 진한 색(green/red/primary)엔 **흰** 텍스트. 골드를 어둡게 눌러 갈색(머스타드)으로 만들지 말 것 - AI slop 신호.
- 회사 색이 흰 배경에서 AA 미달이면 **경고 + 더 어두운 변형 제안**(예 명도를 낮춘 동일 색상). 조용히 통과시키지 않는다. 사용자가 원본을 고수하면 텍스트를 흰/연회색 배경에 두는 배치로 우회.

## 영속성 (문서 간 재사용)

캡처한 brand-kit.json은 `.superoffice/brand-kit.json`에 저장하고 이후 모든 문서가 vault에서 읽어 재사용한다(supergoal의 domain-wiki 아이디어 - 한 번 확정한 사실을 포인터로 재사용, 현재 양식 파일과 충돌하면 양식 파일이 이긴다). per-document vault(`.superoffice/<doc>/`)는 이 공용 brand-kit.json을 가리키고 doc-claims.md에 브랜드킷 사용을 선언한다.

## 게이트

brand-kit.json을 쓴 문서 -> `bash templates/office-gate.sh <vault> <text files>`. 색 쌍은 `contrast-pairs.json`으로 contrast-gate, 텍스트 근거는 .txt로 추출해 safety/korean, 수치 출처는 facts.json으로 integrity. 색 미달·미선언 시 게이트가 막는다.
