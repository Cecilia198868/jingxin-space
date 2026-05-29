import { knowledgeArticles } from "../data/knowledge";
import { beginnerGuideArticles } from "../data/beginner-guide";
import { footerInfoArticles } from "../data/footer-info";
import {
  scriptureOrder,
  scriptures,
  type ScriptureKey,
} from "../data/scriptures";

export type SiteSearchResult = {
  id: string;
  title: string;
  category: string;
  href: string;
  excerpt: string;
  score: number;
};

type SearchDocument = {
  id: string;
  title: string;
  category: string;
  href: string;
  summary: string;
  body: string;
  priority?: number;
};

const staticDocuments: SearchDocument[] = [
  {
    id: "home",
    title: "静心修习空间",
    category: "首页",
    href: "/",
    summary: "在线抄写佛经、静心描佛、念佛号、佛乐欣赏与传统文化学习平台。",
    body: "抄写经书 抄写佛号 朗读佛经 念佛号 念咒语 抄写咒语 背景音乐 佛乐欣赏 静心描佛 佛教知识 初学者学佛指南",
    priority: 5,
  },
  {
    id: "copy-scripture",
    title: "抄写经书",
    category: "修习工具",
    href: "/copy-scripture",
    summary: "逐句抄写经典，由字入心。",
    body: "在线抄经 抄写佛经 经典抄写 经文全文 经文解释",
    priority: 12,
  },
  {
    id: "draw-buddha",
    title: "静心描佛",
    category: "修习工具",
    href: "/draw-buddha",
    summary: "描绘佛像，安住当下，净心修行。",
    body: "佛像描绘 描佛 静心 莲花 观音 阿弥陀佛 地藏菩萨 药师佛",
    priority: 12,
  },
  {
    id: "buddha-name-recitation",
    title: "念佛号",
    category: "修习工具",
    href: "/buddha-name-recitation",
    summary: "称念佛号，摄心安稳。",
    body: "阿弥陀佛 观世音菩萨 地藏菩萨 药师佛 释迦牟尼佛 普贤菩萨 弥勒佛",
    priority: 12,
  },
  {
    id: "buddhist-music",
    title: "佛乐欣赏",
    category: "音乐",
    href: "/buddhist-music",
    summary: "聆听佛乐，回归宁静。",
    body: "佛乐 禅乐 古琴 音乐 静心 背景音乐 念佛音乐",
    priority: 12,
  },
  {
    id: "about",
    title: "关于静心修习空间",
    category: "关于",
    href: "/about",
    summary: "了解静心修习空间的缘起与内容。",
    body: "佛经抄写 静心描佛 念佛号 佛乐欣赏 传统文化学习",
    priority: 4,
  },
];

const scriptureAliases: Partial<Record<ScriptureKey, string[]>> = {
  heartSutra: [
    "心经",
    "般若波罗蜜多心经",
    "般若波羅蜜多心經",
    "抄写心经",
    "抄心经",
    "念心经",
    "读心经",
    "朗读心经",
    "心经歌曲",
    "心经佛乐",
    "心经音乐",
    "心经全文",
    "心经解释",
  ],
  diamondSutra: ["金刚经", "金剛經", "抄写金刚经", "朗读金刚经", "金刚经全文", "金刚经解释"],
  ksitigarbhaSutra: ["地藏经", "地藏菩萨本愿经", "抄写地藏经", "朗读地藏经", "地藏经全文"],
  amitabhaSutra: ["阿弥陀经", "阿彌陀經", "佛说阿弥陀经", "抄写阿弥陀经", "朗读阿弥陀经"],
  contemplationSutra: ["观无量寿佛经", "觀無量壽佛經", "观经", "净土三经"],
  shurangamaSutraVol1: ["楞严经", "大佛顶首楞严经", "楞严经卷一", "抄写楞严经"],
  universalGateChapter: ["普门品", "观世音菩萨普门品", "觀世音菩薩普門品", "观音经"],
  medicineBuddhaSutra: ["药师经", "藥師經", "药师琉璃光七佛本愿功德经", "抄写药师经"],
};

