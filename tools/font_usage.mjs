// 统计 dist/ 每个页面实际用到哪些字、各落在哪个字体上（按计算后的 font-family / font-weight），
// 输出 JSON 给 tools/subset_fonts.py 做子集。不起端口：拦截 https://site.test/* 直接读 dist。
// 用法：node tools/font_usage.mjs > /tmp/shuyelab-font-usage.json
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_CORE || '/tmp/shuyelab-tools/node_modules/playwright-core');
const DIST = path.resolve('dist');
const SKIP = /^(books\/[^/]+\/[^/]+\/listen|go|citizenship|preview)\//;
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); const rel = path.relative(DIST, p); if (f.isDirectory()) { if (!SKIP.test(rel + '/')) walk(p); } else if (f.name.endsWith('.html')) pages.push('/' + rel.replace(/index\.html$/, '')); } })(DIST);
const exeDir = fs.readdirSync(`${process.env.HOME}/.cache/ms-playwright`).filter((d) => d.startsWith('chromium-')).sort().pop();
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/.cache/ms-playwright/${exeDir}/chrome-linux64/chrome` });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route('**/*', (route) => {
  const u = new URL(route.request().url());
  if (u.origin !== 'https://site.test') return route.abort();
  let f = path.join(DIST, decodeURIComponent(u.pathname)); if (f.endsWith('/')) f += 'index.html';
  if (/\.(woff2|webp|png|mp3)$/.test(f)) return route.fulfill({ status: 404, body: '' });
  return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), headers: { 'content-type': f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' } }) : route.fulfill({ status: 404, body: '' });
});
const page = await ctx.newPage();
const out = {};
for (const p of pages) {
  await page.goto('https://site.test' + p, { waitUntil: 'load' });
  out[p] = await page.evaluate(() => {
    const res = {};
    const add = (face, s) => { if (!s) return; res[face] = (res[face] || '') + s; };
    const faceOf = (cs, ch) => {
      const fams = cs.fontFamily.split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, ''));
      const bold = parseInt(cs.fontWeight, 10) >= 600 ? 700 : 400;
      const cp = ch.codePointAt(0);
      if ((cp >= 0xAC00 && cp <= 0xD7AF) || (cp >= 0x3130 && cp <= 0x318F) || (cp >= 0x0E00 && cp <= 0x0E7F)) return `krth-${bold}`;
      for (const f of fams) {
        if (f === 'Shuye Serif SC') return `serif-${bold}`;
        if (f === 'Shuye Sans SC') return `sans-${bold}`;
        if (f === 'Shuye Kai') return 'kai-400';
      }
      return `none`;
    };
    const isTarget = (cp) => cp >= 0x2E80 || (cp >= 0x0E00 && cp <= 0x0E7F) || (cp >= 0x3000);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement; if (!el) continue;
      const cs = getComputedStyle(el);
      for (const ch of n.data) { if (isTarget(ch.codePointAt(0))) add(faceOf(cs, ch), ch); }
    }
    for (const el of document.querySelectorAll('*')) for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo); const c = cs.content;
      if (c && c !== 'none' && c !== 'normal') for (const ch of c.replace(/^"|"$/g, '')) if (isTarget(ch.codePointAt(0))) add(faceOf(cs, ch), ch);
    }
    // 拉丁扩展（拼音调号）按字体记一下
    const lat = {};
    const w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while ((n = w2.nextNode())) {
      const el = n.parentElement; if (!el) continue;
      const fam = getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      for (const ch of n.data) { const cp = ch.codePointAt(0); if (cp > 0xFF && cp < 0x2E80) lat[fam] = (lat[fam] || '') + ch; }
    }
    res.latin = lat;
    res.title = document.title;
    return res;
  });
}
await browser.close();
process.stdout.write(JSON.stringify(out));
