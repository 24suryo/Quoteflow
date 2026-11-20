import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://quoteflow.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
});
