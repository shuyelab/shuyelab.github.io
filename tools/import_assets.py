"""生成站点图片（本地工具，CI 不跑；产物入库在 public/assets/img/）。

- 书封：kdp-books/books/<src>/out/ebook-cover.jpg → public/assets/img/books/<slug>/cover-{400,800}.webp
- 样张：kdp-books/books/<src>/out/interior.pdf 第 N 页 → sample-<i>-{900,1800}.webp（页码见 src/data/books.json 的 samples[].page，从 1 起）
- App 截图：design/assets/img/{kaihua,chiheng}/*.webp → public/assets/img/apps/<app>/<name>-600.webp
- 持恒图标：chiheng 仓库 androidApp 的 ic_launcher.png → public/assets/img/apps/chiheng/icon.webp

依赖 Pillow 与 PyMuPDF（用 kdp-books 的 .pylib）：
  PYTHONPATH=/home/ywr/projects/personal/kdp-books/.pylib python3 tools/import_assets.py
"""
from __future__ import annotations

import io
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
KDP = Path("/home/ywr/projects/personal/kdp-books/books")
CHIHENG = Path("/home/ywr/dev/chiheng")
OUT = ROOT / "public/assets/img"


def save_webp(im: Image.Image, path: Path, width: int, q: int = 82):
    path.parent.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)
    return im.size


def books():
    import pymupdf
    data = json.loads((ROOT / "src/data/books.json").read_text("utf-8"))
    for b in data:
        src = KDP / b["source"] / "out"
        d = OUT / "books" / b["slug"]
        cover = Image.open(src / "ebook-cover.jpg")
        for w in (400, 800):
            print(b["slug"], "cover", w, save_webp(cover, d / f"cover-{w}.webp", w))
        pdf = pymupdf.open(src / "interior.pdf")
        for i, s in enumerate(b.get("samples", []), 1):
            page = pdf[s["page"] - 1]
            r = page.rect
            if abs(r.width - 621) < 1:  # KDP 出血版（8.625 × 11.25 in）：裁掉上下和外侧各 0.125 in，只留成品尺寸
                r = pymupdf.Rect(0 if s["page"] % 2 else 9, 9, r.width - 9 if s["page"] % 2 else r.width, r.height - 9)
            zoom = 1800 / r.width
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=r)
            im = Image.open(io.BytesIO(pix.tobytes("png")))
            for w in (900, 1800):
                print(b["slug"], "sample", i, w, save_webp(im, d / f"sample-{i}-{w}.webp", w, q=80))


def apps():
    for app in ("kaihua", "chiheng"):
        for f in sorted((ROOT / "design/assets/img" / app).glob("*.webp")):
            if f.stem.startswith(("icon", "feature")):
                continue
            print(app, f.stem, save_webp(Image.open(f), OUT / "apps" / app / f"{f.stem}-600.webp", 600))
    # 持恒打卡日历：换成没有弹层的真机截图（安卓模拟器；顶部状态栏涂成底色）
    cal = CHIHENG / "tmp/shots/streak_fix.png"
    if cal.exists():
        src = Image.open(cal).convert("RGB")
        bg = src.getpixel((8, 70))
        im = Image.new("RGB", src.size, bg)  # 去掉状态栏，内容整体下移，给手机外框的灵动岛让位
        im.paste(src.crop((0, 56, src.width, src.height - 64)), (0, 120))
        print("chiheng calendar", save_webp(im, OUT / "apps/chiheng/calendar-600.webp", 600))
    shutil.copy(ROOT / "design/assets/img/kaihua/icon.webp", OUT / "apps/kaihua/icon.webp")
    icon = Image.open(CHIHENG / "androidApp/src/main/res/mipmap-xxxhdpi/ic_launcher.png")
    print("chiheng icon", save_webp(icon, OUT / "apps/chiheng/icon.webp", 192, q=90))


if __name__ == "__main__":
    what = sys.argv[1:] or ["books", "apps"]
    if "apps" in what:
        apps()
    if "books" in what:
        books()
