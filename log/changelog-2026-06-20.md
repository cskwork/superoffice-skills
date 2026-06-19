# 2026-06-20 - superoffice-skills 초기 빌드

## What

한국 직장인(팀장·경영자)의 업무 문서를 만드는 `/superoffice` 라우터 스킬 레포를 신규 생성. docx/pptx/xlsx/hwpx/pdf 생성·읽기·변환 + 회사 브랜드 적용 + 결정론적 `office-gate` 검증. supercontent(교육 콘텐츠)의 업무 문서 자매 스킬.

## 아키텍처 결정 (선택 + 기각한 대안)

- **단일 `/superoffice` 라우터** (선택) vs 형식별 개별 스킬(기각). 개별 스킬은 env/게이트/brand-kit 로직이 4중 중복되고 유지보수 포인트가 늘어난다. 라우터 하나가 형식 모드를 분기하고 공용 자산을 한 곳에서 공유 - supercontent에서 검증된 패턴.
- **회사 브랜드는 두 방식 모두** (선택): 템플릿 파일 상속(`Presentation("회사.pptx")`) + brand-kit.json 인터뷰(색/폰트/로고/정책). 인터뷰만/상속만보다 강력 - 양식 파일에서 추출 가능한 건 추출하고 나머지만 ≤5 질문(supergoal 인터뷰 규율).
- **업무 전용 단일 게이트 트랙** (선택): supercontent의 edu/doc 2트랙 분기를 제거. 이 레포는 성인 업무 문서뿐이라 curriculum/read-level 게이트가 부적합. `office-gate.sh` = safety+korean+integrity+contrast.
- **검증된 자산은 byte-for-byte 포팅** (선택) vs 에이전트 재작성(기각). doc-env.py/sh와 4개 게이트(korean/safety/integrity/contrast)·게이트 시드(korean-rules.json/forbidden-topics.json)는 supercontent에서 실측된 코드라 `cp`로 정확히 복사 - 에이전트 재작성은 전사 오류 위험.
- **신규 craft는 워크플로우 병렬 저작** (선택): 리서치(anthropics/skills + Excel 라이브러리) 2 + 저작 13 에이전트. 측정 API는 fidelity-lock으로 verbatim 보존, xlsx/brand-kit만 리서치 반영 신규 작성. 스파인(SKILL.md/office.md/README)은 conductor가 직접 작성해 정합 보장.
- **PyMuPDF(AGPL) 비채택** (기각): 상업 통합 시 소스공개 전염. pypdf(BSD)/pdfplumber(MIT)로 충분.

## Net-new (supercontent 대비 추가)

- `reference/xlsx.md` - Excel craft (openpyxl 기본 + XlsxWriter/pandas). supercontent에 없던 형식.
- `reference/brand-kit.md` + `templates/brand-kit.example.json` - 회사 템플릿/스타일 인터뷰·적용(레포 차별점).
- `agents/xlsx-producer.md` / `brand-interviewer.md` / `doc-critic.md` - Excel 빌더·브랜드 인터뷰·독립 검수 페르소나.

## 검증 (증거)

- reference-links 계약 2/2, gate-data 계약 7/7 통과.
- `office-gate.sh` 기능 검증: clean vault PASS, 이모지/미출처 수치 주입 시 정확히 FAIL, facts.json 출처 선언 시 PASS.
- 생성 스모크(venv): **openpyxl 3.1.5** - xlsx.md의 CellIsRule/Table/BarChart/freeze_panes/DataValidation/number_format/read_only·data_only 전부 동작(kpi.xlsx 생성). **python-docx 1.2.0** - add_heading/Table Grid/w:shd 셀 음영/w:eastAsia 동작(report.docx 생성). 문서화 버전과 일치 - API 환각 없음.
- 통합 검증 중 수정: doc-claims.md를 업무 전용/office-gate로 재작성(포팅 verbatim의 edu dials/doc-gate 잔재 제거), sources.md의 잘못된 URL 2건 수정(openpyxl는 github 아닌 Heptapod·readthedocs, ReportLab github 레포 404→reportlab.com), anthropics/skills의 미검증 구현 주장(JS 라이브러리) 완화, brand-interviewer 폰트 스키마를 정식 brand-kit 스키마(ko/latin)에 일치, xlsx.md "집값"→"하우스" 오타.

## Attribution

supercontent(문서 craft·게이트·팔레트), supergoal(스킬 제작·서브에이전트 vault 공유·인터뷰 패턴), anthropics/skills(트렌딩 오피스 스킬 - 패턴만, 라이브러리는 Python 스택 유지). 상세 `reference/sources.md`.
