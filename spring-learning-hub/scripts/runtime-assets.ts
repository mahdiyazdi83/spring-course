/** Static resource discovery for our generated HTML/CSS (not a general HTML parser). */
export function cssAssets(css: string): string[] {
  return [
    ...[...css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gs)].map((m) => m[2]!),
    ...[...css.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]!),
  ];
}

export function htmlAssets(html: string): string[] {
  const assets: string[] = [];
  for (const match of html.matchAll(/<(script|link|img|source|video|audio|iframe)\b[^>]*>/g)) {
    const tag = match[0];
    if (match[1] === 'link' && !/rel=["'](?:stylesheet|preload|modulepreload|icon)["']/.test(tag))
      continue;
    for (const attr of tag.matchAll(/\s(?:src|href|poster)=["']([^"']+)["']/g))
      assets.push(attr[1]!);
    const srcset = /\ssrcset=["']([^"']+)["']/.exec(tag)?.[1];
    if (srcset && !srcset.startsWith('data:')) {
      assets.push(...srcset.split(',').map((part) => part.trim().split(/\s+/)[0]!));
    }
  }
  for (const style of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g))
    assets.push(...cssAssets(style[1]!));
  for (const style of html.matchAll(/\sstyle=["']([^"']+)["']/g))
    assets.push(...cssAssets(style[1]!));
  return assets;
}

export function externalAsset(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value.trim());
}
