// 站点文案（界面字符串 + 首页 / 关于 / 联系 / 本站隐私声明）。产品、系列、书的文案在 src/data/*.json。
// 加一种语言：在 LANGS 里登记，再给 ui 补一份同结构的对象（缺的键会回落到英文）。

export const LANGS = ['en', 'zh', 'ko', 'th'] as const;
export type Lang = (typeof LANGS)[number];
/** 完整提供全站页面的语言；ko / th 只用于个别产品页（如 Kaihua 隐私政策）。 */
export const SITE_LANGS: Lang[] = ['en', 'zh'];
export const HTML_LANG: Record<Lang, string> = { en: 'en', zh: 'zh-CN', ko: 'ko', th: 'th' };
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', zh: 'zh_CN', ko: 'ko_KR', th: 'th_TH' };
export const LANG_LABEL: Record<Lang, string> = { en: 'English', zh: '中文', ko: '한국어', th: 'ไทย' };
export const LANG_SHORT: Record<Lang, string> = { en: 'EN', zh: '中文', ko: '한국어', th: 'ไทย' };

type Dict = Record<string, any>;

const en: Dict = {
  siteName: 'Shuye Lab',
  skip: 'Skip to content',
  nav: { apps: 'Apps', books: 'Books', about: 'About', contact: 'Contact', menu: 'Menu', main: 'Main', home: 'Shuye Lab home', language: 'Language' },
  footer: {
    about: 'An independent studio making study apps and printed study books.',
    apps: 'Apps', books: 'Books', studio: 'Studio', privacy: 'Site privacy', cookies: 'No cookies on this site.',
  },
  comingSoon: 'Coming soon', amazonSoon: 'Coming soon on Amazon', buyAmazon: 'Buy on Amazon',
  appStore: 'App Store', googlePlay: 'Google Play', inTesting: 'In testing',
  readMore: 'Read more', viewSeries: 'See the series', viewBook: 'About this book',
  writtenFor: 'Written for', whatsInside: "What's inside", samplePages: 'Sample pages', lookInside: 'Look inside.',
  enlarge: 'Open full size', close: 'Close', details: 'Details', aboutSeries: 'About the series',
  booksInSeries: 'Books in this series', moreSoon: 'More books in this series are on the way.',
  crumbsBooks: 'Books', crumbsApps: 'Apps',
  legalAlso: 'This page in other languages:', backTo: 'Back to', legalBack: 'About the app',
  home: {
    title: 'Shuye Lab · 书叶工作室',
    description: 'Shuye Lab is an independent studio. It makes an app for learning Chinese, an app for logging a daily practice, and printed study books.',
    eyebrow: 'Independent studio · <span class="zh">书叶工作室</span>',
    h1: 'Apps for learning Chinese, <em>and books for study.</em>',
    lead: 'Shuye Lab makes two apps, one for learning Chinese and one for logging a daily practice, and printed study books on Chinese characters, the U.S. citizenship test, classical Chinese in translation and chess tactics.',
    ctaApps: 'See the apps', ctaBooks: 'Browse the books',
    key: [['书', 'shū', 'a book'], ['叶', 'yè', 'a leaf']],
    appsEyebrow: 'Apps',
    appsH2: 'Two apps: one for Chinese words, one for <em>daily practice.</em>',
    appsSide: 'Neither asks you to make an account. Your progress stays on your own phone.',
    booksEyebrow: 'Books, by series',
    booksH2: 'Four series. <em>Book one</em> of each is on its way.',
    booksSide: 'Paperback and Kindle editions are coming soon on Amazon.',
    aboutEyebrow: 'About', aboutH2: 'Two characters, <em>one name.</em>',
    contactEyebrow: 'Contact', contactH2: 'Questions, corrections, <em>ideas.</em>',
    contactP: 'One inbox for every app and book. For purchase questions, include your store order ID, never your password or card number.',
  },
  about: {
    title: 'About Shuye Lab',
    description: 'Shuye Lab (书叶工作室) is an independent studio. What the name means, what we make and the rules we keep.',
    eyebrow: 'About',
    h1: 'Two characters, <em>one name.</em>',
    chars: [['书', 'shū · book', 'For the books we publish.'], ['叶', 'yè · leaf', 'In English, a page of a book is also a leaf.']],
    lead: 'Shuye Lab is an independent studio. We make apps for learning Chinese and tracking daily practice, and print books for study: Chinese characters, the U.S. citizenship test, classical Chinese texts in translation, and chess tactics.',
    principlesH2: 'Rules we keep',
    principles: [
      ['Official sources first', 'Word lists and answers come from the source: the HSK 3.0 syllabus, the USCIS civics list. Where we add our own material, such as notes, examples or translations, we check it against that source.'],
      ['No account needed', 'Our apps work without sign-up. Your progress stays on your device.'],
      ['Free things stay free', 'Kaihua reviews, all of ChiHeng, and the citizenship audio cost nothing.'],
      ['Corrections in public', 'When we find a mistake in a book, it goes on the book’s errata page. Tell us about any you find.'],
    ],
    makeH2: 'What we make',
    makeApps: 'Apps', makeBooks: 'Books',
  },
  contact: {
    title: 'Contact Shuye Lab',
    description: 'One email address for every Shuye Lab app and book: questions, corrections, purchase help and ideas.',
    eyebrow: 'Contact',
    h1: 'Questions, corrections, <em>ideas.</em>',
    lead: 'One inbox for every app and book. We read everything and aim to reply within 15 business days.',
    include: 'What helps us answer',
    tips: [
      ['About an app', 'The app name, your device model, the system version and the app version.'],
      ['About a purchase', 'Your store order ID (Apple: in the receipt email; Google: starts with “GPA.”). Never send your password or card number.'],
      ['About a book', 'The book title, the page or question number, and what looks wrong. A photo of the page helps.'],
    ],
    selfHelp: 'You may find the answer here first',
  },
  legal: {
    title: 'Site privacy',
    description: 'Privacy notice for the shuyelab.github.io website: no cookies, no tracking, hosted on GitHub Pages.',
  },
  apps: {
    title: 'Apps by Shuye Lab',
    description: 'Kaihua, for learning HSK 3.0 words and tones, and ChiHeng, a quiet log for daily practice.',
    eyebrow: 'Apps', h1: 'Two apps, <em>no accounts.</em>',
    lead: 'Both apps keep your progress on your own phone. Each has its own support page, privacy policy and terms.',
  },
  books: {
    title: 'Books by Shuye Lab',
    description: 'Four series of printed study books: HSK 3.0 Chinese characters, the U.S. citizenship test in Chinese and English, classical Chinese in parallel text, and chess tactics.',
    eyebrow: 'Books, by series', h1: 'Four series. <em>Book one</em> of each is on its way.',
    lead: 'Paperback and Kindle editions are coming soon on Amazon. Each series page lists its books and what they cover.',
  },
  notFound: { title: 'Page not found', h1: 'This page is <em>not here.</em>', p: 'The address may be mistyped, or the page has moved.', home: 'Go to the home page' },
  legalNav: { privacy: 'Privacy Policy', terms: 'Terms of Use', support: 'Support' },
};

