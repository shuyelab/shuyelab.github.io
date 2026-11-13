"""构建产物自检：python3 tools/check_dist.py [dist]   有问题退出码 1。

检查：
  1. 产物里没有 design/、node_modules/、preview/、.astro/；
  2. 所有 HTML 里的站内链接（href / src / srcset / meta refresh / canonical）都能落到 dist 里的文件；
  3. 正式页面都有 title、description、canonical、og:image，hreflang 指向的页面都存在且互相对应；
  4. 关键网址存在：印刷短链 /go/cb1/…、旧址 /citizenship/…、listen/ 音频站与音频文件；
  5. 图片都有 alt；页面里没有占位邮箱和未购买的域名；
  6. 页面用到的汉字、韩文、泰文都在子集字体里（否则会回落到系统字体）；
  7. sitemap.xml 里的网址都存在，robots.txt 禁止 /preview/ 与 /go/。
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
SITE = "https://shuyelab.github.io"
errors: list[str] = []
warn: list[str] = []


def err(msg):
    errors.append(msg)


def resolve(url_path: str) -> Path | None:
    p = DIST / unquote(url_path).lstrip("/")
    if url_path.endswith("/"):
        p = p / "index.html"
    if p.is_file():
        return p
    if (p / "index.html").is_file():
        return p / "index.html"
    return None


def page_url(f: Path) -> str:
    rel = f.relative_to(DIST).as_posix()
    return "/" + (rel[: -len("index.html")] if rel.endswith("index.html") else rel)


for bad in ("design", "node_modules", "preview", ".astro", "src"):
    if (DIST / bad).exists():
        err(f"产物里不该有 {bad}/")

htmls = sorted(DIST.rglob("*.html"))
ATTR = re.compile(r'\s(?:href|src)="([^"]*)"')
SRCSET = re.compile(r'\ssrcset="([^"]*)"')
REFRESH = re.compile(r'http-equiv="refresh" content="0; url=([^"]+)"')
STATIC = re.compile(r"^/(books/[^/]+/[^/]+/listen|go|citizenship)/")
astro_pages = []
for f in htmls:
    text = f.read_text("utf-8", "ignore")
    here = page_url(f)
    urls = [html.unescape(u) for u in ATTR.findall(text)]
    for s in SRCSET.findall(text):
        urls += [x.strip().split(" ")[0] for x in s.split(",") if x.strip()]
    urls += [html.unescape(u) for u in REFRESH.findall(text)]
    for u in urls:
        if not u or u.startswith(("mailto:", "tel:", "data:", "javascript:")):
            continue
        full = urljoin(SITE + here, u)
        pu = urlparse(full)
        if pu.netloc != urlparse(SITE).netloc:
            continue
        if pu.path.startswith("/preview/"):
            err(f"{here} 链到已删除的 /preview/：{u}")
            continue
        if not resolve(pu.path):
            err(f"{here} 死链：{u}")
    if not STATIC.match(here) and "shuyelab:redirect" not in text[:300]:
        astro_pages.append((f, here, text))

# 3. 元信息与 hreflang
for f, here, text in astro_pages:
    is404 = here == "/404.html"
    for name, pat in [("title", r"<title>[^<]+</title>"), ("description", r'<meta name="description" content="[^"]+"'), ("og:image", r'<meta property="og:image" content="[^"]+"')]:
        if not re.search(pat, text):
            err(f"{here} 缺 {name}")
    if not is404:
        m = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        if not m:
            err(f"{here} 缺 canonical")
        elif urlparse(m.group(1)).path != here:
            err(f"{here} canonical 不指向自己：{m.group(1)}")
        alts = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', text))
        if alts and here not in {urlparse(u).path for u in alts.values()}:
            err(f"{here} hreflang 里没有自己")
        for lang, u in alts.items():
            target = resolve(urlparse(u).path)
            if not target:
                err(f"{here} hreflang={lang} 指向不存在的页面 {u}")
                continue
            back = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', target.read_text("utf-8", "ignore")))
            if back != alts:
                err(f"{here} 与 {u} 的 hreflang 组不一致")
        og = re.search(r'<meta property="og:image" content="([^"]+)"', text)
        if og and not resolve(urlparse(og.group(1)).path):
            err(f"{here} og:image 不存在：{og.group(1)}")
    for img in re.findall(r"<img\b[^>]*>", text):
        if not re.search(r"\salt(=|\s|>|/)", img):
            err(f"{here} 图片缺 alt：{img[:80]}")
    for bad in ("hello@shuyelab.com", "support@kaihua.app", "kaihua.app/"):
        if bad in text:
            err(f"{here} 含 {bad}")
    if "待确认" in text.replace("[适用法律——待确认]", ""):  # Kaihua 条款第 10 条的准据法占位与英文原文一致，待用户定
        err(f"{here} 页面源码里有「待确认」字样")

for src in sorted((DIST.parent / "src/content").rglob("*.html")):
    n = src.read_text("utf-8").count("待确认")
    if n:
        warn.append(f"{src.relative_to(DIST.parent)} 有 {n} 处「待确认」注释（构建时已去掉，不会上线）")

# 4. 关键网址
KEY = ["/go/cb1/", "/go/cb1/u01/", "/go/cb1/u20/", "/go/cb1/senior/", "/go/cb1/errata/", "/citizenship/", "/citizenship/u05/",
       "/books/civics-in-two-languages/", "/books/civics-in-two-languages/civics-2025-zh/", "/books/civics-in-two-languages/civics-2025-zh/listen/",
       "/books/civics-in-two-languages/civics-2025-zh/listen/u01/", "/books/civics-in-two-languages/civics-2025-zh/listen/senior/",
       "/books/civics-in-two-languages/civics-2025-zh/listen/errata/", "/404.html", "/robots.txt", "/sitemap.xml", "/favicon.ico",
       "/favicon.svg", "/apple-touch-icon.png", "/ko/apps/kaihua/privacy/", "/th/apps/kaihua/privacy/", "/apps/kaihua/privacy/",
       "/apps/kaihua/terms/", "/apps/kaihua/support/", "/apps/chiheng/privacy/", "/zh/", "/legal/"]
for k in KEY:
    if not resolve(k):
        err(f"关键网址不存在：{k}")
book_page = resolve("/books/civics-in-two-languages/civics-2025-zh/")
if book_page and "shuyelab:redirect" in book_page.read_text("utf-8")[:300]:
    err("书页仍是临时跳转页")
# 旧网址（已印刷或曾经上线）必须是跳到新位置的跳转页
NEW = "/books/civics-in-two-languages/civics-2025-zh/listen/"
REDIRECTS = {
    "/go/cb1/u01/": NEW + "u01/", "/go/cb1/senior/": NEW + "senior/", "/go/cb1/": NEW, "/citizenship/u05/": NEW + "u05/",
    "/citizenship/": NEW, "/books/citizenship-bridge/civics-2025-zh/listen/u05/": NEW + "u05/",
    "/books/citizenship-bridge/civics-2025-zh/listen/": NEW, "/books/citizenship-bridge/civics-2025-zh/": "/books/civics-in-two-languages/civics-2025-zh/",
    "/books/citizenship-bridge/": "/books/civics-in-two-languages/",
}
for old, new in REDIRECTS.items():
    f = resolve(old)
    if not f:
        err(f"旧网址缺跳转页：{old}")
        continue
    m = REFRESH.search(f.read_text("utf-8"))
    if not m or html.unescape(m.group(1)) != new:
        err(f"{old} 没有跳到 {new}（现在：{m.group(1) if m else '不是跳转页'}）")
    elif not resolve(new):
        err(f"{old} 的跳转目标不存在：{new}")
listen_pages = list((DIST / "books/civics-in-two-languages/civics-2025-zh/listen").rglob("index.html"))
if len(listen_pages) < 23:
    err(f"listen/ 页面只有 {len(listen_pages)} 个")
mp3 = list((DIST / "books/civics-in-two-languages/civics-2025-zh/listen/audio").rglob("*.mp3"))
if len(mp3) < 500:
    err(f"listen/ 音频文件只有 {len(mp3)} 个")

# 6. 字体覆盖
try:
    from fontTools.ttLib import TTFont
    cover: set[int] = set()
    for w in (DIST / "assets/fonts").rglob("*.woff2"):
        cover |= set(TTFont(w).getBestCmap().keys())
    missing: dict[str, set] = {}
    for f, here, text in astro_pages:
        body = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", text, flags=re.S)
        for ch in html.unescape(body):
            cp = ord(ch)
            if (0x3400 <= cp <= 0x9FFF or 0xAC00 <= cp <= 0xD7AF or 0x0E00 <= cp <= 0x0E7F) and cp not in cover:
                missing.setdefault(ch, set()).add(here)
    if missing:
        err(f"子集字体缺字（重跑 tools/font_usage.mjs + subset_fonts.py）：{''.join(sorted(missing))[:60]}")
except ImportError:
    warn.append("没有 fontTools，跳过字体覆盖检查（PYTHONPATH 加 kdp-books/.pylib）")

# 7. sitemap / robots
sm = (DIST / "sitemap.xml").read_text("utf-8") if (DIST / "sitemap.xml").exists() else ""
for loc in re.findall(r"<loc>([^<]+)</loc>", sm):
    if not resolve(urlparse(loc).path):
        err(f"sitemap 里的网址不存在：{loc}")
rb = (DIST / "robots.txt").read_text("utf-8") if (DIST / "robots.txt").exists() else ""
for line in ("Disallow: /preview/", "Disallow: /go/", "Sitemap: https://shuyelab.github.io/sitemap.xml"):
    if line not in rb:
        err(f"robots.txt 缺：{line}")

print(f"HTML {len(htmls)} 个（正式页面 {len(astro_pages)}），sitemap {sm.count('<loc>')} 条，音频 {len(mp3)} 个")
for w in warn:
    print("提醒：", w)
for e in errors:
    print("错误：", e)
print("通过" if not errors else f"{len(errors)} 个问题")
sys.exit(1 if errors else 0)
