import type { APIRoute } from 'astro';
import { getAllCategories, getAllQuotes, getLatestArticles } from '../utils/repository';

interface SitemapEntry {
  enPath: string;
  idPath: string;
  lastmod?: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin ?? 'https://quoteflow.pages.dev').replace(/\/$/, '');

  const staticPairs: SitemapEntry[] = [
    { enPath: '/', idPath: '/id/' },
    { enPath: '/generator/', idPath: '/id/generator/' },
    { enPath: '/library/', idPath: '/id/library/' },
    { enPath: '/designer/', idPath: '/id/designer/' },
    { enPath: '/favorites/', idPath: '/id/favorites/' },
    { enPath: '/blog/', idPath: '/id/blog/' },
    { enPath: '/about/', idPath: '/id/about/' },
    { enPath: '/contact/', idPath: '/id/contact/' },
    { enPath: '/privacy-policy/', idPath: '/id/privacy-policy/' },
    { enPath: '/terms/', idPath: '/id/terms/' },
  ];

  const categoryPairs: SitemapEntry[] = getAllCategories().map((cat) => ({
    enPath: `/quotes/${cat.slug.en}/`,
    idPath: `/id/quotes/${cat.slug.id}/`,
  }));

  const quotePairs: SitemapEntry[] = getAllQuotes().map((q) => ({
    enPath: `/quote/${q.slug.en}/`,
    idPath: `/id/quote/${q.slug.id}/`,
    lastmod: q.createdAt,
  }));

  const articlePairs: SitemapEntry[] = getLatestArticles(50).map((art) => ({
    enPath: `/blog/${art.slug.en}/`,
    idPath: `/id/blog/${art.slug.id}/`,
    lastmod: art.publishedAt,
  }));

  const allEntries = [...staticPairs, ...categoryPairs, ...quotePairs, ...articlePairs];

  const urlNodes: string[] = [];

  for (const entry of allEntries) {
    const enLoc = `${origin}${entry.enPath}`;
    const idLoc = `${origin}${entry.idPath}`;
    const lastmodTag = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';

    for (const loc of [enLoc, idLoc]) {
      urlNodes.push(`  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enLoc)}" />
    <xhtml:link rel="alternate" hreflang="id" href="${escapeXml(idLoc)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(enLoc)}" />
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes.join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};