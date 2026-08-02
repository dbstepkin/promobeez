#!/usr/bin/env node
/**
 * Citation integrity check for Promobeez blog HTML articles.
 * Usage: node scripts/check-refs.js [path-to-html ...]
 * Default: all blog/*.html
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const files = args.length
  ? args.map((f) => path.resolve(f))
  : fs
      .readdirSync(path.join(root, 'blog'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(root, 'blog', f));

let failed = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const name = path.relative(root, file);
  const citeNums = new Set(
    [...html.matchAll(/class="cite"[^>]*href="#ref-(\d+)"/g)].map((m) => m[1])
  );
  const refIds = new Set(
    [...html.matchAll(/id="ref-(\d+)"/g)].map((m) => m[1])
  );
  const issues = [];

  for (const n of citeNums) {
    if (!refIds.has(n)) issues.push(`cite [${n}] has no #ref-${n}`);
  }
  for (const n of refIds) {
    if (!citeNums.has(n)) issues.push(`#ref-${n} is never cited`);
  }

  // Contiguous numbering from 1
  const refList = [...refIds].map(Number).sort((a, b) => a - b);
  for (let i = 0; i < refList.length; i++) {
    if (refList[i] !== i + 1) {
      issues.push(`refs not contiguous from 1 (got ${refList.join(', ')})`);
      break;
    }
  }

  // First-appearance order: first cite of each number should be ascending
  const firstOrder = [];
  const seen = new Set();
  for (const m of html.matchAll(/class="cite"[^>]*href="#ref-(\d+)"/g)) {
    if (!seen.has(m[1])) {
      seen.add(m[1]);
      firstOrder.push(Number(m[1]));
    }
  }
  for (let i = 0; i < firstOrder.length; i++) {
    if (firstOrder[i] !== i + 1) {
      issues.push(`first-appearance order is ${firstOrder.join(', ')} (expected 1..n)`);
      break;
    }
  }

  if (issues.length) {
    failed++;
    console.log(`FAIL ${name}`);
    for (const issue of issues) console.log(`  - ${issue}`);
  } else {
    console.log(`OK   ${name}  (${refIds.size} refs, ${citeNums.size} cited)`);
  }
}

process.exit(failed ? 1 : 0);
