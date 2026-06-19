# xlsx - 정산·KPI·대시보드 (openpyxl + XlsxWriter/pandas)

Load from `reference/office.md` when 형식 = .xlsx. 정산표·KPI 대시보드·표·수식·차트·조건부서식을 코드로 생성하거나 기존 .xlsx를 읽을 때. 메시지 구조는 `reference/biz-report.md`(결론 먼저·한장보고)를, 회사 색/폰트/로고는 `reference/brand-kit.md`를 먼저 적용한다 - 색보다 표의 구조와 결론이 우선.

라이브러리 (전부 설치·실측 확인):
- **openpyxl 3.1.5** (MIT) - 기본. 읽기 AND 쓰기, 스타일·number_format·수식·조건부서식·차트·Table·DataValidation·이미지 전부 지원.
- **XlsxWriter 3.2.0** (BSD-2) - **쓰기 전용**, 빠르고 차트/포맷 API가 풍부. 읽기 없이 대량 서식 리포트를 새로 만들 때.
- **pandas 2.2.3** (BSD-3) - 데이터 레이어(DataFrame). 서식 천장이 낮아 KPI 포맷은 엔진(openpyxl/xlsxwriter)으로 내려간다.

한글 폰트: 엑셀 셀은 `Font(name=...)`만으로 동작(docx의 w:eastAsia 불필요). 이름만 임베드되므로 여는 PC에 폰트가 있어야 한다 - `templates/doc-env.py korean_font_name()`(맑은 고딕/나눔) 재사용, 하드코딩 금지.

## 생성 (openpyxl 기본)

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
wb = Workbook(); ws = wb.active; ws.title = "실적"
ws["A1"] = "월"; ws["B1"] = "달성률"
ws["A1"].font = Font(name="Malgun Gothic", bold=True, color="FFFFFF")   # hex에 # 없음
ws["A1"].fill = PatternFill("solid", fgColor="273340")                  # primary 헤더
ws["A1"].alignment = Alignment(horizontal="center", wrap_text=True)
thin = Side(style="thin", color="D0D0D0")
ws["A1"].border = Border(left=thin, right=thin, top=thin, bottom=thin)
wb.save("kpi.xlsx")
```

스타일 객체는 immutable - 새로 할당하지 mutate 금지. **openpyxl 색 hex는 # 없음**(6자리 RGB / 8자리 ARGB).

### number_format (₩/%/천단위/날짜)

```python
ws["B2"].number_format = "₩#,##0"     # 원화
ws["C2"].number_format = "0.0%"       # 백분율
ws["D2"].number_format = "#,##0"      # 천단위
ws["E2"].number_format = "yyyy-mm-dd" # 날짜 - 셀에 실제 date/datetime 값을 넣어야 적용
```

### 수식 (하드코딩 금지)

```python
ws["B10"] = "=SUM(B2:B9)"   # 파이썬에서 계산해 박지 말고 엑셀 수식 문자열로
```

집계 값을 파이썬에서 계산해 박으면 원본이 바뀔 때 조용히 stale - 경영진 신뢰가 깨진다. 항상 수식 문자열을 쓴다. (계산된 값을 다시 읽으려면 아래 읽기 한계 참고.)

## RAG 조건부서식 (하우스 팔레트)

3단 CellIsRule = Green `2E6F5E` / Amber `E3A82B` / Red `B0413E`. 배지와 같은 대비 규칙: **밝은 골드(Amber)엔 다크 텍스트, 진한 초록/적엔 흰 텍스트.** 골드를 어둡게 눌러 갈색(머스타드)으로 만들지 말 것 - AI slop 신호.

```python
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Font, PatternFill
g = CellIsRule(operator="greaterThanOrEqual", formula=["0.9"],
               fill=PatternFill("solid", fgColor="2E6F5E"), font=Font(color="FFFFFF"))
a = CellIsRule(operator="between", formula=["0.5", "0.9"],
               fill=PatternFill("solid", fgColor="E3A82B"), font=Font(color="1F2933"))  # 다크
