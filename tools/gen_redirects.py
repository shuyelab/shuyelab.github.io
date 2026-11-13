"""按 data/routes.json 生成静态跳转页（GitHub Pages 没有服务器端跳转）。

- go / legacy：源前缀下镜像目标目录的全部子页面，例如 /go/cb1/u01/ → <目标>/u01/；
  同时保留查询参数与锚点。
- temp：只在源路径本身放一个跳转页，并且只在该目录还没有真实页面时才写
  （真实页面 = public/ 里已有非跳转的 index.html，或 Astro 会生成的书页 / 系列页，见 src/data/books.json）。
生成的跳转页带 <meta name="robots" content="noindex">，不会被搜索引擎收录。

跳转页和各书的静态子站（如 listen/）都放在 public/ 下，Astro 构建时原样拷进 dist/。

用法：python3 tools/gen_redirects.py   （在仓库根目录运行）
"""
from __future__ import annotations

import html
import json
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / "public"
MARK = "<!-- shuyelab:redirect -->"

TPL = """<!doctype html>
{mark}
<html lang="en"><head><meta charset="utf-8">
<title>Redirecting…</title>
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url={url}">
<script>location.replace({js} + location.search + location.hash)</script>
</head><body style="font:18px/1.6 system-ui,sans-serif;padding:40px">
<p>Opening <a href="{url}">{url}</a> …</p>
</body></html>
"""


def stub(url: str) -> str:
    return TPL.format(mark=MARK, url=html.escape(url, quote=True), js=json.dumps(url))


def is_stub_dir(d: Path) -> bool:
    f = d / "index.html"
    return f.exists() and MARK in f.read_text("utf-8", "ignore")[:200]


def astro_page_dirs() -> set[str]:
    """Astro 会生成的书页、系列页（不含语言前缀），如 books/<系列>、books/<系列>/<书>。"""
    out = set()
    books = REPO / "src/data/books.json"
    if books.exists():
        for b in json.loads(books.read_text("utf-8")):
            out.add(f"books/{b['series']}/{b['slug']}")
            out.add(f"books/{b['series']}")
    return out


def target_pages(target: str) -> list[str]:
    """目标目录下所有页面（相对路径，'' 表示目标本身）：public/ 里带 index.html 的子目录，加上 Astro 生成的页面。"""
    t = target.strip("/")
    base = ROOT / t
    rels = set()
    if base.is_dir():
        for f in base.rglob("index.html"):
            rel = f.parent.relative_to(base).as_posix()
            rels.add("" if rel == "." else rel)
    for p in astro_page_dirs():
        if p == t:
            rels.add("")
        elif p.startswith(t + "/"):
            rels.add(p[len(t) + 1:])
    if not rels:
        raise SystemExit(f"目标不存在：{target}")
    return sorted(rels)


def write(src_dir: Path, url: str):
    if (src_dir / "index.html").exists() and not is_stub_dir(src_dir):
        raise SystemExit(f"拒绝覆盖真实页面：{src_dir}")
    src_dir.mkdir(parents=True, exist_ok=True)
    (src_dir / "index.html").write_text(stub(url), "utf-8")


def clean(prefix: Path):
    """删掉旧的跳转页（只删带标记的），保证跳转表改动后不残留。"""
    if not prefix.exists():
        return
    for f in prefix.rglob("index.html"):
        if MARK in f.read_text("utf-8", "ignore")[:200]:
            f.unlink()
    for d in sorted((p for p in prefix.rglob("*") if p.is_dir()), key=lambda p: -len(p.parts)):
        if not any(d.iterdir()):
            d.rmdir()


def main():
    routes = json.loads((REPO / "data/routes.json").read_text("utf-8"))
    astro_pages = astro_page_dirs()
    n = 0
    clean(ROOT / "go")
    for code, target in routes.get("go", {}).items():
        for rel in target_pages(target):
            write(ROOT / "go" / code / rel, target + (rel + "/" if rel else ""))
            n += 1
    for old, target in routes.get("legacy", {}).items():
        old_dir = ROOT / old.strip("/")
        if old_dir.exists() and not is_stub_dir(old_dir):
            shutil.rmtree(old_dir)  # 旧位置的真实内容已迁走，改成跳转
        clean(old_dir)
        for rel in target_pages(target):
            write(old_dir / rel, target + (rel + "/" if rel else ""))
            n += 1
    for src, target in routes.get("temp", {}).items():
        d = ROOT / src.strip("/")
        if src.strip("/") in astro_pages:
            if is_stub_dir(d):
                (d / "index.html").unlink()  # Astro 已生成真实页面，删掉旧跳转页免得冲突
            print(f"temp 跳转作废（真实页面已上线）：/{src.strip('/')}/")
            continue
        if (d / "index.html").exists() and not is_stub_dir(d):
            continue  # 真实页面已上线，临时跳转作废
        write(d, target)
        n += 1
    print(f"生成跳转页 {n} 个")


if __name__ == "__main__":
    main()
