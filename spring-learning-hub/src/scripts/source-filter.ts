import { filterBlocks, type FilterBlock } from '../utils/source-filter.ts';
import type { SourceId } from '../content/schemas/knowledge.ts';

class SourceFilter extends HTMLElement {
  #events?: AbortController;

  connectedCallback() {
    this.#events?.abort();
    this.#events = new AbortController();
    const options = { signal: this.#events.signal };
    const page = document.querySelector<HTMLElement>('.sl-markdown-content');
    if (!page) return;
    const elements = Array.from(page.querySelectorAll<HTMLElement>('[data-source-block]'));
    const blocks: FilterBlock[] = elements.map((element) => ({
      id: element.id,
      source: element.dataset.source as SourceId,
      contexts: (element.dataset.context ?? '').split(/\s+/).filter(Boolean),
      corrects: element.dataset.corrects,
    }));
    const inputs = Array.from(this.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const fieldset = this.querySelector('fieldset');
    if (!fieldset) return;
    fieldset.disabled = false;
    for (const input of inputs) {
      const available = blocks.some((block) => block.source === input.value);
      input.disabled = !available;
      input.checked = available;
      const note = this.querySelector<HTMLElement>(`[data-unavailable="${input.value}"]`);
      if (note) note.hidden = available;
    }
    const apply = () => {
      const selected = new Set(
        inputs.filter((input) => input.checked).map((input) => input.value as SourceId),
      );
      const visibility = filterBlocks(blocks, selected);
      for (const element of elements) {
        const state = visibility.get(element.id) ?? 'hidden';
        element.hidden = state === 'hidden';
        element.dataset.visibility = state;
        const body = element.querySelector<HTMLElement>('[data-block-body]');
        const summary = element.querySelector<HTMLElement>('[data-block-summary]');
        const contextLabel = element.querySelector<HTMLElement>('[data-context-label]');
        const correctionLabel = element.querySelector<HTMLElement>('[data-correction-label]');
        if (body) body.hidden = state === 'context';
        if (summary) summary.hidden = state !== 'context';
        if (contextLabel) contextLabel.hidden = state !== 'context';
        if (correctionLabel) correctionLabel.hidden = state !== 'correction';
      }
      page.querySelectorAll<HTMLElement>('[data-source-group]').forEach((group) => {
        const children = Array.from(group.querySelectorAll<HTMLElement>('[data-source-block]'));
        group.hidden = children.length > 0 && children.every((block) => block.hidden);
      });
      // Preserve the native TOC, removing links only when their heading is hidden.
      document
        .querySelectorAll<HTMLAnchorElement>('starlight-toc a, mobile-starlight-toc a')
        .forEach((link) => {
          const heading = document.getElementById(
            decodeURIComponent(new URL(link.href).hash.slice(1)),
          );
          link.hidden = Boolean(heading?.closest('[hidden]'));
        });
      const states = [...visibility.values()];
      const count = (value: string) =>
        new Intl.NumberFormat('fa-IR').format(states.filter((state) => state === value).length);
      const status = this.querySelector<HTMLElement>('[data-filter-status]');
      if (status)
        status.textContent = selected.size
          ? `${count('full')} بخش انتخاب‌شده؛ ${count('context')} زمینهٔ لازم؛ ${count('correction')} اصلاح همراه.`
          : 'هیچ منبعی انتخاب نشده است. یک منبع را فعال کنید یا «نمایش همه» را بزنید.';
    };
    inputs.forEach((input) => input.addEventListener('change', apply, options));
    const selectAll = () => {
      inputs.forEach((input) => {
        input.checked = !input.disabled;
      });
      apply();
    };
    this.querySelector('[data-select-all]')?.addEventListener('click', selectAll, options);
    window.addEventListener(
      'hashchange',
      () => {
        let id: string;
        try {
          id = decodeURIComponent(window.location.hash.slice(1));
        } catch {
          return;
        }
        const target = document.getElementById(id);
        const block = target?.closest<HTMLElement>('[data-source-block]');
        if (target?.closest('[hidden]') || block?.dataset.visibility === 'context') {
          selectAll();
          target?.scrollIntoView({ block: 'start' });
        }
      },
      options,
    );
    apply();
  }

  disconnectedCallback() {
    this.#events?.abort();
  }
}
if (!customElements.get('kb-source-filter'))
  customElements.define('kb-source-filter', SourceFilter);
