import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cssAssets, htmlAssets, externalAsset } from './runtime-assets.ts';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = new Map<string, string>();
const styles = new Map<string, string>();
const files = new Set<string>();
async function walk(path: string) {
  for (const item of await readdir(path, { withFileTypes: true })) {
    const file = join(path, item.name);
    if (item.isDirectory()) await walk(file);
    else {
      const name = relative(root, file).split(sep).join('/');
      files.add(name);
      if (item.name.endsWith('.html')) pages.set(name, await readFile(file, 'utf8'));
      if (item.name.endsWith('.css')) styles.set(name, await readFile(file, 'utf8'));
    }
  }
}
await walk(root);
assert(pages.size > 0, 'Build the site first.');
let checked = 0;
let resourceCount = 0;
function checkAssets(file: string, assets: string[]) {
  for (const value of assets) {
    assert(!externalAsset(value), file + ': required external runtime asset ' + value);
    if (!value || value.startsWith('data:') || value.startsWith('#')) continue;
    const url = new URL(value, 'http://local.test/' + file);
    assert(url.protocol === 'http:', file + ': unsupported runtime resource ' + value);
    const path = decodeURIComponent(url.pathname.slice(1));
    assert(files.has(path), file + ': missing local runtime asset ' + value);
    resourceCount++;
  }
}
for (const [file, html] of pages) {
  const base = 'http://local.test/' + file.replace(/index\.html$/, '');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
  assert.equal(new Set(ids).size, ids.length, file + ': duplicate HTML IDs');
  for (const match of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = match[1]!;
    if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;
    const url = new URL(href, base);
    if (url.origin !== 'http://local.test') continue;
    const targetPath = decodeURIComponent(url.pathname).replace(/^\//, '');
    const targetFile =
      targetPath.endsWith('/') || !targetPath ? targetPath + 'index.html' : targetPath;
    const target = pages.get(targetFile);
    assert(target !== undefined, file + ': missing local page ' + href);
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(target.includes('id="' + id + '"'), file + ': missing anchor ' + href);
    }
    checked++;
  }
  checkAssets(file, htmlAssets(html));
}
for (const [file, css] of styles) checkAssets(file, cssAssets(css));
assert((await stat(join(root, 'pagefind/pagefind.js'))).size > 0, 'Missing search runtime');
assert((await stat(join(root, 'pagefind/pagefind-entry.json'))).size > 0, 'Missing search index');
const index = JSON.parse(await readFile(join(root, 'pagefind/pagefind-entry.json'), 'utf8'));
const expectedPages = [...pages.values()].filter((html) =>
  /\sdata-pagefind-body(?:[=>\s])/.test(html),
).length;
assert(
  expectedPages > 0 && index.languages.fa?.page_count === expectedPages,
  'Persian search corpus does not match indexable built pages',
);
console.log('Runtime resources: ' + resourceCount + '; indexed pages: ' + expectedPages);
console.log(
  `Verified ${pages.size} built pages, ${checked} internal links/anchors, local runtime assets and Persian Pagefind index.`,
);
