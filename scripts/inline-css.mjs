import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const tailwindCss = fs.readFileSync(path.join(root, 'assets/tailwind.css'), 'utf8').trim();
const siteCss = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8').trim();
const combined = `${tailwindCss}\n${siteCss}`;

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'print-collateral') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.html') && entry.name !== 'index.backup.html') files.push(full);
  }
  return files;
}

// First-run shape: the two external <link> tags this replaces.
const linkPattern = /<link rel="stylesheet" href="(?:\.\.\/)*assets\/tailwind\.css" \/>\r?\n<link rel="stylesheet" href="(?:\.\.\/)*assets\/site\.css" \/>/;
// Re-run shape: an already-inlined block, identified by marker comments so
// a later CSS change can be re-propagated by just running this script again.
const inlinedPattern = /<style>\r?\n\/\* BEGIN GENERATED CSS \*\/[\s\S]*?\/\* END GENERATED CSS \*\/\r?\n<\/style>/;
// One-time migration shape: a page already inlined by an earlier version of
// this script, before the marker comments existed. Every templated page has
// exactly one <style> block, so this is safe to match unconditionally.
const legacyInlinedPattern = /<style>\r?\n[\s\S]*?\r?\n<\/style>/;
const preconnectPattern = /<link rel="preconnect" href="https:\/\/images\.pexels\.com" \/>\r?\n?/;
const scriptPattern = /<script src="((?:\.\.\/)*)assets\/site\.js"><\/script>/;

const styleBlock = `<style>\n/* BEGIN GENERATED CSS */\n${combined}\n/* END GENERATED CSS */\n</style>`;

const files = walk(root, []);
let cssInlined = 0;
let preconnectRemoved = 0;
let deferAdded = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let text = original;

  if (linkPattern.test(text)) {
    text = text.replace(linkPattern, styleBlock);
    cssInlined++;
  } else if (inlinedPattern.test(text)) {
    text = text.replace(inlinedPattern, styleBlock);
    cssInlined++;
  } else if (legacyInlinedPattern.test(text)) {
    text = text.replace(legacyInlinedPattern, styleBlock);
    cssInlined++;
  }

  if (preconnectPattern.test(text)) {
    text = text.replace(preconnectPattern, '');
    preconnectRemoved++;
  }

  if (scriptPattern.test(text)) {
    text = text.replace(scriptPattern, '<script src="$1assets/site.js" defer></script>');
    deferAdded++;
  }

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
  }
}

console.log(`CSS inlined in ${cssInlined} files`);
console.log(`Preconnect removed in ${preconnectRemoved} files`);
console.log(`defer added in ${deferAdded} files`);
console.log(`Total files scanned: ${files.length}`);
