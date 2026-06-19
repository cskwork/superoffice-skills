# office - 업무 문서 허브 (docx / pptx / xlsx / hwpx / pdf 생성·읽기·변환 + 회사 브랜드)

Load at the start of any /superoffice job. 허브: 형식을 고르고, 작업을 고르고, 회사 브랜드를 입히고, `office-gate.sh`로 검증한다. 이 레포는 **직장인 업무 문서 전용**이다 - 학생/학부모 배포 교육 문서는 범위 밖(supercontent), presenton AI 덱 초안도 범위 밖(이 레포의 .pptx는 python-pptx 정밀 제어).

## 무엇을 위한 것인가

회사 업무 문서를 **파일 포맷으로** 생성·읽기·변환한다. 대상은 팀장·경영자에게 올라가는 보고서·제안서·기안·공문·발표 덱·정산표·대시보드, 그리고 받은 문서의 읽기/표 추출/형식 변환이다. Windows 동료가 .docx/.xlsx/.hwpx로 이어서 편집하는 협업을 전제한다.

핵심 가치 두 축: (1) **메시지 구조** - 결론 먼저(BLUF), action title, 한장보고 (`reference/biz-report.md`). 색이 예뻐도 결론이 묻히면 업무 문서가 아니다. (2) **회사 브랜드** - 회사 템플릿/스타일을 한 번 캡처해 모든 형식에 일관 적용 (`reference/brand-kit.md`).

## Step 1 - 형식 + 작업 판별 (one-line, state it)

State e.g. `DOCS: 1분기 실적 보고 -> .pptx 생성, 회사 브랜드 적용, 16:9` 또는 `DOCS: 받은 .xlsx 정산표 읽어 표 추출`.

| 작업 | 분기 | Reference |
|---|---|---|
| .docx 생성/읽기 (보고서·제안서·기안·공문 본문) | python-docx | `reference/docx.md` |
| .pptx 정밀 생성/읽기 (발표 덱; 셀·표·도형·좌표 결정론적 제어) | python-pptx | `reference/pptx.md` |
| .xlsx 생성/읽기 (정산·KPI·대시보드·표·수식·차트) | openpyxl (+XlsxWriter/pandas) | `reference/xlsx.md` |
| .hwpx 생성/편집/읽기/검증 (한글, 공공·기업 표준) | python-hwpx | `reference/hwpx.md` |
| .pdf 생성 (다페이지 본문) / .pdf 읽기·표 추출 | Chromium·WeasyPrint·ReportLab / pdfplumber·pypdf | `reference/pdf.md` |
| 형식 무관 기존 문서 읽기 (어떤 파서를 언제) | 통합 매트릭스 | `reference/doc-ingest.md` |
| 형식 변환 (hwpx<->docx<->pdf<->xlsx 등) | LibreOffice + H2Orestart | 각 형식 reference의 변환 섹션 |
| 마크다운(.md) <-> office 생성·추출 | pandoc·chrome·python-markdown | `reference/markdown.md` |

## Step 2 - 게이트 (단일 트랙)

이 레포의 검증은 **`templates/office-gate.sh` 한 트랙**이다 (supercontent의 edu/doc 분기가 없다 - 전부 성인 업무 문서). 도는 것: safety(이모지/PII/링크, band 없음) + korean(맞춤법/띄어쓰기) + integrity(수치/날짜 출처) + contrast(색을 declare했을 때). 새 검증 로직은 만들지 않는다.

```bash
bash templates/office-gate.sh .superoffice/<doc> <text source files>
```

바이너리 문서(.docx/.pptx/.xlsx/.pdf/.hwpx)는 직접 스캔되지 않는다 - 본문/셀을 텍스트로 뽑아(`export_text`/paragraphs/셀 .csv 덤프/pdfplumber) vault에 두고 그 파일을 검사한다.

## Vault 계약

