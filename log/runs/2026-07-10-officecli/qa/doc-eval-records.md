# 문서별 평가 기록 (SC6 증거, 2026-07-10)

대표 문서 3종의 생산 -> 검수 -> 수정 -> 재검증 이력. 수정 전 검수 원문은 `doc-critic-report.md`, 수치는 각 vault의 facts.json(출처: 가상 시나리오 지정값). 게이트/validate/issues 출력은 각 담당 에이전트가 실행·보고했고, 최종 상태는 conductor가 재실행으로 재확인(아래 "최종 재확인").

## 1. weekly-report.docx (.superoffice/weekly-report/)

- 생산: python-docx, A4 1페이지. 초판이 기본 스타일 간격 때문에 2페이지로 넘침 -> 렌더 검증(`--grid`)이 발견, 스타일 재정의(단일 줄간격+콤팩트 간격+여백 18/15mm)로 수정. 이 함정은 docx.md에 환류됨.
- 게이트: safety/korean/integrity PASS (10 sourced facts)
- 렌더 검증: PNG 육안 - 한글 무결, RAG 표 대비 정상, 1페이지 확인(grid 1타일). `view issues` [U1] { PAGE } 필드 미평가(python-docx 한계, Word에서 열면 채워짐 - 양성, doc-claims 기록). validate 클린.
- doc-critic 판정: SHIP (MINOR 3)
- 적대 리뷰 H1 후속: 추출 텍스트가 헤더 문구 누락 -> section.header/.footer 포함 재추출, 게이트 재실행 green, doc-claims "100% 동일" 주장 정정.

## 2. q2-results.pptx (.superoffice/q2-results-deck/)

- 생산: python-pptx, 16:9 5장(표지/임원요약/지표/리스크/3분기 계획+CTA). 초판에서 python-pptx 기본 템플릿의 layout+master 양쪽 Date/Footer/SlideNumber 플레이스홀더가 렌더에 노출("1/27/13", 페이지번호) -> layout만 삭제로는 재발, master까지 삭제+hf 억제로 해소. pptx.md에 환류됨.
- 게이트: safety/korean/integrity(13 facts)/contrast(9쌍 AA, 최저 5.72) PASS
- 렌더 검증: 슬라이드별 PNG 5장 육안 - 넘침/겹침/플레이스홀더 없음. validate 클린 + issues 0건.
- doc-critic 판정: FIX-HIGH -> 수정 3건: (1) Slide 3 제목 "전 항목 목표 상회" 과대선언 -> "전 지표 전분기 대비 개선, 매출은 목표 대비 102% 달성" 리프레임, (2) "권고 (ask 먼저)" 지침 라벨 제거, (3) ask 정중체("승인을 요청드립니다"). 재빌드 후 게이트 4종 + validate/issues + PNG 육안 전부 재검증 green. 규칙은 biz-report.md/doc-critic.md에 환류됨.

## 3. kpi-dashboard.xlsx (.superoffice/kpi-dashboard/)

- 생산: openpyxl, 시트 2개(대시보드+원데이터), 합계/평균/달성률 수식(하드코딩 0), RAG 조건부서식, LineChart, freeze_panes. 수식 캐시는 LibreOffice 라운드트립으로 채움(officecli `view text --range`로 평가값 128/1.023 등 확인).
- 게이트: safety/korean/integrity(5 facts)/contrast(5쌍 AA) PASS
- doc-critic 판정: FIX-MED (대시보드 시트 렌더 공백 - officecli가 첫 시트만 캡처) -> 수정: 대시보드를 첫 시트로 재배치(새 xlsx.md 권고 적용) 후 렌더 확보. 렌더 육안에서 **차트가 합계 행(8행)을 덮는 실결함 추가 발견** -> 앵커 A11->A15 이동으로 수정, 재검증. doc-claims 렌더 메모 "검증됨"으로 갱신, F열 클리핑 메모 정정.
- validate: "Found 5 validation error(s)" - 3건 openpyxl dxf 저장 특성 + 2건 라운드트립 차트 스타일 XML, 셀 데이터/수식 무영향(issues 0건). xlsx.md에 실측 문구로 환류됨.

## 4. official-notice.hwpx (.superoffice/official-notice/) - 2026-07-11 추가

- 생산: python-hwpx 2.24.0, 협력사 시스템 점검 안내 공문(문서번호/시행일/수신/제목/개조식 본문/요청/문의처/공개구분/발신명의/끝.). facts.json 9건 전수 선언.
- 게이트: safety/korean/integrity PASS (첫 실행부터 green)
- 검증: 렌더는 officecli hwpx 플러그인 부재(실측 "No plugins installed")로 **미검증 명시** - 대체 검증 3종 실제 실행: OWPML validate ok, 라운드트립 텍스트 완전 일치, 공문 구조 린트 11개 규칙 score 1.0.
- doc-critic 판정: FIX-MED - 유일 사유는 시각층 미검증(residual 처리 자체는 "4종 중 모범" 평가, 한글 뷰어 육안 1회가 발송 전 잔여 과제) + MINOR 1건(요청 문장 목적격조사 중첩) -> 수정 후 게이트·validate·라운드트립·린트 전부 재실행 green.
- 환류: hwpx.md 마찰 4건(버전 표기 2.24.0 재확인, 공문 린트 호출·공개구분 하드 요구 문서화, fallback stdout 주의, 공문 하우스 견본 examples/format/official-notice.md 신설) + critic 보강 제안(표준 렌더 검증 메모 블록)을 templates/doc-claims.md에 반영.

## 최종 재확인 (conductor 직접 실행)

- officecli validate: pptx/docx 클린 exit 0, xlsx 5건 보고 exit 1(발견 시 exit 1이 정상 동작 - doc-env.py는 발견 보고를 근거로 반환)
- view issues: docx [U1] 1건(양성), pptx 0건 - 발견 유무와 무관하게 exit 0
- office-gate 3종, 계약 테스트 2종: 최종 검증 섹션(QA.md) 참조
