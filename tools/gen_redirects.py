"""按 data/routes.json 生成静态跳转页（GitHub Pages 没有服务器端跳转）。

- go / legacy：源前缀下镜像目标目录的全部子页面，例如 /go/cb1/u01/ → <目标>/u01/；
  同时保留查询参数与锚点。
- temp：只在源路径本身放一个跳转页，并且只在该目录还没有真实页面时才写。
生成的跳转页带 <meta name="robots" content="noindex">，不会被搜索引擎收录。

用法：python3 tools/gen_redirects.py   （在仓库根目录运行）
"""
from __future__ import annotations

import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
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


def target_pages(target: str) -> list[str]:
    """目标目录下所有带 index.html 的子目录（相对路径，'' 表示目标本身）。"""
    base = ROOT / target.strip("/")
    if not base.is_dir():
        raise SystemExit(f"目标不存在：{target}")
    out = []
    for f in sorted(base.rglob("index.html")):
        rel = f.parent.relative_to(base).as_posix()
        out.append("" if rel == "." else rel)
    return out


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
    routes = json.loads((ROOT / "data/routes.json").read_text("utf-8"))
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
        if (d / "index.html").exists() and not is_stub_dir(d):
            continue  # 真实页面已上线，临时跳转作废
        write(d, target)
        n += 1
    print(f"生成跳转页 {n} 个")


if __name__ == "__main__":
    main()
