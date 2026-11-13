// 无端口截图：Playwright 拦截 https://site.test/* 的请求，直接从 dist/ 读文件返回，不起任何服务。
// 用法：node tools/shoot.mjs <输出目录> [页面路径,...]   默认截主要页面 × 1440 / 768 / 390 三种宽度（整页）
// 依赖：playwright-core（PW_CORE 指定路径，默认 /tmp/shuyelab-tools/node_modules/playwright-core）与本机 chromium（~/.cache/ms-playwright）
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_CORE || '/tmp/shuyelab-tools/node_modules/playwright-core');
const DIST = path.resolve(process.env.DIST || 'dist');
const ORIGIN = 'https://site.test';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const DEFAULT = ['/', '/zh/', '/apps/kaihua/', '/zh/apps/kaihua/', '/apps/chiheng/', '/books/civics-in-two-languages/civics-2025-zh/', '/zh/books/civics-in-two-languages/civics-2025-zh/', '/books/grid-by-grid-chinese/hsk1-workbook/', '/books/', '/books/civics-in-two-languages/', '/apps/kaihua/privacy/', '/ko/apps/kaihua/privacy/', '/about/', '/contact/', '/404.html'];
const VIEWS = { desktop: { width: 1440, height: 900, s: 1 }, tablet: { width: 768, height: 1024, s: 1 }, mobile: { width: 390, height: 844, s: 2, m: true } };
const out = path.resolve(process.argv[2] || 'shots');
const pages = process.argv[3] ? process.argv[3].split(',') : DEFAULT;
const views = process.env.VIEWS ? process.env.VIEWS.split(',') : Object.keys(VIEWS);
fs.mkdirSync(out, { recursive: true });
const exeDir = fs.readdirSync(`${process.env.HOME}/.cache/ms-playwright`).filter((d) => d.startsWith('chromium-')).sort().pop();
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/.cache/ms-playwright/${exeDir}/chrome-linux64/chrome` });
const report = [];
for (const p of pages) for (const vk of views) {
  const v = VIEWS[vk];
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.s, isMobile: !!v.m, hasTouch: !!v.m, reducedMotion: 'reduce' });
  const errs = []; const fonts = new Set();
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== ORIGIN) { errs.push('EXTERNAL ' + u.href); return route.abort(); }
    let f = path.join(DIST, decodeURIComponent(u.pathname));
    if (f.endsWith('/')) f += 'index.html';
    if (!fs.existsSync(f)) { errs.push('404 ' + u.pathname); return route.fulfill({ status: 404, body: 'nf' }); }
    if (f.endsWith('.woff2')) fonts.add(path.basename(f));
    route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' } });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push('JSERR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.goto(ORIGIN + p, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))); });
  await page.waitForTimeout(300);
  const overflow = (await page.evaluate(() => document.documentElement.scrollWidth)) - v.width;
  const name = (p.replace(/^\/|\/$/g, '').replace(/\//g, '_').replace('.html', '') || 'home') + `-${vk}.png`;
  await page.screenshot({ path: path.join(out, name), fullPage: true });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const line = `${name} h=${h}${overflow > 0 ? ' H-OVERFLOW ' + overflow : ''} fonts=${[...fonts].join(',')}${errs.length ? ' ERR ' + errs.join(' | ') : ''}`;
  console.log(line); report.push(line);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, 'report.txt'), report.join('\n') + '\n');