const featuredContentDocuments: SearchDocument[] = [
  {
    id: "practice-copy-heart-sutra",
    title: "抄写《心经》",
    category: "抄经",
    href: "/copy-scripture?book=heartSutra&sentence=1",
    summary: "打开《心经》逐句抄写，配合全文与每句解释，由字入心。",
    body: "心经 抄写心经 抄心经 在线抄心经 心经全文 心经解释 般若波罗蜜多心经",
    priority: 130,
  },
  {
    id: "practice-read-heart-sutra",
    title: "朗读《心经》",
    category: "朗读佛经",
    href: "/copy-scripture?reading=heart-sutra",
    summary: "聆听《心经》朗读，适合读诵、静心与熟悉经文。",
    body: "心经 念心经 读心经 朗读心经 心经读诵 心经念诵 般若波罗蜜多心经",
    priority: 124,
  },
  {
    id: "music-heart-sutra",
    title: "《心经》歌曲与佛乐",
    category: "佛乐",
    href: "/buddhist-music?music=heart-sutra-song-1",
    summary: "收听《心经》歌曲、佛乐与不同演唱版本，让音乐陪伴静心修习。",
    body: "心经歌曲 心经佛乐 心经音乐 王菲心经 张学友心经 般若波罗蜜多心经歌曲 般若心經 歌曲 佛乐",
    priority: 122,
  },
  {
    id: "music-heart-sutra-faye-wong",
    title: "王菲《心经》",
    category: "佛乐",
    href: "/buddhist-music?music=faye-wong-heart-sutra",
    summary: "王菲演唱版本的《心经》佛乐。",
    body: "王菲心经 王菲《心经》 心经歌曲 心经音乐 心经佛乐",
    priority: 110,
  },
  {
    id: "music-heart-sutra-jacky-cheung",
    title: "张学友粤语《心经》",
    category: "佛乐",
    href: "/buddhist-music?music=jacky-cheung-cantonese-heart-sutra",
    summary: "张学友粤语版本的《般若波罗蜜多心经》。",
    body: "张学友心经 粤语心经 心经歌曲 心经音乐 心经佛乐",
    priority: 108,
  },
  {
    id: "music-heart-sutra-sun-lu",
    title: "孙露《心经》",
    category: "佛乐",
    href: "/buddhist-music?music=sun-lu-heart-sutra",
    summary: "孙露演唱版本的《般若波罗蜜多心经》。",
    body: "孙露心经 心经歌曲 心经音乐 心经佛乐",
    priority: 106,
  },
];

function scripturePracticeDocuments(): SearchDocument[] {
  return scriptureOrder.map((bookKey) => {
    const book = scriptures[bookKey];
    const aliases = scriptureAliases[bookKey]?.join(" ") ?? "";

    return {
      id: `practice-copy-${bookKey}`,
      title: `抄写${book.displayName}`,
      category: "抄经",
      href: `/copy-scripture?book=${bookKey}&sentence=1`,
      summary: `进入${book.displayName}全文抄写与解释。`,
      body: `${book.title} ${book.displayName} ${aliases} 在线抄经 抄写佛经 经文解释`,
      priority: bookKey === "heartSutra" ? 100 : 70,
    };
  });
}

