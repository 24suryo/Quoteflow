import { getFavorites, getHistory, toggleFavorite, type HistoryEntry } from './store';

interface ClientQuoteRecord {
  id: string;
  author: string;
  category: string;
  text: string;
  detailUrl: string;
  designerUrl: string;
}

export function initFavoritesPage(): void {
  const root = document.getElementById('favorites-app');
  if (!root) return;

  const locale: 'en' | 'id' = root.dataset.locale === 'id' ? 'id' : 'en';
  const catalog: ClientQuoteRecord[] = JSON.parse(root.dataset.quotes || '[]');
  const byId = new Map<string, ClientQuoteRecord>(catalog.map((item) => [item.id, item]));

  const favContainer = document.getElementById('fav-list-container');
  const histContainer = document.getElementById('history-list-container');
  const favCountEl = document.getElementById('fav-count-badge');

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderAll() {
    const favIds: string[] = getFavorites();
    const historyEntries: HistoryEntry[] = getHistory();

    if (favCountEl) {
      favCountEl.textContent =
        locale === 'id' ? `${favIds.length} tersimpan` : `${favIds.length} saved`;
    }

    if (favContainer) {
      const favItems = favIds
        .map((id: string) => byId.get(id))
        .filter((item): item is ClientQuoteRecord => Boolean(item));

      if (favItems.length === 0) {
        favContainer.innerHTML = `<p class="empty-note">${
          locale === 'id'
            ? 'Belum ada kutipan favorit. Simpan kutipan dari Generator untuk melihatnya di sini.'
            : 'No favorite quotes saved yet. Bookmark any quote from the Generator to see it here.'
        }</p>`;
      } else {
        favContainer.innerHTML = '';
        for (const item of favItems) {
          const card = document.createElement('article');
          card.className = 'card fav-card';
          card.innerHTML = `
            <span class="badge">${escapeHtml(item.category)}</span>
            <blockquote class="fav-quote">“${escapeHtml(item.text)}”</blockquote>
            <div class="fav-meta">
              <span>— ${escapeHtml(item.author)}</span>
              <div class="fav-actions">
                <a href="${escapeHtml(item.designerUrl)}" class="fav-btn-link">${
                  locale === 'id' ? 'Desain PNG' : 'Design PNG'
                }</a>
                <button type="button" class="fav-remove-btn" data-id="${escapeHtml(item.id)}">${
                  locale === 'id' ? 'Hapus' : 'Remove'
                }</button>
              </div>
            </div>
          `;
          card.querySelector('.fav-remove-btn')?.addEventListener('click', () => {
            toggleFavorite(item.id);
            renderAll();
          });
          favContainer.appendChild(card);
        }
      }
    }

    if (histContainer) {
      const histItems = historyEntries
        .slice(0, 8)
        .map((h: HistoryEntry) => byId.get(h.quoteId))
        .filter((item): item is ClientQuoteRecord => Boolean(item));

      if (histItems.length === 0) {
        histContainer.innerHTML = `<p class="empty-note">${
          locale === 'id'
            ? 'Belum ada riwayat kutipan yang dilihat.'
            : 'No recently viewed quotes recorded yet.'
        }</p>`;
      } else {
        histContainer.innerHTML = '';
        for (const item of histItems) {
          const row = document.createElement('a');
          row.href = item.detailUrl;
          row.className = 'card hist-row';
          row.innerHTML = `
            <span class="hist-quote">“${escapeHtml(item.text)}”</span>
            <span class="hist-author">— ${escapeHtml(item.author)}</span>
          `;
          histContainer.appendChild(row);
        }
      }
    }
  }

  renderAll();
  window.addEventListener('quoteflow:favorites-changed', renderAll);
}