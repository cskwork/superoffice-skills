#!/usr/bin/env node
// korean-gate - deterministic detector for high-confidence Korean spacing/spelling errors in built text.
// Korean spelling/spacing is context-sensitive, so this gate fires ONLY on patterns that are almost
// always wrong (see reference/korean-rules.json). It is a FLOOR, not a substitute for the doc-critic's
// judgment of naturalness, 맞춤법, and tone. NEVER edit this script (or korean-rules.json) to make
// sloppy text pass - fix the writing. To widen coverage, add rules to korean-rules.json.
//
// Per-line escape hatch: a line containing "gate-ok" suppresses ALL rules on that line
// (use only for a deliberate, justified case, e.g. quoting a misspelling to teach the correct form).
//
// Usage: node korean-gate.mjs [--band <초저|초고|중|고>] <file> [<file> ...]
//   --band is accepted for call-consistency but ignored (spelling/spacing is band-agnostic).
//   Scans text files only (.md/.txt/.html); other extensions are skipped.
// Exit 0 = no violations. Exit 1 = at least one violation. Exit 2 = usage/read error.

import { readFileSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function usage(msg) {
  if (msg) console.error(`korean-gate: ${msg}`);
  console.error("usage: node korean-gate.mjs [--band <초저|초고|중|고>] <file> [<file> ...]");
  process.exit(2);
}

const argv = process.argv.slice(2);
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--band") { i++; continue; }   // accepted, ignored
  files.push(argv[i]);
}
if (files.length === 0) usage("missing <file>");

let rules = { misspell: [], spacing: [] };
try { rules = JSON.parse(readFileSync(resolve(HERE, "../reference/korean-rules.json"), "utf8")); }
catch { /* no rules file -> nothing to enforce, pass */ }

const misspell = rules.misspell || [];
const spacing = (rules.spacing || []).map((r) => ({ re: new RegExp(r.re), msg: r.msg }));

const TEXT_EXT = new Set([".md", ".txt", ".html"]);

let findings = [];
let suppressed = 0;
let read = 0;

for (const file of files) {
  if (!TEXT_EXT.has(extname(file).toLowerCase())) continue;
  let text;
  try { text = readFileSync(file, "utf8"); }
  catch (e) { console.error(`korean-gate: cannot read ${file}: ${e.message}`); continue; }
  read++;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/gate-ok/i.test(line)) { suppressed++; return; }
    for (const r of misspell) {
      if (line.includes(r.bad)) findings.push({ file, line: i + 1, id: "korean-spelling", msg: r.msg, snippet: line.trim().slice(0, 80) });
    }
    for (const r of spacing) {
      if (r.re.test(line)) findings.push({ file, line: i + 1, id: "korean-spacing", msg: r.msg, snippet: line.trim().slice(0, 80) });
    }
  });
}

if (read === 0) usage("no readable text files (.md/.txt/.html)");

if (findings.length > 0) {
  console.log("== KOREAN GATE: FAIL ==");
  for (const f of findings) {
    console.log(`${f.file}:${f.line}  [${f.id}]  ${f.msg}`);
    console.log(`    > ${f.snippet}`);
  }
  console.log(`\n${findings.length} violation(s) across ${read} file(s)${suppressed ? `, ${suppressed} line(s) suppressed by gate-ok` : ""}.`);
  console.log("Fix the writing, not this gate.");
  process.exit(1);
}

console.log(`== KOREAN GATE: PASS == (${read} text file(s)${suppressed ? `, ${suppressed} gate-ok suppression(s)` : ""})`);
process.exit(0);
