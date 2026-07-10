# 2026-07-10 - OfficeCLI 렌더 검증 통합 + 실전 평가 런 환류

## What

스킬의 최대 공백이던 **시각 검증**(office-gate는 텍스트만 검사, 렌더된 문서를 아무도 보지 않음 - grep 실측 관련 언급 0건)을 OfficeCLI 1.0.135(Apache-2.0, brew)로 메움. 이어 스킬 자체 루프로 대표 문서 3종(주간보고 docx / 분기 실적 pptx 5장 / KPI 대시보드 xlsx)을 실제 생산-검수-수정하는 평가 런을 돌려, 거기서 드러난 공백 12건+를 레퍼런스/에이전트에 환류. 런 증거: `log/runs/2026-07-10-officecli/`.

## 아키텍처 결정 (선택 + 기각한 대안)

- **OfficeCLI = 표준 렌더 검증기 + merge + 읽기·퀵빌드 보조, python 스택 = 기본 정밀 빌더 유지** (선택) vs 기본 빌더 전면 교체(기각) vs 비채택(기각). 스모크 실측(`log/runs/.../qa/smoke-report.md`): 한국어 렌더 무결(docx/pptx/xlsx PNG), `view issues`가 overflow를 줄수·필요치·suggest.height까지 정밀 보고, `validate`(OpenXML), `merge --data`({{key}} 치환·한글 유지). 동일 스펙 슬라이드 A/B에서 렌더 품질 동등 - 그러나 PDF 내보내기·hwpx가 플러그인 기본 미설치로 불가하고, 실측된 python reference 자산(차트·조건부서식·스타일 생성·템플릿 상속)과 brand-kit 상속 경로를 대체할 수 없어 빌더 교체는 기각. 단순 1~2문단 문서 퀵빌드 옵션으로는 허용.
- **렌더 검증은 절차+doc-env 헬퍼로, 새 게이트 스크립트는 만들지 않음** (선택): office-gate.sh 결정론 트랙은 불변. `doc-env.py`에 `officecli-render/validate/issues` 서브커맨드(부재 시 명시 실패 - 위조 금지 유지), 공통 절차는 office.md "렌더 검증"이 정본이고 형식 reference는 고유 주의점만.
- **LibreOffice 렌더로 시각 검증** (기각): slide별 PNG·issues 검출·페이지 grid가 없음. **MCP 서버 연결** (기각): 서브에이전트에는 CLI 직접 호출이 단순.

## 평가 런이 발견해 환류한 것 (전부 실측)

- docx: 기본 스타일 간격만으로 "A4 1페이지"가 조용히 2페이지로 넘침 -> 콤팩트 레시피 + `--grid`(1타일=1페이지) 페이지 수 확인법 문서화. 헤더/푸터가 추출 텍스트에서 빠지면 게이트를 우회 -> section.header/.footer 포함 규칙.
- pptx: python-pptx 기본 템플릿의 잔여 Date/Footer/SlideNumber가 **layout과 master 양쪽**에 있어 layout만 지우면 렌더에 잔존("1/27/13") - validate/issues 둘 다 클린이어도 검출 안 됨 -> PNG 육안 필수 + 완전 제거법. `screenshot --page`는 페이지별 개별 호출.
- xlsx: officecli screenshot은 첫 시트만 캡처(시트 선택 불가) -> 육안 중요 시트를 첫 시트로 + `view text --range`로 수식 평가값 검증. openpyxl 수식 캐시 미저장 -> LibreOffice 라운드트립(validate에 비치명 오류 5건 유발, 셀 무영향) vs officecli 자체 평가. 렌더 육안이 차트가 합계 행을 덮는 실결함도 검출(앵커 수정).
- 메시지 품질(독립 doc-critic 검수): action title 정성적 과대선언("전 항목 목표 상회" - 목표 근거는 매출뿐)이 숫자만 보는 integrity-gate를 통과 -> biz-report.md에 vertical-logic 규칙(단정어는 주어별 facts 근거 필수). ask 정중체("요청드립니다")를 형식-공통 규칙로 명시, 괄호형 작성 지침 라벨("(ask 먼저)") 산출물 노출 금지. doc-critic에 "핵심 산출물 렌더 증거 전무 시 SHIP 금지" 판정 규칙 승격.
- exit code 계약(재측정으로 정정): `validate`는 클린 0/오류 발견 1/호출 실패 1, `view issues`는 발견 유무 무관 0. 최초 측정이 파이프(`| tail`) 때문에 tail의 exit를 읽은 오류였음 - doc-env.py는 발견 보고를 근거로 반환하고 호출 실패만 실패 처리. `merge`는 resident를 만들지 않고 즉시 저장(문서 정정), `set`은 resident 유지(실측 확인).

