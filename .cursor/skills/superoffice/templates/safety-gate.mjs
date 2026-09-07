#!/usr/bin/env node
// safety-gate - deterministic detector for house-rule tells in built content (business documents).
// Scans source (HTML/JS/MD/TXT/script) for: emoji (banned in deliverables), PII, forbidden words,
// unsafe links, and Korean CommonMark blank-line breaks. The producer cannot ship a document
// past machine-checkable safety violations by eyeball. (--band is optional; office use passes none.)
// NEVER edit this script (or forbidden-topics.json) to make unsafe content pass - fix the content.
//
// Per-line escape hatch: a line containing "gate-ok" suppresses ALL rules on that line
// (use only for a deliberate, justified case, e.g. a legitimate contact line quoted as evidence).
//
// Usage: node safety-gate.mjs [--band <초저|초고|중|고>] <file> [<file> ...]
// Exit 0 = no violations. Exit 1 = at least one violation. Exit 2 = usage/read error.

import { readFileSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function usage(msg) {
  if (msg) console.error(`safety-gate: ${msg}`);
  console.error("usage: node safety-gate.mjs [--band <초저|초고|중|고>] <file> [<file> ...]");
  process.exit(2);
}

const argv = process.argv.slice(2);
let band = null;
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--band") { band = argv[++i]; continue; }
  files.push(argv[i]);
}
if (files.length === 0) usage("missing <file>");

let topics = { universal: [], byBand: {} };
try { topics = JSON.parse(readFileSync(resolve(HERE, "../reference/forbidden-topics.json"), "utf8")); }
catch { /* run with built-in universal rules only */ }

const forbidden = [
  ...(topics.universal || []),
  ...((band && topics.byBand && topics.byBand[band]) || []),
];
const forbiddenRes = forbidden.map((t) => ({ t, re: new RegExp(t, "i") }));

const EMOJI = /\p{Extended_Pictographic}/u;
const PHONE = /01[016789]\s*-?\s*\d{3,4}\s*-?\s*\d{4}/;
const RRN = /\b\d{6}\s*-\s*[1-4]\d{6}\b/;            // 주민등록번호 shape
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;

const RULES = [
  { id: "emoji", msg: "emoji in deliverable (banned; use bracket markers like [목적] instead)",
    test: (l) => EMOJI.test(l) },
  { id: "pii-phone", msg: "phone number (PII; remove or use a fictional placeholder)",
    test: (l) => PHONE.test(l) },
  { id: "pii-rrn", msg: "주민등록번호 shape (PII; never include)",
    test: (l) => RRN.test(l) },
  { id: "pii-email", msg: "email address (PII; remove or fictionalize)",
    test: (l) => EMAIL.test(l) },
  { id: "unsafe-link", msg: "insecure http:// link (use https or remove)",
    test: (l) => /http:\/\/(?!localhost|127\.0\.0\.1)/.test(l) },
];

// CommonMark blank-line rules apply only to markdown (strict CommonMark: a list/heading needs a
// blank line before it, and a single \n between text lines is ignored as a soft break).
function mdRule(prev, line) {
  const out = [];
  const prevNonEmpty = prev !== null && prev.trim() !== "";
  const prevList = prev !== null && /^\s*([-*+]|\d+\.)\s/.test(prev);
  if (/^\s*([-*+]|\d+\.)\s/.test(line) && prevNonEmpty && !prevList) {
    out.push({ id: "md-list-no-blank", msg: "list item needs a blank line before it (strict CommonMark)" });
  }
  if (/^#{1,6}\s/.test(line) && prevNonEmpty) {
    out.push({ id: "md-heading-no-blank", msg: "heading needs a blank line before it (strict CommonMark)" });
  }
  return out;
}

let findings = [];
let suppressed = 0;
let read = 0;

for (const file of files) {
  let text;
  try { text = readFileSync(file, "utf8"); }
  catch (e) { console.error(`safety-gate: cannot read ${file}: ${e.message}`); continue; }
  read++;
  const isMd = extname(file).toLowerCase() === ".md";
  const lines = text.split(/\r?\n/);
  let prev = null;
  lines.forEach((line, i) => {
    if (/gate-ok/i.test(line)) { suppressed++; prev = line; return; }
    for (const rule of RULES) {
      if (rule.test(line)) findings.push({ file, line: i + 1, id: rule.id, msg: rule.msg, snippet: line.trim().slice(0, 80) });
    }
    for (const { t, re } of forbiddenRes) {
      if (re.test(line)) findings.push({ file, line: i + 1, id: "forbidden-topic", msg: `forbidden for band ${band || "(none given)"}: ${t}`, snippet: line.trim().slice(0, 80) });
    }
    if (isMd) for (const r of mdRule(prev, line)) findings.push({ file, line: i + 1, id: r.id, msg: r.msg, snippet: line.trim().slice(0, 80) });
    prev = line;
  });
}

if (read === 0) usage("no readable files");

if (findings.length > 0) {
  console.log("== SAFETY GATE: FAIL ==");
  for (const f of findings) {
    console.log(`${f.file}:${f.line}  [${f.id}]  ${f.msg}`);
    console.log(`    > ${f.snippet}`);
  }
  console.log(`\n${findings.length} violation(s) across ${read} file(s)${suppressed ? `, ${suppressed} line(s) suppressed by gate-ok` : ""}.`);
  console.log("Fix the content, not this gate.");
  process.exit(1);
}

console.log(`== SAFETY GATE: PASS == (${read} file(s), band ${band || "universal-only"}${suppressed ? `, ${suppressed} gate-ok suppression(s)` : ""})`);
process.exit(0);
