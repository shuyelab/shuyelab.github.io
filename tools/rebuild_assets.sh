#!/usr/bin/env bash
# 文案或数据改动后重做字体子集与分享图，再构建并自检（本地用；CI 只跑 npm run build）。
# 需要：Node ≥ 22.23（Astro 7 要求）、playwright-core（PW_CORE）、本机 chromium、kdp-books/.pylib（fontTools、Pillow）。
set -euo pipefail
cd "$(dirname "$0")/.."
export PYTHONPATH="${PYTHONPATH:-/home/ywr/projects/personal/kdp-books/.pylib}"
npx astro build >/dev/null
node tools/font_usage.mjs > /tmp/shuyelab-font-usage.json
python3 tools/subset_fonts.py /tmp/shuyelab-font-usage.json
npx astro build >/dev/null
node tools/make_icons_og.mjs
python3 - <<'PY'
from PIL import Image
import glob
ims = [Image.open(f'/tmp/shuyelab-icon-{s}.png').convert('RGBA') for s in (16, 32, 48)]
ims[2].save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
for f in glob.glob('public/assets/og/*.png'):
    Image.open(f).convert('RGB').save(f, optimize=True)
PY
npx astro build >/dev/null
python3 tools/check_dist.py dist
