import type { Locale } from '../types';

export const DEFAULT_LOCALE: Locale = 'en';

export const UI_STRINGS = {
  en: {
    siteName: 'QuoteFlow',
    tagline: 'Words that move you forward.',
    nav: {
      home: 'Home',
      generator: 'Generator',
      library: 'Library',
      designer: 'Image Designer',
      favorites: 'Favorites',
      blog: 'Journal',
    },
    hero: {
      badge: 'Bilingual Inspiration & Poster Studio',
      title: 'Words that move you forward.',
      subtitle:
        'Discover timeless wisdom in English and Bahasa Indonesia. Customize minimalist quote posters and carry daily clarity wherever you go.',
      primaryCta: 'Open Quote Generator',
      secondaryCta: 'Design a Quote Poster',
    },
    sections: {
      qotdLabel: 'Quote of the Day',
      categoriesTitle: 'Explore by Theme',
      categoriesSubtitle: 'Curated reflections across life, discipline, and personal growth.',
      previewTitle: 'Instant Quote Generator',
      previewSubtitle: 'Shuffle curated thoughts, copy in one click, or launch the full studio.',
      popularTitle: 'Popular Reflections',
      articlesTitle: 'Latest from the Journal',
      ctaTitle: 'Turn meaningful words into shareable art.',
      ctaSubtitle: 'Create high-resolution posters for Instagram, Stories, and desktop wallpapers—free and offline-ready.',
      ctaButton: 'Start Creating Now',
    },
    actions: {
      shuffle: 'New Quote',
      copy: 'Copy Quote',
      copied: 'Copied!',
      favorite: 'Save',
      saved: 'Saved',
      design: 'Design Image',
      viewAll: 'View All',
      readArticle: 'Read Article',
      switchLangLabel: 'Bahasa Indonesia',
    },
    footer: {
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      adLabel: 'Advertisement',
      copyright: 'All rights reserved. Built for clarity and daily focus.',
    },
  },
  id: {
    siteName: 'QuoteFlow',
    tagline: 'Kata-kata yang menggerakkan langkahmu.',
    nav: {
      home: 'Beranda',
      generator: 'Generator',
      library: 'Pustaka',
      designer: 'Desain Gambar',
      favorites: 'Favorit',
      blog: 'Jurnal',
    },
    hero: {
      badge: 'Studio Kutipan & Poster Dwibahasa',
      title: 'Kata-kata yang menggerakkan langkahmu.',
      subtitle:
        'Temukan kutipan inspiratif dalam Bahasa Indonesia dan Inggris. Rancang poster minimalis siap unduh dan simpan refleksi harian Anda.',
      primaryCta: 'Buka Generator Kutipan',
      secondaryCta: 'Buat Poster Kutipan',
    },
    sections: {
      qotdLabel: 'Kutipan Hari Ini',
      categoriesTitle: 'Jelajahi Berdasarkan Tema',
      categoriesSubtitle: 'Refleksi pilihan seputar kehidupan, disiplin, dan pengembangan diri.',
      previewTitle: 'Generator Kutipan Instan',
      previewSubtitle: 'Acak kutipan pilihan, salin sekali klik, atau buka studio lengkap.',
      popularTitle: 'Kutipan Populer',
      articlesTitle: 'Artikel Jurnal Terbaru',
      ctaTitle: 'Ubah kata bermakna menjadi karya visual.',
      ctaSubtitle: 'Buat poster resolusi tinggi untuk Instagram, Story, dan wallpaper—gratis dan dapat diakses offline.',
      ctaButton: 'Mulai Membuat Sekarang',
    },
    actions: {
      shuffle: 'Kutipan Baru',
      copy: 'Salin Kutipan',
      copied: 'Tersalin!',
      favorite: 'Simpan',
      saved: 'Tersimpan',
      design: 'Desain Gambar',
      viewAll: 'Lihat Semua',
      readArticle: 'Baca Artikel',
      switchLangLabel: 'English',
    },
    footer: {
      about: 'Tentang Kami',
      contact: 'Kontak',
      privacy: 'Kebijakan Privasi',
      terms: 'Syarat & Ketentuan',
      adLabel: 'Iklan',
      copyright: 'Hak cipta dilindungi. Dirancang untuk ketenangan dan fokus harian.',
    },
  },
} as const;

export function getStrings(locale: Locale) {
  return UI_STRINGS[locale] ?? UI_STRINGS.en;
}

export function getLocalizedPath(locale: Locale, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') {
    return cleanPath;
  }
  return cleanPath === '/' ? '/id/' : `/id${cleanPath}`;
}