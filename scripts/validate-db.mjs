import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const categories = readJson('src/data/categories.json');
const authors = readJson('src/data/authors.json');
const quotes = readJson('src/data/quotes.json');
const templates = readJson('src/data/templates.json');
const articles = readJson('src/data/articles.json');

const errors = [];
const catIds = new Set(categories.map((c) => c.id));
const authorIds = new Set(authors.map((a) => a.id));
const quoteIds = new Set();

if (categories.length < 12) errors.push(`Expected >= 12 categories, found ${categories.length}`);
if (quotes.length < 100) errors.push(`Expected >= 100 quotes, found ${quotes.length}`);
if (templates.length < 10) errors.push(`Expected >= 10 templates, found ${templates.length}`);
if (articles.length < 5) errors.push(`Expected >= 5 articles, found ${articles.length}`);

for (const q of quotes) {
  if (quoteIds.has(q.id)) errors.push(`Duplicate quote ID: ${q.id}`);
  quoteIds.add(q.id);
  if (!catIds.has(q.categoryId)) errors.push(`Quote ${q.id} invalid categoryId: ${q.categoryId}`);
  if (!authorIds.has(q.authorId)) errors.push(`Quote ${q.id} invalid authorId: ${q.authorId}`);
  if (!q.content?.en || !q.content?.id) errors.push(`Quote ${q.id} missing EN/ID content`);
  if (!q.isOriginal && !q.sourceUrl) errors.push(`Non-original quote ${q.id} missing sourceUrl`);
}

for (const a of articles) {
  if (!catIds.has(a.categoryId)) errors.push(`Article ${a.id} invalid categoryId: ${a.categoryId}`);
}

if (errors.length > 0) {
  console.error('Database validation failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log('QuoteFlow DB Verified:', {
  categories: categories.length,
  authors: authors.length,
  quotes: quotes.length,
  templates: templates.length,
  articles: articles.length,
});