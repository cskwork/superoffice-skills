# 독립 doc-critic 검수 보고 (2026-07-10, 수정 전 상태 보존)

평가 런에서 생산된 문서 3종에 대한 독립 검수 결과 원문 요약. 아래 발견들은 **수정 전** 산출물 기준이며, 이후 수정 이력은 `doc-eval-records.md` 참조. 검수 방법: facts.json 전수 대조 + 렌더 PNG 육안 + 텍스트 추출본·빌드 스크립트 교차.

## 1. weekly-report.docx - 판정: SHIP

- [통과] 수치 무결성 전수 OK (본문 수치 전부 facts.json 선언값 일치, 날조 0)
- [통과] BLUF·격식 OK (첫 줄 결론 문장, "요청드립니다" 격식 ask, 이모지·플레이스홀더 없음)
- [통과] 시각 위계 OK (A4 1페이지, RAG 표 Amber 다크 텍스트/Green 흰 텍스트, 넘침·깨짐 없음)
- [MINOR] 회사(가온테크)/제품(가온클라우드) 관계 선언이 이 vault에 없음
- [MINOR] 페이지 헤더 문구가 추출 .txt에 없음 - 게이트 사각 (-> 적대 리뷰 H1로 승격, 수정됨)
- [MINOR] action title이 결론 3개를 한 줄에 담음 (경계선 허용)

## 2. q2-results.pptx (5장) - 판정: FIX-HIGH

- [HIGH] Slide 3 제목 "매출·수익성·고객 지표 전 항목 목표 상회, 이탈률도 개선" - facts.json에 목표는 매출(125억, 102%)만 선언, 본문 표에도 목표 열 없음. 헤드라인 과대선언(vertical logic 위반). 수치 자체는 전수 무결.
- [MED] Slide 2 소제목 "권고 (ask 먼저)" - 작성 지침 라벨이 산출물 표면에 노출
- [MED] Slide 2·5 ask "승인을 요청한다" 평서체 - biz-report의 정중체 규칙 위반 (docx는 준수, 덱만 회귀)
- [통과] titles test 흐름, 팔레트 준수, 슬라이드당 1강조, 넘침·겹침·플레이스홀더 없음, 미선언 전분기값 "-" 처리로 날조 회피

## 3. kpi-dashboard.xlsx - 판정: FIX-MED

- [MED] 대시보드 시트(RAG 조건부서식·차트·병합 제목) 렌더 PNG 부재 - officecli 시트 선택 한계로 3가지 시도 실패, 텍스트 경로로 값은 검증했으나 시각층 미검증. "렌더 미검증 자기승인 금지" 원칙상 SHIP 보류.
- [MINOR] 원데이터 F열(출처)이 렌더에서 클리핑되는데 doc-claims 렌더 메모는 "잘림 없음"으로 부정확
- [MINOR] render-dashboard.png 파일명-내용 불일치(원데이터 시트 사본) - 오도성 잔여 파일
- [통과] 수식·수치 무결성 전수 OK (하드코딩 0, 이탈률 역산 처리 올바름, RAG 텍스트 라벨 색맹 대비)

## 스킬 개선 제안 3건 (-> 2차 환류로 반영됨)

1. 게이트 텍스트 추출이 헤더/푸터·미렌더 시트를 못 봄 -> office.md/docx.md에 header/footer 추출 규칙 + doc-critic "핵심 산출물 렌더 증거 전무 시 SHIP 금지" 판정 규칙 승격
2. integrity-gate는 숫자만 검사 - 정성적 과대선언 통과 -> biz-report.md에 action title 단정어 vertical-logic 규칙 + doc-critic 전수 대조 항목
3. ask 격식·스캐폴딩 처리 포맷 간 불일치 -> biz-report.md 문체 규칙 형식-공통 명시 + 괄호형 지침 라벨 노출 금지
