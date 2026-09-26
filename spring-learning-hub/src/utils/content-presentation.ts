import type { Knowledge } from '../content/schemas/knowledge.ts';

export const sectionLabels = {
  home: 'خانه',
  tuesday: 'کلاس‌های سه‌شنبه',
  thursday: 'جلسه‌های پنج‌شنبه',
  concepts: 'مفاهیم',
} as const;

export const statusLabels: Record<Exclude<Knowledge, { type: 'index' }>['status'], string> = {
  draft: 'پیش‌نویس',
  'in-progress': 'در حال تدوین',
  complete: 'تکمیل‌شده',
  'needs-follow-up': 'نیازمند پیگیری',
};

export const persianNumber = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));

export function documentHref(id: string): string {
  const path = id.replace(/(^|\/)index$/, '').replace(/\/$/, '');
  return path ? `/${path}/` : '/';
}
