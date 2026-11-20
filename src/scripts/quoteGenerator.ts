import {
  isFavorite,
  toggleFavorite,
  recordViewedQuote,
  savePreferences,
} from './store';

export interface LocalizedQuotePayload {
  text: string;
  category: string;
  interpretation: string;
}

export interface GeneratorQuoteItem {
  id: string;
  categoryId: string;
  author: string;
  isOriginal: boolean;
  tags: string[];
  locales: {
    en: LocalizedQuotePayload;
    id: LocalizedQuotePayload;
  };
}

export function initQuoteGenerator(): void {
  const root = document.getElementById('quote-generator-app');
  if (!root) return;

  const rawQuotes = root.dataset.quotes;
  if (!rawQuotes) return;

  const allQuotes: GeneratorQuoteItem[] = JSON.parse(rawQuotes);
  if (allQuotes.length === 0) return;

  let activeLocale: 'en' | 'id' = root.dataset.defaultLocale === 'id' ? 'id' : 'en';
  let selectedCategory = 'all';
  let searchQuery = '';
  let filteredQuotes: GeneratorQuoteItem[] = [...allQuotes];
  let currentIndex = 0;

  const searchInput = document.getElementById('gen-search-input') as HTMLInputElement | null;
  const categorySelect = document.getElementById('gen-category-select') as HTMLSelectElement | null;
  const langToggleBtn = document.getElementById('gen-lang-toggle') as HTMLButtonElement | null;
  const randomBtn = document.getElementById('gen-random-btn') as HTMLButtonElement | null;
  const prevBtn = document.getElementById('gen-prev-btn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('gen-next-btn') as HTMLButtonElement | null;
  const favBtn = document.getElementById('gen-fav-btn') as HTMLButtonElement | null;
  const copyTextBtn = document.getElementById('gen-copy-text-btn') as HTMLButtonElement | null;
  const copyFullBtn = document.getElementById('gen-copy-full-btn') as HTMLButtonElement | null;
  const shareBtn = document.getElementById('gen-share-btn') as HTMLButtonElement | null;
  const designerLink = document.getElementById('gen-designer-link') as HTMLAnchorElement | null;

  const counterEl = document.getElementById('gen-counter');
  const categoryBadgeEl = document.getElementById('gen-category-badge');
  const originBadgeEl = document.getElementById('gen-origin-badge');
  const quoteTextEl = document.getElementById('gen-quote-text');
  const quoteAuthorEl = document.getElementById('gen-quote-author');
  const quoteInterpEl = document.getElementById('gen-quote-interp');
  const statusToastEl = document.getElementById('gen-status-toast');
  const relatedListEl = document.getElementById('gen-related-list');

  let toastTimer: number | undefined;

  function notify(msg: string) {
    if (!statusToastEl) return;
    statusToastEl.textContent = msg;
    statusToastEl.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      if (statusToastEl) statusToastEl.hidden = true;
    }, 2000);
  }

  function updateFavoriteButton(quoteId: string) {
    if (!favBtn) return;
    const saved = isFavorite(quoteId);
    favBtn.setAttribute('aria-pressed', String(saved));
    favBtn.classList.toggle('is-favorited', saved);
    const savedText = favBtn.dataset.savedLabel || 'Favorited';
    const unsavedText = favBtn.dataset.saveLabel || 'Favorite';
    favBtn.textContent = saved ? `★ ${savedText}` : `☆ ${unsavedText}`;
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderRelated(current: GeneratorQuoteItem) {
    if (!relatedListEl) return;
    const related = allQuotes
      .filter((item) => item.categoryId === current.categoryId && item.id !== current.id)
      .slice(0, 3);

    relatedListEl.innerHTML = '';
    for (const rel of related) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card related-item';
      const text = rel.locales[activeLocale].text;
      card.innerHTML = `<p class="related-quote">“${escapeHtml(text)}”</p><span class="related-author">— ${escapeHtml(rel.author)}</span>`;
      card.addEventListener('click', () => {
        const idxInFiltered = filteredQuotes.findIndex((q) => q.id === rel.id);
        if (idxInFiltered >= 0) {
          currentIndex = idxInFiltered;
          renderCurrent();
        } else {
          selectedCategory = 'all';
          searchQuery = '';
          if (categorySelect) categorySelect.value = 'all';
          if (searchInput) searchInput.value = '';
          applyFilters(rel.id);
        }
      });
      relatedListEl.appendChild(card);
    }
  }

  function renderCurrent() {
    if (filteredQuotes.length === 0) {
      if (quoteTextEl) {
        quoteTextEl.textContent =
          activeLocale === 'id'
            ? 'Tidak ada kutipan yang cocok dengan filter atau kata kunci Anda.'
            : 'No quotes match your current filter or search query.';
      }
      if (quoteAuthorEl) quoteAuthorEl.textContent = '';
      if (quoteInterpEl) quoteInterpEl.textContent = '';
      if (counterEl) counterEl.textContent = '0 / 0';
      return;
    }

    const item = filteredQuotes[currentIndex];
    const localized = item.locales[activeLocale];

    if (quoteTextEl) quoteTextEl.textContent = `“${localized.text}”`;
    if (quoteAuthorEl) quoteAuthorEl.textContent = `— ${item.author}`;
    if (categoryBadgeEl) categoryBadgeEl.textContent = localized.category;
    if (quoteInterpEl) quoteInterpEl.textContent = localized.interpretation;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${filteredQuotes.length}`;

    if (originBadgeEl) {
      originBadgeEl.textContent = item.isOriginal
        ? activeLocale === 'id'
          ? 'Kutipan Orisinal'
          : 'Original'
        : activeLocale === 'id'
          ? 'Arsip Terverifikasi'
          : 'Verified Archive';
    }

    if (langToggleBtn) {
      langToggleBtn.textContent = activeLocale === 'en' ? 'EN → ID' : 'ID → EN';
    }

    if (designerLink) {
      const base = designerLink.dataset.baseHref || '/designer/';
      designerLink.href = `${base}?quoteId=${encodeURIComponent(item.id)}&lang=${activeLocale}`;
    }

    updateFavoriteButton(item.id);
    recordViewedQuote(item.id);
    renderRelated(item);
  }

  function applyFilters(preferredQuoteId?: string) {
    const qLower = searchQuery.trim().toLowerCase();
    filteredQuotes = allQuotes.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (!qLower) return true;
      const enMatch =
        item.locales.en.text.toLowerCase().includes(qLower) ||
        item.locales.en.interpretation.toLowerCase().includes(qLower);
      const idMatch =
        item.locales.id.text.toLowerCase().includes(qLower) ||
        item.locales.id.interpretation.toLowerCase().includes(qLower);
      const authorMatch = item.author.toLowerCase().includes(qLower);
      const tagMatch = item.tags.some((t) => t.toLowerCase().includes(qLower));
      return enMatch || idMatch || authorMatch || tagMatch;
    });

    if (preferredQuoteId) {
      const foundIdx = filteredQuotes.findIndex((q) => q.id === preferredQuoteId);
      currentIndex = foundIdx >= 0 ? foundIdx : 0;
    } else {
      currentIndex = 0;
    }

    renderCurrent();
  }

  randomBtn?.addEventListener('click', () => {
    if (filteredQuotes.length <= 1) return;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * filteredQuotes.length);
    }
    currentIndex = next;
    renderCurrent();
  });

  prevBtn?.addEventListener('click', () => {
    if (filteredQuotes.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredQuotes.length) % filteredQuotes.length;
    renderCurrent();
  });

  nextBtn?.addEventListener('click', () => {
    if (filteredQuotes.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredQuotes.length;
    renderCurrent();
  });

  langToggleBtn?.addEventListener('click', () => {
    activeLocale = activeLocale === 'en' ? 'id' : 'en';
    savePreferences({ locale: activeLocale });
    renderCurrent();
  });

  categorySelect?.addEventListener('change', () => {
    selectedCategory = categorySelect.value;
    savePreferences({ lastCategoryId: selectedCategory });
    applyFilters();
  });

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    applyFilters();
  });

  favBtn?.addEventListener('click', () => {
    if (filteredQuotes.length === 0) return;
    const item = filteredQuotes[currentIndex];
    const res = toggleFavorite(item.id);
    updateFavoriteButton(item.id);
    notify(
      res.favorited
        ? activeLocale === 'id'
          ? 'Ditambahkan ke Favorit.'
          : 'Added to Favorites.'
        : activeLocale === 'id'
          ? 'Dihapus dari Favorit.'
          : 'Removed from Favorites.'
    );
  });

  copyTextBtn?.addEventListener('click', async () => {
    if (filteredQuotes.length === 0) return;
    const textOnly = filteredQuotes[currentIndex].locales[activeLocale].text;
    try {
      await navigator.clipboard.writeText(textOnly);
      notify(activeLocale === 'id' ? 'Teks kutipan disalin.' : 'Quote text copied.');
    } catch {
      notify(activeLocale === 'id' ? 'Gagal menyalin ke clipboard.' : 'Clipboard access blocked.');
    }
  });

  copyFullBtn?.addEventListener('click', async () => {
    if (filteredQuotes.length === 0) return;
    const item = filteredQuotes[currentIndex];
    const formatted = `“${item.locales[activeLocale].text}” — ${item.author}`;
    try {
      await navigator.clipboard.writeText(formatted);
      notify(activeLocale === 'id' ? 'Kutipan & penulis disalin.' : 'Quote & author copied.');
    } catch {
      notify(activeLocale === 'id' ? 'Gagal menyalin ke clipboard.' : 'Clipboard access blocked.');
    }
  });

  shareBtn?.addEventListener('click', async () => {
    if (filteredQuotes.length === 0) return;
    const item = filteredQuotes[currentIndex];
    const shareText = `“${item.locales[activeLocale].text}” — ${item.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuoteFlow',
          text: shareText,
          url: window.location.href,
        });
        notify(activeLocale === 'id' ? 'Kutipan dibagikan.' : 'Shared successfully.');
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} (${window.location.href})`);
      notify(activeLocale === 'id' ? 'Tautan & kutipan disalin.' : 'Quote & link copied for sharing.');
    } catch {
      notify(activeLocale === 'id' ? 'Tidak dapat membagikan.' : 'Unable to share.');
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuoteId = urlParams.get('quoteId') || undefined;
  renderRelated(allQuotes[0]);
  if (initialQuoteId) {
    applyFilters(initialQuoteId);
  } else {
    renderCurrent();
  }
}