r = CellIsRule(operator="lessThan", formula=["0.5"],
               fill=PatternFill("solid", fgColor="B0413E"), font=Font(color="FFFFFF"))
for rule in (g, a, r):
    ws.conditional_formatting.add("B2:B13", rule)
```

`CellIsRule.formula`는 **문자열 리스트**(숫자 아님); `between`은 두 개 `["0.5","0.9"]`. 연속 음영이 필요하면 `ColorScaleRule(start_type='min', start_color='B0413E', mid_type='percentile', mid_value=50, mid_color='E3A82B', end_type='max', end_color='2E6F5E')`.

## 차트 (BarChart/LineChart, pie 회피)

```python
from openpyxl.chart import BarChart, LineChart, Reference
chart = BarChart(); chart.title = "월별 달성률"
data = Reference(ws, min_col=2, min_row=1, max_row=13)   # 헤더 포함
cats = Reference(ws, min_col=1, min_row=2, max_row=13)
chart.add_data(data, titles_from_data=True); chart.set_categories(cats)
ws.add_chart(chart, "D2")
```

`titles_from_data=True`는 data Reference가 헤더 행을 포함할 때 시리즈 범례명을 가져온다. **Pie 금지** - 값 비교가 나쁘고 AI slop 신호. 추세=LineChart, 비교=BarChart.

## 고정 헤더 + 필터 (팀장·경영자 기대)

명명된 Table 한 번이면 헤더 스타일 + autofilter 드롭다운 + 줄무늬가 한꺼번에 붙는다.

```python
from openpyxl.worksheet.table import Table, TableStyleInfo
tab = Table(displayName="실적표", ref="A1:B13")   # displayName 공백 없이 유일, ref는 헤더 포함
tab.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
ws.add_table(tab)
ws.freeze_panes = "A2"   # 헤더 고정
```

## 드롭다운 (DataValidation)

```python
from openpyxl.worksheet.datavalidation import DataValidation
dv = DataValidation(type="list", formula1='"완료,진행,예정"', allow_blank=True)
ws.add_data_validation(dv)   # 먼저 add
dv.add("C2:C13")             # 그다음 범위
```

## 이미지 (실제 파일만)

```python
from openpyxl.drawing.image import Image   # Pillow 필요
ws.add_image(Image("chart.png"), "E2")     # 존재하는 파일 경로만 - no-fabrication
```

## KPI 대시보드 패턴 (경영 보고)

한 시트 = 한 메시지. 상단 primary 헤더 행(흰 텍스트) + 명명 Table(필터·줄무늬) + 달성률 열 RAG 조건부서식 + `freeze_panes`로 헤더 고정 + 우측 BarChart 하나. 숫자 포맷 일관(`₩#,##0` / `0.0%`), 집계는 수식. 색은 최소화하고 위계로 승부 - 머스타드/네온/의미 없는 베이지 금지.

## XlsxWriter (쓰기 전용, 차트/포맷 강함)

읽기 없이 대량 서식 리포트를 새로 만들 때. **XlsxWriter 색 hex는 # 있음**(openpyxl과 반대 - 섞으면 검은/잘못된 fill).

```python
import xlsxwriter
wb = xlsxwriter.Workbook("out.xlsx"); ws = wb.add_worksheet("실적")
fmt = wb.add_format({"font_name": "Malgun Gothic", "num_format": "₩#,##0", "bold": True})
ws.write_row(0, 0, ["월", "매출"]); ws.set_column("B:B", 14, fmt)
ws.conditional_format("B2:B4", {"type": "cell", "criteria": ">=", "value": 0.9, "format": fmt})
ws.add_table("A1:B4", {"name": "실적표",
    "columns": [{"header": "월"}, {"header": "매출"}], "style": "Table Style Medium 2"})
ws.freeze_panes(1, 0)
chart = wb.add_chart({"type": "column"})   # pie 금지
chart.add_series({"name": "매출", "categories": "=실적!$A$2:$A$4", "values": "=실적!$B$2:$B$4"})
ws.insert_chart("D2", chart)
wb.close()   # 반드시 close() 해야 파일 flush
```

