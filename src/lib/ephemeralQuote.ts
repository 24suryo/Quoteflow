export type BgSourceMode = 'none' | 'upload' | 'random';
export type QuoteLocale = 'id' | 'en';

export interface QuoteThemePreset {
  id: string;
  nameId: string;
  nameEn: string;
  baseBg: string;
  overlayBg: string;
  textColor: string;
  authorColor: string;
}

export interface EphemeralQuoteState {
  quote: string;
  author: string;
  themeId: string;
  bgMode: BgSourceMode;
  bgUrl: string | null;
}

export interface QuoteUiCopy {
  ephemeralNotice: string;
  quoteLabel: string;
  quotePlaceholder: string;
  quoteCanvasPlaceholder: string;
  authorLabel: string;
  authorPlaceholder: string;
  colorLabel: string;
  uploadBtn: string;
  randomBtn: string;
  clearBgBtn: string;
  resetBtn: string;
  downloadBtn: string;
  loadingRandom: string;
  loadingUpload: string;
  loadedRandom: string;
  loadedUpload: string;
  loadFailed: string;
  invalidFileType: string;
  fileTooLarge: string;
  emptyRandomPool: string;
  bgCleared: string;
  allReset: string;
  corsDownloadError: string;
  downloadFilename: string;
}

export const QUOTE_UI_COPY: Record<QuoteLocale, QuoteUiCopy> = {
  id: {
    ephemeralNotice:
      'Sesi sementara: teks, nama penulis, dan gambar tidak disimpan di situs dan akan hilang saat halaman ditutup atau di-reset.',
    quoteLabel: 'Isi Kutipan (Bebas)',
    quotePlaceholder: 'Tulis kutipan bebas...',
    quoteCanvasPlaceholder: 'Ketik kutipan bebas di sini...',
    authorLabel: 'Nama Penulis',
    authorPlaceholder: 'Masukkan nama penulis...',
    colorLabel: 'Warna:',
    uploadBtn: 'Upload Background Sendiri',
    randomBtn: 'Background Random Gratis',
    clearBgBtn: 'Hapus Background Foto',
    resetBtn: 'Reset Semua',
    downloadBtn: 'Unduh PNG',
    loadingRandom: 'Memuat gambar random gratis...',
    loadingUpload: 'Memuat gambar lokal...',
    loadedRandom: 'Gambar random gratis diterapkan (tidak disimpan di server).',
    loadedUpload: 'Gambar lokal diterapkan di browser (tidak diunggah ke server).',
    loadFailed: 'Gambar gagal dimuat, kembali ke latar warna.',
    invalidFileType: 'Pilih file gambar (JPG, PNG, atau WebP).',
    fileTooLarge: 'Ukuran file maksimal 8 MB.',
    emptyRandomPool: 'Daftar gambar random kosong.',
    bgCleared: 'Background foto dihapus, memakai warna tema.',
    allReset: 'Semua input dan background sementara telah di-reset.',
    corsDownloadError:
      'Tidak bisa mengunduh PNG dari gambar eksternal tanpa izin CORS; coba upload gambar lokal.',
    downloadFilename: 'quoteflow-poster-id.png',
  },
  en: {
    ephemeralNotice:
      'Ephemeral session: text, author name, and images are not stored on the site and disappear when closed or reset.',
    quoteLabel: 'Quote Text (Freeform)',
    quotePlaceholder: 'Write any quote...',
    quoteCanvasPlaceholder: 'Type your quote here...',
    authorLabel: 'Author Name',
    authorPlaceholder: 'Enter author name...',
    colorLabel: 'Color:',
    uploadBtn: 'Upload Own Background',
    randomBtn: 'Free Random Background',
    clearBgBtn: 'Remove Photo Background',
    resetBtn: 'Reset All',
    downloadBtn: 'Download PNG',
    loadingRandom: 'Loading free random background...',
    loadingUpload: 'Loading local image...',
    loadedRandom: 'Free random background applied (not stored on server).',
    loadedUpload: 'Local image applied in browser (not uploaded to server).',
    loadFailed: 'Background image failed to load, reverted to solid color.',
    invalidFileType: 'Please choose an image file (JPG, PNG, or WebP).',
    fileTooLarge: 'Maximum image size is 8 MB.',
    emptyRandomPool: 'Random background list is empty.',
    bgCleared: 'Photo background removed, using color theme.',
    allReset: 'All inputs and temporary backgrounds have been reset.',
    corsDownloadError:
      'Cannot export PNG from external image without CORS permission; try uploading a local image.',
    downloadFilename: 'quoteflow-poster-en.png',
  },
};

