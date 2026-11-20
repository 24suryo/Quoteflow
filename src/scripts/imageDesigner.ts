import {
  renderPosterToCanvas,
  exportCanvasAsPng,
  type AspectPresetId,
  type PosterDesignState,
} from './canvasRenderer';

interface DesignerQuoteOption {
  id: string;
  author: string;
  enText: string;
  idText: string;
}

interface DesignerTemplateOption {
  id: string;
  name: string;
  bgType: 'solid' | 'gradient';
  bgColors: string[];
  textColor: string;
  accentColor: string;
  fontFamily: 'Playfair Display' | 'Inter' | 'Lora' | 'Montserrat';
  textAlign: 'left' | 'center' | 'right';
  decoration: 'none' | 'border' | 'quote-marks' | 'divider';
}

export function initImageDesigner(): void {
  const root = document.getElementById('quote-designer-app');
  if (!root) return;

  const canvas = document.getElementById('poster-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const quotes: DesignerQuoteOption[] = JSON.parse(root.dataset.quotes || '[]');
  const templates: DesignerTemplateOption[] = JSON.parse(root.dataset.templates || '[]');
  const defaultLang: 'en' | 'id' = root.dataset.defaultLang === 'id' ? 'id' : 'en';

  const quoteSelect = document.getElementById('dsn-quote-select') as HTMLSelectElement | null;
  const quoteLangSelect = document.getElementById('dsn-quote-lang') as HTMLSelectElement | null;
  const quoteTextInput = document.getElementById('dsn-quote-text') as HTMLTextAreaElement | null;
  const authorTextInput = document.getElementById('dsn-author-text') as HTMLInputElement | null;
  const templateSelect = document.getElementById('dsn-template-select') as HTMLSelectElement | null;
  const aspectSelect = document.getElementById('dsn-aspect-select') as HTMLSelectElement | null;
  const bgTypeSelect = document.getElementById('dsn-bg-type') as HTMLSelectElement | null;
  const bgPrimaryInput = document.getElementById('dsn-bg-primary') as HTMLInputElement | null;
  const bgSecondaryInput = document.getElementById('dsn-bg-secondary') as HTMLInputElement | null;
  const textColorInput = document.getElementById('dsn-text-color') as HTMLInputElement | null;
  const accentColorInput = document.getElementById('dsn-accent-color') as HTMLInputElement | null;
  const fontSelect = document.getElementById('dsn-font-family') as HTMLSelectElement | null;
  const fontSizeInput = document.getElementById('dsn-font-size') as HTMLInputElement | null;
  const fontSizeVal = document.getElementById('dsn-font-size-val');
  const alignSelect = document.getElementById('dsn-text-align') as HTMLSelectElement | null;
  const posInput = document.getElementById('dsn-pos-y') as HTMLInputElement | null;
  const posVal = document.getElementById('dsn-pos-y-val');
  const decoSelect = document.getElementById('dsn-decoration') as HTMLSelectElement | null;
  const watermarkCheck = document.getElementById('dsn-watermark') as HTMLInputElement | null;
  const downloadBtn = document.getElementById('dsn-download-btn') as HTMLButtonElement | null;
  const statusMsg = document.getElementById('dsn-status-msg');

  const initialTpl = templates[0];
  const initialQuote = quotes[0];

  const state: PosterDesignState = {
    quoteText: initialQuote ? (defaultLang === 'id' ? initialQuote.idText : initialQuote.enText) : '',
    authorText: initialQuote ? initialQuote.author : 'QuoteFlow Editorial',
    aspect: 'square',
    bgType: initialTpl?.bgType ?? 'solid',
    bgColorPrimary: initialTpl?.bgColors[0] ?? '#F3EFE6',
    bgColorSecondary: initialTpl?.bgColors[1] ?? '#E6E1D7',
    textColor: initialTpl?.textColor ?? '#292820',
    accentColor: initialTpl?.accentColor ?? '#B69A75',
    fontFamily: initialTpl?.fontFamily ?? 'Playfair Display',
    fontSize: 54,
    textAlign: initialTpl?.textAlign ?? 'center',
    verticalOffsetPct: 0,
    decoration: initialTpl?.decoration ?? 'border',
    showWatermark: true,
  };

  function syncInputsFromState() {
    if (quoteTextInput) quoteTextInput.value = state.quoteText;
    if (authorTextInput) authorTextInput.value = state.authorText;
    if (aspectSelect) aspectSelect.value = state.aspect;
    if (bgTypeSelect) bgTypeSelect.value = state.bgType;
    if (bgPrimaryInput) bgPrimaryInput.value = state.bgColorPrimary;
    if (bgSecondaryInput) bgSecondaryInput.value = state.bgColorSecondary;
    if (textColorInput) textColorInput.value = state.textColor;
    if (accentColorInput) accentColorInput.value = state.accentColor;
    if (fontSelect) fontSelect.value = state.fontFamily;
    if (fontSizeInput) fontSizeInput.value = String(state.fontSize);
    if (fontSizeVal) fontSizeVal.textContent = `${state.fontSize}px`;
    if (alignSelect) alignSelect.value = state.textAlign;
    if (posInput) posInput.value = String(state.verticalOffsetPct);
    if (posVal) posVal.textContent = `${state.verticalOffsetPct}%`;
    if (decoSelect) decoSelect.value = state.decoration;
    if (watermarkCheck) watermarkCheck.checked = state.showWatermark;
  }

  function applyTemplateById(tplId: string) {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    state.bgType = tpl.bgType;
    state.bgColorPrimary = tpl.bgColors[0] || '#F3EFE6';
    state.bgColorSecondary = tpl.bgColors[1] || tpl.bgColors[0] || '#E6E1D7';
    state.textColor = tpl.textColor;
    state.accentColor = tpl.accentColor;
    state.fontFamily = tpl.fontFamily;
    state.textAlign = tpl.textAlign;
    state.decoration = tpl.decoration;
    syncInputsFromState();
    void redraw();
  }

  function loadQuoteById(qId: string, lang: 'en' | 'id') {
    const found = quotes.find((q) => q.id === qId);
    if (!found) return;
    state.quoteText = lang === 'id' ? found.idText : found.enText;
    state.authorText = found.author;
    if (quoteTextInput) quoteTextInput.value = state.quoteText;
    if (authorTextInput) authorTextInput.value = state.authorText;
    void redraw();
  }

  async function redraw() {
    if (!canvas) return;
    await renderPosterToCanvas(canvas, state);
  }

  quoteSelect?.addEventListener('change', () => {
    const lang = (quoteLangSelect?.value as 'en' | 'id') || defaultLang;
    loadQuoteById(quoteSelect.value, lang);
  });

  quoteLangSelect?.addEventListener('change', () => {
    const lang = (quoteLangSelect.value as 'en' | 'id') || defaultLang;
    if (quoteSelect?.value) {
      loadQuoteById(quoteSelect.value, lang);
    }
  });

  quoteTextInput?.addEventListener('input', () => {
    state.quoteText = quoteTextInput.value;
    void redraw();
  });

  authorTextInput?.addEventListener('input', () => {
    state.authorText = authorTextInput.value;
    void redraw();
  });

  templateSelect?.addEventListener('change', () => {
    applyTemplateById(templateSelect.value);
  });

  aspectSelect?.addEventListener('change', () => {
    state.aspect = (aspectSelect.value as AspectPresetId) || 'square';
    void redraw();
  });

  bgTypeSelect?.addEventListener('change', () => {
    state.bgType = bgTypeSelect.value === 'gradient' ? 'gradient' : 'solid';
    void redraw();
  });

  bgPrimaryInput?.addEventListener('input', () => {
    state.bgColorPrimary = bgPrimaryInput.value;
    void redraw();
  });

  bgSecondaryInput?.addEventListener('input', () => {
    state.bgColorSecondary = bgSecondaryInput.value;
    void redraw();
  });

  textColorInput?.addEventListener('input', () => {
    state.textColor = textColorInput.value;
    void redraw();
  });

  accentColorInput?.addEventListener('input', () => {
    state.accentColor = accentColorInput.value;
    void redraw();
  });

  fontSelect?.addEventListener('change', () => {
    state.fontFamily = fontSelect.value as PosterDesignState['fontFamily'];
    void redraw();
  });

  fontSizeInput?.addEventListener('input', () => {
    state.fontSize = Number(fontSizeInput.value) || 54;
    if (fontSizeVal) fontSizeVal.textContent = `${state.fontSize}px`;
    void redraw();
  });

  alignSelect?.addEventListener('change', () => {
    state.textAlign = alignSelect.value as PosterDesignState['textAlign'];
    void redraw();
  });

  posInput?.addEventListener('input', () => {
    state.verticalOffsetPct = Number(posInput.value) || 0;
    if (posVal) posVal.textContent = `${state.verticalOffsetPct}%`;
    void redraw();
  });

  decoSelect?.addEventListener('change', () => {
    state.decoration = decoSelect.value as PosterDesignState['decoration'];
    void redraw();
  });

  watermarkCheck?.addEventListener('change', () => {
    state.showWatermark = watermarkCheck.checked;
    void redraw();
  });

  downloadBtn?.addEventListener('click', () => {
    if (!canvas) return;
    const filename = `quoteflow-${state.aspect}-${Date.now()}.png`;
    const ok = exportCanvasAsPng(canvas, filename);
    if (statusMsg) {
      statusMsg.hidden = false;
      statusMsg.textContent = ok
        ? defaultLang === 'id'
          ? `Poster berhasil diunduh: ${filename}`
          : `Poster downloaded: ${filename}`
        : defaultLang === 'id'
          ? 'Gagal mengunduh gambar.'
          : 'Failed to export PNG image.';
    }
  });

  // Handle URL query ?quoteId=...&lang=...
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('quoteId');
  const langParam = params.get('lang') === 'id' ? 'id' : defaultLang;
  if (quoteLangSelect) quoteLangSelect.value = langParam;

  if (qParam) {
    const matched = quotes.find((q) => q.id === qParam);
    if (matched) {
      if (quoteSelect) quoteSelect.value = matched.id;
      state.quoteText = langParam === 'id' ? matched.idText : matched.enText;
      state.authorText = matched.author;
    }
  }

  syncInputsFromState();
  void redraw();
}