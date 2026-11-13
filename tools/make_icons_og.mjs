// 生成 favicon / apple-touch-icon / PWA 图标与 Open Graph 分享图（本地工具，产物入库 public/）。
// 先 npm run build（要用 dist/ 里的字体和图片），再：node tools/make_icons_og.mjs
// 依赖同 tools/shoot.mjs（playwright-core + 本机 chromium），不起任何端口。
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_CORE || '/tmp/shuyelab-tools/node_modules/playwright-core');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist'); const PUB = path.join(ROOT, 'public');
const books = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/books.json'), 'utf8'));
const seriesName = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/series.json'), 'utf8')).map((s) => [s.slug, s.name]));
const SEAL_INNER = `<g transform="translate(32 32) scale(.76) translate(-32 -31)"><path fill="#FBF4E6" d="M30.7 3.5C21 9.5 9.5 20.5 9.5 35.5c0 6.4 1.8 11 4.6 14.2 6.6.2 12.2 2.6 16.6 7.3Z"/><path fill="#FBF4E6" d="M33.3 3.5C43 9.5 54.5 20.5 54.5 35.5c0 6.4-1.8 11-4.6 14.2-6.6.2-12.2 2.6-16.6 7.3Z"/><g fill="none" stroke="#C23A2B" stroke-width="2.6" stroke-linecap="round"><path d="M30.7 25.2C26.6 22.6 22.6 21.6 18.4 22"/><path d="M30.7 34.6C25.6 31.6 20.6 30.6 15.2 31.4"/><path d="M30.7 44C25.6 41.2 20.4 40.4 15 41.2"/><path d="M33.3 25.2C37.4 22.6 41.4 21.6 45.6 22"/><path d="M33.3 34.6C38.4 31.6 43.4 30.6 48.8 31.4"/></g></g>`;
const seal = (full = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${full ? '<rect width="64" height="64" fill="#C23A2B"/>' : '<rect x="2" y="2" width="60" height="60" rx="12" fill="#C23A2B"/>'}${SEAL_INNER}</svg>`;
fs.writeFileSync(path.join(PUB, 'favicon.svg'), seal());

const fontCss = fs.readFileSync(path.join(ROOT, 'src/styles/fonts.css'), 'utf8');
const exeDir = fs.readdirSync(`${process.env.HOME}/.cache/ms-playwright`).filter((d) => d.startsWith('chromium-')).sort().pop();
const browser = await chromium.launch({ executablePath: `${process.env.HOME}/.cache/ms-playwright/${exeDir}/chrome-linux64/chrome` });
async function render(html, w, h, out, transparent = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await ctx.route('https://og.test/**', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/') return route.fulfill({ body: html, headers: { 'content-type': 'text/html; charset=utf-8' } });
    const f = path.join(DIST, decodeURIComponent(u.pathname));
    return fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f) }) : route.fulfill({ status: 404, body: '' });
  });
  const page = await ctx.newPage();
  await page.goto('https://og.test/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent });
  await ctx.close();
}
// 图标
const iconHtml = (full, pad) => `<html><body style="margin:0;background:${full ? '#C23A2B' : 'transparent'}"><div style="width:100vw;height:100vh;display:grid;place-items:center">${seal(full).replace('<svg ', `<svg style="width:${100 - pad * 2}vw;height:${100 - pad * 2}vh" `)}</div></body></html>`;
for (const s of [16, 32, 48]) await render(iconHtml(false, 0), s, s, `/tmp/shuyelab-icon-${s}.png`, true);
await render(iconHtml(true, 6), 180, 180, path.join(PUB, 'apple-touch-icon.png'));
await render(iconHtml(false, 0), 192, 192, path.join(PUB, 'icon-192.png'), true);
await render(iconHtml(false, 0), 512, 512, path.join(PUB, 'icon-512.png'), true);
fs.writeFileSync(path.join(PUB, 'site.webmanifest'), JSON.stringify({ name: 'Shuye Lab · 书叶工作室', short_name: 'Shuye Lab', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }], theme_color: '#FAF6EE', background_color: '#FAF6EE', display: 'browser' }, null, 2) + '\n');

// OG 图 1200×630
const base = `<style>${fontCss}
*{box-sizing:border-box} body{margin:0;width:1200px;height:630px;background:#FAF6EE;color:#1E1B17;font-family:'Inter Variable','Shuye Sans SC',sans-serif;position:relative;overflow:hidden}
.k{position:absolute;inset:0;background:radial-gradient(circle at 78% 42%,rgba(238,142,116,.35),rgba(238,142,116,0) 46%)}
.txt{position:absolute;left:80px;top:96px;width:600px}
.brand{display:flex;align-items:center;gap:16px;font:600 30px 'Fraunces Variable',serif}
.brand small{display:block;font:400 15px 'Shuye Serif SC',serif;letter-spacing:.38em;color:#645B50;margin-top:4px}
h1{font:560 66px/1.06 'Fraunces Variable','Shuye Serif SC',serif;letter-spacing:-.02em;margin:58px 0 22px}
h1 em{font-style:italic;font-weight:420;color:#C23A2B} .zh h1{font-weight:700;letter-spacing:.01em;line-height:1.2} .zh h1 em{font-style:normal;font-weight:700}
p{font-size:25px;line-height:1.45;color:#4E473F;margin:0}
.phone{position:absolute;width:250px;aspect-ratio:390/844;border-radius:15%/7%;background:#1C1916;padding:8px;box-shadow:0 40px 80px -30px rgba(46,33,18,.5)}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:12.6%/5.9%}
.book{position:absolute;border-radius:4px 10px 10px 4px;box-shadow:0 40px 80px -30px rgba(46,33,18,.55)}
.bar{position:absolute;left:0;right:0;bottom:0;height:14px;background:#C23A2B}
</style>`;
const brand = `<div class="brand">${seal().replace('<svg ', '<svg width="56" height="56" ')}<div>Shuye Lab<small>书叶工作室</small></div></div>`;
const jobs = [];
for (const lang of ['en', 'zh']) {
  const zh = lang === 'zh';
  jobs.push([`default-${lang}`, `<html class="${zh ? 'zh' : ''}"><body>${base}<div class="k"></div><div class="txt ${zh ? 'zh' : ''}">${brand}<h1>${zh ? '做学习用的<br><em>App 和书。</em>' : 'Apps for learning Chinese, <em>and books for study.</em>'}</h1><p>${zh ? '汉字练习册、入籍考试中英对照书、典籍英译、国际象棋题集。' : 'Chinese characters, the U.S. citizenship test, classical Chinese in translation, chess tactics.'}</p></div>
  <img class="book" src="/assets/img/books/art-of-war/cover-400.webp" style="width:170px;left:905px;top:40px;transform:rotate(7deg)"><div class="phone" style="left:700px;top:70px;transform:rotate(-4deg)"><img src="/assets/img/apps/kaihua/02-review-600.webp"></div><img class="book" src="/assets/img/books/civics-2025-zh/cover-400.webp" style="width:190px;left:930px;top:300px;transform:rotate(-3deg)"><div class="bar"></div></body></html>`]);
  jobs.push([`kaihua-${lang}`, `<html><body>${base}<div class="k"></div><div class="txt ${zh ? 'zh' : ''}"><div class="brand"><img src="/assets/img/apps/kaihua/icon.webp" width="64" height="64" style="border-radius:22%"><div>Kaihua <span style="color:#C23A2B;font-family:'Shuye Serif SC'">开花</span><small>Shuye Lab · 书叶工作室</small></div></div><h1>${zh ? '背 HSK 3.0 的词，<br><em>听清四个声调。</em>' : 'Learn the HSK 3.0 words. <em>Hear the tones.</em>'}</h1><p>${zh ? '七天声调营 · FSRS 复习永远免费 · 英韩泰三种讲解' : '7-Day Tone Camp · free FSRS reviews · English, 한국어, ไทย'}</p></div>
  <div class="phone" style="left:700px;top:90px;transform:rotate(-5deg)"><img src="/assets/img/apps/kaihua/01-camp-600.webp"></div><div class="phone" style="left:900px;top:40px;transform:rotate(3deg)"><img src="/assets/img/apps/kaihua/02-review-600.webp"></div><div class="bar"></div></body></html>`]);
  jobs.push([`chiheng-${lang}`, `<html><body>${base}<div class="txt ${zh ? 'zh' : ''}"><div class="brand"><img src="/assets/img/apps/chiheng/icon.webp" width="64" height="64" style="border-radius:22%"><div>${zh ? '持恒 <span style="font:500 22px Inter">ChiHeng</span>' : 'ChiHeng <span style="color:#4C6A5A;font-family:\'Shuye Serif SC\'">持恒</span>'}<small>Shuye Lab · 书叶工作室</small></div></div><h1>${zh ? '每天的功课，<br><em style="color:#4C6A5A">安安静静地记下来。</em>' : 'A log for your <em style="color:#4C6A5A">daily practice.</em>'}</h1><p>${zh ? '计数 · 打卡 · 静坐计时 · 资料库。无广告，免登录。' : 'Counter · check-in · meditation timer · library. No ads, no login.'}</p></div>
  <div class="phone" style="left:760px;top:70px;transform:rotate(-3deg)"><img src="/assets/img/apps/chiheng/counter-600.webp"></div><div class="phone" style="left:930px;top:30px;transform:rotate(3deg);z-index:-0"><img src="/assets/img/apps/chiheng/today-600.webp"></div><div class="bar" style="background:#4C6A5A"></div></body></html>`]);
}
for (const b of books) {
  jobs.push([`book-${b.slug}`, `<html><body>${base}<div class="txt" style="width:640px;top:80px">${brand}<h1 style="font-size:${b.title.length > 60 ? 44 : 54}px;margin-top:48px">${b.title}</h1><p style="color:#C23A2B;font-weight:700;font-family:'Shuye Serif SC'">${b.zh_title}</p><p style="margin-top:18px;font-size:21px">${seriesName[b.series]} · ${b.number.en}</p></div>
  <div style="position:absolute;right:0;top:0;bottom:0;width:430px;background:#F3ECDF"></div><img class="book" src="/assets/img/books/${b.slug}/cover-800.webp" style="width:300px;right:70px;top:55px"><div class="bar"></div></body></html>`]);
}
fs.mkdirSync(path.join(PUB, 'assets/og'), { recursive: true });
for (const [name, html] of jobs) { await render(html, 1200, 630, path.join(PUB, 'assets/og', `${name}.png`)); console.log('og', name); }
await browser.close();
