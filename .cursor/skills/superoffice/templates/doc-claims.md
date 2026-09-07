# doc-claims - 업무 문서 선언 (office-gate 대상)

회사 업무 문서의 빌더 선언. 이 레포는 단일 트랙(업무 문서)뿐이다 - 교육 dials(FUN_INTENSITY 등)·성취기준·curriculum-claims는 없다(학생/학부모 교육 문서는 범위 밖, supercontent). 문서 한 건의 vault(기본 `.superoffice/<doc>/`)에 둔다.

## 문서 spec

- 형식: <docx | pptx | xlsx | pdf | hwpx>
- 대상: <업무/성인 - 예: 사내 임원, 거래처, 팀장 보고>
- 목적: <보고서 | 제안서 | 기안 | 공문 | 발표 덱 | 정산/KPI 대시보드>
- 언어: <한국어 | 영어 | ...>
- 분량: <예: A4 3페이지 / 슬라이드 12장 / 시트 2개>
- 폰트: <맑은 고딕 | 나눔고딕 | AppleGothic>   # 협업 시 범용 폰트 권장 (doc-env.py korean_font_name)
- 변환 타깃: <없음 | pdf | hwpx | docx | xlsx>
- 브랜드킷: <없음 | 템플릿 상속(회사.pptx/docx/xlsx) | brand-kit.json(.superoffice/brand-kit.json) | 둘 다>   # 출처 한 줄

## 텍스트 근거 (office-gate 검사 대상)

바이너리 문서(.docx/.pptx/.xlsx/.pdf/.hwpx)는 본문/셀을 텍스트로 추출해 여기 둔다 - office-gate는 텍스트만 스캔한다.

- <본문 .txt/.md 경로>   # 예: body.txt (hwpx export_text / pdfplumber / docx paragraphs + section.header/.footer), cells.md (xlsx 셀 덤프 - korean-gate는 .csv를 스캔하지 않으니 .md/.txt로)

## run-to-prove

- `bash templates/office-gate.sh <vault> <text files>`   # safety(이모지/PII/링크) + korean + integrity (+contrast 색 선언 시)
- `python templates/doc-env.py officecli-render <doc> <out.png>` + PNG 육안   # 렌더 검증 (reference/office.md) - 불가하면 아래 렌더 검증 메모에 기록

## 렌더 검증 메모 (핵심 산출물에 렌더 증거가 없으면 SHIP 불가 - doc-critic 판정 규칙)

- 상태: <검증됨 | 미검증>
- 미검증일 때 표준 기록: 도구 부재/불가의 실측 명령과 출력 한 줄, 실행한 대체 검증(예: OWPML validate·라운드트립·구조 린트·view text --range), 대체가 못 덮는 잔여 시각 항목(넘침/폰트/여백 등), 렌더 파일명이 실제 내용과 일치하는지.

## substitutions (도구/라이브러리 부재 시, 위조 대신 기록)

- [substitution] <stage>: <primary> 불가 -> <대체 경로> (<이유>)
  예: [substitution] hwpx 변환: H2Orestart 미설치 -> export_html+Chrome PDF (확장 없음)