const zh: Dict = {
  siteName: '书叶工作室',
  skip: '跳到正文',
  nav: { apps: '应用', books: '图书', about: '关于', contact: '联系', menu: '菜单', main: '主导航', home: '书叶工作室首页', language: '语言' },
  footer: {
    about: '独立工作室，做学习类 App 和纸质学习书。',
    apps: '应用', books: '图书', studio: '工作室', privacy: '本站隐私声明', cookies: '本站不使用 Cookie',
  },
  comingSoon: '即将上线', amazonSoon: '即将在亚马逊上架', buyAmazon: '在亚马逊购买',
  appStore: 'App Store', googlePlay: 'Google Play', inTesting: '测试中',
  readMore: '了解更多', viewSeries: '查看系列', viewBook: '了解这本书',
  writtenFor: '适合谁', whatsInside: '书里有什么', samplePages: '样张', lookInside: '翻开看看。',
  enlarge: '查看大图', close: '关闭', details: '图书信息', aboutSeries: '关于这个系列',
  booksInSeries: '本系列图书', moreSoon: '本系列的后续各册正在编写中。',
  crumbsBooks: '图书', crumbsApps: '应用',
  legalAlso: '其他语言版本：', backTo: '返回', legalBack: 'App 介绍',
  home: {
    title: '书叶工作室 Shuye Lab',
    description: '书叶工作室是一家独立工作室，做学中文、记功课的 App，也出纸质学习书：汉字练习、美国入籍考试、典籍英译和国际象棋。',
    eyebrow: 'Shuye Lab · 独立工作室',
    h1: '做学习用的<br><em>App 和书。</em>',
    lead: '书叶工作室做学习用的 App 和书：给海外中文学习者的背词与声调训练，给每天做功课的人的记录工具，还有汉字练习册、入籍考试中英对照书、典籍英译和国际象棋题集。',
    ctaApps: '看看 App', ctaBooks: '看看图书',
    key: [['书', 'shū', '出版的书'], ['叶', 'yè', '一点点长出来的东西']],
    appsEyebrow: '应用 · Apps',
    appsH2: '两款 App，<br>一个学中文，<em>一个记功课。</em>',
    appsSide: '都不需要注册账号，数据留在你自己的手机上。',
    booksEyebrow: '图书 · 按系列',
    booksH2: '四个系列，<br><em>第一册都快上架了。</em>',
    booksSide: '平装与 Kindle 电子版即将在亚马逊上架。',
    aboutEyebrow: '关于', aboutH2: '名字里的<em>两个字。</em>',
    contactEyebrow: '联系', contactH2: '有问题，<br><em>写信给我们。</em>',
    contactP: '所有 App 和图书的问题都发到同一个邮箱。问购买问题时请附上商店订单号，不要发密码或卡号。',
  },
  about: {
    title: '关于书叶工作室',
    description: '书叶工作室（Shuye Lab）是一家独立工作室。名字的意思、我们做什么，以及我们守的几条规矩。',
    eyebrow: '关于',
    h1: '名字里的<em>两个字</em>',
    chars: [['书', 'shū', '对应我们出的书。'], ['叶', 'yè', '叶子一片一片长，学东西也一样。']],
    lead: '书叶工作室是一家独立工作室，做学中文、记功课的 App，也出纸质学习书：汉字练习、美国入籍考试、中国典籍英译和国际象棋战术。',
    principlesH2: '我们守的几条规矩',
    principles: [
      ['以官方为准', '词表和答案照录原始出处：HSK 3.0 官方大纲、USCIS 公布的入籍考试题单。我们自己加的讲解、例句和译文，也对照这些出处核对。'],
      ['不要账号，数据在你手里', '我们的 App 不需要注册，进度只存在你的设备上。'],
      ['该免费的一直免费', '开花的复习、持恒的全部功能、入籍考试的朗读音频，都不收费。'],
      ['勘误公开', '书里发现的错误会登在这本书的勘误页上。你发现了错误，也请告诉我们。'],
    ],
    makeH2: '我们做的东西',
    makeApps: '应用', makeBooks: '图书',
  },
  contact: {
    title: '联系书叶工作室',
    description: '书叶工作室所有 App 和图书共用一个邮箱：使用问题、勘误、购买和建议都可以写信来。',
    eyebrow: '联系',
    h1: '有问题，<br><em>写信给我们。</em>',
    lead: '所有 App 和图书共用一个邮箱。每封信我们都会看，争取在 15 个工作日内回复。',
    include: '写信时附上这些，回复会快一些',
    tips: [
      ['App 的问题', 'App 名称、手机型号、系统版本和 App 版本。'],
      ['购买的问题', '商店订单号（苹果在购买收据邮件里，谷歌的以「GPA.」开头）。请不要发密码或银行卡号。'],
      ['图书的问题', '书名、页码或题号，以及哪里看起来不对。拍一张那一页的照片更好。'],
    ],
    selfHelp: '这些页面里可能已经有答案',
  },
  legal: {
    title: '本站隐私声明',
    description: 'shuyelab.github.io 网站的隐私声明：不用 Cookie，不做跟踪，托管在 GitHub Pages。',
  },
  apps: {
    title: '书叶工作室的 App',
    description: '开花 Kaihua：HSK 3.0 背词与声调训练；持恒：安安静静的功课记录工具。',
    eyebrow: '应用', h1: '两款 App，<em>都不用注册。</em>',
    lead: '两款 App 都把进度存在你自己的手机上，各自有支持页、隐私政策和使用条款。',
  },
  books: {
    title: '书叶工作室的图书',
    description: '四个系列的纸质学习书：HSK 3.0 汉字练习、美国入籍考试中英对照、中国典籍中英对照、国际象棋战术。',
    eyebrow: '图书 · 按系列', h1: '四个系列，<br><em>第一册都快上架了。</em>',
    lead: '平装与 Kindle 电子版即将在亚马逊上架。点进每个系列，可以看到收了哪些书、各讲什么。',
  },
  notFound: { title: '找不到页面', h1: '这个页面<em>不在这里。</em>', p: '可能是网址输错了，也可能页面已经搬走。', home: '回到首页' },
  legalNav: { privacy: '隐私政策', terms: '使用条款', support: '支持' },
};

