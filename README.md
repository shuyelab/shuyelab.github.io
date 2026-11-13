# shuyelab.github.io · 书叶工作室官网

Shuye Lab（书叶工作室）的官网：https://shuyelab.github.io/ 。Astro 静态站，GitHub Actions 构建后发布到 GitHub Pages。
网址规则见 [docs/url-scheme.md](docs/url-scheme.md)，设计与内容决策见 [docs/decisions.md](docs/decisions.md)。

## 目录

| 路径 | 内容 |
|---|---|
| `src/data/site.json` | 站点设置：网址、**联系邮箱**（全站只在这里改）、GoatCounter 开关 |
| `src/data/apps.json` | App 数据：首页卡片、产品页各区块（`blocks`）、合规页的语种（`legal`） |
| `src/data/series.json`、`src/data/books.json` | 图书系列与单本书的数据（书名、简介、样张页码、`amazon_url`、配套资源） |
| `src/i18n.ts` | 界面文字和首页 / 关于 / 联系 / 列表页的文案（en、zh；ko、th 只有页头页脚） |
| `src/content/legal/<app>/<doc>.<lang>.html` | App 合规页正文（隐私政策、使用条款、支持），HTML 片段 |
| `src/lib/routes.ts` | 路由表：由数据生成全部页面、hreflang 与 sitemap |
| `src/pages/[...path].astro` | 唯一的页面入口，按路由表渲染 `src/components/pages/*` |
| `src/styles/global.css`、`fonts.css` | 样式（v3「纸与印」）；`fonts.css` 由脚本生成 |
| `public/` | 原样输出的静态文件：`assets/`（图片、字体、分享图）、图标、`robots.txt`，以及下面三棵静态子树 |
| `public/books/civics-in-two-languages/civics-2025-zh/listen/` | 入籍书配套音频站（由 kdp-books 仓库同步进来，**不要手改**） |
| `public/go/`、`public/citizenship/` | 印刷短链与旧网址的跳转页（`tools/gen_redirects.py` 生成） |
| `data/routes.json` | 跳转表（`go` 短链、`legacy` 旧址、`temp` 临时跳转） |
| `tools/` | 构建辅助脚本（见下） |
| `design/` | 设计稿与评审（不发布） |

## 本地预览与构建

需要 Node ≥ 22.23（Astro 7 的要求；本机系统 Node 是 22.22，用 `~/.local/opt/node-v24.22.3-linux-x64/bin` 里的 Node 24 LTS）。

```bash
export PATH=$HOME/.local/opt/node-v24.22.3-linux-x64/bin:$PATH
npm ci                     # 慢就加 --registry=https://registry.npmmirror.com
npm run build              # 产物在 dist/
python3 tools/check_dist.py dist   # 自检：死链、关键网址、元信息、hreflang、字体缺字
npm run preview            # http://127.0.0.1:18322 （本机是生产服务器：看完就 Ctrl-C，别常驻）
```

不起端口也能看页面：`node tools/shoot.mjs /tmp/shots`（Playwright 拦截请求直接读 `dist/`，输出 1440 / 768 / 390 三种宽度的整页截图）。

文案或数据改动后，如果新增了汉字（或韩文、泰文），要重做字体子集和分享图：

```bash
tools/rebuild_assets.sh    # 构建 → 统计用字 → 子集化字体 → 生成 favicon / OG 图 → 再构建 → 自检
```

封面、样张、App 截图换了：`PYTHONPATH=/home/ywr/projects/personal/kdp-books/.pylib python3 tools/import_assets.py`
（书封取 kdp-books `books/<书>/out/ebook-cover.jpg`，样张从 `interior.pdf` 按 `books.json` 的页码渲染）。

## 发布

推送到 `main` 就会触发 `.github/workflows/deploy.yml`：`npm ci` → `astro build` → `tools/check_dist.py` → 上传到 Pages。
仓库 Pages 设置为 `build_type=workflow`。部署状态：`gh run list -R shuyelab/shuyelab.github.io`。

