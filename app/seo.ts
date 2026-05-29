import type { Metadata } from "next";

export const SITE_URL = "https://jingxin-space.vercel.app";
export const SITE_NAME = "静心修习空间";
export const SITE_NAME_EN = "Jingxin Meditation Space";
export const HOME_DESCRIPTION =
  "在线抄写佛经、静心修习、描佛、念佛号、佛乐欣赏与传统文化学习平台。";

export type SeoPage = {
  path: string;
  label: string;
  title: string;
  description: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

export const seoPages = {
  home: {
    path: "/",
    label: "首页",
    title: `${SITE_NAME} | ${SITE_NAME_EN}`,
    description: HOME_DESCRIPTION,
    changeFrequency: "weekly",
    priority: 1,
  },
  copyScripture: {
    path: "/copy-scripture",
    label: "抄写佛经",
    title: `抄写佛经 | ${SITE_NAME}`,
    description:
      "在线逐句抄写佛经，安住当下，学习经典义理，培养专注与清净心。",
    changeFrequency: "weekly",
    priority: 0.9,
  },
  drawBuddha: {
    path: "/draw-buddha",
    label: "静心描佛",
    title: `静心描佛 | ${SITE_NAME}`,
    description:
      "在线描佛与静心绘修空间，以笔画观照身心，适合日常静心修习。",
    changeFrequency: "weekly",
    priority: 0.85,
  },
  buddhaNameRecitation: {
    path: "/buddha-name-recitation",
    label: "念佛号",
    title: `念佛号 | ${SITE_NAME}`,
    description:
      "在线念佛号与佛号抄写修习，帮助日常持名、摄心与传统文化学习。",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  buddhistMusic: {
    path: "/buddhist-music",
    label: "佛乐欣赏",
    title: `佛乐欣赏 | ${SITE_NAME}`,
    description:
      "欣赏静心佛乐、禅乐与传统文化音乐，为抄经、描佛和修习营造清净氛围。",
    changeFrequency: "weekly",
    priority: 0.8,
  },
  about: {
    path: "/about",
    label: "关于我们",
    title: `关于我们 | ${SITE_NAME}`,
    description:
      "了解静心修习空间，一个面向佛经抄写、静心描佛、念佛号和佛乐欣赏的传统文化学习平台。",
    changeFrequency: "monthly",
    priority: 0.7,
  },
} satisfies Record<string, SeoPage>;

export const primarySeoPages = Object.values(seoPages);

export function absoluteUrl(path: string): string {
  if (path === "/") {
    return `${SITE_URL}/`;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(page: SeoPage): Metadata {
  return {
    title: {
      absolute: page.title,
    },
    description: page.description,
    alternates: {
      canonical: absoluteUrl(page.path),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(page.path),
      siteName: `${SITE_NAME} (${SITE_NAME_EN})`,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: page.title,
      description: page.description,
    },
  };
}
