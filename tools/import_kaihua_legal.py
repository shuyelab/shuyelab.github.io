"""把 Kaihua 仓库现成的合规页（store/site/*.html）导入为本站的 HTML 片段。

只读 kaihua 仓库；写 src/content/legal/kaihua/<doc>.<lang>.html。
内容一字不改，只做站点适配：
  - 去掉原页的页头、语言切换行和页脚（本站模板自己提供）；
  - 站内链接改成本站网址（privacy.html → /apps/kaihua/privacy/ 等）；
  - 联系邮箱 support@kaihua.app → 站点统一邮箱（src/data/site.json 的 email）。
中文译本（*.zh.html）不由本脚本生成，导入时不会被覆盖。

用法：python3 tools/import_kaihua_legal.py [KAIHUA_REPO]   （默认 /home/ywr/projects/personal/kaihua）
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/ywr/projects/personal/kaihua") / "store/site"
OUT = ROOT / "src/content/legal/kaihua"
EMAIL = json.loads((ROOT / "src/data/site.json").read_text("utf-8"))["email"]

DOCS = {  # 源文件 → (文档, 语言, 本站网址前缀)
    "privacy.html": ("privacy", "en"),
    "privacy-ko.html": ("privacy", "ko"),
    "privacy-th.html": ("privacy", "th"),
    "terms.html": ("terms", "en"),
    "support.html": ("support", "en"),
}
LINKS = {
    "privacy.html": "/apps/kaihua/privacy/",
    "privacy-ko.html": "/ko/apps/kaihua/privacy/",
    "privacy-th.html": "/th/apps/kaihua/privacy/",
    "terms.html": "/apps/kaihua/terms/",
    "support.html": "/apps/kaihua/support/",
    "index.html": "/apps/kaihua/",
}


def convert(text: str) -> str:
    m = re.search(r"<main>(.*?)</main>", text, re.S)
    if not m:
        raise SystemExit("找不到 <main>")
    body = m.group(1).strip()
    body = re.sub(r'<p class="lang">.*?</p>\s*', "", body, count=1, flags=re.S)
    for old, new in LINKS.items():
        body = re.sub(r'href="' + re.escape(old) + r'(#[^"]*)?"', lambda mm: f'href="{new}{mm.group(1) or ""}"', body)
    body = body.replace("support@kaihua.app", EMAIL)
    # 附录里只写 “Link” 的外链，链接文字换成网址本身（读屏和视觉上都看得出去向；内容不变）
    body = re.sub(r'<a href="(https?://([^"]+?))/?">Link</a>', lambda mm: f'<a href="{mm.group(1)}">{mm.group(2).split("/")[0].removeprefix("www.")}</a>', body)
    left = re.findall(r'href="(?!https?://|mailto:|/|#)[^"]+"', body)
    if left:
        raise SystemExit(f"还有未改写的相对链接：{left}")
    if "kaihua.app" in body:
        raise SystemExit("正文里仍有 kaihua.app（域名未购买），请检查")
    return body + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, (doc, lang) in DOCS.items():
        body = convert((SRC / name).read_text("utf-8"))
        (OUT / f"{doc}.{lang}.html").write_text(body, "utf-8")
        print(f"{name} → {doc}.{lang}.html  {len(body)} 字节")


if __name__ == "__main__":
    main()
