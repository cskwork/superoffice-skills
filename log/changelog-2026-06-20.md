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

## 추가 (같은 날) - 형식 예시 + 회사 양식 분석

사용자 피드백 두 건 반영:

- **형식 따라하기**: 하우스 골든 견본 `examples/format/`(status-report·proposal·exec-summary, biz-report 구조를 자리표시로 채운 형식 모델) + `reference/examples.md`(견본 또는 사용자 제공 예시/회사 양식의 구조·톤을 모방하되 내용은 새로, verbatim 복제·위조 금지). doc-producer·xlsx-producer가 이를 따른다.
- **회사 양식 = 브랜드 + 형식 이중 소스**: 회사 자체 양식이 있으면 그 파일 분석이 브랜드 1순위(상호작용 - 추출→사용자 확인·수정→저장), 그 양식의 레이아웃·섹션 구조는 형식 예시로도 쓴다(`format_skeleton`). 양식이 없을 때만 인터뷰/하우스 기본. brand-kit.md·brand-interviewer.md 강화.
- 결정(기각한 대안): 견본을 렌더된 바이너리로 넣지 않고 텍스트 `.md` 형식 모델로 - 게이트 검사 가능 + 형식 무관(어느 산출 형식으로도 렌더) + diff 친화.
- 검증: reference-links 2/2(SKILL.md→examples.md), 견본 3종 safety+korean 게이트 PASS(이모지 없음·어절 띄어쓰기), examples.md가 SKILL/office/brand-kit/3 에이전트/README에서 일관 참조.

## 추가 (같은 날) - 마크다운 변환 + 한글 띄어쓰기 게이트 강화

- **마크다운 변환**: `reference/markdown.md`(MD <-> docx/pptx/pdf/hwpx, office->MD 추출). `doc-env.py`에 `find_pandoc`/`pandoc_convert` 추가 - pandoc 1순위, MD->PDF는 `chrome_to_pdf`(HTML 경유) 폴백, python `markdown`은 옵션. 부재 시 placeholder + 안내(위조 금지). SKILL.md CONVERT 모드 + office.md 와이어링. 실측(Python 3.10 + 설치된 pandoc): MD->docx 11KB, MD->HTML->Chrome PDF 34KB, docx->MD 라운드트립, .md 소스 office-gate PASS.
- **한글 띄어쓰기 진단**: korean-gate는 의도적 고신뢰 floor라 spacing 규칙이 4개(것/수/척/체 의존명사)뿐 - 완전한 띄어쓰기는 문맥 의존적이라 형태소 분석기 없이는 오탐 위험, LLM 생성 + doc-critic 판단이 담당. korean-rules.json에 안전한 의존명사 규칙 4종 추가(-ㄹ 것/만큼/줄/리). 실측: 오류 4종 정확 발동, 견본·reference 15파일 오탐 0. 랜딩 페이지의 게이트 데모 줄(일부러 "할수있다" 오류 예시)은 `gate-ok` HTML 주석으로 억제.
- superdesign-skill 평가(요청): SKILL.md·구조 성숙·최신(anti-slop 게이트, playwright 렌더 검증, per-mode contracts). `.gitignore`가 작업 디렉토리 제외, 활발한 유지보수. `grep.exe.stackdump`는 untracked(커밋 안 됨). 개선 시급성 낮음 - 수정은 보류(별도 레포, 동의 필요).

## 추가 (같은 날) - 리뷰·검증 패스 + 개선

독립 critic 2명(기술 정확성, 개선/한국어 품질) + 전체 검증 후 적용. CRITICAL 0건.

- **정확성 수정**: pptx.md 팔레트 ink/bg를 정규값(`#1F2933`/`#F3F5F7`)으로 통일(다른 형식과의 드리프트 제거 - doc-critic이 막아야 할 종류를 reference가 심던 문제); xlsx.md `soffice-convert` -> `soffice_convert`(doc-env.sh 서브커맨드 철자 불일치, exit 2 버그); sources.md 헤더 한국어화(11개 reference 중 유일한 영어); brand-kit.md의 cross-repo `interview.md` 경로를 인라인 패턴으로(로컬 broken-link처럼 보이던 것).
- **정체성 정리**: 포팅된 게이트의 교육/아동 프레이밍 제거 - 억제 토큰 `edu-ok` -> `gate-ok`(전 파일), safety/korean/integrity-gate 헤더를 업무 문서용으로 정정(child-safety/grade band/edu-critic 제거). hwpx.md가 실측이라 주장한 메서드 28종 + 모듈 헬퍼 6종을 설치된 python-hwpx 2.11.1로 전수 확인 - 전부 실재(환각 0).
- **완성도 개선**: `examples/format/minutes.md`(회의록 견본 - 결정·액션 우선) 추가; docx.md에 결재 문서(품의서·기안문)·목차/페이지번호/머리말 섹션; biz-report.md에 문체 일관 규칙(개조식 본문 + 격식 ask)·차트 콤보(이중축)/워터폴·전송 이메일 커버. 견본 ask 문장 격식화("요청드립니다")로 문체 통일.
- 검증: contract 2/2 + 7/7, cross-ref 0 missing, korean-gate 전 파일 PASS, gate-ok 억제 동작 확인.
- 미적용(낮은 우선순위/별도 동의): xlsx openpyxl 이중축 콤보 코드 스니펫, doc-env.sh `pandoc` 패스스루(.py 직접 호출은 동작), requirements.txt 버전 핀.