const ko: Dict = {
  skip: '본문으로 건너뛰기',
  nav: { apps: '앱', books: '도서', about: '소개', contact: '문의', menu: '메뉴', main: '주 메뉴', home: 'Shuye Lab 홈', language: '언어' },
  footer: { about: '학습용 앱과 학습서를 만드는 독립 스튜디오입니다.', apps: '앱', books: '도서', studio: '스튜디오', privacy: '사이트 개인정보', cookies: '이 사이트는 쿠키를 사용하지 않습니다.' },
  legalAlso: '다른 언어:', backTo: '돌아가기', legalBack: '앱 소개', crumbsApps: '앱',
  legalNav: { privacy: '개인정보처리방침', terms: '이용약관(영문)', support: '고객 지원(영문)' },
};

const th: Dict = {
  skip: 'ข้ามไปที่เนื้อหา',
  nav: { apps: 'แอป', books: 'หนังสือ', about: 'เกี่ยวกับเรา', contact: 'ติดต่อ', menu: 'เมนู', main: 'เมนูหลัก', home: 'หน้าแรก Shuye Lab', language: 'ภาษา' },
  footer: { about: 'สตูดิโออิสระที่ทำแอปและหนังสือสำหรับการเรียน', apps: 'แอป', books: 'หนังสือ', studio: 'สตูดิโอ', privacy: 'ความเป็นส่วนตัวของเว็บไซต์', cookies: 'เว็บไซต์นี้ไม่ใช้คุกกี้' },
  legalAlso: 'ภาษาอื่น:', backTo: 'กลับไปที่', legalBack: 'เกี่ยวกับแอป', crumbsApps: 'แอป',
  legalNav: { privacy: 'นโยบายความเป็นส่วนตัว', terms: 'ข้อกำหนดการใช้งาน (ภาษาอังกฤษ)', support: 'ฝ่ายช่วยเหลือ (ภาษาอังกฤษ)' },
};

const DICTS: Record<Lang, Dict> = { en, zh, ko, th };

function merge(base: Dict, over: Dict): Dict {
  const out: Dict = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base[k] ? merge(base[k], v) : v;
  }
  return out;
}

export function t(lang: Lang): Dict {
  return lang === 'en' ? en : merge(en, DICTS[lang]);
}

/** 取 {en, zh, …} 形式的本地化值；缺语言时回落英文。字符串原样返回。 */
export function L<T = string>(v: any, lang: Lang): T {
  if (v == null) return v;
  if (typeof v !== 'object' || Array.isArray(v)) return v;
  return (v[lang] ?? v.en) as T;
}

/** 站内网址：英文不加前缀，其他语言加 /<lang>。path 以 / 开头并以 / 结尾。 */
export function href(lang: Lang, path: string): string {
  return lang === 'en' ? path : `/${lang}${path}`;
}
