import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html') && entry.name !== 'index.backup.html') files.push(full);
  }
  return files;
}

// Variant 1: nav header, navy strokes, with the two latitude curves.
const v1old = '<circle cx="32" cy="32" r="29" stroke="#12233F" stroke-width="2"/>\n          <ellipse cx="32" cy="32" rx="12.5" ry="29" stroke="#12233F" stroke-width="1.6"/>\n          <line x1="3.5" y1="32" x2="60.5" y2="32" stroke="#12233F" stroke-width="1.6"/>\n          <path d="M6 20 Q32 32 58 20" stroke="#12233F" stroke-width="1.1" fill="none"/>\n          <path d="M6 44 Q32 32 58 44" stroke="#12233F" stroke-width="1.1" fill="none"/>\n          <rect x="27.5" y="27.5" width="9" height="9" transform="rotate(45 32 32)" fill="#B8892B"/>';
const v1new = '<circle cx="32" cy="32" r="29" stroke="#12233F" stroke-width="1.5"/>\n          <ellipse cx="32" cy="32" rx="13" ry="29" stroke="#12233F" stroke-width="1.2"/>\n          <line x1="3" y1="32" x2="61" y2="32" stroke="#12233F" stroke-width="1.2"/>\n          <path d="M7 19 Q32 32 57 19" stroke="#12233F" stroke-width="0.85" fill="none"/>\n          <path d="M7 45 Q32 32 57 45" stroke="#12233F" stroke-width="0.85" fill="none"/>\n          <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#B8892B"/>';

// Same as v1 but as it appears inline (single-line, no leading indent) in print-collateral.
const v1oldInline = '<circle cx="32" cy="32" r="29" stroke="#12233F" stroke-width="2"/><ellipse cx="32" cy="32" rx="12.5" ry="29" stroke="#12233F" stroke-width="1.6"/><line x1="3.5" y1="32" x2="60.5" y2="32" stroke="#12233F" stroke-width="1.6"/><path d="M6 20 Q32 32 58 20" stroke="#12233F" stroke-width="1.1" fill="none"/><path d="M6 44 Q32 32 58 44" stroke="#12233F" stroke-width="1.1" fill="none"/><rect x="27.5" y="27.5" width="9" height="9" transform="rotate(45 32 32)" fill="#B8892B"/>';
const v1newInline = '<circle cx="32" cy="32" r="29" stroke="#12233F" stroke-width="1.5"/><ellipse cx="32" cy="32" rx="13" ry="29" stroke="#12233F" stroke-width="1.2"/><line x1="3" y1="32" x2="61" y2="32" stroke="#12233F" stroke-width="1.2"/><path d="M7 19 Q32 32 57 19" stroke="#12233F" stroke-width="0.85" fill="none"/><path d="M7 45 Q32 32 57 45" stroke="#12233F" stroke-width="0.85" fill="none"/><rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#B8892B"/>';

// Variant 2: footer / dark-bg contexts, white strokes, no curves.
const v2old = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="2"/>\n              <ellipse cx="32" cy="32" rx="12.5" ry="29" stroke="white" stroke-width="1.4"/>\n              <line x1="3.5" y1="32" x2="60.5" y2="32" stroke="white" stroke-width="1.4"/>\n              <rect x="27.5" y="27.5" width="9" height="9" transform="rotate(45 32 32)" fill="#B8892B"/>';
const v2new = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="1.5"/>\n              <ellipse cx="32" cy="32" rx="13" ry="29" stroke="white" stroke-width="1.2"/>\n              <line x1="3" y1="32" x2="61" y2="32" stroke="white" stroke-width="1.2"/>\n              <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#B8892B"/>';

// Same as v2 but inline (print-collateral: business-card back panel omits this shape;
// flyers/brochure use it inline with no leading indent).
const v2oldInline = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="2"/><ellipse cx="32" cy="32" rx="12.5" ry="29" stroke="white" stroke-width="1.4"/><line x1="3.5" y1="32" x2="60.5" y2="32" stroke="white" stroke-width="1.4"/><rect x="27.5" y="27.5" width="9" height="9" transform="rotate(45 32 32)" fill="#B8892B"/>';
const v2newInline = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="1.5"/><ellipse cx="32" cy="32" rx="13" ry="29" stroke="white" stroke-width="1.2"/><line x1="3" y1="32" x2="61" y2="32" stroke="white" stroke-width="1.2"/><rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#B8892B"/>';

// Variant 3: business-card back panel, white strokes, with curves at a lighter weight.
const v3old = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="2"/>\n        <ellipse cx="32" cy="32" rx="12.5" ry="29" stroke="white" stroke-width="1.4"/>\n        <line x1="3.5" y1="32" x2="60.5" y2="32" stroke="white" stroke-width="1.4"/>\n        <path d="M6 20 Q32 32 58 20" stroke="white" stroke-width="0.9" fill="none"/>\n        <path d="M6 44 Q32 32 58 44" stroke="white" stroke-width="0.9" fill="none"/>\n        <rect x="27.5" y="27.5" width="9" height="9" transform="rotate(45 32 32)" fill="#B8892B"/>';
const v3new = '<circle cx="32" cy="32" r="29" stroke="white" stroke-width="1.5"/>\n        <ellipse cx="32" cy="32" rx="13" ry="29" stroke="white" stroke-width="1.2"/>\n        <line x1="3" y1="32" x2="61" y2="32" stroke="white" stroke-width="1.2"/>\n        <path d="M7 19 Q32 32 57 19" stroke="white" stroke-width="0.7" fill="none"/>\n        <path d="M7 45 Q32 32 57 45" stroke="white" stroke-width="0.7" fill="none"/>\n        <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#B8892B"/>';

// Multi-line variants may appear with LF or CRLF line endings depending on
// which tool last touched the file, so match both.
const crlf = (s) => s.replace(/\n/g, '\r\n');

const replacements = [
  [v1old, v1new],
  [crlf(v1old), crlf(v1new)],
  [v1oldInline, v1newInline],
  [v2old, v2new],
  [crlf(v2old), crlf(v2new)],
  [v2oldInline, v2newInline],
  [v3old, v3new],
  [crlf(v3old), crlf(v3new)],
];

const files = walk(root, []);
let filesTouched = 0;
let replacementsMade = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let text = original;
  for (const [oldStr, newStr] of replacements) {
    let idx;
    while ((idx = text.indexOf(oldStr)) !== -1) {
      text = text.slice(0, idx) + newStr + text.slice(idx + oldStr.length);
      replacementsMade++;
    }
  }
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    filesTouched++;
  }
}

console.log(`Replacements made: ${replacementsMade}`);
console.log(`Files touched: ${filesTouched} of ${files.length} scanned`);
