# PLAN - superoffice 스킬 개선: OfficeCLI 통합 + 문서 생성·평가 루프

Frozen plan. Fresh-context implementer는 이 파일(+재진입 시 최신 R-LOOP.md 섹션)만 읽고 빌드한다.

## Approval

- Status: auto-approved
- Record: 2026-07-10; autonomous run (사용자 비관전 세션, 원 요청이 계획+실행 전체를 위임): auto-approved

## Intent

- Goal: superoffice 스킬을 팀장·경영자용 문서 메이커로 개선. 핵심 공백 = 시각 검증(현 게이트는 텍스트만 검사, 렌더된 문서를 아무도 못 봄). OfficeCLI의 headless 렌더(view screenshot)·issues(overflow)·validate(OpenXML)로 이 공백을 메우고, 실제 문서 3종을 생성·평가해 스킬을 환류 개선.
- Constraints: 스킬의 기존 원칙 유지(위조 금지, 결정론 게이트, 역할 분리, cross-platform, 도구 부재 시 폴백). 최소 diff - 기존 python 빌더 스택 문서는 재작성하지 않고 확장.
- Tradeoffs: OfficeCLI를 기본 빌더로 전면 교체하면 검증된 python 레퍼런스(실측 API 문서)를 버리는 큰 위험; 반대로 비채택이면 시각 검증 공백이 남음. 중간 = 검증·변환 레이어 채택.
- Rejected approaches: (1) LibreOffice soffice 렌더로 시각 검증 - 이미 변환용으로 있지만 렌더 충실도·slide별 PNG·issues 검출이 없음. (2) MCP 서버로 OfficeCLI 연결 - 스킬은 CLI 직접 호출이 단순하고 서브에이전트 친화적. (3) 전면 빌더 교체 - A/B 증거 없이는 금지(d1 게이트).
- Completion promise: promised outcome = OfficeCLI 역할이 결정·배선된 스킬 + 게이트/시각검증 통과한 대표 문서 3종 + 환류 개선 1건 이상; required proof = officecli 명령 출력, office-gate green 출력, PNG 육안 확인, 계약 테스트 green; stop condition = GOAL.md SC1-SC9 전부 체크 또는 max_iterations 도달; max_iterations: 8

## Steps

1. **스모크 (conductor, 증거 수집).** vault `qa/`에 기록. 한국어 텍스트로: `officecli create smoke.docx` + 문단 추가 + `view smoke.docx screenshot`, 같은 방식 pptx(제목+본문 슬라이드)·xlsx(셀+수식). `validate`, `view issues`, `merge`(플레이스홀더 docx) 실행. PNG를 Read로 육안 확인 - 한글 폰트 렌더 품질이 판정 기준. 실패 시 그대로 기록(위조 금지).
2. **d1 결정.** 스모크 + (빌더 후보성 판단 위해) 동일 스펙 미니 슬라이드 1장을 python-pptx vs officecli로 만들어 비교. 결정 기준: 한글 렌더 품질, 정밀 좌표 제어, 스크립트 복잡도, 오류 처리. 결정과 근거를 GOAL.md d1에 기록.
3. **스킬 배선 (builder subagent).** 결정된 역할 기준 기본안(검증·변환 레이어 채택 시):
   - `templates/doc-env.py`: `find_officecli()` + `officecli_render(file, out_png)` / `officecli_validate(file)` 헬퍼 (부재 시 None/명시적 미지원 반환 - 위조 금지). `doc-env.sh`에 서브커맨드 패스스루.
   - `reference/office.md`: 환경 섹션에 OfficeCLI(선택 의존성, brew/npm 설치법) + "렌더 검증" 단계 문서화.
   - `reference/docx.md`/`pptx.md`/`xlsx.md`: 각 빌드 섹션 끝에 "렌더 검증(officecli view screenshot/issues/validate)" 서브섹션 추가 - 있으면 필수, 없으면 폴백(placeholder 금지, 텍스트 게이트만으로 통과 + 미검증 명시).
   - `agents/doc-critic.md`: 시각 검수 패스 추가(렌더 PNG를 보고 overflow/겹침/폰트 깨짐/여백 판단, `view issues` 출력 포함).
   - `SKILL.md`: Default loop 4(Critique)에 시각 검증 한 줄, Final checklist에 렌더 검증 항목, 환경 표기.
   - `reference/sources.md`: OfficeCLI 항목(Apache-2.0, URL).
4. **문서 생산 x3 (skill 자체 루프로; producer subagent per doc).** `.superoffice/<doc>/` vault로: (a) 주간 현황보고 .docx, (b) 분기 실적 보고 .pptx 16:9, (c) KPI 대시보드 .xlsx. 소재는 가상의 회사 시나리오를 스스로 선언하고 모든 수치를 facts.json에 출처("시나리오 가정")로 명시 - integrity 게이트 통과 + 위조 아님(가정임이 문서 내 명시 불필요, vault에 기록). 각 producer는 개정된 reference를 따르고 officecli 렌더 검증까지 수행.
5. **평가 (doc-critic subagent per doc).** office-gate.sh 실행 + 렌더 PNG 육안 + view issues + biz-report 기준(BLUF/action title) 판정. HIGH 위반은 수정 루프(cap 3).
6. **환류.** critic/스모크에서 드러난 스킬 결함(레퍼런스 누락, 게이트 빈틈, 안내 오류) ≥1건을 스킬 파일에 반영, 해당 문서 재평가.
7. **최종 검증 + changelog.** tests/ 2종 실행, log/changelog-2026-07-10.md 작성(결정·기각 대안·실측 증거), GOAL.md 체크, Z-2026-07-10.md.

## Tools & Skills

- officecli (brew 설치됨), python3 venv + python-docx/python-pptx/openpyxl (스모크 시 설치), bash templates/office-gate.sh, bash tests/*.sh
- superoffice 스킬 reference/agents (producer/critic 페르소나), supergoal role-loop

## Verification strategy

- Before proof: `officecli not found` (설치 전 출력, 기록됨); 현 스킬에 시각 검증 단계 부재(SKILL.md/office.md/doc-critic.md에 렌더·screenshot·officecli 언급 0 - grep으로 확인 예정); tests/ 2종은 현재 green이어야 함(기준선).
- Step -> criterion: 1->SC1,SC2; 2->SC3(d1); 3->SC4; 4->SC5; 5->SC6; 6->SC7; 7->SC8,SC9
- Trusted commands (frozen_repo): `bash tests/reference-links-contract.test.sh`, `bash tests/gate-data-contract.test.sh`, `bash templates/office-gate.sh <vault> <files>`. (evaluator_owned): `officecli validate/view/merge ...`, PNG Read 육안.

## Grounding ledger

- OfficeCLI 능력? -> GitHub README 실측 요약(2회 fetch): view screenshot/html/pdf, validate(OpenXML), view issues(overflow/alt/formula), merge({{key}}), 플러그인으로 .doc/.hwpx/pdf, MCP, Apache-2.0, brew formula 1.0.129 존재 -> 스모크로 실검증 후 채택 결정
- 설치 방식? -> brew (dotnet 의존) 완료; npm 폴백 d2
- 현 스킬 구조? -> SKILL.md/office.md/changelog 읽음: python 정밀 스택 + office-gate(text-only) + 역할 분리 루프; 시각 검증 공백 확인
- 문서 소재의 수치 출처? -> 가상 시나리오 선언 + facts.json에 "시나리오 가정" 출처 - integrity 게이트 규약 준수, 위조 금지 원칙과 충돌 없음 (게이트가 요구하는 건 출처 선언)