export const QUOTE_THEME_PRESETS: QuoteThemePreset[] = [
  {
    id: 'classic-dark',
    nameId: 'Classic Dark',
    nameEn: 'Classic Dark',
    baseBg: '#181c22',
    overlayBg: 'rgba(12, 15, 20, 0.56)',
    textColor: '#f8fafc',
    authorColor: '#e2c07d',
  },
  {
    id: 'warm-sand',
    nameId: 'Warm Sand',
    nameEn: 'Warm Sand',
    baseBg: '#efe7d6',
    overlayBg: 'rgba(20, 20, 20, 0.52)',
    textColor: '#ffffff',
    authorColor: '#fde68a',
  },
  {
    id: 'deep-pine',
    nameId: 'Deep Pine',
    nameEn: 'Deep Pine',
    baseBg: '#132a24',
    overlayBg: 'rgba(10, 22, 19, 0.58)',
    textColor: '#ecfdf5',
    authorColor: '#6ee7b7',
  },
];

export const FREE_RANDOM_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
];

export function cleanupBlobUrl(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

export function getNextRandomImage(currentUrl: string | null): string | null {
  if (FREE_RANDOM_IMAGES.length === 0) return null;
  if (FREE_RANDOM_IMAGES.length === 1) return FREE_RANDOM_IMAGES[0];

  const pool = FREE_RANDOM_IMAGES.filter((item) => item !== currentUrl);
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function loadImageSafe(src: string, enableCors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (enableCors) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number): void {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawW = w;
  let drawH = h;
  let dx = 0;
  let dy = 0;

  if (imgRatio > boxRatio) {
    drawW = h * imgRatio;
    dx = -(drawW - w) / 2;
  } else {
    drawH = w / imgRatio;
    dy = -(drawH - h) / 2;
  }

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function wrapLines(ctx: CanvasRenderingContext2D, rawText: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = rawText.split('\n');

  for (const p of paragraphs) {
    const words = p.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${line} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
  }

  return lines;
}

export function drawQuotePoster(
  canvas: HTMLCanvasElement,
  state: EphemeralQuoteState,
  theme: QuoteThemePreset,
  bgImage: HTMLImageElement | null,
  fallbackPlaceholder: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = theme.baseBg;
  ctx.fillRect(0, 0, width, height);

  const hasPhoto = Boolean(bgImage && state.bgMode !== 'none');
  if (hasPhoto && bgImage) {
    drawCover(ctx, bgImage, width, height);
    ctx.fillStyle = theme.overlayBg;
    ctx.fillRect(0, 0, width, height);
  }

  const quoteText = state.quote.trim() || fallbackPlaceholder;
  ctx.save();
  ctx.fillStyle = hasPhoto ? theme.textColor : theme.baseBg === '#efe7d6' ? '#1f2937' : theme.textColor;
  ctx.font = '600 44px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const padX = 76;
  const maxWidth = width - padX * 2;
  const lines = wrapLines(ctx, quoteText, maxWidth);
  const lineHeight = 62;
  const blockHeight = lines.length * lineHeight;
  const startY = Math.max(88, (height - blockHeight) / 2 - 24);

  lines.forEach((line, idx) => {
    ctx.fillText(line, padX, startY + idx * lineHeight);
  });

  const authorText = state.author.trim();
  if (authorText) {
    ctx.fillStyle = hasPhoto ? theme.authorColor : theme.baseBg === '#efe7d6' ? '#92400e' : theme.authorColor;
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(`— ${authorText}`, padX, startY + blockHeight + 34);
  }

  ctx.restore();
}
