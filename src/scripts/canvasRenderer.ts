export type AspectPresetId = 'square' | 'portrait' | 'landscape' | 'story';

export interface AspectPreset {
  id: AspectPresetId;
  width: number;
  height: number;
  label: { en: string; id: string };
}

export const ASPECT_PRESETS: Record<AspectPresetId, AspectPreset> = {
  square: {
    id: 'square',
    width: 1080,
    height: 1080,
    label: { en: 'Square (1080 × 1080)', id: 'Persegi (1080 × 1080)' },
  },
  portrait: {
    id: 'portrait',
    width: 1080,
    height: 1350,
    label: { en: 'Portrait (1080 × 1350)', id: 'Potret (1080 × 1350)' },
  },
  landscape: {
    id: 'landscape',
    width: 1200,
    height: 675,
    label: { en: 'Landscape (1200 × 675)', id: 'Lanskap (1200 × 675)' },
  },
  story: {
    id: 'story',
    width: 1080,
    height: 1920,
    label: { en: 'Story (1080 × 1920)', id: 'Story (1080 × 1920)' },
  },
};

export interface PosterDesignState {
  quoteText: string;
  authorText: string;
  aspect: AspectPresetId;
  bgType: 'solid' | 'gradient';
  bgColorPrimary: string;
  bgColorSecondary: string;
  textColor: string;
  accentColor: string;
  fontFamily: 'Playfair Display' | 'Inter' | 'Lora' | 'Montserrat';
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  verticalOffsetPct: number; // -25 to +25
  decoration: 'none' | 'border' | 'quote-marks' | 'divider';
  showWatermark: boolean;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${currentLine} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

async function ensureFontLoaded(fontFamily: string, sizePx: number, italic = false): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  const weight = italic ? 'italic 500' : '500';
  try {
    await document.fonts.load(`${weight} ${Math.round(sizePx)}px "${fontFamily}"`);
    await document.fonts.ready;
  } catch {
    // Fallback to system/loaded fonts if font face load times out
  }
}

export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  state: PosterDesignState
): Promise<void> {
  const preset = ASPECT_PRESETS[state.aspect] ?? ASPECT_PRESETS.square;
  const width = preset.width;
  const height = preset.height;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const marginX = Math.round(width * 0.1);
  const marginY = Math.round(height * 0.12);
  const contentWidth = width - marginX * 2;
  const maxTextHeight = height - marginY * 2 - 120;

  // 1. Background fill
  if (state.bgType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, state.bgColorPrimary);
    grad.addColorStop(1, state.bgColorSecondary || state.bgColorPrimary);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = state.bgColorPrimary;
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Optional border decoration
  if (state.decoration === 'border') {
    const pad = Math.round(Math.min(width, height) * 0.055);
    ctx.save();
    ctx.strokeStyle = state.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
    ctx.restore();
  }

  // 3. Calculate quote font size with auto-fit if text is tall
  const cleanQuote = (state.quoteText || '').trim() || 'Words that move you forward.';
  const formattedQuote = `“${cleanQuote}”`;
  const cleanAuthor = (state.authorText || '').trim();

  let activeFontSize = Math.max(24, Math.min(120, state.fontSize));
  const isSerif = state.fontFamily === 'Playfair Display' || state.fontFamily === 'Lora';
  const fontSpec = (px: number) =>
    `${isSerif ? 'italic ' : ''}600 ${px}px "${state.fontFamily}", Georgia, serif`;

  await ensureFontLoaded(state.fontFamily, activeFontSize, isSerif);

  ctx.font = fontSpec(activeFontSize);
  let lines = wrapLines(ctx, formattedQuote, contentWidth);
  let lineHeight = Math.round(activeFontSize * 1.38);

  while (lines.length * lineHeight > maxTextHeight && activeFontSize > 26) {
    activeFontSize -= 2;
    ctx.font = fontSpec(activeFontSize);
    lines = wrapLines(ctx, formattedQuote, contentWidth);
    lineHeight = Math.round(activeFontSize * 1.38);
  }

  const quoteBlockHeight = lines.length * lineHeight;
  const authorFontSize = Math.max(18, Math.round(activeFontSize * 0.44));
  const authorLineHeight = Math.round(authorFontSize * 1.4);
  const gapAfterQuote = Math.round(Math.max(24, activeFontSize * 0.55));
  const totalBlockHeight = quoteBlockHeight + (cleanAuthor ? gapAfterQuote + authorLineHeight : 0);

  const offsetPx = ((state.verticalOffsetPct || 0) / 100) * (height * 0.35);
  const startY = Math.max(
    marginY,
    Math.min(
      height - marginY - totalBlockHeight,
      (height - totalBlockHeight) / 2 + offsetPx
    )
  );

  // Horizontal anchor based on alignment
  let anchorX = width / 2;
  if (state.textAlign === 'left') anchorX = marginX;
  else if (state.textAlign === 'right') anchorX = width - marginX;

  ctx.textAlign = state.textAlign;
  ctx.textBaseline = 'top';

  // 4. Optional quote marks or divider decoration
  if (state.decoration === 'quote-marks') {
    ctx.save();
    ctx.fillStyle = state.accentColor;
    ctx.globalAlpha = 0.28;
    ctx.font = `700 ${Math.round(activeFontSize * 2.1)}px "Playfair Display", Georgia, serif`;
    ctx.fillText('“', anchorX, Math.max(marginY * 0.45, startY - activeFontSize * 1.45));
    ctx.restore();
  }

  if (state.decoration === 'divider') {
    const dividerY = Math.max(marginY * 0.65, startY - 34);
    const divWidth = 72;
    let divX = anchorX - divWidth / 2;
    if (state.textAlign === 'left') divX = marginX;
    else if (state.textAlign === 'right') divX = width - marginX - divWidth;

    ctx.save();
    ctx.fillStyle = state.accentColor;
    ctx.fillRect(divX, dividerY, divWidth, 4);
    ctx.restore();
  }

  // 5. Draw wrapped quote text
  ctx.fillStyle = state.textColor;
  ctx.font = fontSpec(activeFontSize);
  lines.forEach((line, idx) => {
    ctx.fillText(line, anchorX, startY + idx * lineHeight);
  });

  // 6. Draw author attribution
  if (cleanAuthor) {
    await ensureFontLoaded('Inter', authorFontSize, false);
    ctx.fillStyle = state.accentColor;
    ctx.font = `600 ${authorFontSize}px "Inter", sans-serif`;
    const authorY = startY + quoteBlockHeight + gapAfterQuote;
    ctx.fillText(`— ${cleanAuthor}`, anchorX, authorY);
  }

  // 7. Subtle brand watermark
  if (state.showWatermark) {
    ctx.save();
    ctx.fillStyle = state.textColor;
    ctx.globalAlpha = 0.42;
    ctx.font = `500 18px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('QuoteFlow', width / 2, height - Math.round(height * 0.03));
    ctx.restore();
  }
}

export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename = 'quoteflow-poster.png'): boolean {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}