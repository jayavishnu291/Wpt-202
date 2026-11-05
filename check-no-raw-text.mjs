#!/usr/bin/env node
/**
 * Fails if on-screen text is typed in code instead of read from src/text/en.json.
 * Usage: node scripts/check-no-raw-text.mjs [folder ...]   (default: src/app and src/ui)
 *
 * Flags: words between JSX tags; string literals in text props (title, label, placeholder,
 * accessibilityLabel ...); string literals in {braces} inside JSX; Alert.alert('...');
 * text-like object properties (title, message, label ...); and the app name typed anywhere.
 * Skips: src/text, src/config, tests, fixtures.
 * Escape hatch for a real exception: add a comment `text-ok: reason` on the same or previous line.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const TEXT_NAMES = new Set([
  'title', 'subtitle', 'label', 'placeholder', 'message', 'description', 'text', 'alt',
  'headerTitle', 'tabBarLabel', 'accessibilityLabel', 'accessibilityHint', 'aria-label',
]);
const SKIP_TOP = new Set(['text', 'config']);
const SKIP_ANY = new Set(['node_modules', '__tests__', '__fixtures__']);
const hasWords = (s) => /[\p{L}\p{N}]/u.test(s);
const hasBrand = (s) => /WPT\s*202/i.test(s);

function walk(dir, root, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).split(path.sep);
    if (entry.isDirectory()) {
      if (SKIP_ANY.has(entry.name) || SKIP_TOP.has(rel[0]) && rel.length === 1) continue;
      walk(full, root, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
      out.push(full);
    }
  }
}

/** String pieces that can end up on screen from an expression such as a ? 'A' : 'B'. */
function literalsIn(node) {
  if (!node) return [];
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isTemplateExpression(node)) return [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) return literalsIn(node.expression);
  if (ts.isConditionalExpression(node)) return [...literalsIn(node.whenTrue), ...literalsIn(node.whenFalse)];
  if (ts.isBinaryExpression(node)) return [...literalsIn(node.left), ...literalsIn(node.right)];
  return [];
}

const nameOf = (n) => (n && (ts.isIdentifier(n) || ts.isStringLiteral(n)) ? n.text : n?.getText?.());

function scanFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];
  const report = (node, why) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line;
    if (/text-ok:/.test(lines[line] ?? '') || /text-ok:/.test(lines[line - 1] ?? '')) return;
    found.push({ file, line: line + 1, why });
  };

  const visit = (node) => {
    if (ts.isJsxText(node) && hasWords(node.text)) report(node, `text typed in JSX: "${node.text.trim().slice(0, 40)}"`);

    if (ts.isJsxAttribute(node) && TEXT_NAMES.has(nameOf(node.name))) {
      const init = node.initializer;
      const pieces = !init ? [] : ts.isStringLiteral(init) ? [init.text] : ts.isJsxExpression(init) ? literalsIn(init.expression) : [];
      if (pieces.some(hasWords)) report(node, `text typed in prop "${nameOf(node.name)}"`);
    }

    if (ts.isJsxExpression(node) && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      if (literalsIn(node.expression).some(hasWords)) report(node, 'text typed inside {} in JSX');
    }

    if (ts.isCallExpression(node) && node.expression.getText(sf) === 'Alert.alert') {
      if (node.arguments.some((a) => literalsIn(a).some(hasWords))) report(node, 'text typed in Alert.alert');
    }

    if (ts.isPropertyAssignment(node) && TEXT_NAMES.has(nameOf(node.name))) {
      if (literalsIn(node.initializer).some(hasWords)) report(node, `text typed in property "${nameOf(node.name)}"`);
    }

    const brandTexts = ts.isJsxText(node) ? [node.text] : literalsIn(node).length && !ts.isBinaryExpression(node) && !ts.isConditionalExpression(node) && !ts.isParenthesizedExpression(node) ? literalsIn(node) : [];
    if (brandTexts.some(hasBrand)) report(node, 'app name typed in code; use appConfig.appName');

    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

const roots = process.argv.slice(2);
if (roots.length === 0) roots.push(...['src/app', 'src/ui'].filter((r) => fs.existsSync(r)));
const files = [];
for (const root of roots) walk(root, root, files);

const problems = files.flatMap(scanFile);
for (const p of problems) console.log(`${p.file}:${p.line}  ${p.why}`);
console.log(`${files.length} file(s) scanned, ${problems.length} problem(s).`);
process.exit(problems.length ? 1 : 0);
