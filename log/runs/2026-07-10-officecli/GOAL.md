# GOAL - superoffice 스킬 개선: OfficeCLI 통합 결정 + 대표 문서 생성·평가 루프

Single source of "done". Only the verifier ticks a box; unticking needs regression evidence.

## Original Request

> makie plan to imrprove this skill as a doc maker for managers. research to imrprove this maybe use sth like https://github.com/iOfficeAI/OfficeCLI (install if not installed) to make doc use by default you can use this or not but find best way then supergoal to actual make different docs and evaluate them to make it better

## Spec

superoffice 스킬(팀장·경영자용 업무 문서 메이커)을 개선한다:

1. OfficeCLI(iOfficeAI/OfficeCLI)를 리서치·설치하고 스킬에 필요한 능력(한국어 문서 생성, PNG 렌더, validate, issues, merge, PDF)을 실측한다.
2. 실측 증거로 통합 범위를 결정한다 - "기본 빌더로 교체" vs "검증(렌더/validate/issues)·변환·읽기 레이어로 채택 + python 정밀 빌더 유지" vs "비채택". 애매하면 보수적(후자) 기본.
3. 결정된 역할을 스킬 파일(SKILL.md, reference/office.md, 형식 reference, agents/doc-critic.md, templates/doc-env.*)에 배선한다. OfficeCLI 부재 환경 폴백을 명시한다(위조 금지 원칙 유지).
4. 스킬의 자체 루프로 대표 문서 3종 이상을 실제 생성한다(주간 현황보고 .docx, 분기 실적 .pptx, KPI 대시보드 .xlsx). 각각 office-gate + OfficeCLI 검증 + doc-critic 평가를 통과시킨다.
5. 평가에서 발견된 스킬 결함을 스킬 파일 수정으로 환류하고 재평가한다.
6. 계약 테스트 green + changelog(결정·기각 대안·실측 증거) 기록.

## Success Criteria

각 항목은 반증 가능하며 검증 방법을 명기한다.

- [x] SC1: OfficeCLI 설치되어 `officecli --version`이 버전을 출력 - verified: 1.0.135 (qa/smoke-report.md, QA.md Results)
- [x] SC2: 스모크 실측 완료 - 한국어 create/screenshot/validate/issues/merge 전부 실행·기록, PNG Read 육안 - verified: qa/smoke-report.md + qa/smoke/ 파일 실재
- [x] SC3: 통합 결정이 근거·기각 대안과 함께 changelog에 기록 - verified: log/changelog-2026-07-10.md "아키텍처 결정" 섹션
- [x] SC4: 역할 배선 + 부재 시 폴백 명시 - verified: 배선 diff(SKILL/office/docx/pptx/xlsx/brand-kit/sources/doc-critic/doc-env/README), _OFFICECLI_MISSING 폴백, reference-links 2/2 (conductor 최종 재실행). 퀵빌드 옵션도 office.md에 배선(L2 해소)
- [x] SC5: 대표 문서 3종 생성 + office-gate green - verified: .superoffice/ 3개 vault, conductor 최종 재실행 3종 전부 PREFLIGHT PASS
- [x] SC6: 문서별 평가 기록 - verified: qa/doc-critic-report.md(수정 전 원문) + qa/doc-eval-records.md(이력·최종) + vault 렌더 PNG
- [x] SC7: 환류 1건 이상 + 재평가 통과 - verified: 1차 8건(레퍼런스 4파일) + 2차 4건(critic 제안) + 리뷰 후속(H1/M1/M2/M5/L2-L4); pptx FIX-HIGH 수정 재검증 green, weekly 재추출 재게이트 green
- [x] SC8: 계약 테스트 2종 green - verified: 2/2 + 7/7 (conductor 최종 재실행)
- [x] SC9: changelog 작성 완료 - verified: log/changelog-2026-07-10.md

## Decision Gates

| ID | Action | Status | Finding | Decision |
|---|---|---|---|---|
| d1 | OfficeCLI를 기본 빌더로 교체할지 | resolved | 스모크+A/B 완료(qa/smoke-report.md): 렌더/issues/validate/merge 실측 PASS, PDF·hwpx 플러그인 기본 부재, A/B 품질 동일 | 기본 빌더 유지(python), OfficeCLI = 표준 렌더 검증기 + merge + 읽기 보조 + 단순 문서 퀵 빌드 옵션 |
| d2 | brew 설치 실패/지연 시 npm(@officecli/officecli) 폴백 | resolved | brew 설치 성공(1.0.135) | 폴백 불필요 |
| d3 | hwpx 문서 4종째 생성 여부 | resolved | 후속 지시("finishing rest")로 생산 - 공문 .hwpx, 게이트 green + OWPML validate/라운드트립/공문 린트 1.0, critic FIX-MED(시각층은 도구 부재로 미검증 - 한글 뷰어 육안이 잔여) | 생산 완료, 시각층만 residual. hwpx.md 마찰 4건(버전 표기·공문 린트 문서화·fallback 출력·공문 견본 부재) 환류 |