const readingDocuments: SearchDocument[] = [
  {
    id: "reading-heart-sutra",
    title: "《心经》朗读",
    category: "朗读佛经",
    href: "/copy-scripture?reading=heart-sutra",
    summary: "《心经》朗读内容，适合跟读、读诵和静心。",
    body: "心经 朗读心经 念心经 读心经 心经读诵 心经念诵",
    priority: 115,
  },
  {
    id: "reading-diamond-sutra",
    title: "《金刚经》朗读",
    category: "朗读佛经",
    href: "/copy-scripture?reading=diamond-sutra",
    summary: "《金刚经》朗读内容，适合听经与跟读。",
    body: "金刚经 朗读金刚经 念金刚经 读金刚经",
    priority: 86,
  },
  {
    id: "reading-amitabha-sutra",
    title: "《佛说阿弥陀经》朗读",
    category: "朗读佛经",
    href: "/copy-scripture?reading=amitabha-sutra",
    summary: "《佛说阿弥陀经》朗读内容，适合净土修学者听闻读诵。",
    body: "阿弥陀经 佛说阿弥陀经 朗读阿弥陀经 念阿弥陀经 净土",
    priority: 86,
  },
  {
    id: "reading-ksitigarbha-sutra",
    title: "《地藏菩萨本愿经》朗读",
    category: "朗读佛经",
    href: "/copy-scripture?reading=ksitigarbha-sutra",
    summary: "《地藏菩萨本愿经》朗读内容，适合听闻与回向。",
    body: "地藏经 地藏菩萨本愿经 朗读地藏经 念地藏经",
    priority: 86,
  },
  {
    id: "reading-infinite-life-sutra",
    title: "《佛说无量寿经》朗读",
    category: "朗读佛经",
    href: "/copy-scripture?reading=infinite-life-sutra-traditional",
    summary: "《佛说无量寿经》朗读内容，适合了解净土法门经典。",
    body: "无量寿经 佛说无量寿经 朗读无量寿经 净土法门",
    priority: 86,
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTerms(query: string): string[] {
  return Array.from(new Set(normalizeText(query).split(" ").filter(Boolean)));
}

function scriptureDocuments(): SearchDocument[] {
  return scriptureOrder.map((bookKey: ScriptureKey) => {
    const book = scriptures[bookKey];
    const aliases = scriptureAliases[bookKey]?.join(" ") ?? "";
    const bookBody = book.sentences
      .map((sentence) =>
        [
          sentence.chapterTitle,
          sentence.original,
          sentence.translation,
          sentence.commentary,
          sentence.explanation,
        ]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ");

    return {
      id: `scripture-${bookKey}`,
      title: `${book.displayName || book.title}全文与解释`,
      category: "佛经全文",
      href: `/copy-scripture?book=${bookKey}&sentence=1`,
      summary: `${book.title}全文、抄写入口与经文解释。`,
      body: `${book.title} ${book.displayName} ${book.translator ?? ""} ${aliases} ${bookBody}`,
      priority: bookKey === "heartSutra" ? 65 : 42,
    };
  });
}

function knowledgeDocuments(): SearchDocument[] {
  return knowledgeArticles.map((article) => ({
    id: `knowledge-${article.slug}`,
    title: article.title,
    category: "佛教知识",
    href: `/#${article.slug}`,
    summary: article.summary,
    body: `${article.title} ${article.summary} ${article.paragraphs.join(" ")}`,
    priority: article.title.includes("心经") ? 88 : 36,
  }));
}

function beginnerGuideDocuments(): SearchDocument[] {
  return beginnerGuideArticles.map((article) => ({
    id: `beginner-guide-${article.slug}`,
    title: article.title,
    category: "初学者学佛指南",
    href: `/#${article.slug}`,
    summary: article.summary,
    body: `${article.title} ${article.summary} ${article.paragraphs.join(" ")}`,
    priority: 80,
  }));
}

function footerInfoDocuments(): SearchDocument[] {
  return footerInfoArticles.map((article) => ({
    id: `footer-info-${article.slug}`,
    title: article.title,
    category: "网站信息",
    href: `/#${article.slug}`,
    summary: article.summary,
    body: `${article.title} ${article.summary} ${article.paragraphs.join(" ")}`,
    priority: 55,
  }));
}

function allDocuments(): SearchDocument[] {
  return [
    ...featuredContentDocuments,
    ...scripturePracticeDocuments(),
    ...readingDocuments,
    ...knowledgeDocuments(),
    ...beginnerGuideDocuments(),
    ...footerInfoDocuments(),
    ...scriptureDocuments(),
    ...staticDocuments,
  ];
}

function countOccurrences(text: string, term: string): number {
  if (!term) {
    return 0;
  }

  let count = 0;
  let index = text.indexOf(term);

  while (index !== -1) {
    count += 1;
    index = text.indexOf(term, index + term.length);
  }

  return count;
}

function excerptFor(document: SearchDocument, terms: string[]): string {
  const text = `${document.summary} ${document.body}`.replace(/\s+/g, " ").trim();
  const lowerText = text.toLowerCase();
  const firstMatch = terms
    .map((term) => lowerText.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];
  const start = firstMatch === undefined ? 0 : Math.max(0, firstMatch - 36);
  const excerpt = text.slice(start, start + 128);

  return `${start > 0 ? "..." : ""}${excerpt}${start + 128 < text.length ? "..." : ""}`;
}

function scoreDocument(document: SearchDocument, terms: string[]): SiteSearchResult | null {
  const title = normalizeText(document.title);
  const category = normalizeText(document.category);
  const summary = normalizeText(document.summary);
  const body = normalizeText(document.body);
  const haystack = `${title} ${category} ${summary} ${body}`;
  const matchesAllTerms = terms.every((term) => haystack.includes(term));

  if (!matchesAllTerms) {
    return null;
  }

  const score = terms.reduce((total, term) => {
    const titleScore = title.includes(term) ? 80 : 0;
    const categoryScore = category.includes(term) ? 20 : 0;
    const summaryScore = summary.includes(term) ? 35 : 0;
    const bodyScore = Math.min(countOccurrences(body, term), 12) * 4;
    return total + titleScore + categoryScore + summaryScore + bodyScore;
  }, document.priority ?? 0);

  return {
    id: document.id,
    title: document.title,
    category: document.category,
    href: document.href,
    excerpt: excerptFor(document, terms),
    score,
  };
}

export function searchSite(query: string): SiteSearchResult[] {
  const terms = queryTerms(query);

  if (terms.length === 0) {
    return [];
  }

  return allDocuments()
    .map((document) => scoreDocument(document, terms))
    .filter((result): result is SiteSearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "zh-CN"))
    .slice(0, 120);
}
