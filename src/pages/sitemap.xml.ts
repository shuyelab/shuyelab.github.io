import site from '../data/site.json';
import { allRoutes, fullPath } from '../lib/routes';
import { HTML_LANG } from '../i18n';

// 正式页面 + 配套音频站首页；/go/、/citizenship/ 等跳转页不进 sitemap。
const EXTRA = ['/books/civics-in-two-languages/civics-2025-zh/listen/'];

export function GET() {
  const urls: string[] = [];
  for (const r of allRoutes()) {
    for (const l of r.langs) {
      const alts = r.langs.map((x) => `<xhtml:link rel="alternate" hreflang="${HTML_LANG[x]}" href="${site.url}${fullPath(x, r.path)}"/>`).join('');
      const xd = r.langs.includes('en') ? `<xhtml:link rel="alternate" hreflang="x-default" href="${site.url}${r.path}"/>` : '';
      urls.push(`<url><loc>${site.url}${fullPath(l, r.path)}</loc>${r.langs.length > 1 ? alts + xd : ''}</url>`);
    }
  }
  for (const p of EXTRA) urls.push(`<url><loc>${site.url}${p}</loc></url>`);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
