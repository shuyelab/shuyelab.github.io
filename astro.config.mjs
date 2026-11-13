import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shuyelab.github.io',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never', assets: 'assets/build' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
