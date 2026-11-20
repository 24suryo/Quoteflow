export type Locale = 'en' | 'id';

export interface LocalizedText {
  en: string;
  id: string;
}

export interface Category {
  id: string;
  slug: LocalizedText;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
}

export interface Author {
  id: string;
  name: string;
  bio: LocalizedText;
  isOriginalBrand?: boolean;
}

export interface Quote {
  id: string;
  slug: LocalizedText;
  content: LocalizedText;
  authorId: string;
  categoryId: string;
  tags: string[];
  isOriginal: boolean;
  sourceUrl?: string;
  interpretation: LocalizedText;
  published: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface EnrichedQuote extends Quote {
  author: Author;
  category: Category;
}

export interface Article {
  id: string;
  slug: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  categoryId: string;
  readingTimeMinutes: number;
  publishedAt: string;
}

export interface PosterTemplate {
  id: string;
  name: LocalizedText;
  theme: 'minimalist' | 'elegant' | 'dark-premium' | 'inspirational' | 'modern-editorial';
  bgType: 'solid' | 'gradient';
  bgColors: string[];
  textColor: string;
  accentColor: string;
  fontFamily: 'Playfair Display' | 'Inter' | 'Lora' | 'Montserrat';
  textAlign: 'left' | 'center' | 'right';
  decoration: 'none' | 'border' | 'quote-marks' | 'divider';
}