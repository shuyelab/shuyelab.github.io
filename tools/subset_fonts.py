"""按实际用字给字体做子集，写 public/assets/fonts/ 与 src/styles/fonts.css（本地工具，产物入库）。

流程（字或文案有改动后跑一遍）：
  npm run build
  node tools/font_usage.mjs > /tmp/shuyelab-font-usage.json      # 每页每种字体实际用到的字
  PYTHONPATH=/home/ywr/projects/personal/kdp-books/.pylib python3 tools/subset_fonts.py /tmp/shuyelab-font-usage.json
  npm run build                                                   # 新字体进 dist
中文字体分两档：英文页面用到的字（品牌、书名里的汉字）放进很小的 core 文件，其余放 extra 文件；
extra 先声明、core 后声明，浏览器对英文页只会下载 core。韩文 / 泰文只在对应语言页面下载。
源字体：kdp-books/fonts（思源宋体 / 思源黑体 / 霞鹜文楷，OFL）、kaihua 的 Noto Sans KR / Thai 静态实例（OFL）、
design/assets/fonts（Fraunces、Inter、Atkinson Hyperlegible，来自 @fontsource，OFL）。
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/assets/fonts"
KDP = Path("/home/ywr/projects/personal/kdp-books/fonts")
KT = Path("/home/ywr/projects/personal/kaihua/tmp/store/shots/fonts-static")
LAT = ROOT / "design/assets/fonts"
PUNCT = "，。、：；！？「」『』（）《》〈〉·—…“”‘’０１２３４５６７８９"
CJK_FACES = {
    "serif-400": ("Shuye Serif SC", 400, KDP / "NotoSerifCJKsc-Regular.otf"),
    "serif-700": ("Shuye Serif SC", 700, KDP / "NotoSerifCJKsc-Bold.otf"),
    "sans-400": ("Shuye Sans SC", 400, KDP / "NotoSansCJKsc-Regular.otf"),
    "sans-700": ("Shuye Sans SC", 700, KDP / "NotoSansCJKsc-Bold.otf"),
    "kai-400": ("Shuye Kai", 400, KDP / "LXGWWenKai-Regular.ttf"),
}
CJK_RANGE = "U+2E80-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF,U+3000-303F"
BASIC = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212,U+2460-2473,U+FEFF,U+FFFD"


def opts():
    o = subset.Options()
    o.flavor = "woff2"
    o.layout_features = ["*"]
    o.name_IDs = ["*"]
    o.desubroutinize = True
    o.notdef_outline = True
    return o


def save_subset(src: Path, out: Path, text: str = "", unicodes=None, font=None):
    o = opts()
    f = font or subset.load_font(str(src), o)
    s = subset.Subsetter(o)
    s.populate(text=text, unicodes=unicodes or [])
    s.subset(f)
    subset.save_font(f, str(out), o)
    return out.stat().st_size


def urange(chars: str) -> str:
    cps = sorted({ord(c) for c in chars})
    parts, i = [], 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        parts.append(f"U+{cps[i]:X}" if i == j else f"U+{cps[i]:X}-{cps[j]:X}")
        i = j + 1
    return ",".join(parts)


def face(fam, url, rng=None, weight="400", style="normal", fmt="woff2"):
    r = f";unicode-range:{rng}" if rng else ""
    return f"@font-face{{font-family:'{fam}';font-style:{style};font-weight:{weight};font-display:swap;src:url({url}) format('{fmt}'){r}}}"


def main(usage_path: str):
    usage = json.loads(Path(usage_path).read_text("utf-8"))
    core: dict[str, set] = {}
    allc: dict[str, set] = {}
    latin: dict[str, set] = {}
    for page, d in usage.items():
        en = not page.startswith(("/zh/", "/ko/", "/th/"))
        for k, s in d.items():
            if k == "title":
                continue
            if k == "latin":
                for fam, t in s.items():
                    latin.setdefault(fam, set()).update(t)
                continue
            allc.setdefault(k, set()).update(s)
            if en:
                core.setdefault(k, set()).update(s)
    (OUT / "cjk").mkdir(parents=True, exist_ok=True)
    for old in (OUT / "cjk").glob("*.woff2"):
        old.unlink()
    css = ["/* 由 tools/subset_fonts.py 生成，勿手改 */"]

    # 拉丁：Fraunces 固定 SOFT / WONK 轴，只留字重和光学尺寸；拉丁扩展只留实际用到的字（拼音调号等）
    ext_chars = "".join(sorted(set().union(*latin.values()) if latin else set()))
    ext_chars = "".join(c for c in ext_chars if 0x100 <= ord(c) <= 0x2AF or 0x1E00 <= ord(c) <= 0x1EFF) + "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü"
    for name, src_basic, src_ext, style in [
        ("fraunces", "fraunces/fraunces-latin-full-normal.woff2", "fraunces/fraunces-latin-ext-full-normal.woff2", "normal"),
        ("fraunces-italic", "fraunces/fraunces-latin-full-italic.woff2", "fraunces/fraunces-latin-ext-full-italic.woff2", "italic"),
    ]:
        for part, src, chars in [("latin", src_basic, None), ("ext", src_ext, ext_chars)]:
            f = TTFont(LAT / src)
            f = instancer.instantiateVariableFont(f, {"SOFT": 50, "WONK": 0, "wght": (300, 700)})
            import io
            buf = io.BytesIO(); f.flavor = None; f.save(buf); buf.seek(0); f = TTFont(buf)
            out = OUT / f"{name}-{part}.woff2"
            if chars is None:
                save_subset(None, out, unicodes=list(range(0x20, 0x100)) + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2022, 0x2192, 0x2190, 0x00D7, 0x2122], font=f)
            else:
                save_subset(None, out, text=chars, font=f)
            print(out.name, out.stat().st_size // 1024, "KB")
            css.append(face("Fraunces Variable", f"/assets/fonts/{out.name}", BASIC if chars is None else urange(chars), "300 700", style))
    for part, src, chars in [("latin", "inter/inter-latin-wght-normal.woff2", None), ("ext", "inter/inter-latin-ext-wght-normal.woff2", ext_chars)]:
        out = OUT / f"inter-{part}.woff2"
        if chars is None:
            import shutil
            shutil.copy(LAT / src, out)
        else:
            save_subset(LAT / src, out, text=chars)
        print(out.name, out.stat().st_size // 1024, "KB")
        css.append(face("Inter Variable", f"/assets/fonts/{out.name}", BASIC if chars is None else urange(chars), "100 900"))
    for w in (400, 700):
        import shutil
        shutil.copy(LAT / f"atkinson/atkinson-{w}.woff2", OUT / f"atkinson-{w}.woff2")
        css.append(face("Atkinson Hyperlegible", f"/assets/fonts/atkinson-{w}.woff2", None, str(w)))

    # 中文：extra（宽范围）先声明，core（精确字表）后声明
    for key, (fam, w, src) in CJK_FACES.items():
        c_all = allc.get(key, set()) | set(PUNCT)
        c_core = core.get(key, set())
        extra = c_all - c_core
        if extra:
            n = save_subset(src, OUT / f"cjk/{key}.woff2", text="".join(sorted(c_all)))
            print(f"cjk/{key}.woff2", len(c_all), "字", n // 1024, "KB")
            css.append(face(fam, f"/assets/fonts/cjk/{key}.woff2", CJK_RANGE, str(w)))
        if c_core:
            n = save_subset(src, OUT / f"cjk/{key}-core.woff2", text="".join(sorted(c_core)))
            print(f"cjk/{key}-core.woff2", len(c_core), "字", n // 1024, "KB")
            css.append(face(fam, f"/assets/fonts/cjk/{key}-core.woff2", urange("".join(c_core)), str(w)))

    # 韩文 / 泰文
    for w in (400, 700):
        chars = allc.get(f"krth-{w}", set())
        if w == 700:
            chars = chars | allc.get("krth-400", set())  # 粗体缺字时浏览器会合成，这里保险起见同一字表
        ko = "".join(sorted(c for c in chars if 0xAC00 <= ord(c) <= 0xD7AF or 0x3130 <= ord(c) <= 0x318F))
        th = "".join(sorted(c for c in chars if 0x0E00 <= ord(c) <= 0x0E7F))
        for script, text, src, rng in [("kr", ko, KT / f"NotoSansKR-{w}.ttf", "U+1100-11FF,U+3130-318F,U+AC00-D7AF"), ("th", th, KT / f"NotoSansThai-{w}.ttf", "U+0E00-0E7F")]:
            if not text:
                continue
            n = save_subset(src, OUT / f"cjk/{script}-{w}.woff2", text=text)
            print(f"cjk/{script}-{w}.woff2", len(text), "字", n // 1024, "KB")
            css.append(face("Shuye Sans KR TH", f"/assets/fonts/cjk/{script}-{w}.woff2", rng, str(w)))
    for old in OUT.glob("*.woff2"):
        if old.name not in {Path(x.split("url(")[1].split(")")[0]).name for x in css if "url(" in x}:
            old.unlink()
    (ROOT / "src/styles/fonts.css").write_text("\n".join(css) + "\n", "utf-8")
    print("fonts.css", len(css) - 1, "faces")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/shuyelab-font-usage.json")
