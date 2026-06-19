[English](README.md) | **한국어**

# superoffice

한국 직장인(특히 팀장·경영자)의 업무 문서를 만드는 Claude Code 스킬. 브리프를 읽고, 형식을 판별하고, 회사 브랜드를 입히고, 결론 먼저(BLUF) 메시지 구조로, 결정론적 `office-gate`를 통과하는 보고서·제안서·발표 덱·정산표·대시보드를 산출한다. `.docx` `.pptx` `.xlsx` `.hwpx` `.pdf`를 생성·읽기·변환하며 Windows/macOS에서 동일하게 동작한다. 교육 자료를 만드는 자매 스킬 [supercontent](https://github.com/cskwork/supercontent-skill)의 업무 문서 버전이다.

랜딩 페이지: https://cskwork.github.io/superoffice-skills

## 일반 문서 프롬프트보다 더하는 것

- **결론 먼저, 디자인은 그다음.** 팀장·경영자는 60초 안에 권고를 이해해야 한다. action title(제목이 결론), 한장보고, SCQA 임원 요약, RAG 상태판 - 메시지 구조(`reference/biz-report.md`)를 디자인보다 먼저 적용한다.
- **회사 브랜드 반영.** 회사 템플릿 파일 상속(`Presentation("회사.pptx")`)과 brand-kit.json 인터뷰(색/폰트/로고/정책)를 둘 다 지원한다. 한 번 캡처하면 모든 형식·문서에 일관 적용되고, 회사 색도 WCAG AA 대비를 지킨다(`reference/brand-kit.md`). 회사 자체 양식이 있으면 그 파일을 분석해 사용자와 상호작용으로 브랜드를 확정한다(양식 있을 때만).
- **형식 따라하기.** 하우스 골든 견본(상태보고·제안서·임원요약)과 사용자가 준 예시 문서·회사 양식의 구조를 따라 일관된 사내 포맷으로 생성한다. 구조·톤은 모방하되 내용은 새로 쓰고 위조하지 않는다(`reference/examples.md`).
- **형식 판별 라우팅.** 작업을 docx/pptx/xlsx/hwpx/pdf + 읽기/변환 모드로 분류해 맞는 라이브러리와 디자인으로 보낸다. 하나의 기본 템플릿이 아니다.
- **검증은 눈대중이 아니다.** 결정론적 게이트(`templates/office-gate.sh`)가 산출물의 텍스트 근거를 스캔한다 - 맞춤법·띄어쓰기, 사실 무결성(출처), 이모지/PII, 색 대비. Builder는 자기 승인하지 않고, 독립 critic이 게이트를 돌린다.
- **절대 위조하지 않는다.** 없는 수치·날짜·통계는 `facts.json` 출처 또는 삭제. 라이브러리/변환 도구 부재는 문서화된 placeholder를 남기고 절대 가짜 파일을 만들지 않는다.
- **한글 1급 + 협업 안전.** .hwpx 생성·편집·읽기·검증·변환을 cross-platform 지원. 이모지 금지(대괄호 마커), 어절 띄어쓰기·맞춤법, 범용 한글 폰트.

## 모드

형식+작업을 한 줄로 선언하고 시작한다. 예: `Making this as: PPTX 1분기 실적 보고 덱, 회사 브랜드, 16:9, 12장`.

| Mode | For |
|---|---|
| DOCX | 보고서 / 제안서 / 기안 / 공문 본문 |
| PPTX | 발표 덱 / 보고 슬라이드 / 정밀 표·도형 |
| XLSX | 정산 / KPI / 대시보드 / 표·수식·차트 |
| HWPX | 한글 공문서 / 공공·기업 표준 |
| PDF | 다페이지 본문 PDF 생성 / PDF 읽기·표 추출 |
| READ | 기존 문서(docx·pptx·xlsx·pdf·hwpx) 읽기·표 추출 |
| CONVERT | 형식 변환 (hwpx<->docx<->pdf<->xlsx) |

오버레이: **BRAND**(회사 템플릿/스타일, 어느 빌드 모드든) + **메시지 구조**(보고서·덱이면 항상).

## 기본 루프 - 역할 분리, 서브에이전트 기본

1. **Read** 브리프 - 형식/대상/목적/분량/변환 타깃을 추론, 한 줄 선언.
2. **Brand** (오버레이) - 회사 템플릿 상속 또는 brand-interviewer가 ≤5 질문으로 brand-kit.json 캡처, `.superoffice/brand-kit.json`에 저장·재사용.
3. **Build** - docx/pptx/pdf/hwpx는 doc-producer, xlsx는 xlsx-producer. 메시지 구조 + 디자인 팔레트, 실제 자산만.
4. **Critique** (독립) - doc-critic이 본문/셀을 텍스트로 enumerate, `office-gate.sh` 실행, 스크립트가 못 보는 것 판정.
5. **Verify** - 위반마다 최소 수정, green까지 재실행, 명령 출력으로 보고. Cap 3 사이클.

**Vault**는 문서당 작업 디렉토리(기본 `.superoffice/<doc>/`): `doc-claims.md`, `facts.json`, 선택 `contrast-pairs.json`/`brand-kit.json`. No vault, no gate.

## 빠른 시작

```
/superoffice "1분기 실적 보고서 docx로"
/superoffice "신규 사업 제안 발표 덱, 회사 템플릿으로"     # PPTX + BRAND
/superoffice "월 정산 KPI 대시보드 엑셀로"                 # XLSX
/superoffice "협조 공문 hwpx로"                            # HWPX
/superoffice "이 제안서 pdf로 변환"                        # CONVERT
/superoffice "받은 정산표 xlsx 표 추출해줘"                # READ
```

## office-gate

```bash
# 업무 문서 vault에 대한 전체 게이트 (safety + korean + integrity + contrast)
bash templates/office-gate.sh .superoffice/<doc> path/to/body.txt
```

순서대로: `safety-gate.mjs`(이모지/PII/insecure-link, band 없음), `korean-gate.mjs`(맞춤법·띄어쓰기), `integrity-gate.mjs <facts.json>`(출처 있는 사실), `contrast-gate.mjs`(색을 declare했을 때 WCAG AA). 바이너리 문서는 본문/셀을 텍스트로 추출해 검사한다 - 게이트는 텍스트만 스캔한다.

## 하우스 규칙 (게이트가 강제)

- 이모지 금지. 대괄호 마커 사용: `[현황]`, `[조치]`, `[결론]`.
- 엄격한 CommonMark 간격: 문단·제목·리스트 사이 빈 줄.
- 사실·자산을 위조하지 않는다. 수치·날짜는 `facts.json` 출처. 색은 contrast AA.
- cross-platform 경로·폰트는 `templates/doc-env.py`에 위임(협업은 범용 폰트).

## 회사 브랜드

회사별 스타일을 두 방식으로 입힌다 - 둘 다 지원: (1) 회사 템플릿 파일 상속, (2) brand-kit.json 인터뷰(색/폰트/로고/정책 한 번 캡처 -> 모든 형식 재사용). 상세는 `reference/brand-kit.md`, 예시 스키마는 `templates/brand-kit.example.json`.

## Attribution

문서 craft·게이트·팔레트 패턴은 [supercontent](https://github.com/cskwork/supercontent-skill), 스킬 제작·서브에이전트·인터뷰 패턴은 [supergoal](https://github.com/cskwork/supergoal-skill)에서 가져왔다. 트렌딩 오피스 스킬 패턴은 anthropics/skills를 참고했다. 라이브러리: python-docx, python-pptx, openpyxl, XlsxWriter, pdfplumber, pypdf, python-hwpx, WeasyPrint, ReportLab, LibreOffice + H2Orestart. 전체 attribution + 라이선스는 `reference/sources.md`.

## 현재성

현재 연도 2026 기준. 핵심 라이브러리는 전부 순수 Python(MIT/BSD/Apache)이라 OS 종속이 없고, 한글 폰트·변환 도구의 OS 분기만 `templates/doc-env.py`/`doc-env.sh`에 집약돼 있다.