## 검증 (증거)

- 계약 테스트 2/2 + 7/7, 이번 런 편집 .md 11파일 korean-gate PASS, `py_compile` OK - 최종 상태를 conductor가 직접 재실행.
- 문서 3종 office-gate 전체 green(safety/korean/integrity/contrast), 렌더 PNG 육안, validate/issues 기록 - 이력 `log/runs/.../qa/doc-eval-records.md`, 수정 전 검수 원문 `qa/doc-critic-report.md`.
- 독립 적대 리뷰: CRITICAL 0, HIGH 2(증거층 - weekly 추출 헤더 누락, kpi doc-claims 낡음)는 수정 완료, MED 5·LOW 4 전부 처리(M2 exit code 전파, M1/M5 실측 정정, L2/L3/L4 문서화).
- 미해결(잔여 리스크): hwpx 4종째 문서는 미생산(시간 여력 - d3 게이트, hwpx 경로는 기존 그대로), 회사 브랜드킷 상속 경로는 이번 런 미검증, Windows에서의 officecli 동작은 미실측(문서에는 officecli 자체 안내로 귀속).

## 추가 (2026-07-11) - hwpx 공문 4종째 + 랜딩 동기화

- **hwpx 공문 생산·검수**: 협력사 시스템 점검 안내 공문을 python-hwpx 2.24.0으로 생산. 렌더는 officecli hwpx 플러그인 부재로 불가 -> 대체 검증 3종 실제 실행(OWPML validate ok / 라운드트립 텍스트 일치 / 공문 구조 린트 11규칙 score 1.0), "렌더 미검증"을 doc-claims에 명시(critic: residual 처리 "4종 중 모범"). critic MINOR(목적격조사 중첩) 수정 후 전 체인 재실행 green. 잔여: 발송 전 한글 뷰어 육안 1회.
- **hwpx 환류 4건**: hwpx.md 버전 표기(2.11.1 실측 -> 2.24.0 재확인, API 시그니처 전부 일치), `inspect_official_document_style` 문서화(호출 예·11규칙·공개구분 하드 요구 - 소스를 읽어야만 알 수 있던 함정), fallback stdout 안내 주의, **공문 하우스 견본 신설**(examples/format/official-notice.md - 린트 1.0 산출물 구조를 자리표시로 일반화, SKILL/hwpx.md가 공문을 대표 사례로 쓰면서 견본이 없던 공백).
- **doc-claims 템플릿 표준화**(critic 보강 제안): 렌더 검증 메모 블록(상태/도구 부재 실측/대체 검증/잔여 시각 항목/파일명-내용 일치)과 run-to-prove 렌더 단계를 templates/doc-claims.md에 - 미검증 residual 처리 품질이 문서마다 제각각이던 문제를 vault 시작점에서 통일. 셀 덤프 .csv -> .md/.txt 주의도 템플릿에 반영.
- **랜딩 동기화**: docs/index.html KO/EN 각 4곳(검증 카드·게이트 체크 그리드에 렌더 검증 추가·Critique 단계·라이브러리 목록)에 OfficeCLI 렌더 검증 반영.
- doc-env.py `officecli-validate` exit code 계약 정정 상세는 위 "평가 런이 발견해 환류한 것" 참조.

## Attribution

iOfficeAI/OfficeCLI(Apache-2.0, 실측 1.0.135 - sources.md 등재), supergoal(LEGACY 런 격리·adversarial review·환류 루프), 평가 시나리오는 가상 기업 데이터(facts.json에 출처 선언).
