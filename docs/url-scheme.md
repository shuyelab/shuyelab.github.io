# 网址规范（shuyelab.github.io，以后迁到 shuyelab.com 不变）

> 2026-11-13 定稿；同日正式站（Astro）上线，状态列已同步。原则：**网址一旦印到书上、填进 App 商店，就永远不改**。所有路径都按下面的规则来，新功能只在预留的命名空间里扩展。

## 1. 通用规则

- 全部用**小写 ASCII**，单词之间用连字符 `-`；不出现中文、空格、下划线、大写字母。
- 每个页面就是一个目录，网址**以 `/` 结尾**（`/apps/kaihua/`），不暴露 `.html`。
- slug（网址里的名字）一经发布就不改。真要改，旧网址必须留跳转（见第 4 节）。
- 版本、年份、语种只在确实需要区分时才放进 slug（如 `civics-2025-zh`），不用日期做目录。

## 2. 顶层命名空间

| 路径 | 用途 | 状态 |
|---|---|---|
| `/` | 工作室首页（英文，默认语言） | 已上线（2026-11-13 正式站，v3 设计） |
| `/zh/`、`/ko/`、`/th/` … | 其他语言版本：**语言前缀加上与英文完全相同的路径**，如 `/zh/apps/kaihua/` | `/zh/` 全站已上线；`/ko/`、`/th/` 只有 `apps/kaihua/privacy/` |
| `/apps/` | App 列表 | 已上线 |
| `/apps/<app>/` | 单个 App 主页，`<app>` 取包名最后一段：`kaihua`、`chiheng` | 已上线：`kaihua`、`chiheng` |
| `/apps/<app>/privacy/`、`terms/`、`support/` | App 商店要求的合规页（其他语言走前缀：`/ko/apps/kaihua/privacy/`） | 已上线：kaihua（隐私 en/zh/ko/th，条款与支持 en/zh）、chiheng（en/zh） |
| `/apps/<app>/changelog/`、`faq/`、`press/` | App 更新日志、常见问题、媒体素材 | 预留 |
| `/books/` | 出版物总览（按系列） | 已上线 |
| `/books/<series>/` | 系列页，`<series>` 为系列名 slug | 已上线（4 个系列） |
| `/books/<series>/<book>/` | 单本书页面（封面、介绍、购买链接、资源入口） | 已上线（4 本；civics-2025-zh 的临时跳转已作废） |
| `/books/<series>/<book>/listen/` | 配套音频播放 | **已上线**：`/books/civics-in-two-languages/civics-2025-zh/listen/`（旧址 `/books/citizenship-bridge/…` 全部跳转到这里） |
| `/books/<series>/<book>/errata/`、`downloads/`、`extras/` | 勘误、可打印资料、补充内容 | 预留（勘误目前在 listen/errata/ 下，等书页上线后迁出） |
| `/go/<code>/…` | **印刷短链**，只做跳转（见第 3 节） | 已上线：`/go/cb1/` |
| `/about/`、`/contact/` | 工作室介绍、联系方式 | 已上线 |
| `/legal/` | 工作室网站本身的隐私声明、使用条款 | 已上线（隐私声明；使用条款预留） |
| `/news/` | 动态、新书或新版本公告 | 预留 |
| `/press/` | 品牌素材包（Logo、产品图） | 预留 |
| `/api/v1/…` | 给 App 读取的静态 JSON（公告、远程配置、最新版本号、书与 App 的互链数据） | 预留 |
| `/assets/` | 全站共用的静态资源（字体、Logo、图标） | 已上线：`img/`、`fonts/`、`og/`（分享图）、`build/`（构建生成的 CSS/JS） |
| `/.well-known/` | App 深度链接：iOS 的 `apple-app-site-association`、Android 的 `assetlinks.json`（以后可实现"扫书里的码，已装 App 就直接在 App 里打开"） | 预留 |
| `/favicon.ico`、`/favicon.svg`、`/apple-touch-icon.png`、`/icon-192.png`、`/icon-512.png`、`/site.webmanifest` | 浏览器和系统约定的图标文件，只能放根目录 | 已上线 |
| `/app-ads.txt`、`/robots.txt`、`/sitemap.xml`、`/404.html` | 根目录固定文件。AdMob 要求 `app-ads.txt` 必须在开发者网站根目录 | `robots.txt`、`sitemap.xml`、`404.html` 已上线；`app-ads.txt` 等 AdMob 账号（放 `public/app-ads.txt`） |