Table `columns` 개수는 데이터 헤더와 일치해야 close()가 통과. 날짜는 `ws.write_datetime(r, c, dt, fmt)` + num_format(아니면 시리얼 숫자로 보임). categories/values는 절대 범위 문자열.

## pandas (데이터 레이어만)

`to_excel`는 freeze_panes는 되지만 셀별 서식·조건부서식이 안 되니 엔진으로 내려간다.

```python
import pandas as pd
with pd.ExcelWriter("out.xlsx", engine="xlsxwriter") as xw:
    df.to_excel(xw, sheet_name="실적", index=False, freeze_panes=(1, 0))
    wb = xw.book; ws = xw.sheets["실적"]
    ws.set_column("B:B", 14, wb.add_format({"num_format": "₩#,##0"}))
df = pd.read_excel("in.xlsx", sheet_name="실적")   # DataFrame (sheet_name=None이면 dict)
```

엔진 선택: 읽기/수정 -> `openpyxl`(기본), 쓰기 전용 풍부한 서식 -> `xlsxwriter`.

## 읽기

```python
from openpyxl import load_workbook
wb = load_workbook("in.xlsx", read_only=True, data_only=True)
ws = wb["실적"]
for row in ws.iter_rows(values_only=True): print(row)
wb.close()   # read_only는 close 필요
```

한계(실측): `data_only=True`는 **수식의 캐시된 결과**를 반환하는데, 파일을 엑셀/LibreOffice가 한 번 열어 저장한 적이 없으면 모두 `None`이다(openpyxl은 수식을 계산하지 않음). 계산된 값이 필요하면 `soffice`로 한 번 변환·저장하거나 원본 수치를 읽는다. `read_only=True`는 대용량을 스트리밍하지만 셀이 read-only가 된다.

## 변환

```bash
bash templates/doc-env.sh soffice_convert kpi.xlsx pdf out/   # LibreOffice headless, H2Orestart 불필요
```

`templates/doc-env.py soffice_convert(src, fmt='pdf', outdir)`로 위임(OS 경로는 거기 집약). soffice 부재 시 RuntimeError - 그때는 .xlsx 원본 + 수동 변환 안내를 남기고 가짜 PDF를 만들지 않는다(no-fabrication). 주의: xlsx->pdf에서 차트·일부 서식이 단순화될 수 있다 - 직접 본 것만 단정한다.

## brand-kit 색 적용

회사 색을 헤더 fill·차트 시리즈에 입히되 본문 셀은 monochrome 유지(강조는 한 곳). brand-kit.json의 색도 `contrast-gate` AA를 통과해야 한다 - 회사 색이 흰 배경에서 미달이면 경고 + 더 진한 변형을 제안한다. openpyxl은 # 없는 hex, XlsxWriter는 # 있는 hex로 변환해 넣는다. 상세는 `reference/brand-kit.md`.

## 게이트

셀값은 바이너리라 게이트가 직접 못 읽는다 - 셀을 **.csv로 덤프**해 vault에 두고 검사한다.

```python
import csv
from openpyxl import load_workbook
ws = load_workbook("kpi.xlsx", data_only=True).active
with open(".superoffice/kpi/cells.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(ws.iter_rows(values_only=True))
```

```bash
bash templates/office-gate.sh .superoffice/kpi .superoffice/kpi/cells.csv
```

`office-gate.sh` = safety(이모지/PII/링크) + korean(맞춤법/띄어쓰기) + integrity(`facts.json` 출처) + contrast(색을 declare했을 때). 표의 모든 수치/날짜는 `facts.json` 출처 또는 삭제. 색을 입혔으면 텍스트-배경 쌍(헤더/primary, RAG 배지/텍스트)을 `contrast-pairs.json`에 enumerate해 contrast-gate AA.
