interface PreviewQuote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export function initHomePreview(): void {
  const container = document.getElementById('home-generator-preview');
  if (!container) return;

  const rawData = container.dataset.quotes;
  const designerBase = container.dataset.designerUrl || '/designer/';
  if (!rawData) return;

  const quotes: PreviewQuote[] = JSON.parse(rawData);
  if (quotes.length === 0) return;

  let currentIndex = 0;

  const quoteTextEl = document.getElementById('preview-quote-text');
  const quoteAuthorEl = document.getElementById('preview-quote-author');
  const quoteCatEl = document.getElementById('preview-quote-category');
  const shuffleBtn = document.getElementById('preview-shuffle-btn');
  const copyBtn = document.getElementById('preview-copy-btn') as HTMLButtonElement | null;
  const designLink = document.getElementById('preview-design-link') as HTMLAnchorElement | null;

  function render(index: number) {
    const item = quotes[index];
    if (quoteTextEl) quoteTextEl.textContent = `“${item.text}”`;
    if (quoteAuthorEl) quoteAuthorEl.textContent = `— ${item.author}`;
    if (quoteCatEl) quoteCatEl.textContent = item.category;
    if (designLink) designLink.href = `${designerBase}?quoteId=${item.id}`;
  }

  shuffleBtn?.addEventListener('click', () => {
    if (quotes.length <= 1) return;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * quotes.length);
    }
    currentIndex = next;
    render(currentIndex);
  });

  copyBtn?.addEventListener('click', async () => {
    const item = quotes[currentIndex];
    const formatted = `"${item.text}" — ${item.author}`;
    try {
      await navigator.clipboard.writeText(formatted);
      const originalText = copyBtn.dataset.defaultLabel || 'Copy';
      copyBtn.textContent = copyBtn.dataset.copiedLabel || 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 1600);
    } catch {
      // Ignore clipboard failure
    }
  });

  document.querySelectorAll<HTMLButtonElement>('.copy-quote-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.text || '';
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.dataset.defaultLabel || 'Copy';
        btn.textContent = btn.dataset.copiedLabel || 'Copied!';
        setTimeout(() => {
          btn.textContent = orig;
        }, 1600);
      } catch {
        // Ignore clipboard failure
      }
    });
  });
}