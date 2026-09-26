import test from 'node:test';
import assert from 'node:assert/strict';
import { cssAssets, htmlAssets, externalAsset } from '../scripts/runtime-assets.ts';

test('offline audit catches CSS imports, font URLs and protocol-relative assets', () => {
  const refs = cssAssets(
    '@import "https://cdn.test/a.css"; @font-face { src:url(//fonts.test/a.woff2); } .a{background:url("./a.svg")}',
  );
  assert.deepEqual(refs.filter(externalAsset), ['//fonts.test/a.woff2', 'https://cdn.test/a.css']);
  assert(refs.includes('./a.svg'));
});

test('ordinary documentation/canonical links are allowed, runtime srcsets and media are audited', () => {
  const refs = htmlAssets(
    '<a href="https://docs.test/">Reference</a><link rel="canonical" href="https://site.test/"><script src="/app.js"></script><img srcset="/small.png 1x, https://cdn.test/large.png 2x"><video poster="//cdn.test/poster.jpg" src="/video.mp4"></video>',
  );
  assert.deepEqual(refs.filter(externalAsset), [
    'https://cdn.test/large.png',
    '//cdn.test/poster.jpg',
  ]);
  assert(refs.includes('/app.js'));
  assert(!refs.includes('https://docs.test/'));
});
