import rawQuotes from '../data/quotes.json';
import rawCategories from '../data/categories.json';
import rawAuthors from '../data/authors.json';
import rawTemplates from '../data/templates.json';
import rawArticles from '../data/articles.json';
import { validateDatabase } from './validateData';
import type { Quote, Category, Author, PosterTemplate, Article, EnrichedQuote, Locale } from '../types';

const report = validateDatabase({
  categories: rawCategories as Category[],
  authors: rawAuthors as Author[],
  quotes: rawQuotes as Quote[],
  templates: rawTemplates as PosterTemplate[],
  articles: rawArticles as Article[],
});

if (!report.valid) {
  throw new Error(`[QuoteFlow Database Validation Failed]\n${report.errors.join('\n')}`);
}

const authorsMap = new Map<string, Author>(
  (rawAuthors as Author[]).map((author) => [author.id, author])
);

const categoriesMap = new Map<string, Category>(
  (rawCategories as Category[]).map((cat) => [cat.id, cat])
);

export function getAllCategories(): Category[] {
  return rawCategories as Category[];
}

export function getCategoryById(id: string): Category | undefined {
  return categoriesMap.get(id);
}

export function getAllTemplates(): PosterTemplate[] {
  return rawTemplates as PosterTemplate[];
}

export function getAllQuotes(): EnrichedQuote[] {
  return (rawQuotes as Quote[])
    .filter((q) => q.published)
    .map((quote) => {
      const author = authorsMap.get(quote.authorId) ?? {
        id: 'unknown',
        name: 'Unknown',
        bio: { en: '', id: '' },
      };
      const category = categoriesMap.get(quote.categoryId) ?? {
        id: 'general',
        slug: { en: 'general', id: 'umum' },
        name: { en: 'General', id: 'Umum' },
        description: { en: '', id: '' },
        icon: 'sparkles',
      };
      return { ...quote, author, category };
    });
}

export function filterQuotes(params: {
  locale: Locale;
  categoryId?: string;
  query?: string;
}): EnrichedQuote[] {
  const all = getAllQuotes();
  const qLower = (params.query ?? '').trim().toLowerCase();

  return all.filter((item) => {
    if (params.categoryId && params.categoryId !== 'all' && item.categoryId !== params.categoryId) {
      return false;
    }
    if (!qLower) return true;

    const textMatch = item.content[params.locale].toLowerCase().includes(qLower);
    const authorMatch = item.author.name.toLowerCase().includes(qLower);
    const catMatch = item.category.name[params.locale].toLowerCase().includes(qLower);
    const tagMatch = item.tags.some((t) => t.toLowerCase().includes(qLower));
    return textMatch || authorMatch || catMatch || tagMatch;
  });
}

export function getFeaturedQuotes(limit = 4): EnrichedQuote[] {
  const all = getAllQuotes();
  const featured = all.filter((q) => q.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export function getQuoteOfTheDay(): EnrichedQuote {
  const all = getAllQuotes();
  const daySeed = Math.floor(Date.now() / 86_400_000);
  return all[daySeed % all.length];
}

export function getLatestArticles(limit = 5): Article[] {
  return (rawArticles as Article[]).slice(0, limit);
}

export function getDatabaseStats() {
  return report.stats;
}