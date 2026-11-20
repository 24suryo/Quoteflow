import type { Author, Category, Quote, PosterTemplate, Article } from '../types';

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  stats: {
    categories: number;
    authors: number;
    quotes: number;
    templates: number;
    articles: number;
  };
}

export function validateDatabase(data: {
  categories: Category[];
  authors: Author[];
  quotes: Quote[];
  templates: PosterTemplate[];
  articles: Article[];
}): ValidationReport {
  const errors: string[] = [];

  const categoryIds = new Set<string>();
  const enCatSlugs = new Set<string>();
  const idCatSlugs = new Set<string>();

  for (const cat of data.categories) {
    if (!cat.id || categoryIds.has(cat.id)) {
      errors.push(`Invalid or duplicate category id: "${cat.id}"`);
    }
    categoryIds.add(cat.id);

    if (!cat.name.en?.trim() || !cat.name.id?.trim()) {
      errors.push(`Category "${cat.id}" missing EN or ID name.`);
    }
    if (!cat.slug.en?.trim() || enCatSlugs.has(cat.slug.en)) {
      errors.push(`Duplicate or empty EN slug in category "${cat.id}".`);
    }
    if (!cat.slug.id?.trim() || idCatSlugs.has(cat.slug.id)) {
      errors.push(`Duplicate or empty ID slug in category "${cat.id}".`);
    }
    enCatSlugs.add(cat.slug.en);
    idCatSlugs.add(cat.slug.id);
  }

  const authorIds = new Set<string>();
  for (const author of data.authors) {
    if (!author.id || authorIds.has(author.id)) {
      errors.push(`Invalid or duplicate author id: "${author.id}"`);
    }
    authorIds.add(author.id);
    if (!author.name?.trim()) {
      errors.push(`Author "${author.id}" missing name.`);
    }
  }

  const quoteIds = new Set<string>();
  for (const quote of data.quotes) {
    if (!quote.id || quoteIds.has(quote.id)) {
      errors.push(`Invalid or duplicate quote id: "${quote.id}"`);
    }
    quoteIds.add(quote.id);

    if (!quote.content.en?.trim() || !quote.content.id?.trim()) {
      errors.push(`Quote "${quote.id}" missing EN or ID content.`);
    }
    if (!quote.slug.en?.trim() || !quote.slug.id?.trim()) {
      errors.push(`Quote "${quote.id}" missing EN or ID slug.`);
    }
    if (!categoryIds.has(quote.categoryId)) {
      errors.push(`Quote "${quote.id}" references unknown categoryId "${quote.categoryId}".`);
    }
    if (!authorIds.has(quote.authorId)) {
      errors.push(`Quote "${quote.id}" references unknown authorId "${quote.authorId}".`);
    }
    if (!quote.isOriginal && !quote.sourceUrl?.trim()) {
      errors.push(`Non-original quote "${quote.id}" is missing sourceUrl.`);
    }
  }

  const templateIds = new Set<string>();
  for (const tpl of data.templates) {
    if (!tpl.id || templateIds.has(tpl.id)) {
      errors.push(`Invalid or duplicate template id: "${tpl.id}"`);
    }
    templateIds.add(tpl.id);
    if (!tpl.name.en?.trim() || !tpl.name.id?.trim()) {
      errors.push(`Template "${tpl.id}" missing EN or ID name.`);
    }
    if (!Array.isArray(tpl.bgColors) || tpl.bgColors.length === 0) {
      errors.push(`Template "${tpl.id}" must have at least one background color.`);
    }
  }

  const articleIds = new Set<string>();
  for (const art of data.articles) {
    if (!art.id || articleIds.has(art.id)) {
      errors.push(`Invalid or duplicate article id: "${art.id}"`);
    }
    articleIds.add(art.id);
    if (!categoryIds.has(art.categoryId)) {
      errors.push(`Article "${art.id}" references unknown categoryId "${art.categoryId}".`);
    }
    if (!art.title.en?.trim() || !art.title.id?.trim() || !art.content.en?.trim() || !art.content.id?.trim()) {
      errors.push(`Article "${art.id}" missing localized title or content.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      categories: data.categories.length,
      authors: data.authors.length,
      quotes: data.quotes.length,
      templates: data.templates.length,
      articles: data.articles.length,
    },
  };
}