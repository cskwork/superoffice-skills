# OfficeCLI 1.0.135 스모크 실측 보고 (2026-07-10, macOS ARM64, brew 설치)

모든 항목은 이 세션에서 직접 실행·확인한 결과다. 증거 파일: `qa/smoke/`.

## 실측 결과

| 능력 | 명령 | 결과 |
|---|---|---|
| docx 생성(한국어) | `create` + `add / --type p --prop text=...` | PASS. 한글 정상. 빈 docx에는 `style=Heading1` 부재 경고(스타일 파트 없음) - 있는 그대로 참조됨 |
| docx 렌더 | `view smoke.docx screenshot -o out.png` | PASS. 한글 폰트 깨짐 없음, 육안 확인 (smoke-docx.png) |
| docx validate | `validate smoke.docx` | PASS. "no errors found" |
| pptx 생성(한국어) | `add / --type slide --prop title=` + shape(x/y/width/height/size/bold/color cm·pt 단위) | PASS. 16:9 기본(960x540pt) |
| pptx 렌더 | `view smoke.pptx screenshot` | PASS. 한글 대형 타이틀 선명 (smoke-pptx.png) |
| pptx overflow 검출 | `view smoke.pptx issues` | PASS. 3x1cm 도형에 장문 주입 -> `[O1] text overflow: 18 lines at 18.0pt need 324pt, usable 21pt. suggest.height=11.7cm` - 줄수·필요치·제안치까지 정밀 |
| xlsx 셀/수식 | `set /Sheet1/A1 --prop value=` + `--prop formula="SUM(B2:C2)"` (`=` 없이) | PASS. 쓰기 시점 평가 `computedValue=100 evaluated=true` |
| xlsx 렌더 | `view smoke.xlsx screenshot` | PASS. 그리드+한글 헤더 정상 (smoke-xlsx.png) |
| merge 템플릿 | `merge tpl.docx out.docx --data '{"recipient":"..."}'` | PASS. `{{key}}` 2건 치환, 한글 유지. `--data` 플래그 필수(위치 인자 아님) |
| 기본 eastAsia 폰트 | `get` effective 속성 | `맑은 고딕` (docDefaults) - Windows 협업 안전 |
| PDF 내보내기 | `view smoke.docx pdf` | **FAIL**: "No exporter plugin found for .docx -> .pdf" - 플러그인 기본 미설치 |
| hwpx | `plugins list` | **미지원(기본)**: "No plugins installed" - .doc/.hwpx/pdf export는 플러그인 필요 |

## 운영 특성 (스킬 배선 시 반영할 것)

- `create`/`add`는 문서를 **백그라운드 resident로 유지**("kept open in background"). officecli가 편집한 파일을 다른 도구(python/게이트)가 읽기 전에 `officecli close <file>` 또는 `save`로 flush해야 안전. 읽기 전용 사용(view/validate/issues)은 해당 없음.
- locale은 OS에서 추론(ko-KR), `--locale`로 재정의 가능.
- xlsx 경로는 `/<시트명>/<A1참조>` (`/Sheet1/A1`), `/sheet[1]/cell[A1]` 아님. formula는 `=` 없이.
- 빈 문서에는 Heading 스타일 파트가 없음 - 스타일 의존 서식은 python-docx(스타일 생성 가능) 또는 회사 템플릿 상속이 필요.

## A/B: 동일 스펙 슬라이드 (python-pptx vs officecli 직접 빌드)

스펙: 16:9, 타이틀(32pt bold #1F2933) + KPI 텍스트 3개(20pt #3D5A80, 지정 좌표).

- 렌더 품질: **사실상 동일** (ab-python.png vs ab-cli.png, 육안).
- 코드량: python 스크립트 ~20줄 vs officecli 명령 6줄. 단순 문서는 officecli가 간결, 루프/표/차트/템플릿 상속은 python이 우세.
- 발견: python-pptx 기본 템플릿 슬라이드에 잔여 푸터 플레이스홀더(날짜 "1/27/13", 페이지 번호)가 렌더에 노출 - **렌더 검증이 아니면 못 봤을 결함**. officecli 빌드는 깨끗.

## d1 결정 (근거 위)

**python 스택 = 기본 정밀 빌더 유지. OfficeCLI = 표준 렌더 검증기(screenshot/issues/validate) + merge 템플릿 채움 + 읽기/간단 편집 보조.**

- 채택 이유: 시각 검증 공백(스킬 내 관련 언급 0건 - grep 실측)을 결정론적으로 메움; 한글 렌더 실측 무결; overflow 검출은 한국어 pptx의 고질 결함을 게이트화.
- 빌더 교체 기각 이유: PDF/hwpx 플러그인 기본 부재, 실측된 python reference 자산(차트·조건부서식·템플릿 상속·스타일 생성) 대체 불가, 브랜드킷 상속 경로가 python 기반. 단순 문서 퀵 빌드 옵션으로는 허용.
