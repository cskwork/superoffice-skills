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

- <본문 .txt/.md/.csv 경로>   # 예: body.txt (hwpx export_text / pdfplumber / docx paragraphs), cells.csv (xlsx 셀 덤프)

## run-to-prove

- `bash templates/office-gate.sh <vault> <text files>`   # safety(이모지/PII/링크) + korean + integrity (+contrast 색 선언 시)

## substitutions (도구/라이브러리 부재 시, 위조 대신 기록)

- [substitution] <stage>: <primary> 불가 -> <대체 경로> (<이유>)
  예: [substitution] hwpx 변환: H2Orestart 미설치 -> export_html+Chrome PDF (확장 없음)