**保留字**：以上顶层名字，以及 `admin`、`static`、`img`、`search`、`tags` 不能用作系列、书、App 的 slug。

## 3. 印刷短链 `/go/`

书上印的二维码和网址**一律用短链**，不直接印长网址：

```
https://shuyelab.github.io/go/cb1/u01   →   /books/civics-in-two-languages/civics-2025-zh/listen/u01/
```

- **短码**：系列缩写加册序号，全小写、不超过 4 个字符，一经印刷永久有效。登记在 `data/routes.json`。
- 好处：
  1. 长辈手动输入方便；
  2. 以后网站结构再调整，只改跳转表，印出去的书不受影响；
  3. 统计 `/go/` 的访问量就是二维码的扫码量；
  4. 以后可以在这里加"已装 App 就跳进 App"的逻辑。
- 短链下的子路径原样带到目标地址后面：`/go/cb1/senior` → `…/listen/senior/`。

| 短码 | 系列 / 书 | 目标 |
|---|---|---|
| `cb1` | Civics in Two Languages 第 1 册（2025 版 128 题中英大字版；短码沿用改名前的 cb1，已印在书上，不改） | `/books/civics-in-two-languages/civics-2025-zh/listen/` |
| `gg1` | Grid by Grid Chinese 第 1 册（HSK 3.0 一级）| 预留 |
| `cc1` | Chinese Classics in Parallel Text 第 1 册（孙子兵法）| 预留 |
| `mm1` | Motif by Motif Chess Workbooks 第 1 册 | 预留 |

## 4. 跳转

GitHub Pages 没有服务器端跳转，所以用静态跳转页实现：页面里放 `<meta http-equiv="refresh">`、`<link rel="canonical">` 和保留查询参数与锚点的 JS，并设为 `noindex`。

- 跳转表：`data/routes.json`，包括 `go` 短链和 `legacy` 旧网址两类。
- 生成脚本：`python3 tools/gen_redirects.py`。它根据跳转表，为目标目录下的每个子页面都生成对应的跳转页，写进 `public/`（Astro 构建时原样输出）。
- **旧网址永不删除**，只能改成跳到新位置。

## 5. Slug 登记

| 类型 | slug | 说明 |
|---|---|---|
| App | `kaihua` | com.shuyelab.kaihua |
| App | `chiheng` | com.shuyelab.chiheng |
| 系列 | `grid-by-grid-chinese` | Grid by Grid Chinese |
| 系列 | `civics-in-two-languages` | Civics in Two Languages（2026-11-13 由 Citizenship Bridge 改名：原名与纽约同名教育机构冲突。旧 slug `citizenship-bridge` 停用，旧网址全部跳到新位置，见 `data/routes.json` 的 legacy；读者可见处不再出现旧名） |
| 系列 | `chinese-classics-parallel` | Chinese Classics in Parallel Text |
| 系列 | `motif-by-motif-chess` | Motif by Motif Chess Workbooks |
| 书 | `civics-2025-zh` | 美国入籍考试 2025 版 128 题中英大字版 |
| 书 | `hsk1-workbook` | HSK 3.0 一级汉字书写+词汇练习册 |
| 书 | `art-of-war` | 《孙子兵法》原创英译注本 |
| 书 | `core-tactics` | 国际象棋战术题集第 1 册 |