提交时带 pathspec（`git commit -- <路径>`），多个会话可能同时在改这个仓库。

## 加东西

- **加一个 App**：在 `src/data/apps.json` 加一项（`slug` 用包名最后一段），图片放 `public/assets/img/apps/<slug>/`，
  合规页正文放 `src/content/legal/<slug>/{privacy,terms,support}.<lang>.html`，`legal.<doc>.langs` 写有哪些语种。
  产品页由 `blocks` 组成，可用的区块：`tones`、`features`、`band`、`plans`、`promise`、`faq`、`help`、`cta`。
- **加一本书**：在 `src/data/books.json` 加一项（`series` 填系列 slug，`source` 填 kdp-books 里的书目录），
  跑 `tools/import_assets.py` 生成封面和样张，再跑 `tools/rebuild_assets.sh`。上架后把 `amazon_url` 填上，按钮自动变成「Buy on Amazon」。
- **加一个系列**：在 `src/data/series.json` 加一项；slug 不能用 url-scheme.md 第 2 节的保留字。
- **加一种语言**：在 `src/i18n.ts` 的 `LANGS` 登记并补一份界面文字。全站语言放进 `SITE_LANGS`；
  只给某个页面加语种（如 Kaihua 隐私政策的韩、泰语）就在该 App 的 `legal.<doc>.langs` 里加，并放对应的 HTML 片段。
- **加印刷短链**：在 `data/routes.json` 的 `go` 里加，跑 `python3 tools/gen_redirects.py`，产物写进 `public/go/`。
  短链一经印刷永久有效，只能改目标、不能删。

## Kaihua 合规页

**本站是 Kaihua 合规页的唯一事实源**（2026-11-13 起；kaihua 仓库的 `store/site/` 已停用，旧导入脚本已删除）：
直接改 `src/content/legal/kaihua/<doc>.<lang>.html`。英文版为准，改完同步译本：隐私政策有 zh / ko / th，条款和支持页有 zh
（支持页末尾的韩、泰语小节写在英文版里，中文版照抄）。内容必须与 App 实际一致（SDK、权限、本地数据、付费边界、级别与词数），
kaihua 仓库 `store/compliance-forms.md` 的商店问卷要跟着改。买了 kaihua.app 之后迁回，这里的网址保留并做跳转。
这些页面里有法规要求的 AI 内容披露（韩国 AI 基本法），是去 AI 味规则 R1 的例外（见 docs/decisions.md）。

## 配套音频站怎么同步进来

入籍书音频站在 kdp-books 仓库生成：

```bash
cd /home/ywr/projects/personal/kdp-books/books/citizenship-zh
src/deploy-site.sh stage     # 构建 + rsync 到本仓库 public/books/civics-in-two-languages/civics-2025-zh/listen/（只动这个子目录）
src/deploy-site.sh publish   # 再提交（带 pathspec）、推送，等 Actions 部署完成后线上自检
```

以后别的书有配套子站，照这个做法放进 `public/books/<系列>/<书>/<子站>/`，并在 `tools/check_dist.py` 的关键网址里登记。

## 以后要放的文件

- `public/app-ads.txt`：AdMob 账号开通后，把 publisher ID 填进 kaihua 仓库 `store/site/app-ads.txt` 的模板，
  复制到这里（必须在开发者网站域名的根目录，即 `https://shuyelab.github.io/app-ads.txt`），并在商店后台把「开发者网站」填成本站。
- 买了域名之后：`public/CNAME`，并把 `src/data/site.json` 的 `url` 和 `astro.config.mjs` 的 `site` 改成新域名。

## 统计

GoatCounter 的开关在 `src/data/site.json`（`goatcounter.enabled`，code 为 `shuyelab`），默认关闭。
注册好账号后改成 `true` 即可；本站隐私声明 `/legal/` 会自动换成「已启用统计」的说法。
