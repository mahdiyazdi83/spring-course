import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import stableHeadings from './scripts/remark-stable-headings.mjs';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [stableHeadings] }) },
  integrations: [
    starlight({
      title: 'دانش‌نامهٔ Spring',
      description: 'پایگاه داخلی یادگیری Spring؛ جلسه‌ها، منابع و مفاهیم مرتبط.',
      locales: { root: { label: 'فارسی', lang: 'fa', dir: 'rtl' } },
      pagefind: true,
      pagination: false,
      lastUpdated: false,
      credits: false,
      customCss: [
        './src/styles/theme.css',
        './src/styles/documentation.css',
        './src/styles/dashboard.css',
      ],
      expressiveCode: {
        styleOverrides: {
          codeBackground: 'var(--kb-code)',
          borderColor: 'var(--kb-border)',
          borderRadius: 'var(--kb-radius)',
          codeFontFamily: 'var(--sl-font-mono)',
        },
      },
      components: {
        SiteTitle: './src/components/common/SiteTitle.astro',
        PageTitle: './src/components/documentation/PageTitle.astro',
        Footer: './src/components/documentation/KnowledgeFooter.astro',
      },
      sidebar: [
        { label: 'خانه', link: '/' },
        { label: 'کلاس‌های سه‌شنبه', items: [{ autogenerate: { directory: 'tuesday' } }] },
        { label: 'جلسه‌های پنج‌شنبه', items: [{ autogenerate: { directory: 'thursday' } }] },
        { label: 'مفاهیم', items: [{ autogenerate: { directory: 'concepts' } }] },
      ],
    }),
  ],
});
