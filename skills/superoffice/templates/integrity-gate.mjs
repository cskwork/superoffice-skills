#!/usr/bin/env node
// integrity-gate - deterministic floor against fabricated facts in business documents.
// True fact-checking needs the LLM critic; THIS script enforces the discipline that makes checking
// possible: every statistic/date/superlative the content asserts must be DECLARED in facts.json
// with a real source. It catches (a) declared facts with placeholder/empty sources, and
// (b) content that asserts factual signals while declaring none. NEVER weaken it to pass - cite or cut.
//
// Per-line escape hatch: "gate-ok" on a content line suppresses its factual-signal hits (use for a
// hypothetical/illustrative number explicitly marked as such, not a real metric).
//
// Usage: node integrity-gate.mjs <facts.json> [<contentfile> ...]
//   facts.json: [{ "claim": "...", "source": "..." }, ...]  (may be [] for content with no facts)
// Exit 0 = sound. Exit 1 = violation. Exit 2 = usage/read error.

import { readFileSync } from "node:fs";

function usage(msg) {
  if (msg) console.error(`integrity-gate: ${msg}`);
  console.error("usage: node integrity-gate.mjs <facts.json> [<contentfile> ...]");
  process.exit(2);
}

const factsPath = process.argv[2];
const contentFiles = process.argv.slice(3);
if (!factsPath) usage("missing <facts.json>");

const PLACEHOLDER = /^(todo|tbd|n\/a|na|\?+|출처\s*(필요|미정|없음|예정)?|미정|없음|추가\s*예정)$/i;

let facts = [];
let factsMissing = false;
try { facts = JSON.parse(readFileSync(factsPath, "utf8")); }
catch { factsMissing = true; }
if (!Array.isArray(facts)) facts = [facts];

const findings = [];

// (a) declared facts must each carry a real source.
facts.forEach((f, i) => {
  if (!f || typeof f !== "object") { findings.push(`facts[${i}]: not an object`); return; }
  if (!f.claim || String(f.claim).trim() === "") findings.push(`facts[${i}]: empty claim`);
  const src = f.source == null ? "" : String(f.source).trim();
  if (src === "" || PLACEHOLDER.test(src)) findings.push(`facts[${i}]: missing/placeholder source for "${String(f.claim).slice(0, 50)}" (cite a real source or cut the claim)`);
});

// (b) content asserting factual signals while nothing is declared.
const SIGNALS = [
  { id: "percent", re: /\d{1,3}(\.\d+)?\s*(%|퍼센트|프로)/ },
  { id: "year", re: /\b\d{3,4}\s*년(?!\s*생|간|차)/ },
  { id: "superlative", re: /(세계\s*최초|최초로|최대|최소|유일(한|하게)?|가장\s*(큰|작은|긴|짧은|빠른|느린|많은|적은|오래))/ },
];
let signalHits = 0;
let read = 0;
for (const file of contentFiles) {
  let text;
  try { text = readFileSync(file, "utf8"); }
  catch (e) { console.error(`integrity-gate: cannot read ${file}: ${e.message}`); continue; }
  read++;
  text.split(/\r?\n/).forEach((line, i) => {
    if (/gate-ok/i.test(line)) return;
    for (const s of SIGNALS) if (s.re.test(line)) { signalHits++; if (facts.length === 0) findings.push(`${file}:${i + 1}: factual signal [${s.id}] but facts.json declares no sourced facts: "${line.trim().slice(0, 60)}"`); }
  });
}

if (factsMissing && (contentFiles.length === 0 || signalHits > 0)) {
  findings.unshift(`facts.json not found at ${factsPath} (declare facts with sources, or write []) ` + (signalHits ? `- ${signalHits} factual signal(s) found in content` : ""));
}

if (findings.length > 0) {
  console.log("== INTEGRITY GATE: FAIL ==");
  for (const f of findings) console.log(`  ${f}`);
  console.log(`\n${findings.length} issue(s); ${facts.length} declared fact(s), ${signalHits} content signal(s) across ${read} file(s).`);
  console.log("Cite or cut, do not weaken this gate.");
  process.exit(1);
}

console.log(`== INTEGRITY GATE: PASS == (${facts.length} sourced fact(s), ${signalHits} content signal(s), ${read} file(s))`);
process.exit(0);
