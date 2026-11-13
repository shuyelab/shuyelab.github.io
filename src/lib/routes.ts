// 全站路由表：页面、语言版本、hreflang、sitemap 都从这里来。加 App / 书只要改 src/data/*.json。
import apps from '../data/apps.json';
import series from '../data/series.json';
import books from '../data/books.json';
import { SITE_LANGS, type Lang } from '../i18n';

export type Kind = 'home' | 'apps' | 'app' | 'app-legal' | 'books' | 'series' | 'book' | 'about' | 'contact' | 'site-legal';

export interface Route {
  /** 不含语言前缀的路径，以 / 开头和结尾 */
  path: string;
  langs: Lang[];
  kind: Kind;
  props: Record<string, any>;
}

export const APPS = apps as any[];
export const SERIES = series as any[];
export const BOOKS = books as any[];

export const LEGAL_DOCS = ['privacy', 'terms', 'support'] as const;

export function seriesOf(slug: string) {
  return SERIES.find((s) => s.slug === slug);
}
export function booksIn(seriesSlug: string) {
  return BOOKS.filter((b) => b.series === seriesSlug);
}
export function bookPath(b: any) {
  return `/books/${b.series}/${b.slug}/`;
}

export function allRoutes(): Route[] {
  const r: Route[] = [];
  const both = SITE_LANGS;
  r.push({ path: '/', langs: both, kind: 'home', props: {} });
  r.push({ path: '/apps/', langs: both, kind: 'apps', props: {} });
  for (const app of APPS) {
    r.push({ path: `/apps/${app.slug}/`, langs: both, kind: 'app', props: { app } });
    for (const doc of LEGAL_DOCS) {
      const cfg = app.legal?.[doc];
      if (!cfg) continue;
      r.push({ path: `/apps/${app.slug}/${doc}/`, langs: cfg.langs, kind: 'app-legal', props: { app, doc } });
    }
  }
  r.push({ path: '/books/', langs: both, kind: 'books', props: {} });
  for (const s of SERIES) {
    r.push({ path: `/books/${s.slug}/`, langs: both, kind: 'series', props: { series: s } });
  }
  for (const b of BOOKS) {
    r.push({ path: bookPath(b), langs: both, kind: 'book', props: { book: b } });
  }
  r.push({ path: '/about/', langs: both, kind: 'about', props: {} });
  r.push({ path: '/contact/', langs: both, kind: 'contact', props: {} });
  r.push({ path: '/legal/', langs: both, kind: 'site-legal', props: {} });
  return r;
}

export function fullPath(lang: Lang, path: string) {
  return lang === 'en' ? path : `/${lang}${path}`;
}

/** 某路径在各语言下的网址（只列存在的语言）。 */
export function alternates(path: string): Partial<Record<Lang, string>> {
  const route = allRoutes().find((x) => x.path === path);
  const out: Partial<Record<Lang, string>> = {};
  for (const l of route?.langs ?? []) out[l] = fullPath(l, path);
  return out;
}
