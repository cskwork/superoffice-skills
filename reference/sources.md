# sources - 라이브러리·라이선스·attribution

Load from reference/office.md when crediting upstream code, checking a license before redistribution, or recording provenance.

라이선스는 2026 실측 read - 재배포 전 각 패키지에서 재확인. 라이선스는 바뀐다; 이 표는 보증이 아니라 한 시점의 기록이다.

## Document libraries

문서 생성·읽기·변환 라이브러리. 모두 pip 설치·검증됨.

| Library | URL | License (verify) | Used for |
|---|---|---|---|
| python-docx | github.com/python-openxml/python-docx | MIT | .docx 생성·읽기 (한글 w:eastAsia) |
| python-pptx | github.com/scanny/python-pptx | MIT | .pptx 정밀 생성·읽기 |
| openpyxl | openpyxl.readthedocs.io (foss.heptapod.net/openpyxl) | MIT | .xlsx 생성·읽기·수식·조건부서식·차트 (기본) |
| XlsxWriter | github.com/jmcnamara/XlsxWriter | BSD-2 | .xlsx write-only, 대량 서식 리포트 (read-back 불가) |
| pdfplumber | github.com/jsvine/pdfplumber | MIT | PDF 텍스트·표 추출 |
| pypdf | github.com/py-pdf/pypdf | BSD | PDF 텍스트 추출·병합 |
| python-hwpx (airmang) | github.com/airmang/python-hwpx | Apache-2.0 | .hwpx 생성·편집·읽기·검증 (1급) |
| WeasyPrint | github.com/Kozea/WeasyPrint | BSD | HTML/CSS -> PDF (Pango 의존) |
| ReportLab | reportlab.com (PyPI: reportlab) | **LGPL + 상용 이중** | PDF 코드 직접 생성; 상용 재배포는 라이선스 검토 |
| PyMuPDF (fitz) | github.com/pymupdf/pymupdf | **AGPL-3.0** | 고속 PDF·이미지·OCR; 상업 SaaS 통합 시 전염 - **기본 비채택** |
| LibreOffice | libreoffice.org | **GPLv3** (Java) | headless 문서 변환(soffice CLI); recalc·thumbnail·HWPX/OOXML->PDF |
| H2Orestart (ebandal) | github.com/ebandal/H2Orestart | **GPLv3 + Java** | LibreOffice용 HWP/HWPX import 확장; .hwpx 변환용 별도 설치 |

`pandas`(BSD-3)는 데이터 레이어로만 쓰고 서식은 openpyxl/xlsxwriter 엔진으로 내려간다 - 라이선스 표에는 의존성으로만 둔다.

라이선스 경고는 형식 reference(`reference/pdf.md`·`reference/hwpx.md`·`reference/xlsx.md`) 인라인에도 둔다. AGPL/상용 이중/GPLv3는 결합 산출물의 배포 조건을 바꾼다 - 아래 규칙 적용.

## Attribution

이 스킬이 빌려온 패턴과 출처.

| 출처 | URL | 기여 |
|---|---|---|
| supercontent (cskwork) | github.com/cskwork/supercontent-skill | 부모 문서 craft (docx/pptx/pdf/hwpx 생성·읽기·변환) + 게이트/팔레트 패턴 |
| supergoal (cskwork) | github.com/cskwork/supergoal-skill | skill 제작 구조 · 서브에이전트 vault 공유 · 인터뷰 패턴 (brand-interviewer) |
| anthropics/skills | github.com/anthropics/skills | 트렌딩 오피스 스킬 (docx/pptx/xlsx/pdf) - 패턴만 채택, 라이브러리는 Python 스택 유지 |

anthropics/skills의 문서 스킬(docx/pptx/xlsx/pdf)은 자체 스크립트·템플릿 접근을 쓴다(구현 세부는 해당 repo에서 확인). 우리는 패턴·게이트·anti-slop 규율만 가져오고 라이브러리는 python-docx/python-pptx/openpyxl/WeasyPrint/python-hwpx Python 스택을 유지한다.

## Verify license before redistribution

- "check repo" / verify = 파생 코드·산출물 배포 전 실제 LICENSE 파일을 읽어라; MIT/permissive로 가정하지 마라.
- AGPL-3.0(PyMuPDF): 상업 SaaS에 결합하면 전염 - 기본 비채택, 채택 시 라이선스 검토 필수.
- LGPL + 상용 이중(ReportLab): 코드 직접 생성 경로에서만 쓰고 상용 재배포는 검토.
- GPLv3(LibreOffice/H2Orestart): 별도 프로세스로 호출(번들 아님)하므로 산출 문서에 전염되지 않으나, 재배포 형태가 바뀌면 재확인.
- 의존성 라이선스는 스킬 자체 약관과 다를 수 있다 - 결합 산출물에는 가장 엄격한 조건이 적용된다.

## 게이트

문서·코드 산출 전 `templates/office-gate.sh <vault> <text files>` (safety + korean + integrity + contrast). 이 reference에는 게이트 대상 코드가 없다 - 라이선스 경고가 형식 reference 인라인과 일치하는지만 확인.
