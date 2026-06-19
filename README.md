**English** | [한국어](README.ko.md)

# superoffice

A business-document maker for Korean office workers - especially 팀장·경영자 (team leads and executives) - as a Claude Code skill. Read the brief, route to the right format, apply the company brand, and ship a report, deck, or sheet with answer-first (BLUF) message structure that passes a deterministic `office-gate`. Generates, reads, and converts `.docx` `.pptx` `.xlsx` `.hwpx` `.pdf` identically on Windows and macOS. It is the workplace-document sibling of [supercontent](https://github.com/cskwork/supercontent-skill) (which owns education).

Landing page: https://cskwork.github.io/superoffice-skills

## What it adds over a plain document prompt

- **Answer first, design second.** Executives must grasp the recommendation in 60 seconds. Action titles (the title IS the conclusion), one-page reports, SCQA executive summaries, RAG dashboards - the message structure (`reference/biz-report.md`) is applied before any design.
- **Company branding.** Both company-template inheritance (`Presentation("brand.pptx")`) and a `brand-kit.json` interview (colors/fonts/logo/policy) are supported. Capture it once and it applies consistently across every format; company colors still honor WCAG AA contrast (`reference/brand-kit.md`). If the company has its own template, that file is analyzed interactively with the user to lock the brand (only when such a template exists).
- **Follow a format.** House golden exemplars (status report, proposal, executive summary) plus the structure of a user-provided sample or company template, so output matches a consistent in-house format. Mimic the structure and tone, but write fresh content - never fabricate (`reference/examples.md`).
- **Format-aware routing.** Classifies the job into docx/pptx/xlsx/hwpx/pdf plus read/convert modes and picks the right library and design, instead of one default template.
- **Verification, not eyeballing.** A deterministic gate (`templates/office-gate.sh`) scans the built text evidence - Korean spelling/spacing, factual integrity (sourced), emoji/PII, color contrast. The builder never self-approves; an independent critic runs the gate.
- **Never fabricate.** Any number, date, or statistic must be sourced in `facts.json` or cut. A missing library or conversion tool yields a documented placeholder, never a faked file.
- **First-class Korean + collaboration-safe.** `.hwpx` generate/edit/read/validate/convert cross-platform. No emoji (bracket markers), correct 어절 spacing, universal Korean fonts.

## Modes

State the format + operation in one line first, e.g. `Making this as: PPTX Q1 results deck, company brand, 16:9, 12 slides`.

| Mode | For |
|---|---|
| DOCX | report / proposal / draft / official letter body |
| PPTX | presentation deck / precise tables & shapes |
| XLSX | settlement / KPI / dashboard / tables·formulas·charts |
| HWPX | Hangul official document / public·corporate standard |
| PDF | multi-page PDF generation / PDF read·table extraction |
| READ | read existing docx·pptx·xlsx·pdf·hwpx, extract tables |
| CONVERT | format conversion (hwpx<->docx<->pdf<->xlsx) |

Overlays: **BRAND** (company template/style, any build mode) and **message structure** (always for reports/decks).

## Default loop - role-separated, subagent-default

1. **Read** the brief - infer format / audience / purpose / length / conversion target; state it in one line.
2. **Brand** (overlay) - inherit a company template, or `brand-interviewer` captures `brand-kit.json` in <=5 questions, saved to `.superoffice/brand-kit.json` and reused.
3. **Build** - `doc-producer` for docx/pptx/pdf/hwpx, `xlsx-producer` for xlsx. Message structure + design palette, real assets only.
4. **Critique** (independent) - `doc-critic` enumerates body/cells as text, runs `office-gate.sh`, then judges what scripts cannot.
5. **Verify** - smallest fix per violation, re-run until green, report with command output. Cap: 3 cycles.

The **vault** is the per-document work dir (default `.superoffice/<doc>/`): `doc-claims.md`, `facts.json`, optional `contrast-pairs.json` / `brand-kit.json`. No vault, no gate.

## Quickstart

```
/superoffice "Q1 results report as docx"
/superoffice "new-business proposal deck, company template"   # PPTX + BRAND
/superoffice "monthly KPI dashboard as xlsx"                   # XLSX
/superoffice "cooperation official letter as hwpx"             # HWPX
/superoffice "convert this proposal to pdf"                    # CONVERT
/superoffice "extract the tables from this xlsx"               # READ
```

## The office-gate

```bash
# full gate on a business-doc vault (safety + korean + integrity + contrast)
bash templates/office-gate.sh .superoffice/<doc> path/to/body.txt
```

In order: `safety-gate.mjs` (emoji / PII / insecure-link, no band), `korean-gate.mjs` (spelling/spacing), `integrity-gate.mjs <facts.json>` (sourced facts), `contrast-gate.mjs` (WCAG AA when colors are declared). Binary documents are scanned by exporting body text/cells first - the gate reads text only.

## House rules (the gate enforces these)

- No emoji. Use bracket markers: `[현황]`, `[조치]`, `[결론]`.
- Strict CommonMark spacing: a blank line between paragraphs, headings, and lists.
- Never fabricate facts or assets; numbers/dates in `facts.json`; colors pass contrast AA.
- Cross-platform paths and fonts delegate to `templates/doc-env.py` (universal fonts for collaboration).

## Company branding

Two supported mechanisms: (1) inherit a company template file, (2) a `brand-kit.json` interview that captures colors/fonts/logo/policy once and reuses it across every format. See `reference/brand-kit.md`; example schema in `templates/brand-kit.example.json`.

## Attribution

Document craft, gates, and palette patterns draw on [supercontent](https://github.com/cskwork/supercontent-skill); skill-authoring, subagent, and interview patterns draw on [supergoal](https://github.com/cskwork/supergoal-skill); trending office-skill patterns reference anthropics/skills. Libraries: python-docx, python-pptx, openpyxl, XlsxWriter, pdfplumber, pypdf, python-hwpx, WeasyPrint, ReportLab, LibreOffice + H2Orestart. Full attribution + licenses in `reference/sources.md`.

## Note on currency

Current year is 2026. The core libraries are pure Python (MIT/BSD/Apache) with no OS lock-in; only Korean-font and conversion-tool OS branches are centralized in `templates/doc-env.py` / `doc-env.sh`.