업무 문서 vault (기본 `.superoffice/<doc>/`, `templates/`에서 시작):
- 필수: `doc-claims.md` (형식/대상/목적/분량/폰트/변환 타깃/브랜드킷 선언), `facts.json` (수치·날짜·통계 출처; 없으면 `[]`).
- 선택: `contrast-pairs.json` (표지/도표/배지 색 대비를 declare했을 때), `brand-kit.json` (회사 색/폰트/로고/정책 - 문서 간 재사용).

서브에이전트는 vault를 통해 컨텍스트를 공유한다 (conductor가 brand-interviewer -> producer -> critic을 fresh-context로 디스패치, 산출물은 vault에 누적).

## 환경 (cross-platform, 한 번 확인)

- Python 라이브러리는 venv 권장. macOS/Linux 시스템 Python은 PEP 668로 전역 `pip install`이 막힌다: `python3 -m venv venv && ./venv/bin/pip install ...` (Windows: `py -m venv venv`, `venv\Scripts\pip install ...`).
- 핵심 패키지(전부 순수 Python, MIT/BSD/Apache): `python-docx python-pptx openpyxl pdfplumber pypdf python-hwpx`. 생성 보강: `XlsxWriter`(BSD, 차트 강함) / `reportlab`(LGPL+상용 주의) / `weasyprint`(시스템 Pango 의존).
- 변환·한글 폰트의 OS 분기(soffice/chrome 경로, TTF 경로, registerFont, w:eastAsia)는 `templates/doc-env.sh` / `templates/doc-env.py`에 집약 - 각 형식 reference는 거기로 위임한다.
- 라이선스 경고는 형식 reference 인라인 + `reference/sources.md`. 특히 **PyMuPDF는 AGPL**(상업 통합 시 전염) - 기본 비채택.

## 회사 브랜드 (팀장·경영자용 핵심)

회사별 템플릿/스타일을 두 방식으로 입힌다 - 둘 다 지원한다: (1) **템플릿 파일 상속** (`Presentation("회사.pptx")` / `Document("회사.docx")` / openpyxl 스타일), (2) **brand-kit.json 인터뷰** (색/폰트/로고/정책을 한 번 캡처해 모든 형식·문서에 재사용). 회사 색도 `contrast-gate` AA를 통과해야 한다. 상세는 `reference/brand-kit.md`, 인터뷰는 `agents/brand-interviewer.md`. **회사 자체 양식 파일이 있으면 그 파일 분석이 1순위**(상호작용 추출·확인)이며, 그 양식은 브랜드뿐 아니라 **형식 예시**(레이아웃·섹션 구조)이기도 하다 - 형식 따라하기는 `reference/examples.md`(하우스 견본 + 사용자 예시).

## 비즈니스 보고 디자인 (업무 문서 공통)

경영/대표 보고는 텍스트 나열로는 부족하다 - 형식 간 통일된 비주얼 위계를 적용한다. 공통 팔레트: primary 딥 슬레이트 `#273340`(표지/헤더 배경 + 흰 텍스트), accent 절제된 블루 `#3D5A80`(강조 한 곳), ink `#1F2933`, 연회색 `#F3F5F7`. 상태색(RAG): Green `#2E6F5E` / Amber `#E3A82B`(**밝은 골드 + 다크 텍스트** - 어둡게 누르면 갈색=AI slop) / Red `#B0413E`. anti-slop: 색 최소화, 위계로 승부 - 머스타드/황토/네온/의미 없는 베이지 금지. 모든 텍스트-배경 쌍은 `contrast-pairs.json` -> `contrast-gate.mjs` WCAG AA. **메시지 구조(`reference/biz-report.md`)가 디자인보다 먼저다.** 형식별 구현은 각 reference에.

## No-fabrication (문서에서 특히)

라이브러리·변환 도구 부재나 렌더 실패 -> **문서화된 placeholder + `doc-claims.md`의 `[substitution]`**, 절대 "생성됨"으로 위조하지 않는다. 변환 미지원 경로는 원본 + 수동 변환 안내를 남긴다. 동작을 직접 보지 못한 경로를 "동작함"으로 쓰지 않는다. 보고서의 모든 수치/날짜/통계는 `facts.json` 출처 또는 삭제 - integrity-gate가 막는다.
