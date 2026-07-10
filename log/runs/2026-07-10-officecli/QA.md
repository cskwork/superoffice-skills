# QA - superoffice OfficeCLI 통합 + 문서 생성·평가

All testing results as succinct plain-language checklist sentences. Evidence lives in `qa/`.

- Verdict: PASS

## Before

- [x] OfficeCLI 미설치 상태 확인 - `which officecli` -> "officecli not found" (설치 전 출력)
- [x] 스킬에 시각 검증 단계 부재 확인 - `grep -ril "officecli|screenshot|렌더 검증" SKILL.md reference/ agents/ templates/` -> 0건
- [x] 계약 테스트 기준선 green - reference-links 2/2, gate-data 7/7

## Results

- [x] OfficeCLI 1.0.135 brew 설치, `officecli --version` 확인
- [x] 스모크 실측 완료(qa/smoke-report.md): docx/pptx/xlsx 한국어 create+render+validate PASS, view issues overflow 정밀 검출, merge {{key}} 치환 PASS, PDF/hwpx 플러그인 기본 부재 확인
- [x] d1 결정: python 정밀 빌더 유지 + OfficeCLI = 렌더 검증기/merge/읽기 보조 (A/B 렌더 품질 동일 실측, qa/smoke/ab-*.png)
- [x] 스킬 배선 12개 파일(+125/-9 시점), 계약 테스트 green, korean-gate 10파일 PASS - 빌더 보고
- [x] 대표 문서 3종 생산: weekly-report.docx / q2-results.pptx(5장) / kpi-dashboard.xlsx - 각 vault에 office-gate 전체 green
- [x] producer 마찰 8건 -> 환류 1차(레퍼런스 4파일) 반영, 계약 테스트+korean-gate green - 빌더 보고
- [x] 독립 doc-critic 검수: docx SHIP / pptx FIX-HIGH / xlsx FIX-MED + 스킬 제안 3건
- [x] pptx FIX-HIGH 3건 수정 후 재검증 green(게이트 4종 + validate/issues 0건 + PNG 육안) - producer 보고
- [x] critic 제안 3건 환류 2차(biz-report/doc-critic/office/docx) 반영, 계약 테스트+korean-gate green - 빌더 보고
- [x] xlsx FIX-MED 수정 완료: 대시보드 시트 첫 배치 -> 렌더 확보, 육안에서 차트-합계행 겹침 실결함 추가 발견·수정(앵커 A11->A15), doc-claims 갱신 - producer 보고
- [x] Mandatory Adversarial Review: CRITICAL 0 / HIGH 2 / MED 5 / LOW 4 - 전부 수정 또는 문서화(H1 weekly 재추출+게이트 green, H2 kpi doc-claims 갱신, M1/M5 실측 정정, M2 exit code 전파+실증, M3 [U1] 기록, M4 qa/doc-critic-report.md+doc-eval-records.md 작성, L2/L3/L4 배선·완화·문서화, L1 changelog/Z/GOAL 완결)
- [x] exit code 계약 재측정(파이프 오염 정정): validate 클린 0/발견 1/호출실패 1, issues 항상 0 - doc-env.py·xlsx.md 정합, 3경로 실행 실증
- [x] 최종 Exact Verify (conductor 직접): 계약 2/2+7/7, office-gate 3종 PREFLIGHT PASS, korean-gate 편집 11파일 PASS, py_compile OK

Backward-trace: clean (이번 런 편집은 전부 GOAL SC1-SC9 또는 리뷰 findings로 소급됨, 무관 리팩터링 0 - 적대 리뷰 "스코프 초과 없음" 판정)

## Commands

| Command | Source | Proves |
|---|---|---|
| bash tests/reference-links-contract.test.sh | frozen_repo | reference 링크 정합 |
| bash tests/gate-data-contract.test.sh | frozen_repo | 게이트 데이터 계약 |
| bash templates/office-gate.sh <vault> <files> | frozen_repo | 문서 텍스트 게이트 |
| officecli validate / view screenshot / view issues | evaluator_owned | 렌더·스키마 검증 |

## Reproduction Fidelity

- Fidelity level: synthetic-representative (가상 회사 시나리오 문서, 실무 대표 형식 3종)
- Residual risk from data gap: 실제 회사 브랜드킷/양식 파일 미사용 - 브랜드 상속 경로는 이번 런에서 미검증
- Post-deploy confirmation plan: 실제 업무 문서 요청에서 브랜드 상속 + hwpx 경로 확인

## Residual Risk

- Not proven: hwpx 문서 생산 경로(이번 런 4종째 미생산 - d3, 해당 경로 무변경), 회사 브랜드킷 상속(가상 시나리오라 공통 팔레트만 사용), Windows에서의 officecli 동작(macOS만 실측 - 문서에는 officecli 자체 안내로 귀속), xlsx 비-첫 시트의 차트/조건부서식 시각 렌더(officecli 시트 선택 한계 - 완화책 문서화됨).
- Follow-up: 실제 업무 문서 요청에서 브랜드킷 상속 + hwpx 경로 확인; officecli PDF/hwpx 플러그인 생태계 성숙 시 재평가.
