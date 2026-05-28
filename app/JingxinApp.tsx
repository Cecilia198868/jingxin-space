"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  scriptures,
  scriptureOrder,
  type ScriptureKey,
  type ScriptureSentence,
} from "./data/scriptures";
import { mantraGroups, mantras, type Mantra } from "./data/mantras";

const CURRENT_BOOK_KEY = "scripture-copy-current-book";
const LAST_POSITION_KEY = "scripture-copy-last-position";
const MODE_KEY = "jingxin-xinjing-single-mode-v1";
const FONT_SIZE_KEY = "jingxin-xinjing-single-font-size-v2";

const BUDDHIST_INPUT_SUGGESTIONS: BuddhistInputSuggestion[] = [
  {
    text: "南无阿弥陀佛",
    shortcuts: ["nwamtf", "namoamituofo", "namuamitabha", "namo"],
    category: "佛号",
    priority: 120,
  },
  {
    text: "阿弥陀佛",
    shortcuts: ["amtf", "amituofo", "amitabha", "ami"],
    category: "佛号",
    priority: 118,
  },
  {
    text: "观世音菩萨",
    shortcuts: ["gsys", "guanshiyin", "guanshiyinpusa", "gsy"],
    category: "菩萨",
    priority: 116,
  },
  {
    text: "观自在菩萨",
    shortcuts: ["gzzps", "guanzizai", "guanzizaipusa", "gzz"],
    category: "菩萨",
    priority: 114,
  },
  {
    text: "释迦牟尼佛",
    shortcuts: ["sjmnf", "shijiamounifo", "shijia", "sjmn"],
    category: "佛号",
    priority: 112,
  },
  {
    text: "地藏菩萨",
    shortcuts: ["dzps", "dizang", "dizangpusa", "dz"],
    category: "菩萨",
    priority: 110,
  },
  {
    text: "文殊师利菩萨",
    shortcuts: ["wsslps", "wenshushili", "wenshu"],
    category: "菩萨",
    priority: 108,
  },
  {
    text: "普贤菩萨",
    shortcuts: ["pxps", "puxian", "puxianpusa", "px"],
    category: "菩萨",
    priority: 106,
  },
  {
    text: "大势至菩萨",
    shortcuts: ["dszps", "dashizhi", "dashizhipusa", "dsz"],
    category: "菩萨",
    priority: 104,
  },
  {
    text: "药师佛",
    shortcuts: ["ysf", "yaoshifo", "yaoshi"],
    category: "佛号",
    priority: 102,
  },
  {
    text: "弥勒菩萨",
    shortcuts: ["mlps", "mile", "milepusa", "ml"],
    category: "菩萨",
    priority: 100,
  },
  {
    text: "般若波罗蜜",
    shortcuts: ["brblm", "boreboluomi", "banruoboluomi"],
    category: "经文常用",
    priority: 98,
  },
  {
    text: "般若",
    shortcuts: ["br", "bore", "banruo"],
    category: "经文常用",
    priority: 96,
  },
  {
    text: "波罗蜜",
    shortcuts: ["blm", "boluomi"],
    category: "经文常用",
    priority: 94,
  },
  {
    text: "菩提萨埵",
    shortcuts: ["ptsd", "putisaduo", "putisattva"],
    category: "经文常用",
    priority: 92,
  },
  {
    text: "摩诃萨",
    shortcuts: ["mhs", "mohesa", "mahasa"],
    category: "经文常用",
    priority: 90,
  },
  {
    text: "阿耨多罗三藐三菩提",
    shortcuts: ["andlsmspt", "anouduoluo", "anutara"],
    category: "经文常用",
    priority: 88,
  },
  {
    text: "三藐三菩提",
    shortcuts: ["smspt", "sanmiaosanputi", "sanmiao"],
    category: "经文常用",
    priority: 86,
  },
  {
    text: "五蕴皆空",
    shortcuts: ["wyjk", "wuyunjiekong", "wuyun"],
    category: "心经",
    priority: 84,
  },
  {
    text: "色即是空",
    shortcuts: ["sjsk", "sejishikong"],
    category: "心经",
    priority: 82,
  },
  {
    text: "空即是色",
    shortcuts: ["kjss", "kongjishise"],
    category: "心经",
    priority: 80,
  },
  {
    text: "无上正等正觉",
    shortcuts: ["wszdzj", "wushangzhengdengzhengjue"],
    category: "经文常用",
    priority: 78,
  },
  {
    text: "如来",
    shortcuts: ["rl", "rulai"],
    category: "称谓",
    priority: 76,
  },
  {
    text: "世尊",
    shortcuts: ["sz", "shizun"],
    category: "称谓",
    priority: 74,
  },
  {
    text: "舍利子",
    shortcuts: ["slz", "shelizi"],
    category: "心经",
    priority: 72,
  },
  {
    text: "须菩提",
    shortcuts: ["xpt", "xupoti"],
    category: "金刚经",
    priority: 70,
  },
  {
    text: "祇树给孤独园",
    shortcuts: ["qsggdy", "zhishugeiguduyuan", "qishu", "zhishu"],
    category: "金刚经",
    priority: 68,
  },
  {
    text: "忉利天",
    shortcuts: ["dlt", "daolitian"],
    category: "地藏经",
    priority: 66,
  },
  {
    text: "娑婆世界",
    shortcuts: ["spsj", "suoposhijie", "suopo"],
    category: "经文常用",
    priority: 64,
  },
  {
    text: "涅槃",
    shortcuts: ["np", "niepan"],
    category: "经文常用",
    priority: 62,
  },
  {
    text: "无明",
    shortcuts: ["wm", "wuming"],
    category: "经文常用",
    priority: 60,
  },
  {
    text: "比丘",
    shortcuts: ["bq", "biqiu", "bhiksu"],
    category: "称谓",
    priority: 58,
  },
  {
    text: "比丘尼",
    shortcuts: ["bqn", "biqiuni"],
    category: "称谓",
    priority: 56,
  },
  {
    text: "优婆塞",
    shortcuts: ["yps", "youpasai", "upasaka"],
    category: "称谓",
    priority: 54,
  },
  {
    text: "优婆夷",
    shortcuts: ["ypy", "youpayi", "upasika"],
    category: "称谓",
    priority: 52,
  },
  {
    text: "阿罗汉",
    shortcuts: ["alh", "aluohan", "arhat"],
    category: "称谓",
    priority: 50,
  },
  {
    text: "佛法僧",
    shortcuts: ["ffs", "fofaseng"],
    category: "三宝",
    priority: 48,
  },
  {
    text: "三宝",
    shortcuts: ["sb", "sanbao"],
    category: "三宝",
    priority: 46,
  },
  {
    text: "六波罗蜜",
    shortcuts: ["lblm", "liuboluomi"],
    category: "经文常用",
    priority: 44,
  },
];

type ThemeMode = "light" | "dark";
type PracticeMode =
  | "scripture"
  | "chant"
  | "mantra"
  | "buddhaDrawing"
  | "sutraReading"
  | "buddhaNameRecitation"
  | "mantraRecitation"
  | "buddhistMusic"
  | "backgroundMusic";

type ScriptureTerm = {
  name: string;
  meaning: string;
};

type BuddhistInputSuggestion = {
  text: string;
  shortcuts: string[];
  category: string;
  priority: number;
};

type ScriptureSuggestionTarget = {
  start: number;
  end: number;
  query: string;
};

type ScriptureSentenceWithTerms = ScriptureSentence & {
  chapterTitle?: string;
  terms?: ScriptureTerm[];
  glossary?: {
    term: string;
    meaning: string;
  }[];
};

type AdSlot = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

type LastPosition = {
  bookKey: ScriptureKey;
  chapterIndex: number;
  sentenceIndex: number;
  globalSentenceIndex: number;
  input: string;
  fontSize: number;
  mode: ThemeMode;
};

type MantraLastPosition = {
  mantraId: string;
  lineIndex: number;
  input: string;
  fontSize: number;
  mode: ThemeMode;
};

type BuddhaDrawing = {
  id: string;
  title: string;
  svgPath: string;
};

type SutraReading = {
  id: string;
  title: string;
  heading: string;
  embedUrl: string;
  originalUrl: string;
};

type BuddhaNameRecitation = {
  id: string;
  title: string;
  heading: string;
  embedUrl: string;
  originalUrl: string;
};

type MantraRecitation = {
  id: string;
  title: string;
  heading: string;
  embedUrl: string;
  originalUrl: string;
};

type BuddhistMusic = {
  id: string;
  title: string;
  heading: string;
  embedUrl: string;
  originalUrl: string;
};

type BackgroundMusic = {
  id: string;
  title: string;
  heading: string;
  embedUrl: string;
  originalUrl: string;
};

type DrawingColor = {
  key: string;
  label: string;
  value: string;
};

type DrawingStrokeSize = {
  key: "thin" | "medium" | "thick";
  label: string;
  width: number;
};

type DrawingTool = "brush" | "eraser";
type TopMenu =
  | "sutraReading"
  | "chanting"
  | "mantraChanting"
  | "study"
  | "music"
  | "backgroundMusic";

type DrawingPoint = {
  x: number;
  y: number;
};

type DrawingStroke = {
  id: string;
  color: string;
  strokeSize: DrawingStrokeSize["key"];
  points: DrawingPoint[];
};

type SavedDrawing = {
  drawingId: string;
  imageDataUrl?: string;
  strokes?: DrawingStroke[];
  color: string;
  strokeSize: DrawingStrokeSize["key"];
  completion: number;
};

const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 48;
const FONT_STEP = 2;
const EXPLANATION_CHUNK_MAX_LENGTH = 900;
const CHANT_TOTALS_KEY = "scripture-copy-chant-totals";
const MANTRA_TOTALS_KEY = "scripture-copy-mantra-totals";
const MANTRA_LAST_POSITION_KEY = "scripture-copy-mantra-last-position";
const DRAWING_STORAGE_PREFIX = "scripture-copy-buddha-drawing";
const DRAWING_SVG_WIDTH = 600;
const DRAWING_SVG_HEIGHT = 640;
const DRAWING_SNAP_RADIUS = 28;
const DRAWING_COMPLETION_DISTANCE = 2400;

const buddhaChantGroups = [
  {
    title: "阿弥陀佛类",
    chants: [
      "南无阿弥陀佛",
      "南无西方极乐世界阿弥陀佛",
      "南无阿弥陀佛接引导师",
    ],
  },
  {
    title: "观世音菩萨类",
    chants: [
      "南无观世音菩萨",
      "南无千手千眼观世音菩萨",
      "南无大慈大悲观世音菩萨",
    ],
  },
  {
    title: "地藏王菩萨类",
    chants: [
      "南无地藏王菩萨",
      "南无大愿地藏王菩萨",
      "南无幽冥教主地藏王菩萨",
    ],
  },
  {
    title: "药师佛类",
    chants: ["南无药师琉璃光如来", "南无消灾延寿药师佛"],
  },
  {
    title: "释迦牟尼佛类",
    chants: ["南无本师释迦牟尼佛"],
  },
  {
    title: "文殊普贤类",
    chants: ["南无文殊师利菩萨", "南无普贤菩萨", "南无大行普贤菩萨"],
  },
  {
    title: "弥勒佛类",
    chants: ["南无弥勒佛", "南无当来下生弥勒尊佛"],
  },
  {
    title: "财神护法类",
    chants: ["南无黄财神", "南无伽蓝菩萨"],
  },
  {
    title: "经典与祖师类",
    chants: ["南无妙法莲华经", "南无莲花生大士"],
  },
] as const;

type BuddhaChant = (typeof buddhaChantGroups)[number]["chants"][number];

const buddhaChants: BuddhaChant[] = buddhaChantGroups.flatMap((group) => [
  ...group.chants,
]);

type ChantCounterKey = "tenThousand" | "hundredThousand" | "million";

type ChantCounter = {
  key: ChantCounterKey;
  label: string;
};

const chantCounters: ChantCounter[] = [
  { key: "tenThousand", label: "一万遍佛号" },
  { key: "hundredThousand", label: "10万遍佛号" },
  { key: "million", label: "100万遍佛号" },
];

const buddhaNameRecitations: BuddhaNameRecitation[] = [
  {
    id: "amitabha-name-108-counted",
    title: "南無阿彌陀佛聖號 108遍 計數版",
    heading: "南無阿彌陀佛聖號 108遍 計數版",
    embedUrl: "https://www.youtube.com/embed/2Jmi0vq8MR8",
    originalUrl: "https://www.youtube.com/watch?v=2Jmi0vq8MR8",
  },
  {
    id: "amitabha-name-thousand-times",
    title: "南无阿弥陀佛圣号 千遍",
    heading: "南无阿弥陀佛圣号 千遍",
    embedUrl: "https://www.youtube.com/embed/7n5tOAMBXiY",
    originalUrl: "https://www.youtube.com/watch?v=7n5tOAMBXiY",
  },
  {
    id: "low-chant-amitabha-name-ten-thousand",
    title: "【低沉念佛】南无阿弥陀佛六字圣号一万声",
    heading: "【低沉念佛】南无阿弥陀佛六字圣号一万声",
    embedUrl: "https://www.youtube.com/embed/asiBhdFjhfE",
    originalUrl: "https://www.youtube.com/watch?v=asiBhdFjhfE",
  },
  {
    id: "guanyin-name-108-times",
    title: "南無觀世音菩薩 名號 108遍",
    heading: "南無觀世音菩薩 名號 108遍",
    embedUrl: "https://www.youtube.com/embed/Jer5gI9oJnM",
    originalUrl: "https://www.youtube.com/watch?v=Jer5gI9oJnM",
  },
  {
    id: "guanyin-name-thousand-times",
    title: "南无观世音菩萨圣号 1000声",
    heading: "南无观世音菩萨圣号 1000声",
    embedUrl: "https://www.youtube.com/embed/52chScoO1gw",
    originalUrl: "https://www.youtube.com/watch?v=52chScoO1gw",
  },
  {
    id: "ksitigarbha-name-108-times",
    title: "南無地藏菩薩摩訶薩 108遍",
    heading: "南無地藏菩薩摩訶薩 108遍",
    embedUrl: "https://www.youtube.com/embed/2YXjx-tE6EE",
    originalUrl: "https://www.youtube.com/watch?v=2YXjx-tE6EE",
  },
  {
    id: "ksitigarbha-name-thousand-times",
    title: "南无地藏菩萨圣号1000声",
    heading: "南无地藏菩萨圣号1000声",
    embedUrl: "https://www.youtube.com/embed/gRRoFDbDoVM",
    originalUrl: "https://www.youtube.com/watch?v=gRRoFDbDoVM",
  },
  {
    id: "ksitigarbha-king-name-1080-times",
    title: "地藏王菩萨圣号1080遍",
    heading: "地藏王菩萨圣号1080遍",
    embedUrl: "https://www.youtube.com/embed/R1siE9YXbCw",
    originalUrl: "https://www.youtube.com/watch?v=R1siE9YXbCw",
  },
  {
    id: "ksitigarbha-six-syllable-name-5000-times",
    title: "南无地藏菩萨六字圣号5000声",
    heading: "南无地藏菩萨六字圣号5000声",
    embedUrl: "https://www.youtube.com/embed/YpaeawmptiQ",
    originalUrl: "https://www.youtube.com/watch?v=YpaeawmptiQ",
  },
  {
    id: "ksitigarbha-six-syllable-name-ten-thousand-times",
    title: "南无地藏菩萨六字圣号一万声",
    heading: "南无地藏菩萨六字圣号一万声",
    embedUrl: "https://www.youtube.com/embed/wgOkO-vmEPY",
    originalUrl: "https://www.youtube.com/watch?v=wgOkO-vmEPY",
  },
  {
    id: "medicine-buddha-name-108-times",
    title: "南無藥師琉璃光如來 108遍",
    heading: "南無藥師琉璃光如來 108遍",
    embedUrl: "https://www.youtube.com/embed/BHucYJqfLGE",
    originalUrl: "https://www.youtube.com/watch?v=BHucYJqfLGE",
  },
  {
    id: "medicine-buddha-name-1080-times",
    title: "南无药师琉璃光如来 1080遍",
    heading: "南无药师琉璃光如来 1080遍",
    embedUrl: "https://www.youtube.com/embed/G7bLm_3Rjk0",
    originalUrl: "https://www.youtube.com/watch?v=G7bLm_3Rjk0",
  },
  {
    id: "shakyamuni-name-108-times",
    title: "南無本師釋迦摩尼佛聖號 108遍",
    heading: "南無本師釋迦摩尼佛聖號 108遍",
    embedUrl: "https://www.youtube.com/embed/6FKQ4mXe3qI",
    originalUrl: "https://www.youtube.com/watch?v=6FKQ4mXe3qI",
  },
  {
    id: "shakyamuni-name-1080-times",
    title: "南无本师释迦牟尼佛圣号1080遍",
    heading: "南无本师释迦牟尼佛圣号1080遍",
    embedUrl: "https://www.youtube.com/embed/DTGbrm49imY",
    originalUrl: "https://www.youtube.com/watch?v=DTGbrm49imY",
  },
  {
    id: "medicine-buddha-disaster-relief-longevity-name",
    title: "南無消災延壽藥師佛聖號",
    heading: "南無消災延壽藥師佛聖號",
    embedUrl: "https://www.youtube.com/embed/H6Kyh1WFzmI",
    originalUrl: "https://www.youtube.com/watch?v=H6Kyh1WFzmI",
  },
  {
    id: "samantabhadra-name",
    title: "南無普賢菩薩聖號",
    heading: "南無普賢菩薩聖號",
    embedUrl: "https://www.youtube.com/embed/yfe_Cuw0QRk",
    originalUrl: "https://www.youtube.com/watch?v=yfe_Cuw0QRk",
  },
  {
    id: "great-practice-samantabhadra-king-bodhisattva-name",
    title: "南无大行普贤王菩萨",
    heading: "南无大行普贤王菩萨",
    embedUrl: "https://www.youtube.com/embed/37xmBR0MPfM",
    originalUrl: "https://www.youtube.com/watch?v=37xmBR0MPfM",
  },
  {
    id: "maitreya-buddha-name",
    title: "南無彌勒佛 聖號",
    heading: "南無彌勒佛 聖號",
    embedUrl: "https://www.youtube.com/embed/S6-pVf18zJE",
    originalUrl: "https://www.youtube.com/watch?v=S6-pVf18zJE",
  },
];

const sutraReadings: SutraReading[] = [
  {
    id: "heart-sutra",
    title: "心经",
    heading: "《心经》朗读",
    embedUrl: "https://www.youtube.com/embed/V7O_eee6S9w",
    originalUrl: "https://www.youtube.com/watch?v=V7O_eee6S9w",
  },
  {
    id: "diamond-sutra",
    title: "金刚经",
    heading: "《金刚经》朗读",
    embedUrl: "https://www.youtube.com/embed/FGZS7alip5c?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=FGZS7alip5c",
  },
  {
    id: "amitabha-sutra",
    title: "佛说阿弥陀经",
    heading: "《佛说阿弥陀经》朗读",
    embedUrl: "https://www.youtube.com/embed/_AQHBOgLYNo?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=_AQHBOgLYNo",
  },
  {
    id: "universal-gate-chapter",
    title: "普门品",
    heading: "《观世音菩萨普门品》朗读",
    embedUrl: "https://www.youtube.com/embed/PnfG_VkoUas?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=PnfG_VkoUas",
  },
  {
    id: "ksitigarbha-sutra",
    title: "地藏菩萨本愿经",
    heading: "《地藏菩萨本愿经》朗读",
    embedUrl: "https://www.youtube.com/embed/Aa_QVEmAo1o?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=Aa_QVEmAo1o",
  },
  {
    id: "medicine-buddha-sutra",
    title: "药师经",
    heading: "《药师经》朗读",
    embedUrl: "https://www.youtube.com/embed/g3xktRcUDMk?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=g3xktRcUDMk",
  },
  {
    id: "eight-realizations-sutra",
    title: "八大人觉经",
    heading: "《八大人觉经》朗读",
    embedUrl: "https://www.youtube.com/embed/E3mZ4YNuZhs?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=E3mZ4YNuZhs",
  },
  {
    id: "buddha-last-teaching-sutra",
    title: "佛遗教经",
    heading: "《佛遗教经》朗读",
    embedUrl: "https://www.youtube.com/embed/NZAtQa5ZK1I?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=NZAtQa5ZK1I",
  },
  {
    id: "infinite-life-contemplation-sutra",
    title: "观无量寿佛经",
    heading: "《观无量寿佛经》朗读",
    embedUrl: "https://www.youtube.com/embed/5Z3od4z2Z5E?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=5Z3od4z2Z5E",
  },
  {
    id: "dashizhi-yuantong-chapter",
    title: "大势至菩萨念佛圆通章",
    heading: "大势至菩萨念佛圆通章",
    embedUrl: "https://www.youtube.com/embed/7_EN4ovSqyU",
    originalUrl: "https://www.youtube.com/watch?v=7_EN4ovSqyU",
  },
  {
    id: "rebirth-treatise",
    title: "往生论",
    heading: "往生论",
    embedUrl: "https://www.youtube.com/embed/FzsOCIhL75Q",
    originalUrl: "https://www.youtube.com/watch?v=FzsOCIhL75Q",
  },
  {
    id: "samantabhadra-practices-vows",
    title: "普贤菩萨行愿品",
    heading: "普贤菩萨行愿品",
    embedUrl: "https://www.youtube.com/embed/m3L5S4MBdto",
    originalUrl: "https://www.youtube.com/watch?v=m3L5S4MBdto",
  },
  {
    id: "infinite-life-sutra-traditional",
    title: "佛說無量壽經",
    heading: "佛說無量壽經",
    embedUrl: "https://www.youtube.com/embed/kdJaJpDvpZ4",
    originalUrl: "https://www.youtube.com/watch?v=kdJaJpDvpZ4",
  },
  {
    id: "great-compassion-dharani-sutra",
    title: "大悲心陀罗尼经",
    heading: "大悲心陀罗尼经",
    embedUrl: "https://www.youtube.com/embed/q7jbrpHcsCU",
    originalUrl: "https://www.youtube.com/watch?v=q7jbrpHcsCU",
  },
  {
    id: "karmic-retribution-sutra",
    title: "占察善恶业报经",
    heading: "占察善恶业报经",
    embedUrl: "https://www.youtube.com/embed/BL5W-wfM4I8",
    originalUrl: "https://www.youtube.com/watch?v=BL5W-wfM4I8",
  },
  {
    id: "ksitigarbha-ten-wheels-sutra",
    title: "地藏十轮经",
    heading: "地藏十轮经",
    embedUrl: "https://www.youtube.com/embed/0sMSLveDMe8",
    originalUrl: "https://www.youtube.com/watch?v=0sMSLveDMe8",
  },
  {
    id: "medicine-buddha-original-vows-merits-sutra",
    title: "药师琉璃光如来本愿功德经",
    heading: "药师琉璃光如来本愿功德经",
    embedUrl: "https://www.youtube.com/embed/nJ7_2YiVo5E",
    originalUrl: "https://www.youtube.com/watch?v=nJ7_2YiVo5E",
  },
  {
    id: "seven-medicine-buddhas-vows-merits-sutra-volume-one",
    title: "药师琉璃光七佛本愿功德经卷上",
    heading: "药师琉璃光七佛本愿功德经卷上",
    embedUrl: "https://www.youtube.com/embed/OB-Dv6lyo1A",
    originalUrl: "https://www.youtube.com/watch?v=OB-Dv6lyo1A",
  },
  {
    id: "seven-medicine-buddhas-vows-merits-sutra-volume-two",
    title: "药师琉璃光七佛本愿功德经卷下",
    heading: "药师琉璃光七佛本愿功德经卷下",
    embedUrl: "https://www.youtube.com/embed/7JK16kWLWW4",
    originalUrl: "https://www.youtube.com/watch?v=7JK16kWLWW4",
  },
  {
    id: "manjushri-prajnaparamita-sutra",
    title: "文殊师利所说般若波罗蜜经",
    heading: "文殊师利所说般若波罗蜜经",
    embedUrl: "https://www.youtube.com/embed/jupO2lwPDJU",
    originalUrl: "https://www.youtube.com/watch?v=jupO2lwPDJU",
  },
  {
    id: "lotus-sutra",
    title: "妙法蓮華經",
    heading: "妙法蓮華經",
    embedUrl: "https://www.youtube.com/embed/N0GKhYGH3CQ",
    originalUrl: "https://www.youtube.com/watch?v=N0GKhYGH3CQ",
  },
  {
    id: "tathagata-lifespan-chapter",
    title: "如来寿量品",
    heading: "如来寿量品",
    embedUrl: "https://www.youtube.com/embed/VJRjJUJCH6s",
    originalUrl: "https://www.youtube.com/watch?v=VJRjJUJCH6s",
  },
  {
    id: "lotus-sutra-expedient-means-chapter",
    title: "法華經 方便品",
    heading: "法華經 方便品",
    embedUrl: "https://www.youtube.com/embed/Ba57LQEMwxw",
    originalUrl: "https://www.youtube.com/watch?v=Ba57LQEMwxw",
  },
  {
    id: "avatamsaka-sutra-pure-conduct-chapter",
    title: "大方廣佛華嚴經·淨行品",
    heading: "大方廣佛華嚴經·淨行品",
    embedUrl: "https://www.youtube.com/embed/sSJOLf7RCn4",
    originalUrl: "https://www.youtube.com/watch?v=sSJOLf7RCn4",
  },
  {
    id: "compassionate-samadhi-water-repentance",
    title: "慈悲三昧水懺",
    heading: "慈悲三昧水懺",
    embedUrl: "https://www.youtube.com/embed/uajv5KFY76k",
    originalUrl: "https://www.youtube.com/watch?v=uajv5KFY76k",
  },
  {
    id: "great-repentance-before-buddhas",
    title: "禮佛大懺悔文",
    heading: "禮佛大懺悔文",
    embedUrl: "https://www.youtube.com/embed/__thR5-rP5U",
    originalUrl: "https://www.youtube.com/watch?v=__thR5-rP5U",
  },
  {
    id: "eighty-eight-buddhas-great-repentance",
    title: "《八十八佛大懺悔文》 可用於自修拜懺，一佛一拜",
    heading: "《八十八佛大懺悔文》 可用於自修拜懺，一佛一拜",
    embedUrl: "https://www.youtube.com/embed/bVyS6_TlaYQ",
    originalUrl: "https://www.youtube.com/watch?v=bVyS6_TlaYQ",
  },
  {
    id: "thirty-five-buddhas-repentance",
    title: "三十五佛懺",
    heading: "三十五佛懺",
    embedUrl: "https://www.youtube.com/embed/xZRXErWrX9w",
    originalUrl: "https://www.youtube.com/watch?v=xZRXErWrX9w",
  },
  {
    id: "auspicious-sutra",
    title: "吉祥经",
    heading: "吉祥经",
    embedUrl: "https://www.youtube.com/embed/Uddq8d-PlYw",
    originalUrl: "https://www.youtube.com/watch?v=Uddq8d-PlYw",
  },
  {
    id: "vimalakirti-sutra",
    title: "維摩詰所說經",
    heading: "維摩詰所說經",
    embedUrl: "https://www.youtube.com/embed/-4zHhfwFtD8",
    originalUrl: "https://www.youtube.com/watch?v=-4zHhfwFtD8",
  },
];

const mantraRecitations: MantraRecitation[] = [
  {
    id: "great-compassion-mantra",
    title: "大悲咒",
    heading: "《大悲咒》念诵",
    embedUrl: "https://www.youtube.com/embed/boLDNaTbe9s?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=boLDNaTbe9s",
  },
  {
    id: "shurangama-mantra",
    title: "楞严咒",
    heading: "《楞严咒》念诵",
    embedUrl: "https://www.youtube.com/embed/aBlbvgCQhWk?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=aBlbvgCQhWk",
  },
  {
    id: "eleven-faced-guanyin-mantra",
    title: "十一面觀音咒",
    heading: "十一面觀音咒",
    embedUrl: "https://www.youtube.com/embed/dXPjUh0BDSA",
    originalUrl: "https://www.youtube.com/watch?v=dXPjUh0BDSA",
  },
  {
    id: "ten-small-mantras",
    title: "十小咒",
    heading: "十小咒",
    embedUrl: "https://www.youtube.com/embed/GFag62BRxuw",
    originalUrl: "https://www.youtube.com/watch?v=GFag62BRxuw",
  },
  {
    id: "six-syllable-great-bright-mantra",
    title: "六字大明咒",
    heading: "《六字大明咒》念诵",
    embedUrl: "https://www.youtube.com/embed/CjBGrFLdEaw?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=CjBGrFLdEaw&list=RDCjBGrFLdEaw&start_radio=1",
  },
  {
    id: "heart-sutra-gate-gate-mantra",
    title: "心经里的“揭谛咒”",
    heading: "心经里的“揭谛咒”",
    embedUrl: "https://www.youtube.com/embed/j8E27sCzD6A?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=j8E27sCzD6A&list=RDj8E27sCzD6A&start_radio=1",
  },
  {
    id: "cundi-divine-mantra",
    title: "准提神咒",
    heading: "《准提神咒》念诵",
    embedUrl: "https://www.youtube.com/embed/KmJ-QkCyHlM?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=KmJ-QkCyHlM&list=RDKmJ-QkCyHlM&start_radio=1",
  },
  {
    id: "medicine-buddha-mantra",
    title: "药师咒",
    heading: "《药师咒》念诵",
    embedUrl: "https://www.youtube.com/embed/GFpCnMr0_ms?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=GFpCnMr0_ms",
  },
  {
    id: "rebirth-mantra",
    title: "往生咒",
    heading: "《往生咒》念诵",
    embedUrl: "https://www.youtube.com/embed/ZK_VGmXrOis?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=ZK_VGmXrOis&list=RDZK_VGmXrOis&start_radio=1",
  },
  {
    id: "seven-buddhas-extinguish-sins-mantra",
    title: "七佛灭罪真言",
    heading: "《七佛灭罪真言》念诵",
    embedUrl: "https://www.youtube.com/embed/FEdQWMM_cec?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=FEdQWMM_cec&list=RDFEdQWMM_cec&start_radio=1",
  },
  {
    id: "manjushri-heart-mantra",
    title: "文殊心咒",
    heading: "《文殊心咒》念诵",
    embedUrl: "https://www.youtube.com/embed/t_wQ3t-NFEg?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=t_wQ3t-NFEg&list=RDt_wQ3t-NFEg&start_radio=1",
  },
  {
    id: "green-tara-heart-mantra",
    title: "绿度母心咒",
    heading: "《绿度母心咒》念诵",
    embedUrl: "https://www.youtube.com/embed/LJN0-1k5Vb4?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=LJN0-1k5Vb4&list=RDLJN0-1k5Vb4&start_radio=1",
  },
  {
    id: "white-tara-heart-mantra",
    title: "白度母心咒",
    heading: "《白度母心咒》念诵",
    embedUrl: "https://www.youtube.com/embed/RGQfRX8FH0Y?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=RGQfRX8FH0Y&list=RDRGQfRX8FH0Y&start_radio=1",
  },
  {
    id: "vajrasattva-hundred-syllable-mantra",
    title: "金刚萨埵百字明咒",
    heading: "《金刚萨埵百字明咒》念诵",
    embedUrl: "https://www.youtube.com/embed/mtc-9xPhv3s?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=mtc-9xPhv3s&list=RDmtc-9xPhv3s&start_radio=1",
  },
  {
    id: "padmasambhava-heart-mantra",
    title: "莲师心咒",
    heading: "《莲师心咒》念诵",
    embedUrl: "https://www.youtube.com/embed/iCp0thwuaHY?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=iCp0thwuaHY&list=RDiCp0thwuaHY&start_radio=1",
  },
];

const buddhistMusicVideos: BuddhistMusic[] = [
  {
    id: "heart-sutra-song-1",
    title: "般若波羅密多心經 歌曲1",
    heading: "般若波羅密多心經 歌曲1",
    embedUrl: "https://www.youtube.com/embed/9YC9eQxAJxQ?start=301&rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=9YC9eQxAJxQ&list=RD9YC9eQxAJxQ&start_radio=1&t=301s",
  },
  {
    id: "heart-sutra-song-2",
    title: "般若波羅蜜多心經 歌曲2",
    heading: "般若波羅蜜多心經 歌曲2",
    embedUrl: "https://www.youtube.com/embed/9W2U5jbqpdE?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=9W2U5jbqpdE&list=RD9W2U5jbqpdE&start_radio=1",
  },
  {
    id: "faye-wong-heart-sutra",
    title: "王菲《心经》1",
    heading: "王菲《心经》1",
    embedUrl: "https://www.youtube.com/embed/4nQQTm-ALBY?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=4nQQTm-ALBY&list=RD4nQQTm-ALBY&start_radio=1",
  },
  {
    id: "jacky-cheung-cantonese-heart-sutra",
    title: "般若波罗蜜多心经 张学友 粤语",
    heading: "般若波罗蜜多心经 张学友 粤语",
    embedUrl: "https://www.youtube.com/embed/iL_W8W2737A?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=iL_W8W2737A&list=RDiL_W8W2737A&start_radio=1",
  },
  {
    id: "sun-lu-heart-sutra",
    title: "般若波罗蜜多心经 孙露",
    heading: "般若波罗蜜多心经 孙露",
    embedUrl: "https://www.youtube.com/embed/8nl6gIvThoQ?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=8nl6gIvThoQ&list=RD8nl6gIvThoQ&start_radio=1",
  },
  {
    id: "tibetan-plateau-heart-sutra",
    title: "【般若心經】西藏高原天籟之聲",
    heading: "【般若心經】西藏高原天籟之聲",
    embedUrl: "https://www.youtube.com/embed/b3gxOiltiPg?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=b3gxOiltiPg&list=RDb3gxOiltiPg&start_radio=1",
  },
  {
    id: "impression-heart-sutra-rock",
    title: "印象心经·照见空性｜摇滚",
    heading: "印象心经·照见空性｜摇滚",
    embedUrl: "https://www.youtube.com/embed/OlFvmSYO0XQ?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=OlFvmSYO0XQ&list=RDOlFvmSYO0XQ&start_radio=1",
  },
  {
    id: "huang-huiyin-heart-sutra",
    title: "般若波罗密多心经 黄慧音",
    heading: "般若波罗密多心经 黄慧音",
    embedUrl: "https://www.youtube.com/embed/K0m0Hb8Hz4A?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=K0m0Hb8Hz4A&list=RDK0m0Hb8Hz4A&start_radio=1",
  },
  {
    id: "guanyin-bodhisattva-gatha-bodhi-sound",
    title: "《觀音菩薩偈》菩提妙音",
    heading: "《觀音菩薩偈》菩提妙音",
    embedUrl: "https://www.youtube.com/embed/tN8rgjwEbNU?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=tN8rgjwEbNU&list=RDtN8rgjwEbNU&start_radio=1",
  },
  {
    id: "guanyin-bodhisattva-gatha-buddhist-song",
    title: "佛曲《观音菩萨偈》",
    heading: "佛曲《观音菩萨偈》",
    embedUrl: "https://www.youtube.com/embed/ffRMl0ItCRU?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=ffRMl0ItCRU&list=RDffRMl0ItCRU&start_radio=1",
  },
  {
    id: "guanyin-bodhisattva-gatha-xiyan",
    title: "《觀音菩薩偈》(演唱：璽硯)",
    heading: "《觀音菩薩偈》(演唱：璽硯)",
    embedUrl: "https://www.youtube.com/embed/6izqKb5k4Fc?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=6izqKb5k4Fc&list=RD6izqKb5k4Fc&start_radio=1",
  },
  {
    id: "jile-song-ke-peilei",
    title: "佛歌：柯佩磊《极乐歌》",
    heading: "佛歌：柯佩磊《极乐歌》",
    embedUrl: "https://www.youtube.com/embed/YAAMaaepEMY?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=YAAMaaepEMY&list=RDYAAMaaepEMY&start_radio=1",
  },
  {
    id: "amitabha-in-heart",
    title: "阿彌陀佛在心間",
    heading: "阿彌陀佛在心間",
    embedUrl: "https://www.youtube.com/embed/5uyRM-Um8Aw?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=5uyRM-Um8Aw&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P",
  },
  {
    id: "world-suffering-who-knows",
    title: "世間苦誰知道",
    heading: "世間苦誰知道",
    embedUrl: "https://www.youtube.com/embed/5Ifc9Do27zQ?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=5Ifc9Do27zQ&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=2",
  },
  {
    id: "liberation-path",
    title: "解脫道",
    heading: "解脫道",
    embedUrl: "https://www.youtube.com/embed/dweuViDDVGw?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=dweuViDDVGw&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=3",
  },
  {
    id: "dreamlike-human-world",
    title: "夢幻人世間",
    heading: "夢幻人世間",
    embedUrl: "https://www.youtube.com/embed/lS7-_c0nC0U?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=lS7-_c0nC0U&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=4",
  },
  {
    id: "buddha-love",
    title: "佛陀的愛",
    heading: "佛陀的愛",
    embedUrl: "https://www.youtube.com/embed/NdwnlOwA78M?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=NdwnlOwA78M&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=5",
  },
  {
    id: "farewell",
    title: "送別",
    heading: "送別",
    embedUrl: "https://www.youtube.com/embed/Kgc1lPkOjMY?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=Kgc1lPkOjMY&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=6",
  },
  {
    id: "pure-land-is-my-home-choir",
    title: "極樂世界是我家【佛曲】合唱團唱誦",
    heading: "極樂世界是我家【佛曲】合唱團唱誦",
    embedUrl: "https://www.youtube.com/embed/dyYL7fP7SWg?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=dyYL7fP7SWg&list=PLLPNcbNdo7oWl26ivnZFEyLlophe5NK4P&index=15",
  },
  {
    id: "great-vow-ksitigarbha-sanskrit-mantra",
    title: "《大愿地藏》｜一首震撼你心灵的梵文佛咒",
    heading: "《大愿地藏》｜一首震撼你心灵的梵文佛咒",
    embedUrl: "https://www.youtube.com/embed/JdXtpooZz8U?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=JdXtpooZz8U&list=RDJdXtpooZz8U&start_radio=1",
  },
  {
    id: "yinliang-fashi-fangxia",
    title: "印良法师一首佛歌《放下》",
    heading: "印良法师一首佛歌《放下》",
    embedUrl: "https://www.youtube.com/embed/3wXlIVMAdsI?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=3wXlIVMAdsI&list=RD3wXlIVMAdsI&start_radio=1",
  },
  {
    id: "shurangama-mantra-heart-tibetan-snow-mountain",
    title: "《楞严咒心》1小时西藏雪山疗愈MV",
    heading: "《楞严咒心》1小时西藏雪山疗愈MV",
    embedUrl: "https://www.youtube.com/embed/AEveIIb78AU?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=AEveIIb78AU&list=PL5qBcybu8z6FkVeUbKK5zrGgn7519yRm6",
  },
  {
    id: "heart-sutra-purify-mind-remove-obstacles",
    title: "【心经】淨心除礙，悟般若真諦",
    heading: "【心经】淨心除礙，悟般若真諦",
    embedUrl: "https://www.youtube.com/embed/JEsV63OGE1g?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=JEsV63OGE1g&list=RDJEsV63OGE1g&start_radio=1",
  },
  {
    id: "chen-min-wish-to-be-bodhisattva-lotus",
    title: "一首淨化心靈的好歌《願做菩薩那朵蓮》- 陳敏",
    heading: "一首淨化心靈的好歌《願做菩薩那朵蓮》- 陳敏",
    embedUrl: "https://www.youtube.com/embed/dLAymDzim1E?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=dLAymDzim1E&list=RDdLAymDzim1E&start_radio=1",
  },
  {
    id: "repentance-text-before-buddha",
    title: "《懺悔文》今對佛前求懺悔",
    heading: "《懺悔文》今對佛前求懺悔",
    embedUrl: "https://www.youtube.com/embed/RVwem9sIMKo?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=RVwem9sIMKo&list=RDRVwem9sIMKo&start_radio=1",
  },
  {
    id: "metta-sutta-wish-for-self-and-world",
    title: "慈经 为自己许愿・为世界祈福",
    heading: "慈经 为自己许愿・为世界祈福",
    embedUrl: "https://www.youtube.com/embed/VRg-ETFWbDc?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=VRg-ETFWbDc&list=RDVRg-ETFWbDc&start_radio=1",
  },
  {
    id: "tibetan-sanskrit-healing-great-compassion-mantra",
    title: "西藏梵音療愈｜大悲咒｜療愈身心",
    heading: "西藏梵音療愈｜大悲咒｜療愈身心",
    embedUrl: "https://www.youtube.com/embed/KOStd1jCKf8?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=KOStd1jCKf8&list=RDKOStd1jCKf8&start_radio=1",
  },
];

const backgroundMusicVideos: BackgroundMusic[] = [
  {
    id: "guzheng-cloud-water-chan-heart",
    title: "古筝：云水禅心",
    heading: "古筝：云水禅心",
    embedUrl: "https://www.youtube.com/embed/yuuJzPi0Mmk?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=yuuJzPi0Mmk&list=RDyuuJzPi0Mmk&start_radio=1",
  },
  {
    id: "cloud-water-chan-heart-handpan",
    title: "《云水禅心》完整版 12寸13音汉盘空灵鼓演奏",
    heading: "《云水禅心》完整版 12寸13音汉盘空灵鼓演奏",
    embedUrl: "https://www.youtube.com/embed/4cW342IXSMU?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=4cW342IXSMU&list=RD4cW342IXSMU&start_radio=1",
  },
  {
    id: "calming-relaxing-music",
    title: "好聽的音樂，靜心，放鬆",
    heading: "好聽的音樂，靜心，放鬆",
    embedUrl: "https://www.youtube.com/embed/M8G3rlcRybc?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=M8G3rlcRybc&list=RDM8G3rlcRybc&start_radio=1",
  },
  {
    id: "one-buddha-name-one-heart",
    title: "《一聲佛號一聲心》心靈音樂",
    heading: "《一聲佛號一聲心》心靈音樂",
    embedUrl: "https://www.youtube.com/embed/sRyvTR-zl6w?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=sRyvTR-zl6w&list=RDsRyvTR-zl6w&start_radio=1",
  },
  {
    id: "beautiful-music-playlist",
    title: "好聽的音樂",
    heading: "好聽的音樂",
    embedUrl: "https://www.youtube.com/embed/ZdQF_nBjD6s?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=ZdQF_nBjD6s&list=PLmfbth_1ku4hOnq8Yc7fKT8bmNN6JejZS",
  },
  {
    id: "spiritual-chan-music",
    title: "《心靈禪樂》心靈音樂",
    heading: "《心靈禪樂》心靈音樂",
    embedUrl: "https://www.youtube.com/embed/PMp3_BfC490?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=PMp3_BfC490&list=RDPMp3_BfC490&start_radio=1",
  },
  {
    id: "zen-buddhist-meditation-music",
    title: "《禪意音樂》佛教靜心音樂",
    heading: "《禪意音樂》佛教靜心音樂",
    embedUrl: "https://www.youtube.com/embed/ztYcf-xCC0E?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=ztYcf-xCC0E&list=RDztYcf-xCC0E&start_radio=1",
  },
  {
    id: "amitabha-forty-minute-pure-music",
    title: "【一聲佛號一聲心】阿彌陀佛四十分鐘淨化心靈純音楽版",
    heading: "【一聲佛號一聲心】阿彌陀佛四十分鐘淨化心靈純音楽版",
    embedUrl: "https://www.youtube.com/embed/kbn9xYuDgMk?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=kbn9xYuDgMk&list=RDkbn9xYuDgMk&start_radio=1",
  },
  {
    id: "guzheng-buddhist-five-session-recitation",
    title: "【古筝佛乐】五会念佛",
    heading: "【古筝佛乐】五会念佛",
    embedUrl: "https://www.youtube.com/embed/apURAOFI8Ak?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=apURAOFI8Ak&list=RDapURAOFI8Ak&start_radio=1",
  },
  {
    id: "meditation-spiritual-environmental-music",
    title: "靜心、冥想、心靈環保",
    heading: "靜心、冥想、心靈環保",
    embedUrl: "https://www.youtube.com/embed/0Mo41pmVX2Q?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=0Mo41pmVX2Q&list=RD0Mo41pmVX2Q&start_radio=1",
  },
  {
    id: "quiet-zen-guzheng-buddhist-music",
    title: "靜心禪樂 古箏佛曲",
    heading: "靜心禪樂 古箏佛曲",
    embedUrl: "https://www.youtube.com/embed/ScfidHjXiZw?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=ScfidHjXiZw&list=RDScfidHjXiZw&start_radio=1",
  },
  {
    id: "meditation-yoga-sleep-aid",
    title: "冥想、瑜珈、助眠",
    heading: "冥想、瑜珈、助眠",
    embedUrl: "https://www.youtube.com/embed/Jr-1zKPYplc?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=Jr-1zKPYplc&list=RDJr-1zKPYplc&start_radio=1",
  },
  {
    id: "relaxing-music-for-meditation-vipassana",
    title: "適合禪修、內觀的放鬆音樂",
    heading: "適合禪修、內觀的放鬆音樂",
    embedUrl: "https://www.youtube.com/embed/UsCVoqlcfnQ?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=UsCVoqlcfnQ&list=RDUsCVoqlcfnQ&start_radio=1",
  },
  {
    id: "relaxing-music-for-meditation-breathing",
    title: "適合禪修、調息的放鬆音樂",
    heading: "適合禪修、調息的放鬆音樂",
    embedUrl: "https://www.youtube.com/embed/n2lI-Qjpikg?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=n2lI-Qjpikg&list=RDn2lI-Qjpikg&start_radio=1",
  },
  {
    id: "recover-calm-balance-chakras",
    title: "找回平靜，加強脈輪平衡",
    heading: "找回平靜，加強脈輪平衡",
    embedUrl: "https://www.youtube.com/embed/S93q7z1CyPs?rel=0",
    originalUrl: "https://www.youtube.com/watch?v=S93q7z1CyPs",
  },
  {
    id: "meditation-sitting-sleep-aid",
    title: "適合禪修靜坐助眠",
    heading: "適合禪修靜坐助眠",
    embedUrl: "https://www.youtube.com/embed/rncAKppkwQM?rel=0",
    originalUrl:
      "https://www.youtube.com/watch?v=rncAKppkwQM&list=RDrncAKppkwQM&start_radio=1",
  },
];

const emptyChantTotals: Record<ChantCounterKey, number> = {
  tenThousand: 0,
  hundredThousand: 0,
  million: 0,
};

const buddhaDrawings: BuddhaDrawing[] = [
  { id: "lotus", title: "莲花", svgPath: "/drawings/lotus.svg" },
  { id: "white-guanyin", title: "白衣观音", svgPath: "/drawings/white-guanyin.svg" },
  { id: "amitabha", title: "阿弥陀佛", svgPath: "/drawings/amitabha.svg" },
  { id: "ksitigarbha", title: "地藏王菩萨", svgPath: "/drawings/ksitigarbha.svg" },
  { id: "manjushri", title: "文殊菩萨", svgPath: "/drawings/manjushri.svg" },
  { id: "samantabhadra", title: "普贤菩萨", svgPath: "/drawings/samantabhadra.svg" },
  { id: "thousand-hand-guanyin", title: "千手观音", svgPath: "/drawings/thousand-hand-guanyin.svg" },
  { id: "medicine-buddha", title: "药师佛", svgPath: "/drawings/medicine-buddha.svg" },
  { id: "maitreya", title: "弥勒佛", svgPath: "/drawings/maitreya.svg" },
  { id: "padmasambhava", title: "莲花生大士", svgPath: "/drawings/padmasambhava.svg" },
  { id: "green-tara", title: "绿度母", svgPath: "/drawings/green-tara.svg" },
  { id: "white-tara", title: "白度母", svgPath: "/drawings/white-tara.svg" },
  { id: "mandala", title: "曼陀罗", svgPath: "/drawings/mandala.svg" },
];

const drawingColors: DrawingColor[] = [
  { key: "darkGold", label: "暗金色", value: "#A6782A" },
  { key: "cinnabar", label: "朱砂红", value: "#9f2f24" },
  { key: "inkBlack", label: "墨黑", value: "#1f1b16" },
  { key: "navy", label: "藏青", value: "#243b5a" },
  { key: "lightGold", label: "淡金", value: "#d8b66a" },
  { key: "silverWhite", label: "银白", value: "#d8d5cc" },
];

const drawingStrokeSizes: DrawingStrokeSize[] = [
  { key: "thin", label: "细", width: 3 },
  { key: "medium", label: "中", width: 5 },
  { key: "thick", label: "粗", width: 8 },
];

const MIN_AD_SLOT_COUNT = 5;
const MAX_AD_SLOT_COUNT = 28;
const AD_SLOT_HEIGHT = 168;
const WIDE_AD_SLOT_HEIGHT = 190;
const AD_SLOT_GAP = 20;

function getMinimumAdSlotCount(
  practiceMode: PracticeMode,
  hasOpenProjectPanel: boolean,
) {
  if (practiceMode === "buddhaDrawing") {
    return 10;
  }

  if (
    practiceMode === "sutraReading" ||
    practiceMode === "buddhaNameRecitation" ||
    practiceMode === "mantraRecitation" ||
    practiceMode === "buddhistMusic" ||
    practiceMode === "backgroundMusic"
  ) {
    return 7;
  }

  if (hasOpenProjectPanel) {
    return 7;
  }

  return MIN_AD_SLOT_COUNT;
}

function isDrawingStrokeSize(
  value: unknown,
): value is DrawingStrokeSize["key"] {
  return drawingStrokeSizes.some((size) => size.key === value);
}

function getDrawingStrokeWidth(strokeSize: DrawingStrokeSize["key"]) {
  return drawingStrokeSizes.find((size) => size.key === strokeSize)?.width ?? 5;
}

function cloneDrawingStrokes(strokes: DrawingStroke[]) {
  return strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point })),
  }));
}

function parseSavedDrawingStrokes(value: unknown): DrawingStroke[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const stroke = item as Partial<DrawingStroke>;

    if (
      typeof stroke.color !== "string" ||
      !isDrawingStrokeSize(stroke.strokeSize) ||
      !Array.isArray(stroke.points)
    ) {
      return [];
    }

    const points = stroke.points.flatMap((point) => {
      if (!point || typeof point !== "object") {
        return [];
      }

      const maybePoint = point as Partial<DrawingPoint>;

      if (
        typeof maybePoint.x !== "number" ||
        typeof maybePoint.y !== "number" ||
        !Number.isFinite(maybePoint.x) ||
        !Number.isFinite(maybePoint.y)
      ) {
        return [];
      }

      return [{ x: maybePoint.x, y: maybePoint.y }];
    });

    if (points.length === 0) {
      return [];
    }

    return [
      {
        id:
          typeof stroke.id === "string" && stroke.id
            ? stroke.id
            : `restored-${index}`,
        color: stroke.color,
        strokeSize: stroke.strokeSize,
        points,
      },
    ];
  });
}

function getCanvasPointFromDrawingPoint(point: DrawingPoint, rect: DOMRect) {
  return {
    x: (point.x / DRAWING_SVG_WIDTH) * rect.width,
    y: (point.y / DRAWING_SVG_HEIGHT) * rect.height,
  };
}

function getPointToSegmentDistance(
  point: DrawingPoint,
  start: DrawingPoint,
  end: DrawingPoint,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const projection = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  const projectedPoint = {
    x: start.x + projection * dx,
    y: start.y + projection * dy,
  };

  return Math.hypot(point.x - projectedPoint.x, point.y - projectedPoint.y);
}

const drawingLinePaths = [
  "M160 500 C230 430 370 430 440 500",
  "M210 505 C250 455 350 455 390 505",
  "M300 485 C270 430 270 370 300 320 C330 370 330 430 300 485",
  "M300 320 C250 310 220 280 205 240 C250 245 285 270 300 320",
  "M300 320 C350 310 380 280 395 240 C350 245 315 270 300 320",
  "M205 240 C230 190 275 175 300 220",
  "M395 240 C370 190 325 175 300 220",
  "M300 220 C280 165 285 120 300 82 C315 120 320 165 300 220",
  "M145 390 C180 335 235 315 290 350",
  "M455 390 C420 335 365 315 310 350",
  "M120 455 C165 405 220 385 282 408",
  "M480 455 C435 405 380 385 318 408",
  "M190 560 C245 590 355 590 410 560",
  "M235 590 C270 610 330 610 365 590",
  "M300 95 C350 125 385 170 398 225",
  "M300 95 C250 125 215 170 202 225",
  "M178 290 C120 300 92 340 82 390",
  "M422 290 C480 300 508 340 518 390",
  "M95 420 C150 455 205 460 260 430",
  "M505 420 C450 455 395 460 340 430",
  "M260 275 C282 258 318 258 340 275",
  "M250 300 C285 320 315 320 350 300",
  "M235 345 C270 365 330 365 365 345",
  "M300 350 C290 385 290 420 300 455 C310 420 310 385 300 350",
];

const drawingSpecificLinePaths: Record<string, string[]> = {
  mandala: [
    "M300 92 A228 228 0 1 1 299.9 92",
    "M300 142 A178 178 0 1 1 299.9 142",
    "M300 202 A118 118 0 1 1 299.9 202",
    "M300 255 A65 65 0 1 1 299.9 255",
    "M300 92 L300 548",
    "M72 320 L528 320",
    "M139 159 L461 481",
    "M461 159 L139 481",
    "M300 142 C250 205 250 435 300 498 C350 435 350 205 300 142",
    "M142 320 C205 270 435 270 498 320 C435 370 205 370 142 320",
  ],
};

function getDrawingLinePaths(drawingId: string) {
  if (drawingId === "lotus") {
    return [];
  }

  if (drawingSpecificLinePaths[drawingId]) {
    return drawingSpecificLinePaths[drawingId];
  }

  const sharedFigure = drawingLinePaths;
  const symbolPaths: Record<string, string[]> = {
    "white-guanyin": ["M300 95 A92 92 0 1 1 299.9 95", "M210 540 C245 585 355 585 390 540"],
    amitabha: ["M300 82 A115 115 0 1 1 299.9 82", "M240 180 C270 205 330 205 360 180"],
    ksitigarbha: ["M430 160 L430 515", "M410 205 C430 180 450 205 430 230", "M180 360 A28 28 0 1 1 179.9 360"],
    manjushri: ["M430 110 L350 265", "M405 145 L465 175", "M165 470 C210 440 255 440 300 470"],
    samantabhadra: ["M130 520 C195 470 250 470 310 520", "M310 520 C390 450 470 460 505 535", "M455 505 C470 485 495 485 510 505"],
    "thousand-hand-guanyin": ["M300 250 L90 145", "M300 250 L510 145", "M300 280 L70 260", "M300 280 L530 260", "M300 315 L95 400", "M300 315 L505 400"],
    "medicine-buddha": ["M380 430 A34 22 0 1 1 379.9 430", "M352 430 L408 430", "M300 82 A108 108 0 1 1 299.9 82"],
    maitreya: ["M190 430 C240 520 360 520 410 430", "M225 370 C260 410 340 410 375 370", "M245 155 C275 125 325 125 355 155"],
    padmasambhava: ["M220 155 L300 82 L380 155", "M238 155 C270 190 330 190 362 155", "M300 82 C285 120 315 120 300 82"],
    "green-tara": ["M170 515 C210 455 285 470 300 535", "M430 420 C385 405 350 430 330 470", "M245 158 C270 128 330 128 355 158"],
    "white-tara": ["M170 515 C210 455 285 470 300 535", "M430 420 C385 405 350 430 330 470", "M300 98 A112 112 0 1 1 299.9 98"],
  };

  return [...sharedFigure, ...(symbolPaths[drawingId] ?? [])];
}

type ExplanationAudioState = {
  id: string | null;
  status: "idle" | "loading" | "playing" | "paused";
};

type ExplanationBlock = {
  phrase: string;
  terms: ScriptureTerm[];
  explanation: string;
};

const adSlots: Record<"left" | "right", AdSlot[]> = {
  left: [
    {
      title: "静心推荐",
      description: "安静留白的推荐位置，适合书籍、香品与静心用品。",
      buttonText: "广告招租",
      href: "#",
    },
    {
      title: "广告招租",
      description: "可展示与阅读、抄经、静修相关的淡雅品牌内容。",
      buttonText: "联系合作",
      href: "#",
    },
    {
      title: "Amazon 推荐位",
      description: "适合护眼灯、阅读架、纸笔、茶具等日常推荐。",
      buttonText: "预留位置",
      href: "#",
    },
  ],
  right: [
    {
      title: "静心推荐",
      description: "为安静阅读与日常修习保留的轻量推荐位。",
      buttonText: "广告招租",
      href: "#",
    },
    {
      title: "广告招租",
      description: "低干扰展示位，适合长期稳定的内容合作。",
      buttonText: "联系合作",
      href: "#",
    },
    {
      title: "Amazon 推荐位",
      description: "未来可放书籍、文具、护眼与家庭静心用品。",
      buttonText: "预留位置",
      href: "#",
    },
  ],
};

function AdColumn({
  slots,
  isDark,
  side,
  slotCount,
}: {
  slots: AdSlot[];
  isDark: boolean;
  side: "left" | "right";
  slotCount: number;
}) {
  const visibleSlots = Array.from(
    { length: Math.max(slots.length, slotCount) },
    (_, index) => ({
      slot: slots[index % slots.length],
      key: `${slots[index % slots.length].title}-${index}`,
    }),
  );
  const cardClasses = isDark
    ? "border-stone-700/70 bg-[#211f1c]/82 text-stone-200"
    : "border-[rgba(185,158,110,0.36)] bg-[rgba(255,252,245,0.82)] text-[#1f140c]";
  const buttonClasses = isDark
    ? "border-amber-100/20 bg-[#2a2723]/78 text-stone-100"
    : "border-[rgba(167,127,69,0.42)] bg-[rgba(255,252,245,0.9)] text-[#1f140c]";
  return (
    <aside
      className={`no-print home-ad-column hidden w-[160px] shrink-0 flex-col gap-5 self-start min-[1400px]:flex ${
        side === "left"
          ? "home-ad-column--left justify-self-start"
          : "home-ad-column--right justify-self-end"
      }`}
    >
      {visibleSlots.map(({ slot, key }) => (
        <section
          key={key}
          className={`min-h-[148px] rounded-[18px] border p-5 shadow-[0_14px_32px_rgba(80,60,30,0.08)] backdrop-blur-sm min-[1600px]:min-h-[170px] ${cardClasses}`}
        >
          <h2
            className={`serene-nav-font text-[20px] font-semibold leading-snug min-[1600px]:text-[22px] ${
              isDark ? "text-stone-100" : "text-[#2b1d12]"
            }`}
          >
            {slot.title}
          </h2>
          <p
            className={`mt-3 text-[16px] leading-[1.75] min-[1600px]:text-[17px] ${
              isDark ? "text-stone-300" : "text-[#1f140c]"
            }`}
          >
            {slot.description}
          </p>
          {slot.href === "#" ? (
            <button
              type="button"
              className={`serene-nav-font mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border px-4 text-[16px] font-semibold transition hover:-translate-y-0.5 ${buttonClasses}`}
            >
              {slot.buttonText}
            </button>
          ) : (
            <a
              href={slot.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`serene-nav-font mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border px-4 text-[16px] font-semibold transition hover:-translate-y-0.5 ${buttonClasses}`}
            >
              {slot.buttonText}
            </a>
          )}
        </section>
      ))}
    </aside>
  );
}

function getAnswersKey(bookKey: ScriptureKey) {
  return `scripture-copy-${bookKey}`;
}

function getIndexKey(bookKey: ScriptureKey) {
  return `scripture-copy-${bookKey}-index`;
}

function isScriptureKey(value: string | null): value is ScriptureKey {
  return value !== null && value in scriptures;
}

function clampIndex(value: number, maxIndex: number) {
  return Math.min(Math.max(value, 0), Math.max(maxIndex, 0));
}

function getSpeechReadyText(value: string) {
  return value
    .replace(/[????????????????????????]/g, "")
    .replace(/[─│├└←]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitExplanationForSpeech(value: string) {
  const text = getSpeechReadyText(value);

  if (text.length <= EXPLANATION_CHUNK_MAX_LENGTH) {
    return text ? [text] : [];
  }

  const units =
    text.match(/[^。！？!?；;\n]+[。！？!?；;]?|\n+/g)?.map((item) => item.trim()) ??
    [text];
  const chunks: string[] = [];
  let current = "";

  for (const unit of units) {
    if (!unit) {
      continue;
    }

    if (unit.length > EXPLANATION_CHUNK_MAX_LENGTH) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      for (
        let index = 0;
        index < unit.length;
        index += EXPLANATION_CHUNK_MAX_LENGTH
      ) {
        chunks.push(unit.slice(index, index + EXPLANATION_CHUNK_MAX_LENGTH));
      }
      continue;
    }

    const next = current ? `${current}\n${unit}` : unit;

    if (next.length > EXPLANATION_CHUNK_MAX_LENGTH) {
      if (current) {
        chunks.push(current);
      }
      current = unit;
    } else {
      current = next;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function splitScriptureIntoPhrases(original: string) {
  const phrases =
    original
      .match(/[^，,。！？!?；;：:\n]+/g)
      ?.map((phrase) =>
        phrase
          .replace(/[“”"「」『』（）()]/g, "")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean) ?? [];

  return phrases.length > 0 ? phrases : [original.trim()].filter(Boolean);
}

function splitExplanationIntoUnits(explanation: string) {
  const units =
    explanation
      .split(/\n+/)
      .flatMap((paragraph) =>
        paragraph.match(/[^。！？!?；;]+[。！？!?；;]?/g) ?? [paragraph],
      )
      .map((unit) => unit.trim())
      .filter(Boolean);

  return units.length > 0 ? units : [explanation.trim()].filter(Boolean);
}

function buildExplanationBlocks(
  original: string,
  terms: ScriptureTerm[],
  explanation: string,
): ExplanationBlock[] {
  const phrases = splitScriptureIntoPhrases(original);
  const explanationUnits = splitExplanationIntoUnits(explanation);
  const usedTerms = new Set<string>();
  const unitCountPerBlock = Math.max(
    1,
    Math.ceil(explanationUnits.length / Math.max(phrases.length, 1)),
  );

  const blocks = phrases.map((phrase, index) => {
    const matchingTerms = terms.filter((term) => {
      const matched =
        phrase.includes(term.name) ||
        term.name.includes(phrase) ||
        phrase.replace(/\s/g, "").includes(term.name.replace(/\s/g, ""));

      if (matched) {
        usedTerms.add(term.name);
      }

      return matched;
    });
    const explanationStart = index * unitCountPerBlock;
    const explanationEnd =
      index === phrases.length - 1
        ? explanationUnits.length
        : explanationStart + unitCountPerBlock;
    const explanationText = explanationUnits
      .slice(explanationStart, explanationEnd)
      .join("\n");

    return {
      phrase,
      terms: matchingTerms,
      explanation: explanationText,
    };
  });

  const unmatchedTerms = terms.filter((term) => !usedTerms.has(term.name));

  if (unmatchedTerms.length > 0 && blocks[0]) {
    blocks[0] = {
      ...blocks[0],
      terms: [...blocks[0].terms, ...unmatchedTerms],
    };
  }

  return blocks.map((block) => ({
    ...block,
    terms:
      block.terms.length > 0
        ? block.terms
        : [
            {
              name: "这一短句",
              meaning: "这里先按短句理解，重点看它在整句经文中表达的意思。",
            },
          ],
    explanation:
      block.explanation ||
      "这一短句需要和前后文合起来理解。可以先把它当作整句经文中的一个小意思，再慢慢连起来看。",
  }));
}

function cleanPlainExplanationText(text: string) {
  return text
    .replace(/^白话解释[:：]\s*/u, "")
    .replace(/\n+参考讲解[:：][\s\S]*$/u, "")
    .replace(/^本句是原文长段拆分后的第\s*\d+\s*小句。\s*/u, "")
    .trim();
}

function splitDetailOriginalText(original: string) {
  const text = original.replace(/\s+/g, " ").trim();

  if (text.length <= 42) {
    return [text];
  }

  const targetCount = text.length > 72 ? 4 : 3;
  const sentences =
    text.match(/[^。！？!?]+[。！？!?]?/g)?.map((item) => item.trim()).filter(Boolean) ??
    [text];
  const displayLines: string[] = [];

  sentences.forEach((sentence, sentenceIndex) => {
    const remainingSentences = sentences.length - sentenceIndex - 1;
    const availableSlots = targetCount - displayLines.length - remainingSentences;

    const clauses =
      sentence
        .match(/[^，,；;：:]+[，,；;：:]?/g)
        ?.map((item) => item.trim())
        .filter(Boolean) ?? [sentence];

    if ((sentence.length <= 42 && clauses.length <= 3) || availableSlots <= 1) {
      displayLines.push(sentence);
      return;
    }

    const slotCount = Math.min(availableSlots, clauses.length);
    let cursor = 0;

    for (let slot = 0; slot < slotCount; slot += 1) {
      const remainingClauses = clauses.length - cursor;
      const remainingSlots = slotCount - slot;
      const take = Math.ceil(remainingClauses / remainingSlots);
      const line = clauses
        .slice(cursor, cursor + take)
        .join("")
        .replace(/[，,；;：:]\s*$/u, "。");

      displayLines.push(line);
      cursor += take;
    }
  });

  return displayLines.slice(0, targetCount);
}

function buildDetailExplanationBlocks(
  original: string,
  plainExplanation: string,
  terms: ScriptureTerm[],
): ExplanationBlock[] {
  const originalLines = splitDetailOriginalText(original);
  const explanationUnits = splitExplanationIntoUnits(plainExplanation);
  const usedTerms = new Set<string>();
  const unitCountPerBlock = Math.max(
    1,
    Math.ceil(explanationUnits.length / Math.max(originalLines.length, 1)),
  );

  const blocks = originalLines.map((line, index) => {
    const normalizedLine = line.replace(/\s/g, "");
    const matchingTerms = terms.filter((term) => {
      const normalizedTerm = term.name.replace(/\s/g, "");
      const matched =
        normalizedLine.includes(normalizedTerm) ||
        normalizedTerm.includes(normalizedLine);

      if (matched) {
        usedTerms.add(term.name);
      }

      return matched;
    });
    const explanationStart = index * unitCountPerBlock;
    const explanationEnd =
      index === originalLines.length - 1
        ? explanationUnits.length
        : explanationStart + unitCountPerBlock;

    return {
      phrase: line,
      terms: matchingTerms,
      explanation: explanationUnits.slice(explanationStart, explanationEnd).join("\n"),
    };
  });

  const unmatchedTerms = terms.filter((term) => !usedTerms.has(term.name));

  if (unmatchedTerms.length > 0 && blocks[0]) {
    blocks[0] = {
      ...blocks[0],
      terms: [...blocks[0].terms, ...unmatchedTerms],
    };
  }

  return blocks.map((block) => {
    const explanation = block.explanation || plainExplanation;

    return {
      ...block,
      explanation,
      terms:
        block.terms.length > 0
          ? block.terms
          : [
              {
                name: "句義重點",
                meaning:
                  explanation ||
                  "這一句需要連同前後文理解，重點在本段經文的整體意思。",
              },
            ],
    };
  });
}

function createChineseUtterance(text: string) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.75;
  utterance.volume = 1;
  utterance.pitch = 1;
  return utterance;
}

function normalizeCopyText(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function normalizeBuddhistShortcutInput(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function getScriptureSuggestionTarget(
  value: string,
  cursorPosition: number,
): ScriptureSuggestionTarget | null {
  const beforeCursor = value.slice(0, cursorPosition);
  const match = beforeCursor.match(/[A-Za-z][A-Za-z\s]*$/);

  if (!match || match.index === undefined) {
    return null;
  }

  const query = normalizeBuddhistShortcutInput(match[0]);

  if (query.length < 2) {
    return null;
  }

  return {
    start: match.index,
    end: cursorPosition,
    query,
  };
}

function getBuddhistInputSuggestions(query: string) {
  return BUDDHIST_INPUT_SUGGESTIONS.map((suggestion) => {
    const bestShortcut = suggestion.shortcuts.find((shortcut) =>
      normalizeBuddhistShortcutInput(shortcut).startsWith(query),
    );

    if (!bestShortcut) {
      return null;
    }

    return {
      suggestion,
      exactMatch: normalizeBuddhistShortcutInput(bestShortcut) === query,
      shortcutLength: normalizeBuddhistShortcutInput(bestShortcut).length,
    };
  })
    .filter((item): item is {
      suggestion: BuddhistInputSuggestion;
      exactMatch: boolean;
      shortcutLength: number;
    } => item !== null)
    .sort((a, b) => {
      if (a.exactMatch !== b.exactMatch) {
        return a.exactMatch ? -1 : 1;
      }

      if (a.shortcutLength !== b.shortcutLength) {
        return a.shortcutLength - b.shortcutLength;
      }

      return b.suggestion.priority - a.suggestion.priority;
    })
    .slice(0, 5)
    .map((item) => item.suggestion);
}

function getProjectMenuLabelFontSize(
  label: string,
  density: "regular" | "compact" = "regular",
) {
  const length = Array.from(label.replace(/\s+/g, "")).length;

  if (density === "compact") {
    if (length <= 4) return 32;
    if (length <= 6) return 28;
    if (length <= 8) return 24;
    if (length <= 10) return 20;
    if (length <= 12) return 18;
    if (length <= 16) return 15;
    return 13;
  }

  if (length <= 4) return 32;
  if (length <= 6) return 30;
  if (length <= 8) return 28;
  if (length <= 10) return 26;
  if (length <= 12) return 24;
  if (length <= 16) return 22;
  if (length <= 20) return 20;
  if (length <= 24) return 18;
  return 16;
}

function splitMantraLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getDrawingStorageKey(drawingId: string) {
  return `${DRAWING_STORAGE_PREFIX}-${drawingId}`;
}

function getChapterPosition(bookKey: ScriptureKey, globalSentenceIndex: number) {
  const sentences = scriptures[bookKey].sentences as ScriptureSentenceWithTerms[];
  const sentence = sentences[globalSentenceIndex];
  const chapterTitle = sentence?.chapterTitle;

  if (!chapterTitle) {
    return {
      chapterIndex: 0,
      sentenceIndex: clampIndex(globalSentenceIndex, sentences.length - 1),
    };
  }

  const chapterTitles = Array.from(
    new Set(sentences.map((item) => item.chapterTitle).filter(Boolean)),
  );
  const chapterIndex = Math.max(chapterTitles.indexOf(chapterTitle), 0);
  const sentenceIndex = sentences
    .slice(0, globalSentenceIndex + 1)
    .filter((item) => item.chapterTitle === chapterTitle).length - 1;

  return {
    chapterIndex,
    sentenceIndex: Math.max(sentenceIndex, 0),
  };
}

function getGlobalIndexFromPosition(
  bookKey: ScriptureKey,
  chapterIndex: number,
  sentenceIndex: number,
) {
  const sentences = scriptures[bookKey].sentences as ScriptureSentenceWithTerms[];
  const chapterTitles = Array.from(
    new Set(sentences.map((item) => item.chapterTitle).filter(Boolean)),
  );

  if (chapterTitles.length === 0) {
    return clampIndex(sentenceIndex, sentences.length - 1);
  }

  const chapterTitle = chapterTitles[clampIndex(chapterIndex, chapterTitles.length - 1)];
  const indexes = sentences
    .map((sentence, index) => ({ sentence, index }))
    .filter((item) => item.sentence.chapterTitle === chapterTitle)
    .map((item) => item.index);

  return indexes[clampIndex(sentenceIndex, indexes.length - 1)] ?? 0;
}

function readLastPosition(): LastPosition | null {
  const saved = window.localStorage.getItem(LAST_POSITION_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<LastPosition>;
    const bookKey = typeof parsed.bookKey === "string" ? parsed.bookKey : null;

    if (
      !isScriptureKey(bookKey) ||
      typeof parsed.chapterIndex !== "number" ||
      typeof parsed.sentenceIndex !== "number" ||
      typeof parsed.input !== "string" ||
      typeof parsed.fontSize !== "number" ||
      (parsed.mode !== "dark" && parsed.mode !== "light")
    ) {
      return null;
    }

    return {
      bookKey,
      chapterIndex: parsed.chapterIndex,
      sentenceIndex: parsed.sentenceIndex,
      globalSentenceIndex:
        typeof parsed.globalSentenceIndex === "number"
          ? parsed.globalSentenceIndex
          : getGlobalIndexFromPosition(
              bookKey,
              parsed.chapterIndex,
              parsed.sentenceIndex,
            ),
      input: parsed.input,
      fontSize: parsed.fontSize,
      mode: parsed.mode,
    };
  } catch {
    window.localStorage.removeItem(LAST_POSITION_KEY);
    return null;
  }
}

function loadSavedAnswers(bookKey: ScriptureKey) {
  const sentences = scriptures[bookKey].sentences;
  const savedAnswers = window.localStorage.getItem(getAnswersKey(bookKey));

  if (!savedAnswers) {
    return Array(sentences.length).fill("");
  }

  try {
    const parsed = JSON.parse(savedAnswers) as unknown;

    if (!Array.isArray(parsed)) {
      return Array(sentences.length).fill("");
    }

    return sentences.map((_, index) =>
      typeof parsed[index] === "string" ? parsed[index] : "",
    );
  } catch {
    window.localStorage.removeItem(getAnswersKey(bookKey));
    return Array(sentences.length).fill("");
  }
}

function readChantTotals() {
  const saved = window.localStorage.getItem(CHANT_TOTALS_KEY);

  if (!saved) {
    return emptyChantTotals;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<Record<ChantCounterKey, number>>;

    return {
      tenThousand:
        typeof parsed.tenThousand === "number" ? parsed.tenThousand : 0,
      hundredThousand:
        typeof parsed.hundredThousand === "number" ? parsed.hundredThousand : 0,
      million: typeof parsed.million === "number" ? parsed.million : 0,
    };
  } catch {
    window.localStorage.removeItem(CHANT_TOTALS_KEY);
    return emptyChantTotals;
  }
}

function readMantraTotals() {
  const saved = window.localStorage.getItem(MANTRA_TOTALS_KEY);

  if (!saved) {
    return emptyChantTotals;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<Record<ChantCounterKey, number>>;

    return {
      tenThousand:
        typeof parsed.tenThousand === "number" ? parsed.tenThousand : 0,
      hundredThousand:
        typeof parsed.hundredThousand === "number" ? parsed.hundredThousand : 0,
      million: typeof parsed.million === "number" ? parsed.million : 0,
    };
  } catch {
    window.localStorage.removeItem(MANTRA_TOTALS_KEY);
    return emptyChantTotals;
  }
}

function readMantraLastPosition(): MantraLastPosition | null {
  const saved = window.localStorage.getItem(MANTRA_LAST_POSITION_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<MantraLastPosition>;

    if (
      typeof parsed.mantraId !== "string" ||
      typeof parsed.lineIndex !== "number" ||
      typeof parsed.input !== "string" ||
      typeof parsed.fontSize !== "number" ||
      (parsed.mode !== "dark" && parsed.mode !== "light")
    ) {
      return null;
    }

    return {
      mantraId: parsed.mantraId,
      lineIndex: parsed.lineIndex,
      input: parsed.input,
      fontSize: parsed.fontSize,
      mode: parsed.mode,
    };
  } catch {
    window.localStorage.removeItem(MANTRA_LAST_POSITION_KEY);
    return null;
  }
}

export default function Home() {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("scripture");
  const [currentBookKey, setCurrentBookKey] =
    useState<ScriptureKey>("heartSutra");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(scriptures.heartSutra.sentences.length).fill(""),
  );
  const [mode, setMode] = useState<ThemeMode>("light");
  const [fontSize, setFontSize] = useState(42);
  const [notice, setNotice] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [chantSelectorOpen, setChantSelectorOpen] = useState(false);
  const [mantraSelectorOpen, setMantraSelectorOpen] = useState(false);
  const [drawingSelectorOpen, setDrawingSelectorOpen] = useState(false);
  const [activeTopMenu, setActiveTopMenu] = useState<TopMenu | null>(null);
  const [selectedChant, setSelectedChant] =
    useState<BuddhaChant>("南无阿弥陀佛");
  const [selectedMantra, setSelectedMantra] = useState<Mantra>(mantras[0]);
  const [selectedSutraReading, setSelectedSutraReading] =
    useState<SutraReading>(sutraReadings[0]);
  const [selectedBuddhaNameRecitation, setSelectedBuddhaNameRecitation] =
    useState<BuddhaNameRecitation>(buddhaNameRecitations[0]);
  const [selectedMantraRecitation, setSelectedMantraRecitation] =
    useState<MantraRecitation>(mantraRecitations[0]);
  const [selectedBuddhistMusic, setSelectedBuddhistMusic] =
    useState<BuddhistMusic>(buddhistMusicVideos[0]);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] =
    useState<BackgroundMusic>(backgroundMusicVideos[0]);
  const [selectedDrawing, setSelectedDrawing] = useState<BuddhaDrawing>(
    buddhaDrawings[0],
  );
  const [drawingColor, setDrawingColor] = useState(drawingColors[0].value);
  const [drawingStrokeSize, setDrawingStrokeSize] =
    useState<DrawingStrokeSize["key"]>("medium");
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("brush");
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [drawingProgress, setDrawingProgress] = useState(0);
  const [chantAnswer, setChantAnswer] = useState("");
  const [mantraAnswer, setMantraAnswer] = useState("");
  const [mantraLineIndex, setMantraLineIndex] = useState(0);
  const [mantraLineAnswers, setMantraLineAnswers] = useState<string[]>(
    Array(splitMantraLines(mantras[0].text).length).fill(""),
  );
  const [mantraLineCompleted, setMantraLineCompleted] = useState<boolean[]>(
    Array(splitMantraLines(mantras[0].text).length).fill(false),
  );
  const [chantCompletedCount, setChantCompletedCount] = useState(0);
  const [mantraCompletedCount, setMantraCompletedCount] = useState(0);
  const [chantTotals, setChantTotals] =
    useState<Record<ChantCounterKey, number>>(emptyChantTotals);
  const [mantraTotals, setMantraTotals] =
    useState<Record<ChantCounterKey, number>>(emptyChantTotals);
  const [activeChantCounters, setActiveChantCounters] = useState<
    Record<ChantCounterKey, boolean>
  >({
    tenThousand: false,
    hundredThousand: false,
    million: false,
  });
  const [activeMantraCounters, setActiveMantraCounters] = useState<
    Record<ChantCounterKey, boolean>
  >({
    tenThousand: false,
    hundredThousand: false,
    million: false,
  });
  const [explanationAudio, setExplanationAudio] =
    useState<ExplanationAudioState>({
      id: null,
      status: "idle",
    });
  const [scriptureSuggestionTarget, setScriptureSuggestionTarget] =
    useState<ScriptureSuggestionTarget | null>(null);
  const [adSlotCount, setAdSlotCount] = useState(MIN_AD_SLOT_COUNT);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const storageReady = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chantTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mantraTextareaRef = useRef<HTMLTextAreaElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const drawingLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawingCurrentStrokeRef = useRef<DrawingStroke | null>(null);
  const drawingStrokesRef = useRef<DrawingStroke[]>([]);
  const drawingStrokeIdRef = useRef(0);
  const drawingDistanceRef = useRef(0);
  const drawingActiveRef = useRef(false);
  const chantCompletionLockedRef = useRef(false);
  const mantraCompletionLockedRef = useRef(false);
  const explanationContentRef = useRef<HTMLDivElement>(null);
  const explanationSpeechChunksCacheRef = useRef<Map<string, string[]>>(new Map());
  const explanationAudioRunRef = useRef(0);
  const scriptureInputComposingRef = useRef(false);

  const stopExplanationAudio = useCallback(() => {
    explanationAudioRunRef.current += 1;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setExplanationAudio({ id: null, status: "idle" });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const lastPosition = readLastPosition();
      const savedBookKey = window.localStorage.getItem(CURRENT_BOOK_KEY);
      const nextBookKey =
        lastPosition?.bookKey ??
        (isScriptureKey(savedBookKey) &&
        scriptures[savedBookKey].sentences.length > 0
          ? savedBookKey
          : "heartSutra");
      const sentenceCount = scriptures[nextBookKey].sentences.length;
      const nextIndex = lastPosition
        ? clampIndex(lastPosition.globalSentenceIndex, sentenceCount - 1)
        : Number(window.localStorage.getItem(getIndexKey(nextBookKey)));
      const nextAnswers = loadSavedAnswers(nextBookKey);

      setCurrentBookKey(nextBookKey);
      if (lastPosition) {
        nextAnswers[nextIndex] = lastPosition.input;
      }
      setAnswers(nextAnswers);

      if (Number.isInteger(nextIndex)) {
        setCurrentIndex(clampIndex(nextIndex, sentenceCount - 1));
      }

      const savedMode = window.localStorage.getItem(MODE_KEY);
      if (lastPosition) {
        setMode(lastPosition.mode);
      } else if (savedMode === "dark" || savedMode === "light") {
        setMode(savedMode);
      }

      const savedFontSize = Number(window.localStorage.getItem(FONT_SIZE_KEY));
      if (lastPosition) {
        setFontSize(
          Math.min(Math.max(lastPosition.fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE),
        );
      } else if (Number.isFinite(savedFontSize)) {
        setFontSize(
          Math.min(Math.max(savedFontSize, MIN_FONT_SIZE), MAX_FONT_SIZE),
        );
      }

      setChantTotals(readChantTotals());
      setMantraTotals(readMantraTotals());
      storageReady.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }

    window.localStorage.setItem(getAnswersKey(currentBookKey), JSON.stringify(answers));
  }, [answers, currentBookKey]);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }

    window.localStorage.setItem(CURRENT_BOOK_KEY, currentBookKey);
    window.localStorage.setItem(getIndexKey(currentBookKey), String(currentIndex));
  }, [currentIndex, currentBookKey]);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }

    window.localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }

    window.localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    if (practiceMode === "chant") {
      chantTextareaRef.current?.focus();
      return;
    }

    if (practiceMode === "mantra") {
      mantraTextareaRef.current?.focus();
      return;
    }

    textareaRef.current?.focus();
  }, [currentIndex, practiceMode]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(""), 2000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const updateAdSlotCount = () => {
      const contentHeight = mainContentRef.current?.scrollHeight ?? 0;
      const minimumSlotCount = getMinimumAdSlotCount(
        practiceMode,
        Boolean(activeTopMenu),
      );

      if (window.innerWidth < 1400 || contentHeight <= 0) {
        setAdSlotCount(minimumSlotCount);
        return;
      }

      const estimatedSlotHeight =
        window.innerWidth >= 1600 ? WIDE_AD_SLOT_HEIGHT : AD_SLOT_HEIGHT;
      const nextSlotCount = Math.min(
        MAX_AD_SLOT_COUNT,
        Math.max(
          minimumSlotCount,
          Math.ceil(
            (contentHeight + AD_SLOT_GAP) /
              (estimatedSlotHeight + AD_SLOT_GAP),
          ),
        ),
      );

      setAdSlotCount((current) =>
        current === nextSlotCount ? current : nextSlotCount,
      );
    };

    updateAdSlotCount();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && mainContentRef.current
        ? new ResizeObserver(updateAdSlotCount)
        : null;

    if (mainContentRef.current) {
      resizeObserver?.observe(mainContentRef.current);
    }

    const timer = window.setTimeout(updateAdSlotCount, 300);
    window.addEventListener("resize", updateAdSlotCount);
    window.addEventListener("load", updateAdSlotCount);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateAdSlotCount);
      window.removeEventListener("load", updateAdSlotCount);
      resizeObserver?.disconnect();
    };
  }, [activeTopMenu, practiceMode]);

  useEffect(() => {
    return () => stopExplanationAudio();
  }, [practiceMode, currentBookKey, currentIndex, stopExplanationAudio]);

  const currentBook = scriptures[currentBookKey];
  const currentSentences = currentBook.sentences;
  const currentScripture = currentSentences[currentIndex];
  const isChantMode = practiceMode === "chant";
  const isMantraMode = practiceMode === "mantra";
  const isDrawingMode = practiceMode === "buddhaDrawing";
  const isSutraReadingMode = practiceMode === "sutraReading";
  const isBuddhaNameRecitationMode =
    practiceMode === "buddhaNameRecitation";
  const isMantraRecitationMode = practiceMode === "mantraRecitation";
  const isBuddhistMusicMode = practiceMode === "buddhistMusic";
  const isBackgroundMusicMode = practiceMode === "backgroundMusic";
  const isScriptureMode = practiceMode === "scripture";
  const isCopyPhraseMode = isChantMode || isMantraMode;
  const scriptureCopyTextStyle = {
    "--scripture-copy-font-size": `${Math.max(fontSize, 42)}px`,
  } as CSSProperties;
  const chantCopyTextStyle = {
    "--chant-copy-font-size": `${Math.max(fontSize, 56)}px`,
  } as CSSProperties;
  const mantraCopyTextStyle = {
    "--chant-copy-font-size": `${Math.max(fontSize, 50)}px`,
  } as CSSProperties;

  useEffect(() => {
    if (!isChantMode) {
      return;
    }

    const isComplete =
      normalizeCopyText(chantAnswer) === normalizeCopyText(selectedChant);

    if (!isComplete) {
      chantCompletionLockedRef.current = false;
      return;
    }

    if (chantCompletionLockedRef.current) {
      return;
    }

    chantCompletionLockedRef.current = true;
    setChantCompletedCount((count) => count + 1);
    setChantTotals((current) => {
      const next = { ...current };

      for (const counter of chantCounters) {
        if (activeChantCounters[counter.key]) {
          next[counter.key] += 1;
        }
      }

      return next;
    });

    const timer = window.setTimeout(() => {
      setChantAnswer("");
      chantCompletionLockedRef.current = false;
      chantTextareaRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activeChantCounters, chantAnswer, isChantMode, selectedChant]);

  useEffect(() => {
    drawingPathRefs.current = [];
  }, [selectedDrawing.id]);

  useEffect(() => {
    drawingStrokesRef.current = drawingStrokes;
  }, [drawingStrokes]);

  const mantraLines = useMemo(
    () => splitMantraLines(selectedMantra.text),
    [selectedMantra],
  );
  const currentMantraLineText = mantraLines[mantraLineIndex] ?? "";

  useEffect(() => {
    if (!isMantraMode) {
      return;
    }

    const isComplete =
      normalizeCopyText(mantraAnswer) === normalizeCopyText(currentMantraLineText);

    if (!isComplete) {
      mantraCompletionLockedRef.current = false;
      return;
    }

    if (mantraCompletionLockedRef.current) {
      return;
    }

    mantraCompletionLockedRef.current = true;
    const nextCompleted = Array.from(
      { length: mantraLines.length },
      (_, index) =>
        index === mantraLineIndex ? true : Boolean(mantraLineCompleted[index]),
    );
    const completedAll = nextCompleted.every(Boolean);

    const timer = window.setTimeout(() => {
      setMantraLineCompleted(nextCompleted);

      if (mantraLineIndex < mantraLines.length - 1) {
        const nextIndex = mantraLineIndex + 1;
        setMantraLineIndex(nextIndex);
        setMantraAnswer(mantraLineAnswers[nextIndex] ?? "");
      } else if (completedAll) {
        setMantraCompletedCount((count) => count + 1);
        setMantraTotals((currentTotals) => {
          const nextTotals = { ...currentTotals };

          for (const counter of chantCounters) {
            if (activeMantraCounters[counter.key]) {
              nextTotals[counter.key] += 1;
            }
          }

          return nextTotals;
        });
        setMantraLineIndex(0);
        setMantraAnswer("");
        setMantraLineAnswers(Array(mantraLines.length).fill(""));
        setMantraLineCompleted(Array(mantraLines.length).fill(false));
        setNotice("已完成一遍咒语。");
      } else {
        setNotice("还有前面的句子没有正确完成，请返回补齐。");
      }
      mantraCompletionLockedRef.current = false;
      mantraTextareaRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [
    activeMantraCounters,
    currentMantraLineText,
    isMantraMode,
    mantraAnswer,
    mantraLineAnswers,
    mantraLineCompleted,
    mantraLineIndex,
    mantraLines.length,
  ]);

  const currentTerms = useMemo(
    () =>
      (currentScripture as ScriptureSentenceWithTerms).terms ??
      (currentScripture as ScriptureSentenceWithTerms).glossary?.map((item) => ({
        name: item.term,
        meaning: item.meaning,
      })) ??
      [],
    [currentScripture],
  );
  const explanationBlocks = useMemo(
    () =>
      buildExplanationBlocks(
        currentScripture.original,
        currentTerms,
        currentScripture.explanation,
      ),
    [currentScripture, currentTerms],
  );
  const currentChapterTitle =
    (currentScripture as ScriptureSentenceWithTerms).chapterTitle ?? "";
  const currentReferenceTranslation =
    (currentScripture as ScriptureSentenceWithTerms).translation?.trim() ?? "";
  const currentPlainExplanation = useMemo(
    () =>
      cleanPlainExplanationText(
        currentReferenceTranslation || currentScripture.explanation,
      ),
    [currentReferenceTranslation, currentScripture.explanation],
  );
  const detailExplanationBlocks = useMemo(
    () =>
      buildDetailExplanationBlocks(
        currentScripture.original,
        currentPlainExplanation,
        currentTerms,
      ),
    [currentScripture.original, currentPlainExplanation, currentTerms],
  );
  const currentAnswer = answers[currentIndex] ?? "";
  const scriptureInputSuggestions = useMemo(
    () => {
      if (!scriptureSuggestionTarget) {
        return [];
      }

      const currentQuery = normalizeBuddhistShortcutInput(
        currentAnswer.slice(
          scriptureSuggestionTarget.start,
          scriptureSuggestionTarget.end,
        ),
      );

      if (currentQuery !== scriptureSuggestionTarget.query) {
        return [];
      }

      return getBuddhistInputSuggestions(scriptureSuggestionTarget.query);
    },
    [currentAnswer, scriptureSuggestionTarget],
  );
  const drawingCompletion = Math.min(drawingProgress, 100);
  const selectedDrawingLinePaths = useMemo(
    () => getDrawingLinePaths(selectedDrawing.id),
    [selectedDrawing.id],
  );
  const drawingCanvasAspectClass =
    selectedDrawing.id === "lotus" ? "aspect-[500/353]" : "aspect-[600/640]";
  const currentCopyText = isMantraMode ? currentMantraLineText : selectedChant;
  const currentCopyAnswer = isMantraMode ? mantraAnswer : chantAnswer;
  const currentCopyCompletedCount = isMantraMode
    ? mantraCompletedCount
    : chantCompletedCount;
  const currentCopyTotals = isMantraMode ? mantraTotals : chantTotals;
  const currentCopyUnit = isMantraMode ? "咒语" : "佛号";
  const currentExplanationId = `${currentBookKey}-${currentIndex}`;
  const isCurrentExplanationLoading =
    explanationAudio.id === currentExplanationId &&
    explanationAudio.status === "loading";
  const isCurrentExplanationPlaying =
    explanationAudio.id === currentExplanationId &&
    explanationAudio.status === "playing";
  const isCurrentExplanationPaused =
    explanationAudio.id === currentExplanationId &&
    explanationAudio.status === "paused";
  const isDark = mode === "dark";

  useEffect(() => {
    if (
      isCopyPhraseMode ||
      isDrawingMode ||
      isSutraReadingMode ||
      isBuddhaNameRecitationMode ||
      isMantraRecitationMode ||
      isBuddhistMusicMode ||
      isBackgroundMusicMode
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const fullText =
        explanationContentRef.current?.innerText ??
        explanationContentRef.current?.textContent ??
        "";
      const chunks = splitExplanationForSpeech(fullText);

      if (chunks.length > 0) {
        explanationSpeechChunksCacheRef.current.set(currentExplanationId, chunks);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    isCopyPhraseMode,
    isDrawingMode,
    isSutraReadingMode,
    isBuddhaNameRecitationMode,
    isMantraRecitationMode,
    isBuddhistMusicMode,
    isBackgroundMusicMode,
    currentExplanationId,
    explanationBlocks,
    currentPlainExplanation,
    currentTerms,
    detailExplanationBlocks,
  ]);

  const pageClasses = isDark
    ? "bg-[#181715] text-stone-100"
    : "bg-[#f6efe2] text-[#433024]";

  const mutedTextClasses = isDark ? "text-stone-400" : "text-[#5a4231]";
  const buttonClasses = isDark
    ? "border-stone-700 bg-[#24221f] text-stone-100 hover:bg-[#2d2a26]"
    : "border-[#d8c6a6] bg-[#fffaf0] text-[#2b1d12] hover:bg-[#f7eddb] hover:text-[#1f140c]";
  const drawingToolbarFontStyle = {
    color: "#000",
    fontFamily:
      '"SimHei", "Heiti SC", "Microsoft YaHei", "Noto Sans SC", Arial, Helvetica, sans-serif',
    fontSize: 24,
    fontWeight: 700,
  };
  const drawingToolbarLabelStyle = {
    ...drawingToolbarFontStyle,
    fontSize: 26,
  };
  const drawingToolbarButtonClasses =
    "drawing-toolbar-text inline-flex h-[64px] min-w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-md border-2 border-[rgba(120,90,40,0.55)] bg-[#fffdf6] px-6 text-[24px] font-bold leading-none text-black shadow-[0_4px_12px_rgba(80,60,30,0.13)] transition hover:border-[rgba(92,66,28,0.9)] hover:bg-[#f3e4c3] hover:shadow-[0_6px_16px_rgba(80,60,30,0.18)]";
  const drawingToolbarSelectedButtonClasses =
    "drawing-toolbar-text inline-flex h-[64px] min-w-[92px] shrink-0 items-center justify-center whitespace-nowrap rounded-md border-2 border-[#6f5225] bg-[#e0bc74] px-6 text-[24px] font-bold leading-none text-black shadow-[0_6px_16px_rgba(80,60,30,0.2)]";
  const drawingToolbarPrimaryButtonClasses =
    "drawing-toolbar-primary-button drawing-toolbar-text inline-flex h-[76px] min-w-[280px] shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-md border-2 border-[#5f431c] bg-[#d9ad55] px-8 text-[28px] font-bold leading-none text-black shadow-[0_8px_20px_rgba(80,60,30,0.24)] transition hover:bg-[#e7c477] hover:shadow-[0_10px_24px_rgba(80,60,30,0.3)]";
  const drawingStudyMenuTextStyle = {
    color: "#000",
    fontFamily:
      '"SimHei", "Heiti SC", "Microsoft YaHei", "Noto Sans SC", Arial, Helvetica, sans-serif',
    fontSize: 32,
    fontWeight: 900,
  };
  const projectMenuOptionStyle = (
    label: string,
    density: "regular" | "compact" = "regular",
  ) =>
    ({
      "--project-menu-label-size": `${getProjectMenuLabelFontSize(label, density)}px`,
    }) as CSSProperties;
  const drawingStudyMenuButtonClasses = (isSelected = false) =>
    [
      projectOptionClasses(isSelected),
      "project-menu-option min-h-[76px] px-6 py-4 text-left leading-tight",
    ].join(" ");
  const explanationListenButtonClasses = isDark
    ? "bg-[#2a251f]/82 text-stone-50 shadow-[0_0_0_1px_rgba(245,222,179,0.08)] hover:bg-[#3a3026]/88 hover:shadow-[0_0_16px_rgba(245,210,158,0.16)]"
    : "bg-[#3b3024]/72 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)] hover:bg-[#4a3828]/78 hover:shadow-[0_0_14px_rgba(139,95,50,0.18)]";

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < currentSentences.length - 1;
  const canGoPreviousMantraLine = mantraLineIndex > 0;
  const canGoNextMantraLine = mantraLineIndex < mantraLines.length - 1;

  const isStudyPickerOpen =
    selectorOpen || chantSelectorOpen || mantraSelectorOpen || drawingSelectorOpen;
  const isTopMenuSelected = (menu: TopMenu) => activeTopMenu === menu;

  const projectCardClasses = (
    menu: TopMenu,
    isSelectedOverride?: boolean,
  ) => {
    const isSelected = isSelectedOverride ?? isTopMenuSelected(menu);

    return [
      "home-project-card serene-home-card serene-nav-font group relative min-w-0 overflow-hidden rounded-[18px] border px-4 py-4 text-left text-black transition duration-300 lg:px-4 lg:py-4 xl:px-5 xl:py-5",
      isSelected
        ? isDark
          ? "border-amber-200/35 bg-[#2b251f]/92 text-amber-50 shadow-[0_16px_40px_rgba(0,0,0,0.22)]"
          : "border-[rgba(167,127,69,0.36)] bg-[rgba(255,252,245,0.9)] text-[#2b1d12] shadow-[0_16px_38px_rgba(80,60,30,0.1)]"
        : isDark
          ? "border-stone-700/80 bg-[#211f1c]/86 text-stone-100 hover:border-amber-200/35 hover:bg-[#2a251f]"
          : "border-[rgba(185,158,110,0.32)] bg-[rgba(255,252,245,0.78)] text-[#2b1d12] hover:border-[rgba(167,127,69,0.44)] hover:bg-[rgba(255,252,245,0.9)]",
    ].join(" ");
  };


  const projectIconClasses = isDark
    ? "bg-amber-100/10 text-amber-100"
    : "bg-[rgba(238,226,205,0.72)] text-[#a77f45]";

  const projectPanelClasses = isDark
    ? "border-stone-700/80 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.24)]"
    : "border-[rgba(185,158,110,0.35)] bg-[rgba(255,252,245,0.9)] text-[#2b1d12] shadow-[0_10px_30px_rgba(80,60,30,0.08)]";

  const projectOptionClasses = (isSelected = false) =>
    [
      "project-menu-option serene-nav-font rounded-[14px] border px-4 py-3 text-left transition duration-200",
      isSelected
        ? isDark
          ? "border-amber-200/50 bg-[#332d22] text-amber-50"
          : "border-[rgba(167,127,69,0.45)] bg-[rgba(255,249,236,0.92)] text-[#2b1d12]"
        : isDark
          ? "border-stone-700 bg-[#24211e] hover:border-amber-200/45 hover:bg-[#302920]"
          : "border-[rgba(185,158,110,0.32)] bg-[rgba(255,252,245,0.72)] text-[#433024] hover:border-[rgba(167,127,69,0.44)] hover:bg-[rgba(255,252,245,0.96)] hover:text-[#2b1d12]",
    ].join(" ");
  const renderedAdSlotCount = Math.max(
    adSlotCount,
    getMinimumAdSlotCount(practiceMode, Boolean(activeTopMenu)),
  );

  const updateCurrentAnswer = (value: string) => {
    setAnswers((current) => {
      const next = [...current];
      next[currentIndex] = value;
      return next;
    });
  };

  const refreshScriptureSuggestions = (
    value: string,
    cursorPosition: number | null,
  ) => {
    if (scriptureInputComposingRef.current || cursorPosition === null) {
      setScriptureSuggestionTarget(null);
      return;
    }

    setScriptureSuggestionTarget(
      getScriptureSuggestionTarget(value, cursorPosition),
    );
  };

  const applyScriptureSuggestion = (suggestion: BuddhistInputSuggestion) => {
    if (!scriptureSuggestionTarget) {
      return;
    }

    const nextAnswer = `${currentAnswer.slice(
      0,
      scriptureSuggestionTarget.start,
    )}${suggestion.text}${currentAnswer.slice(scriptureSuggestionTarget.end)}`;
    const nextCursor = scriptureSuggestionTarget.start + suggestion.text.length;

    updateCurrentAnswer(nextAnswer);
    setScriptureSuggestionTarget(null);
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
    }, 0);
  };

  const updateChantAnswer = (value: string) => {
    setChantAnswer(value);
  };

  const updateMantraAnswer = (value: string) => {
    setMantraAnswer(value);
    setMantraLineAnswers((current) => {
      const next = Array.from({ length: mantraLines.length }, (_, index) =>
        typeof current[index] === "string" ? current[index] : "",
      );
      next[mantraLineIndex] = value;
      return next;
    });
  };

  const playExplanationAudio = () => {
    if (!("speechSynthesis" in window)) {
      setNotice("当前浏览器不支持朗读功能。");
      return;
    }

    if (isCurrentExplanationPlaying) {
      window.speechSynthesis.pause();
      setExplanationAudio({ id: currentExplanationId, status: "paused" });
      return;
    }

    if (isCurrentExplanationPaused) {
      window.speechSynthesis.resume();
      setExplanationAudio({ id: currentExplanationId, status: "playing" });
      return;
    }

    const fullText =
      explanationContentRef.current?.innerText ??
      explanationContentRef.current?.textContent ??
      "";
    const cachedChunks =
      explanationSpeechChunksCacheRef.current.get(currentExplanationId);
    const chunks = cachedChunks ?? splitExplanationForSpeech(fullText);

    if (chunks.length === 0) {
      setNotice("当前解释没有可朗读的内容。");
      return;
    }

    explanationSpeechChunksCacheRef.current.set(currentExplanationId, chunks);
    window.speechSynthesis.cancel();
    explanationAudioRunRef.current += 1;
    const runId = explanationAudioRunRef.current;
    setExplanationAudio({ id: currentExplanationId, status: "loading" });
    setNotice("");

    const speakChunk = (chunkIndex: number) => {
      if (runId !== explanationAudioRunRef.current) {
        return;
      }

      const chunk = chunks[chunkIndex];

      if (!chunk) {
        setExplanationAudio({ id: null, status: "idle" });
        return;
      }

      const utterance = createChineseUtterance(chunk);
      utterance.onstart = () => {
        if (runId === explanationAudioRunRef.current) {
          setExplanationAudio({ id: currentExplanationId, status: "playing" });
        }
      };
      utterance.onend = () => speakChunk(chunkIndex + 1);
      utterance.onerror = () => {
        if (runId === explanationAudioRunRef.current) {
          setExplanationAudio({ id: null, status: "idle" });
          setNotice("解释朗读暂时无法播放，请稍后再试。");
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk(0);
  };

  const goToNextSentence = () => {
    window.localStorage.setItem(
      getAnswersKey(currentBookKey),
      JSON.stringify(answers),
    );

    if (!canGoNext) {
      setNotice("已经是最后一句");
      return;
    }

    stopExplanationAudio();
    setNotice("");
    setCurrentIndex((index) => clampIndex(index + 1, currentSentences.length - 1));
  };

  const goToMantraLine = (lineIndex: number) => {
    const nextIndex = clampIndex(lineIndex, mantraLines.length - 1);
    setMantraLineIndex(nextIndex);
    setMantraAnswer(mantraLineAnswers[nextIndex] ?? "");
    mantraCompletionLockedRef.current = false;
    setNotice("");
    window.setTimeout(() => mantraTextareaRef.current?.focus(), 0);
  };

  const goToNextMantraLine = () => {
    if (!canGoNextMantraLine) {
      setNotice("已经是最后一句");
      return;
    }

    goToMantraLine(mantraLineIndex + 1);
  };

  const goToPreviousMantraLine = () => {
    if (!canGoPreviousMantraLine) {
      setNotice("已经是第一句");
      return;
    }

    goToMantraLine(mantraLineIndex - 1);
  };

  const restart = () => {
    stopExplanationAudio();
    if (isChantMode) {
      setChantAnswer("");
      setChantCompletedCount(0);
      setNotice("");
      window.setTimeout(() => chantTextareaRef.current?.focus(), 0);
      return;
    }

    if (isMantraMode) {
      setMantraAnswer("");
      setMantraLineIndex(0);
      setMantraLineAnswers(Array(mantraLines.length).fill(""));
      setMantraLineCompleted(Array(mantraLines.length).fill(false));
      setMantraCompletedCount(0);
      setNotice("");
      window.setTimeout(() => mantraTextareaRef.current?.focus(), 0);
      return;
    }

    setAnswers(Array(currentSentences.length).fill(""));
    setCurrentIndex(0);
    setNotice("");
    window.localStorage.removeItem(getAnswersKey(currentBookKey));
    window.localStorage.setItem(getIndexKey(currentBookKey), "0");
  };

  const saveCurrentPosition = () => {
    if (isChantMode) {
      setNotice("当前抄写模式会保留在当前页面。");
      return;
    }

    if (isMantraMode) {
      const lastPosition: MantraLastPosition = {
        mantraId: selectedMantra.id,
        lineIndex: mantraLineIndex,
        input: mantraAnswer,
        fontSize,
        mode,
      };

      window.localStorage.setItem(
        MANTRA_LAST_POSITION_KEY,
        JSON.stringify(lastPosition),
      );
      window.localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
      window.localStorage.setItem(MODE_KEY, mode);
      setNotice("已保存当前咒语位置。");
      return;
    }

    const { chapterIndex, sentenceIndex } = getChapterPosition(
      currentBookKey,
      currentIndex,
    );
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = currentAnswer;
    const lastPosition: LastPosition = {
      bookKey: currentBookKey,
      chapterIndex,
      sentenceIndex,
      globalSentenceIndex: currentIndex,
      input: currentAnswer,
      fontSize,
      mode,
    };

    window.localStorage.setItem(getAnswersKey(currentBookKey), JSON.stringify(nextAnswers));
    window.localStorage.setItem(CURRENT_BOOK_KEY, currentBookKey);
    window.localStorage.setItem(getIndexKey(currentBookKey), String(currentIndex));
    window.localStorage.setItem(FONT_SIZE_KEY, String(fontSize));
    window.localStorage.setItem(MODE_KEY, mode);
    window.localStorage.setItem(LAST_POSITION_KEY, JSON.stringify(lastPosition));
    setAnswers(nextAnswers);
    setNotice("已保存当前位置，明天可继续抄写。");
  };

  const continueLastPosition = () => {
    if (isMantraMode) {
      const lastPosition = readMantraLastPosition();

      if (!lastPosition) {
        setNotice("还没有保存过咒语位置。");
        return;
      }

      const mantra = mantras.find((item) => item.id === lastPosition.mantraId);

      if (!mantra) {
        setNotice("上次保存的咒语已不在列表中。");
        return;
      }

      const lines = splitMantraLines(mantra.text);
      const nextIndex = clampIndex(lastPosition.lineIndex, lines.length - 1);
      const nextAnswers = Array(lines.length).fill("");
      nextAnswers[nextIndex] = lastPosition.input;

      stopExplanationAudio();
      setPracticeMode("mantra");
      setSelectedMantra(mantra);
      setMantraLineIndex(nextIndex);
      setMantraLineAnswers(nextAnswers);
      setMantraLineCompleted(Array(lines.length).fill(false));
      setMantraAnswer(lastPosition.input);
      setFontSize(
        Math.min(Math.max(lastPosition.fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE),
      );
      setMode(lastPosition.mode);
      setNotice("已回到上次咒语抄写的位置。");
      window.setTimeout(() => mantraTextareaRef.current?.focus(), 0);
      return;
    }

    const lastPosition = readLastPosition();

    if (!lastPosition) {
      setNotice("还没有保存过位置。");
      return;
    }

    const sentenceCount = scriptures[lastPosition.bookKey].sentences.length;
    const nextIndex = clampIndex(
      lastPosition.globalSentenceIndex,
      sentenceCount - 1,
    );
    const nextAnswers = loadSavedAnswers(lastPosition.bookKey);
    nextAnswers[nextIndex] = lastPosition.input;

    window.localStorage.setItem(
      getAnswersKey(lastPosition.bookKey),
      JSON.stringify(nextAnswers),
    );
    window.localStorage.setItem(CURRENT_BOOK_KEY, lastPosition.bookKey);
    window.localStorage.setItem(getIndexKey(lastPosition.bookKey), String(nextIndex));
    window.localStorage.setItem(FONT_SIZE_KEY, String(lastPosition.fontSize));
    window.localStorage.setItem(MODE_KEY, lastPosition.mode);

    stopExplanationAudio();
    setPracticeMode("scripture");
    setCurrentBookKey(lastPosition.bookKey);
    setCurrentIndex(nextIndex);
    setAnswers(nextAnswers);
    setFontSize(
      Math.min(Math.max(lastPosition.fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE),
    );
    setMode(lastPosition.mode);
    setNotice("已回到上次抄写的位置。");
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const readCurrentSentence = () => {
    if (!("speechSynthesis" in window)) {
      setNotice("当前浏览器不支持朗读功能。");
      return;
    }

    stopExplanationAudio();

    const utterance = createChineseUtterance(
      isMantraMode
        ? currentMantraLineText
        : isChantMode
          ? selectedChant
          : currentScripture.original,
    );
    window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    stopExplanationAudio();
  };

  const createDrawingStrokeId = (pointerId: number) => {
    drawingStrokeIdRef.current += 1;
    return `${selectedDrawing.id}-${pointerId}-${drawingStrokeIdRef.current}`;
  };

  const applyDrawingStrokeStyle = (
    context: CanvasRenderingContext2D,
    stroke: Pick<DrawingStroke, "color" | "strokeSize">,
  ) => {
    context.globalCompositeOperation = "source-over";
    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineWidth = getDrawingStrokeWidth(stroke.strokeSize);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = stroke.color;
    context.shadowBlur = stroke.color === "#A6782A" ? 5 : 2;
  };

  const drawCanvasStrokePoint = (
    point: DrawingPoint,
    stroke: Pick<DrawingStroke, "color" | "strokeSize">,
  ) => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    applyDrawingStrokeStyle(context, stroke);
    context.beginPath();
    context.arc(
      point.x,
      point.y,
      getDrawingStrokeWidth(stroke.strokeSize) / 2,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.shadowBlur = 0;
  };

  const drawCanvasStrokeSegment = (
    from: DrawingPoint,
    to: DrawingPoint,
    stroke: Pick<DrawingStroke, "color" | "strokeSize">,
  ) => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    applyDrawingStrokeStyle(context, stroke);
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.shadowBlur = 0;
  };

  const drawStoredStroke = (
    context: CanvasRenderingContext2D,
    stroke: DrawingStroke,
    rect: DOMRect,
  ) => {
    const [firstPoint, ...restPoints] = stroke.points;

    if (!firstPoint) {
      return;
    }

    applyDrawingStrokeStyle(context, stroke);

    if (restPoints.length === 0) {
      const canvasPoint = getCanvasPointFromDrawingPoint(firstPoint, rect);
      context.beginPath();
      context.arc(
        canvasPoint.x,
        canvasPoint.y,
        getDrawingStrokeWidth(stroke.strokeSize) / 2,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.shadowBlur = 0;
      return;
    }

    const firstCanvasPoint = getCanvasPointFromDrawingPoint(firstPoint, rect);
    context.beginPath();
    context.moveTo(firstCanvasPoint.x, firstCanvasPoint.y);

    for (const point of restPoints) {
      const canvasPoint = getCanvasPointFromDrawingPoint(point, rect);
      context.lineTo(canvasPoint.x, canvasPoint.y);
    }

    context.stroke();
    context.shadowBlur = 0;
  };

  const redrawDrawingCanvas = (
    strokes: DrawingStroke[] = drawingStrokesRef.current,
  ) => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = rect.width > 0 ? canvas.width / rect.width : 1;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    for (const stroke of strokes) {
      drawStoredStroke(context, stroke, rect);
    }

    context.globalCompositeOperation = "source-over";
    context.shadowBlur = 0;
  };

  const calculateDrawingStrokeDistance = (strokes: DrawingStroke[]) => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return 0;
    }

    const rect = canvas.getBoundingClientRect();

    return strokes.reduce((total, stroke) => {
      let strokeDistance = 0;

      for (let index = 1; index < stroke.points.length; index += 1) {
        const from = getCanvasPointFromDrawingPoint(
          stroke.points[index - 1],
          rect,
        );
        const to = getCanvasPointFromDrawingPoint(stroke.points[index], rect);
        strokeDistance += Math.hypot(to.x - from.x, to.y - from.y);
      }

      return total + strokeDistance;
    }, 0);
  };

  const setDrawingProgressFromDistance = (
    distance: number,
    allowDecrease: boolean,
    announceCompleted: boolean,
  ) => {
    drawingDistanceRef.current = distance;
    const nextProgress = Math.min(
      100,
      Math.round((distance / DRAWING_COMPLETION_DISTANCE) * 100),
    );

    setDrawingProgress((currentProgress) => {
      if (announceCompleted && nextProgress >= 100 && currentProgress < 100) {
        setNotice("佛像已描绘完成");
      }

      return allowDecrease ? nextProgress : Math.max(currentProgress, nextProgress);
    });
  };

  const recalculateDrawingProgress = (
    strokes: DrawingStroke[],
    announceCompleted = false,
  ) => {
    setDrawingProgressFromDistance(
      calculateDrawingStrokeDistance(strokes),
      true,
      announceCompleted,
    );
  };

  const syncDrawingCanvasSize = () => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    const nextWidth = Math.max(1, Math.round(rect.width * scale));
    const nextHeight = Math.max(1, Math.round(rect.height * scale));

    if (canvas.width === nextWidth && canvas.height === nextHeight) {
      return;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    redrawDrawingCanvas();
  };

  const getDrawingCanvasPoint = (
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const getDrawingPointFromCanvasPoint = (point: DrawingPoint) => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return null;
    }

    return {
      x: (point.x / rect.width) * DRAWING_SVG_WIDTH,
      y: (point.y / rect.height) * DRAWING_SVG_HEIGHT,
    };
  };

  const getSnappedDrawingPoint = (point: DrawingPoint) => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return point;
    }

    const rect = canvas.getBoundingClientRect();
    const svgPoint = {
      x: (point.x / rect.width) * DRAWING_SVG_WIDTH,
      y: (point.y / rect.height) * DRAWING_SVG_HEIGHT,
    };
    let nearestPoint: DrawingPoint | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const path of drawingPathRefs.current) {
      if (!path) {
        continue;
      }

      const length = path.getTotalLength();
      const sampleCount = Math.max(12, Math.ceil(length / 18));

      for (let sample = 0; sample <= sampleCount; sample += 1) {
        const candidate = path.getPointAtLength((length * sample) / sampleCount);
        const distance = Math.hypot(
          candidate.x - svgPoint.x,
          candidate.y - svgPoint.y,
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPoint = { x: candidate.x, y: candidate.y };
        }
      }
    }

    if (!nearestPoint || nearestDistance > DRAWING_SNAP_RADIUS) {
      return point;
    }

    const pull = 0.35 + (1 - nearestDistance / DRAWING_SNAP_RADIUS) * 0.35;
    const snappedCanvasPoint = {
      x: (nearestPoint.x / DRAWING_SVG_WIDTH) * rect.width,
      y: (nearestPoint.y / DRAWING_SVG_HEIGHT) * rect.height,
    };

    return {
      x: point.x + (snappedCanvasPoint.x - point.x) * pull,
      y: point.y + (snappedCanvasPoint.y - point.y) * pull,
    };
  };

  const findDrawingStrokeIndexAtPoint = (point: DrawingPoint) => {
    const canvas = drawingCanvasRef.current;

    if (!canvas) {
      return -1;
    }

    const rect = canvas.getBoundingClientRect();

    for (
      let strokeIndex = drawingStrokesRef.current.length - 1;
      strokeIndex >= 0;
      strokeIndex -= 1
    ) {
      const stroke = drawingStrokesRef.current[strokeIndex];
      const strokeWidth = getDrawingStrokeWidth(stroke.strokeSize);
      const hitDistance = Math.max(12, strokeWidth / 2 + 10);
      const [firstPoint, ...restPoints] = stroke.points;

      if (!firstPoint) {
        continue;
      }

      if (restPoints.length === 0) {
        const canvasPoint = getCanvasPointFromDrawingPoint(firstPoint, rect);

        if (Math.hypot(point.x - canvasPoint.x, point.y - canvasPoint.y) <= hitDistance) {
          return strokeIndex;
        }

        continue;
      }

      let previousPoint = getCanvasPointFromDrawingPoint(firstPoint, rect);

      for (const drawingPoint of restPoints) {
        const currentPoint = getCanvasPointFromDrawingPoint(drawingPoint, rect);
        const distance = getPointToSegmentDistance(
          point,
          previousPoint,
          currentPoint,
        );

        if (distance <= hitDistance) {
          return strokeIndex;
        }

        previousPoint = currentPoint;
      }
    }

    return -1;
  };

  const deleteDrawingStrokeAtPoint = (point: DrawingPoint) => {
    const strokeIndex = findDrawingStrokeIndexAtPoint(point);

    if (strokeIndex === -1) {
      setNotice("未点中已描绘的笔画。");
      return;
    }

    const nextStrokes = drawingStrokesRef.current.filter(
      (_, index) => index !== strokeIndex,
    );
    drawingStrokesRef.current = nextStrokes;
    setDrawingStrokes(nextStrokes);
    drawingCurrentStrokeRef.current = null;
    drawingActiveRef.current = false;
    drawingLastPointRef.current = null;
    redrawDrawingCanvas(nextStrokes);
    recalculateDrawingProgress(nextStrokes);
    setNotice("已删除一条笔画。");
  };

  const startCanvasDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    syncDrawingCanvasSize();
    const point = getDrawingCanvasPoint(event);

    if (!point) {
      return;
    }

    if (drawingTool === "eraser") {
      deleteDrawingStrokeAtPoint(point);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const snappedPoint = getSnappedDrawingPoint(point);
    const drawingPoint = getDrawingPointFromCanvasPoint(snappedPoint);

    if (!drawingPoint) {
      return;
    }

    drawingActiveRef.current = true;
    drawingLastPointRef.current = snappedPoint;
    drawingCurrentStrokeRef.current = {
      id: createDrawingStrokeId(event.pointerId),
      color: drawingColor,
      strokeSize: drawingStrokeSize,
      points: [drawingPoint],
    };
  };

  const moveCanvasDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingActiveRef.current) {
      return;
    }

    event.preventDefault();
    const currentPoint = getDrawingCanvasPoint(event);
    const lastPoint = drawingLastPointRef.current;
    const currentStroke = drawingCurrentStrokeRef.current;

    if (!currentPoint || !lastPoint || !currentStroke) {
      return;
    }

    const snappedPoint = getSnappedDrawingPoint(currentPoint);
    const drawingPoint = getDrawingPointFromCanvasPoint(snappedPoint);

    if (!drawingPoint) {
      return;
    }

    drawCanvasStrokeSegment(lastPoint, snappedPoint, currentStroke);
    currentStroke.points.push(drawingPoint);
    drawingLastPointRef.current = snappedPoint;
    setDrawingProgressFromDistance(
      drawingDistanceRef.current +
        Math.hypot(snappedPoint.x - lastPoint.x, snappedPoint.y - lastPoint.y),
      false,
      true,
    );
  };

  const stopCanvasDrawing = (event?: ReactPointerEvent<HTMLCanvasElement>) => {
    if (
      event?.currentTarget.hasPointerCapture &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drawingActiveRef.current) {
      return;
    }

    const currentStroke = drawingCurrentStrokeRef.current;

    if (currentStroke && currentStroke.points.length > 0) {
      if (currentStroke.points.length === 1) {
        const lastPoint = drawingLastPointRef.current;

        if (lastPoint) {
          drawCanvasStrokePoint(lastPoint, currentStroke);
        }
      }

      const nextStrokes = [
        ...drawingStrokesRef.current,
        {
          ...currentStroke,
          points: currentStroke.points.map((point) => ({ ...point })),
        },
      ];
      drawingStrokesRef.current = nextStrokes;
      setDrawingStrokes(nextStrokes);
      recalculateDrawingProgress(nextStrokes, true);
    }

    drawingActiveRef.current = false;
    drawingLastPointRef.current = null;
    drawingCurrentStrokeRef.current = null;
  };

  const clearDrawingCanvas = () => {
    drawingActiveRef.current = false;
    drawingLastPointRef.current = null;
    drawingCurrentStrokeRef.current = null;
    drawingStrokesRef.current = [];
    setDrawingStrokes([]);
    drawingDistanceRef.current = 0;
    setDrawingProgress(0);
    syncDrawingCanvasSize();
    redrawDrawingCanvas([]);
  };

  const restoreDrawingCanvas = (imageDataUrl: string) => {
    syncDrawingCanvasSize();
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scale = rect.width > 0 ? canvas.width / rect.width : 1;
    const image = new Image();
    image.onload = () => {
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.drawImage(image, 0, 0, rect.width, rect.height);
    };
    image.src = imageDataUrl;
  };

  const selectDrawing = (drawing: BuddhaDrawing) => {
    stopExplanationAudio();
    setPracticeMode("buddhaDrawing");
    setSelectedDrawing(drawing);
    setDrawingColor(drawingColors[0].value);
    setDrawingStrokeSize("medium");
    setDrawingTool("brush");
    drawingActiveRef.current = false;
    drawingLastPointRef.current = null;
    drawingCurrentStrokeRef.current = null;
    drawingStrokesRef.current = [];
    setDrawingStrokes([]);
    drawingDistanceRef.current = 0;
    setDrawingProgress(0);
    setNotice("");
    setSelectorOpen(false);
    setChantSelectorOpen(false);
    setMantraSelectorOpen(false);
    setDrawingSelectorOpen(false);
    setActiveTopMenu(null);
    window.setTimeout(() => clearDrawingCanvas(), 0);
  };

  const initializedDrawRouteRef = useRef(false);

  useEffect(() => {
    if (initializedDrawRouteRef.current) {
      return;
    }

    if (!window.location.pathname.startsWith("/draw-buddha")) {
      return;
    }

    initializedDrawRouteRef.current = true;
    const timer = window.setTimeout(() => {
      selectDrawing(selectedDrawing);
    }, 0);

    return () => window.clearTimeout(timer);
    // This route-only initializer intentionally runs once on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restartDrawing = () => {
    drawingActiveRef.current = false;
    drawingLastPointRef.current = null;
    drawingCurrentStrokeRef.current = null;
    clearDrawingCanvas();
    window.localStorage.removeItem(getDrawingStorageKey(selectedDrawing.id));
    setNotice("已清空当前佛像描绘进度。");
  };

  const saveDrawing = () => {
    const canvas = drawingCanvasRef.current;
    const strokes = cloneDrawingStrokes(drawingStrokesRef.current);
    const savedDrawing: SavedDrawing = {
      drawingId: selectedDrawing.id,
      imageDataUrl: canvas ? canvas.toDataURL("image/png") : "",
      strokes,
      color: drawingColor,
      strokeSize: drawingStrokeSize,
      completion: drawingCompletion,
    };

    window.localStorage.setItem(
      getDrawingStorageKey(selectedDrawing.id),
      JSON.stringify(savedDrawing),
    );
    setNotice("佛像描绘作品已保存。");
  };

  const continueDrawing = () => {
    const saved = window.localStorage.getItem(
      getDrawingStorageKey(selectedDrawing.id),
    );

    if (!saved) {
      setNotice("当前佛像还没有保存过描绘进度。");
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Partial<SavedDrawing>;
      const strokeSize: DrawingStrokeSize["key"] = drawingStrokeSizes.some(
        (size) => size.key === parsed.strokeSize,
      )
        ? (parsed.strokeSize as DrawingStrokeSize["key"])
        : "medium";
      const savedStrokes = parseSavedDrawingStrokes(parsed.strokes);
      const hasSavedStrokeArray = Array.isArray(parsed.strokes);

      drawingActiveRef.current = false;
      drawingLastPointRef.current = null;
      drawingCurrentStrokeRef.current = null;

      if (hasSavedStrokeArray) {
        drawingStrokesRef.current = savedStrokes;
        setDrawingStrokes(savedStrokes);
        syncDrawingCanvasSize();
        redrawDrawingCanvas(savedStrokes);
        recalculateDrawingProgress(savedStrokes);
      } else if (typeof parsed.imageDataUrl === "string" && parsed.imageDataUrl) {
        drawingStrokesRef.current = [];
        setDrawingStrokes([]);
        restoreDrawingCanvas(parsed.imageDataUrl);
        const nextProgress =
          typeof parsed.completion === "number" ? parsed.completion : 0;
        drawingDistanceRef.current =
          (nextProgress / 100) * DRAWING_COMPLETION_DISTANCE;
        setDrawingProgress(nextProgress);
      } else {
        clearDrawingCanvas();
      }
      setDrawingColor(
        typeof parsed.color === "string" ? parsed.color : drawingColors[0].value,
      );
      setDrawingStrokeSize(strokeSize);
      setDrawingTool("brush");
      setNotice("已恢复当前佛像的描绘进度。");
    } catch {
      window.localStorage.removeItem(getDrawingStorageKey(selectedDrawing.id));
      setNotice("保存的描绘进度无法读取，已清理。");
    }
  };

  const printDrawing = () => {
    window.print();
  };

  const selectScripture = (bookKey: ScriptureKey) => {
    const nextBook = scriptures[bookKey];

    if (nextBook.sentences.length === 0) {
      setNotice("这部佛经内容即将加入");
      setSelectorOpen(false);
      return;
    }

    window.localStorage.setItem(
      getAnswersKey(currentBookKey),
      JSON.stringify(answers),
    );
    window.localStorage.setItem(CURRENT_BOOK_KEY, bookKey);
    window.localStorage.setItem(getIndexKey(bookKey), "0");

    stopExplanationAudio();
    setPracticeMode("scripture");
    setCurrentBookKey(bookKey);
    setCurrentIndex(0);
    setAnswers(loadSavedAnswers(bookKey));
    setNotice("");
    setSelectorOpen(false);
    setChantSelectorOpen(false);
    setMantraSelectorOpen(false);
    setDrawingSelectorOpen(false);
    setActiveTopMenu(null);
  };

  const selectChant = (chant: BuddhaChant) => {
    stopExplanationAudio();
    setPracticeMode("chant");
    setSelectedChant(chant);
    setChantAnswer("");
    setChantCompletedCount(0);
    chantCompletionLockedRef.current = false;
    setNotice("");
    setSelectorOpen(false);
    setChantSelectorOpen(false);
    setMantraSelectorOpen(false);
    setDrawingSelectorOpen(false);
    setActiveTopMenu(null);
    window.setTimeout(() => chantTextareaRef.current?.focus(), 0);
  };

  const selectMantra = (mantra: Mantra) => {
    const lines = splitMantraLines(mantra.text);
    stopExplanationAudio();
    setPracticeMode("mantra");
    setSelectedMantra(mantra);
    setMantraAnswer("");
    setMantraLineIndex(0);
    setMantraLineAnswers(Array(lines.length).fill(""));
    setMantraLineCompleted(Array(lines.length).fill(false));
    setMantraCompletedCount(0);
    mantraCompletionLockedRef.current = false;
    setNotice("");
    setSelectorOpen(false);
    setChantSelectorOpen(false);
    setMantraSelectorOpen(false);
    setDrawingSelectorOpen(false);
    setActiveTopMenu(null);
    window.setTimeout(() => mantraTextareaRef.current?.focus(), 0);
  };

  const startChantCounter = (key: ChantCounterKey) => {
    setActiveChantCounters((current) => ({ ...current, [key]: true }));
    setNotice("已开始累计。");
  };

  const saveChantCounter = () => {
    window.localStorage.setItem(CHANT_TOTALS_KEY, JSON.stringify(chantTotals));
    setNotice("佛号累计已保存。");
  };

  const clearChantCounter = (key: ChantCounterKey) => {
    setChantTotals((current) => ({ ...current, [key]: 0 }));
    setActiveChantCounters((current) => ({ ...current, [key]: false }));
    setNotice("已清空这一项累计。");
  };

  const startMantraCounter = (key: ChantCounterKey) => {
    setActiveMantraCounters((current) => ({ ...current, [key]: true }));
    setNotice("已开始累计。");
  };

  const saveMantraCounter = () => {
    window.localStorage.setItem(MANTRA_TOTALS_KEY, JSON.stringify(mantraTotals));
    setNotice("咒语累计已保存。");
  };

  const clearMantraCounter = (key: ChantCounterKey) => {
    setMantraTotals((current) => ({ ...current, [key]: 0 }));
    setActiveMantraCounters((current) => ({ ...current, [key]: false }));
    setNotice("已清空这一项累计。");
  };

  const closePracticeSelectors = () => {
    setSelectorOpen(false);
    setChantSelectorOpen(false);
    setMantraSelectorOpen(false);
    setDrawingSelectorOpen(false);
  };

  const openProjectPanel = (menu: TopMenu) => {
    setActiveTopMenu((current) => (current === menu ? null : menu));
    closePracticeSelectors();
  };

  const openStudySelector = (
    selector: "scripture" | "chant" | "mantra" | "drawing",
  ) => {
    stopExplanationAudio();
    setPracticeMode(
      selector === "drawing"
        ? "buddhaDrawing"
        : selector === "scripture"
          ? "scripture"
          : selector,
    );
    setActiveTopMenu("study");
    setSelectorOpen(selector === "scripture");
    setChantSelectorOpen(selector === "chant");
    setMantraSelectorOpen(selector === "mantra");
    setDrawingSelectorOpen(selector === "drawing");
    setNotice("");
  };

  const openSutraReading = (reading: SutraReading) => {
    stopExplanationAudio();
    setPracticeMode("sutraReading");
    setSelectedSutraReading(reading);
    setActiveTopMenu(null);
    closePracticeSelectors();
    setNotice("");
  };

  const openBuddhaNameRecitation = (recitation: BuddhaNameRecitation) => {
    stopExplanationAudio();
    setPracticeMode("buddhaNameRecitation");
    setSelectedBuddhaNameRecitation(recitation);
    setActiveTopMenu(null);
    closePracticeSelectors();
    setNotice("");
  };

  const openMantraRecitation = (recitation: MantraRecitation) => {
    stopExplanationAudio();
    setPracticeMode("mantraRecitation");
    setSelectedMantraRecitation(recitation);
    setActiveTopMenu(null);
    closePracticeSelectors();
    setNotice("");
  };

  const openBuddhistMusic = (music: BuddhistMusic) => {
    stopExplanationAudio();
    setPracticeMode("buddhistMusic");
    setSelectedBuddhistMusic(music);
    setActiveTopMenu(null);
    closePracticeSelectors();
    setNotice("");
  };

  const openBackgroundMusic = (music: BackgroundMusic) => {
    stopExplanationAudio();
    setPracticeMode("backgroundMusic");
    setSelectedBackgroundMusic(music);
    setActiveTopMenu(null);
    closePracticeSelectors();
    setNotice("");
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${pageClasses} ${
        isDrawingMode ? "buddha-drawing-page" : ""
      }`}
    >
      <div className="home-page-shell">
        <AdColumn
          slots={adSlots.left}
          isDark={isDark}
          side="left"
          slotCount={renderedAdSlotCount}
        />

        <div
          ref={mainContentRef}
          className="home-main-content flex w-full min-w-0 max-w-[1280px] flex-col justify-self-center"
        >
          <header className="no-print home-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jingxin-header-banner.png"
              alt="静心修习空间"
              className="header-banner-image"
              draggable={false}
            />
          </header>
          <section className="no-print home-landing-section">
            <div className="home-landing-grid">
              <a
                href="/draw-buddha"
                className="draw-entry-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/zen-draw-buddha-entry.png"
                  alt="静心描佛"
                  className="draw-entry-image"
                  draggable={false}
                />
              </a>

              <div className="home-project-grid">
                <button
                  type="button"
                  onClick={() => openStudySelector("scripture")}
                  className={`${projectCardClasses(
                    "study",
                    activeTopMenu === "study" && selectorOpen,
                  )} home-project-card--large`}
                  aria-expanded={activeTopMenu === "study"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    笔
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--large">
                      抄写经书
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      逐句抄写经典，由字入心
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openStudySelector("chant")}
                  className={`${projectCardClasses(
                    "study",
                    activeTopMenu === "study" && chantSelectorOpen,
                  )} home-project-card--large`}
                  aria-expanded={activeTopMenu === "study" && chantSelectorOpen}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    号
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--large">
                      抄写佛号
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      念念相续，落笔成愿
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openProjectPanel("sutraReading")}
                  className={`${projectCardClasses("sutraReading")} home-project-card--small`}
                  aria-expanded={activeTopMenu === "sutraReading"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    书
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      朗读佛经
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      聆听经典，净化心灵
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openProjectPanel("chanting")}
                  className={`${projectCardClasses("chanting")} home-project-card--small`}
                  aria-expanded={activeTopMenu === "chanting"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    莲
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      念佛号
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      称念佛号，摄心安稳
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openProjectPanel("mantraChanting")}
                  className={`${projectCardClasses("mantraChanting")} home-project-card--small`}
                  aria-expanded={activeTopMenu === "mantraChanting"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    咒
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      念咒语
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      持诵咒语，增长福慧
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openStudySelector("mantra")}
                  className={`${projectCardClasses(
                    "study",
                    activeTopMenu === "study" && mantraSelectorOpen,
                  )} home-project-card--small`}
                  aria-expanded={activeTopMenu === "study" && mantraSelectorOpen}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    咒
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      抄写咒语
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      持咒抄写，凝神净心
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openProjectPanel("backgroundMusic")}
                  className={`${projectCardClasses("backgroundMusic")} home-project-card--small`}
                  aria-expanded={activeTopMenu === "backgroundMusic"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    ♪
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      背景音乐
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      清音相伴，静心修行
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => openProjectPanel("music")}
                  className={`${projectCardClasses("music")} home-project-card--small`}
                  aria-expanded={activeTopMenu === "music"}
                >
                  <span className={`home-project-icon ${projectIconClasses}`}>
                    乐
                  </span>
                  <span className="home-project-copy">
                    <span className="home-project-title home-project-title--small">
                      佛乐欣赏
                    </span>
                    <span className={`home-project-description ${isDark ? "text-stone-300" : "text-[#3b2a1d]"}`}>
                      聆听佛乐，回归宁静
                    </span>
                  </span>
                  <span className="home-project-arrow">
                    ›
                  </span>
                </button>
              </div>
            </div>

            {activeTopMenu === "study" && !(isDrawingMode && drawingSelectorOpen) ? (
              <section
                className={`project-choice-menu drawing-study-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}
                style={drawingStudyMenuTextStyle}
              >
                <div className="mb-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTopMenu(null);
                      closePracticeSelectors();
                    }}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    style={drawingStudyMenuTextStyle}
                    aria-label="关闭临摹修习面板"
                  >
                    关闭 ×
                  </button>
                </div>

                {!isStudyPickerOpen ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        title: "描绘佛像",
                        text: "选择佛像线稿，进入描绘练习。",
                        selector: "drawing" as const,
                      },
                      {
                        title: "抄写佛经",
                        text: "选择经文，逐句抄写与学习。",
                        selector: "scripture" as const,
                      },
                      {
                        title: "抄写佛号",
                        text: "选择佛号，记录抄写遍数。",
                        selector: "chant" as const,
                      },
                      {
                        title: "抄写咒语",
                        text: "选择咒语，分句持诵抄写。",
                        selector: "mantra" as const,
                      },
                    ].map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => openStudySelector(item.selector)}
                        className={drawingStudyMenuButtonClasses()}
                        style={{
                          ...drawingStudyMenuTextStyle,
                          ...projectMenuOptionStyle(item.title),
                        }}
                      >
                        <span
                          className="block text-lg font-semibold"
                          style={drawingStudyMenuTextStyle}
                        >
                          {item.title}
                        </span>
                        <span
                          className={`mt-1 block text-sm leading-relaxed ${mutedTextClasses}`}
                          style={drawingStudyMenuTextStyle}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {drawingSelectorOpen ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {buddhaDrawings.map((drawing) => (
                      <button
                        key={drawing.id}
                        type="button"
                        onClick={() => selectDrawing(drawing)}
                        className={drawingStudyMenuButtonClasses(
                          isDrawingMode && selectedDrawing.id === drawing.id,
                        )}
                        style={{
                          ...drawingStudyMenuTextStyle,
                          ...projectMenuOptionStyle(drawing.title),
                        }}
                      >
                        <span
                          className="block text-lg font-semibold"
                          style={drawingStudyMenuTextStyle}
                        >
                          {drawing.title}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectorOpen ? (
                  <div className="scripture-selector-grid mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {scriptureOrder.map((bookKey) => {
                      const book = scriptures[bookKey];
                      const hasContent = book.sentences.length > 0;
                      const scriptureMenuLabel = `${book.displayName}${
                        hasContent ? "" : " 即将加入"
                      }`;

                      return (
                        <button
                          key={bookKey}
                          type="button"
                          onClick={() => selectScripture(bookKey)}
                          className={drawingStudyMenuButtonClasses(
                            !isCopyPhraseMode && currentBookKey === bookKey,
                          )}
                          style={{
                            ...drawingStudyMenuTextStyle,
                            ...projectMenuOptionStyle(scriptureMenuLabel),
                          }}
                        >
                          <span
                            className="text-lg font-semibold"
                            style={drawingStudyMenuTextStyle}
                          >
                            {scriptureMenuLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {chantSelectorOpen ? (
                  <div className="chant-selector-grid mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {buddhaChants.map((chant) => (
                      <button
                        key={chant}
                        type="button"
                        onClick={() => selectChant(chant)}
                        className={drawingStudyMenuButtonClasses(
                          isChantMode && selectedChant === chant,
                        )}
                        style={{
                          ...drawingStudyMenuTextStyle,
                          ...projectMenuOptionStyle(chant, "compact"),
                        }}
                      >
                        <span
                          className="block text-base font-semibold leading-snug"
                          style={drawingStudyMenuTextStyle}
                        >
                          {chant}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {mantraSelectorOpen ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {mantraGroups.map((group) => (
                      <section
                        key={group.category}
                        className="grid grid-cols-1 gap-3 border-b border-current/15 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[140px_minmax(0,1fr)]"
                      >
                        <h3
                          className="text-lg font-semibold leading-snug text-current/75"
                          style={drawingStudyMenuTextStyle}
                        >
                          {group.category}
                        </h3>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.mantras.map((mantra) => (
                            <button
                              key={mantra.id}
                              type="button"
                              onClick={() => selectMantra(mantra)}
                              className={drawingStudyMenuButtonClasses(
                                isMantraMode && selectedMantra.id === mantra.id,
                              )}
                              style={{
                                ...drawingStudyMenuTextStyle,
                                ...projectMenuOptionStyle(mantra.title),
                              }}
                            >
                              <span
                                className="block text-base font-semibold leading-snug"
                                style={drawingStudyMenuTextStyle}
                              >
                                {mantra.title}
                              </span>
                              <span
                                className={`mt-1 block text-sm leading-snug ${mutedTextClasses}`}
                                style={drawingStudyMenuTextStyle}
                              >
                                {mantra.intro}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeTopMenu === "sutraReading" ? (
              <section className={`project-choice-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
                  <h2 className="serene-nav-font text-2xl leading-normal">
                    朗读佛经
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTopMenu(null)}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    aria-label="关闭朗读佛经面板"
                  >
                    关闭 ×
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sutraReadings.map((reading) => (
                    <button
                      key={reading.id}
                      type="button"
                      onClick={() => openSutraReading(reading)}
                      className={projectOptionClasses(
                        isSutraReadingMode && selectedSutraReading.id === reading.id,
                      )}
                      style={projectMenuOptionStyle(reading.title)}
                    >
                      <span className="block text-base font-semibold leading-snug">
                        {reading.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTopMenu === "chanting" ? (
              <section className={`project-choice-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
                  <h2 className="serene-nav-font text-2xl leading-normal">
                    念佛号
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTopMenu(null)}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    aria-label="关闭念佛号面板"
                  >
                    关闭 ×
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {buddhaNameRecitations.map((recitation) => (
                    <button
                      key={recitation.id}
                      type="button"
                      onClick={() => openBuddhaNameRecitation(recitation)}
                      className={projectOptionClasses(
                        isBuddhaNameRecitationMode &&
                          selectedBuddhaNameRecitation.id === recitation.id,
                      )}
                      style={projectMenuOptionStyle(recitation.title)}
                    >
                      <span className="block text-base font-semibold leading-snug">
                        {recitation.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTopMenu === "mantraChanting" ? (
              <section className={`project-choice-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
                  <h2 className="serene-nav-font text-2xl leading-normal">
                    念咒语
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTopMenu(null)}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    aria-label="关闭念咒语面板"
                  >
                    关闭 ×
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mantraRecitations.map((recitation) => (
                    <button
                      key={recitation.id}
                      type="button"
                      onClick={() => openMantraRecitation(recitation)}
                      className={projectOptionClasses(
                        isMantraRecitationMode &&
                          selectedMantraRecitation.id === recitation.id,
                      )}
                      style={projectMenuOptionStyle(recitation.title)}
                    >
                      <span className="block text-base font-semibold leading-snug">
                        {recitation.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTopMenu === "music" ? (
              <section className={`project-choice-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
                  <h2 className="serene-nav-font text-2xl leading-normal">
                    佛乐欣赏
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTopMenu(null)}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    aria-label="关闭佛乐欣赏面板"
                  >
                    关闭 ×
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {buddhistMusicVideos.map((music) => (
                    <button
                      key={music.id}
                      type="button"
                      onClick={() => openBuddhistMusic(music)}
                      className={projectOptionClasses(
                        isBuddhistMusicMode &&
                          selectedBuddhistMusic.id === music.id,
                      )}
                      style={projectMenuOptionStyle(music.title)}
                    >
                      <span className="block text-base font-semibold leading-snug">
                        {music.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTopMenu === "backgroundMusic" ? (
              <section className={`project-choice-menu rounded-[18px] border p-5 sm:p-6 ${projectPanelClasses}`}>
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-current/15 pb-3">
                  <h2 className="serene-nav-font text-2xl leading-normal">
                    背景音乐
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTopMenu(null)}
                    className="project-menu-close rounded-md px-3 py-1 text-base font-semibold transition hover:bg-current/10"
                    aria-label="关闭背景音乐面板"
                  >
                    关闭 ×
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {backgroundMusicVideos.map((music) => (
                    <button
                      key={music.id}
                      type="button"
                      onClick={() => openBackgroundMusic(music)}
                      className={projectOptionClasses(
                        isBackgroundMusicMode &&
                          selectedBackgroundMusic.id === music.id,
                      )}
                      style={projectMenuOptionStyle(music.title)}
                    >
                      <span className="block text-base font-semibold leading-snug">
                        {music.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </section>

        <section className="flex flex-col gap-4 pb-8">
          {isBuddhaNameRecitationMode ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-4 pt-1">
              <div className="w-full text-center">
                <h2
                  className={`text-2xl font-semibold leading-normal ${
                    isDark ? "text-amber-100" : "text-[#2b1d12]"
                  }`}
                >
                  念佛号
                </h2>
                <div
                  className={`mx-auto mt-2 h-px w-24 ${
                    isDark ? "bg-amber-200/30" : "bg-[#d8b66a]"
                  }`}
                />
              </div>
              <section
                className={`w-full min-w-0 rounded border p-3 shadow-sm sm:p-4 ${
                  isDark
                    ? "border-amber-200/30 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "border-[#d8b66a] bg-[#fff8e8] text-[#2b1d12] shadow-[0_18px_45px_rgba(91,58,22,0.12)]"
                }`}
              >
                <h3 className="mb-4 text-center text-[28px] font-semibold leading-normal">
                  {selectedBuddhaNameRecitation.heading}
                </h3>
                <div
                  className={`overflow-hidden rounded border ${
                    isDark ? "border-amber-200/35" : "border-[#d8b66a]"
                  }`}
                >
                  <div className="aspect-video w-full min-w-0">
                    <iframe
                      src={selectedBuddhaNameRecitation.embedUrl}
                      title={selectedBuddhaNameRecitation.heading}
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p
                  className={`mt-3 text-center text-sm ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  来源：YouTube
                  <span className="mx-2">｜</span>
                  <a
                    href={selectedBuddhaNameRecitation.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline underline-offset-4 transition ${
                      isDark
                        ? "text-amber-100 hover:text-amber-50"
                        : "text-[#5a4231] hover:text-[#1f140c]"
                    }`}
                  >
                    原视频
                  </a>
                </p>
              </section>
            </div>
          ) : isMantraRecitationMode ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-4 pt-1">
              <div className="w-full text-center">
                <h2
                  className={`text-2xl font-semibold leading-normal ${
                    isDark ? "text-amber-100" : "text-[#2b1d12]"
                  }`}
                >
                  念咒语
                </h2>
                <div
                  className={`mx-auto mt-2 h-px w-24 ${
                    isDark ? "bg-amber-200/30" : "bg-[#d8b66a]"
                  }`}
                />
              </div>
              <section
                className={`w-full min-w-0 rounded border p-3 shadow-sm sm:p-4 ${
                  isDark
                    ? "border-amber-200/30 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "border-[#d8b66a] bg-[#fff8e8] text-[#2b1d12] shadow-[0_18px_45px_rgba(91,58,22,0.12)]"
                }`}
              >
                <h3 className="mb-4 text-center text-[28px] font-semibold leading-normal">
                  {selectedMantraRecitation.heading}
                </h3>
                <div
                  className={`overflow-hidden rounded border ${
                    isDark ? "border-amber-200/35" : "border-[#d8b66a]"
                  }`}
                >
                  <div className="aspect-video w-full min-w-0">
                    <iframe
                      src={selectedMantraRecitation.embedUrl}
                      title={selectedMantraRecitation.heading}
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p
                  className={`mt-3 text-center text-sm ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  来源：YouTube
                  <span className="mx-2">｜</span>
                  <a
                    href={selectedMantraRecitation.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline underline-offset-4 transition ${
                      isDark
                        ? "text-amber-100 hover:text-amber-50"
                        : "text-[#5a4231] hover:text-[#1f140c]"
                    }`}
                  >
                    原视频
                  </a>
                </p>
              </section>
            </div>
          ) : isSutraReadingMode ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-4 pt-1">
              <div className="w-full text-center">
                <h2
                  className={`text-2xl font-semibold leading-normal ${
                    isDark ? "text-amber-100" : "text-[#2b1d12]"
                  }`}
                >
                  朗读佛经
                </h2>
                <div
                  className={`mx-auto mt-2 h-px w-24 ${
                    isDark ? "bg-amber-200/30" : "bg-[#d8b66a]"
                  }`}
                />
              </div>
              <section
                className={`w-full min-w-0 rounded border p-3 shadow-sm sm:p-4 ${
                  isDark
                    ? "border-amber-200/30 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "border-[#d8b66a] bg-[#fff8e8] text-[#2b1d12] shadow-[0_18px_45px_rgba(91,58,22,0.12)]"
                }`}
              >
                <h3 className="mb-4 text-center text-[28px] font-semibold leading-normal">
                  {selectedSutraReading.heading}
                </h3>
                <div
                  className={`overflow-hidden rounded border ${
                    isDark ? "border-amber-200/35" : "border-[#d8b66a]"
                  }`}
                >
                  <div className="aspect-video w-full min-w-0">
                    <iframe
                      src={selectedSutraReading.embedUrl}
                      title={selectedSutraReading.heading}
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p
                  className={`mt-3 text-center text-sm ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  来源：YouTube
                  <span className="mx-2">｜</span>
                  <a
                    href={selectedSutraReading.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline underline-offset-4 transition ${
                      isDark
                        ? "text-amber-100 hover:text-amber-50"
                        : "text-[#5a4231] hover:text-[#1f140c]"
                    }`}
                  >
                    原视频
                  </a>
                </p>
                <p
                  className={`mt-4 text-center text-sm leading-relaxed ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  部分朗读内容来自 YouTube 公开可嵌入视频，
                  <br />
                  版权归原作者所有。
                  <br />
                  本网站仅用于佛学修习与学习交流。
                </p>
              </section>
            </div>
          ) : isBuddhistMusicMode ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-4 pt-1">
              <div className="w-full text-center">
                <h2
                  className={`text-2xl font-semibold leading-normal ${
                    isDark ? "text-amber-100" : "text-[#2b1d12]"
                  }`}
                >
                  佛乐欣赏
                </h2>
                <div
                  className={`mx-auto mt-2 h-px w-24 ${
                    isDark ? "bg-amber-200/30" : "bg-[#d8b66a]"
                  }`}
                />
              </div>
              <section
                className={`w-full min-w-0 rounded border p-3 shadow-sm sm:p-4 ${
                  isDark
                    ? "border-amber-200/30 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "border-[#d8b66a] bg-[#fff8e8] text-[#2b1d12] shadow-[0_18px_45px_rgba(91,58,22,0.12)]"
                }`}
              >
                <h3 className="mb-4 text-center text-[28px] font-semibold leading-normal">
                  {selectedBuddhistMusic.heading}
                </h3>
                <div
                  className={`overflow-hidden rounded border ${
                    isDark ? "border-amber-200/35" : "border-[#d8b66a]"
                  }`}
                >
                  <div className="aspect-video w-full min-w-0">
                    <iframe
                      src={selectedBuddhistMusic.embedUrl}
                      title={selectedBuddhistMusic.heading}
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
                <p
                  className={`mt-3 text-center text-sm ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  来源：YouTube
                  <span className="mx-2">｜</span>
                  <a
                    href={selectedBuddhistMusic.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline underline-offset-4 transition ${
                      isDark
                        ? "text-amber-100 hover:text-amber-50"
                        : "text-[#5a4231] hover:text-[#1f140c]"
                    }`}
                  >
                    原视频
                  </a>
                </p>
                <p
                  className={`mt-4 text-center text-sm leading-relaxed ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  佛乐内容来自 YouTube 公开可嵌入视频，
                  <br />
                  版权归原作者所有。
                </p>
              </section>
            </div>
          ) : isBackgroundMusicMode ? (
            <div className="flex w-full min-w-0 flex-col items-stretch gap-4 pt-1">
              <div className="w-full text-center">
                <h2
                  className={`text-2xl font-semibold leading-normal ${
                    isDark ? "text-amber-100" : "text-[#2b1d12]"
                  }`}
                >
                  背景音乐
                </h2>
                <div
                  className={`mx-auto mt-2 h-px w-24 ${
                    isDark ? "bg-amber-200/30" : "bg-[#d8b66a]"
                  }`}
                />
              </div>
              <section
                className={`w-full min-w-0 rounded border p-3 shadow-sm sm:p-4 ${
                  isDark
                    ? "border-amber-200/30 bg-[#211f1c] text-stone-100 shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                    : "border-[#d8b66a] bg-[#fff8e8] text-[#2b1d12] shadow-[0_18px_45px_rgba(91,58,22,0.12)]"
                }`}
              >
                <h3 className="mb-4 text-center text-[28px] font-semibold leading-normal">
                  {selectedBackgroundMusic.heading}
                </h3>
                <div
                  className={`overflow-hidden rounded border ${
                    isDark ? "border-amber-200/35" : "border-[#d8b66a]"
                  }`}
                >
                  <div className="aspect-video w-full min-w-0">
                    <iframe
                      src={selectedBackgroundMusic.embedUrl}
                      title={selectedBackgroundMusic.heading}
                      className="h-full w-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
                <p
                  className={`mt-3 text-center text-sm ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  来源：YouTube
                  <span className="mx-2">｜</span>
                  <a
                    href={selectedBackgroundMusic.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline underline-offset-4 transition ${
                      isDark
                        ? "text-amber-100 hover:text-amber-50"
                        : "text-[#5a4231] hover:text-[#1f140c]"
                    }`}
                  >
                    原视频
                  </a>
                </p>
                <p
                  className={`mt-4 text-center text-sm leading-relaxed ${
                    isDark ? "text-stone-400" : "text-[#433024]"
                  }`}
                >
                  背景音乐来自 YouTube 公开可嵌入视频，
                  <br />
                  版权归原作者所有。
                </p>
              </section>
            </div>
          ) : isDrawingMode ? (
            <div className="flex flex-col gap-5 pt-1">
              <section className="buddha-drawing-toolbar no-print flex flex-col gap-4 rounded border border-[#d9c7a3] bg-[#fff8e8] p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openStudySelector("drawing")}
                    className={drawingToolbarPrimaryButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-8 w-8 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    <span>选择佛像描绘</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 overflow-visible">
                  <span
                    className="buddha-drawing-toolbar-label drawing-toolbar-text shrink-0 text-[26px]"
                    style={drawingToolbarLabelStyle}
                  >
                    笔颜色
                  </span>
                  {drawingColors.map((color) => (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => {
                        setDrawingColor(color.value);
                        setDrawingTool("brush");
                      }}
                      className={`inline-flex items-center gap-2 ${
                        drawingTool === "brush" && drawingColor === color.value
                          ? drawingToolbarSelectedButtonClasses
                          : drawingToolbarButtonClasses
                      }`}
                      style={drawingToolbarFontStyle}
                    >
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded-full border border-[rgba(60,42,24,0.55)]"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="whitespace-nowrap">{color.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 overflow-visible">
                  <span
                    className="buddha-drawing-toolbar-label drawing-toolbar-text shrink-0 text-[26px]"
                    style={drawingToolbarLabelStyle}
                  >
                    笔粗细
                  </span>
                  {drawingStrokeSizes.map((size) => (
                    <button
                      key={size.key}
                      type="button"
                      onClick={() => setDrawingStrokeSize(size.key)}
                      className={
                        drawingStrokeSize === size.key
                          ? drawingToolbarSelectedButtonClasses
                          : drawingToolbarButtonClasses
                      }
                      style={drawingToolbarFontStyle}
                    >
                      {size.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDrawingTool("eraser")}
                    className={
                      drawingTool === "eraser"
                        ? drawingToolbarSelectedButtonClasses
                        : drawingToolbarButtonClasses
                    }
                    style={drawingToolbarFontStyle}
                  >
                    橡皮擦
                  </button>
                  <button
                    type="button"
                    onClick={restartDrawing}
                    className={drawingToolbarButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    重新开始
                  </button>
                  <button
                    type="button"
                    onClick={saveDrawing}
                    className={drawingToolbarButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    保存作品
                  </button>
                  <button
                    type="button"
                    onClick={continueDrawing}
                    className={drawingToolbarButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    继续上次描绘
                  </button>
                  <button
                    type="button"
                    onClick={printDrawing}
                    className={drawingToolbarButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    打印作品
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(isDark ? "light" : "dark")}
                    className={drawingToolbarButtonClasses}
                    style={drawingToolbarFontStyle}
                  >
                    深色模式
                  </button>
                </div>
              </section>

              <div
                className={`grid gap-4 ${
                  drawingSelectorOpen
                    ? "lg:grid-cols-[320px_minmax(0,1fr)]"
                    : "grid-cols-1"
                }`}
              >
                {drawingSelectorOpen ? (
                  <aside
                    className="project-choice-menu drawing-study-menu no-print flex flex-col gap-2 rounded border border-[#d9c7a3] bg-[#fff8e8] p-4 shadow-sm"
                    style={drawingStudyMenuTextStyle}
                  >
                    {buddhaDrawings.map((drawing) => (
                      <button
                        key={drawing.id}
                        type="button"
                        onClick={() => selectDrawing(drawing)}
                        className={drawingStudyMenuButtonClasses(
                          selectedDrawing.id === drawing.id,
                        )}
                        style={{
                          ...drawingStudyMenuTextStyle,
                          ...projectMenuOptionStyle(drawing.title),
                        }}
                      >
                        <span
                          className="block whitespace-nowrap"
                          style={drawingStudyMenuTextStyle}
                        >
                          {drawing.title}
                        </span>
                      </button>
                    ))}
                  </aside>
                ) : null}

                <section className="printable-buddha-art min-w-0 rounded border border-[#d9c7a3] bg-[#fffdf6] p-5 text-[#2b1d12] shadow-sm">
                <div className="mb-4 text-center">
                  <h2 className="text-[28px] font-semibold leading-normal">
                    {selectedDrawing.title}
                  </h2>
                  <p className="text-sm text-[#5a4231]">
                    静心描佛 · 已描绘作品
                  </p>
                </div>

                <div className="w-full min-w-0 rounded border border-[#e2d2ad] bg-white p-3">
                  <p className="mb-3 text-center text-sm text-[#5a4231]">
                    这里将显示：{selectedDrawing.title}线稿
                  </p>

                  <div
                    className={`relative ${drawingCanvasAspectClass} w-full touch-none select-none overflow-hidden rounded bg-[#fffdf8]`}
                  >
                    {/* The SVG must stay as a plain image so it aligns exactly under the canvas overlay. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedDrawing.svgPath}
                      alt={`${selectedDrawing.title}线稿`}
                      className="absolute inset-0 h-full w-full object-contain"
                      draggable={false}
                    />
                    <svg
                      viewBox="0 0 600 640"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                    >
                      <g
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {selectedDrawingLinePaths.map((path, index) => (
                          <path
                            key={`outline-${index}`}
                            ref={(element) => {
                              drawingPathRefs.current[index] = element;
                            }}
                            d={path}
                          />
                        ))}
                      </g>
                    </svg>
                    <canvas
                      ref={drawingCanvasRef}
                      width={600}
                      height={640}
                      className="absolute inset-0 h-full w-full touch-none"
                      onPointerDown={startCanvasDrawing}
                      onPointerMove={moveCanvasDrawing}
                      onPointerUp={stopCanvasDrawing}
                      onPointerCancel={stopCanvasDrawing}
                      onPointerLeave={stopCanvasDrawing}
                    />
                  </div>
                </div>
                </section>
              </div>
            </div>
          ) : isCopyPhraseMode ? (
            <div
              className={`${isChantMode ? "chant-copy-workspace " : ""}${isMantraMode ? "mantra-copy-workspace " : ""}flex flex-col gap-6 pt-1`}
              style={
                isChantMode
                  ? chantCopyTextStyle
                  : isMantraMode
                    ? mantraCopyTextStyle
                    : undefined
              }
            >
              <section className="flex flex-col gap-3">
                {isMantraMode ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-[24px] font-semibold leading-snug">
                      {selectedMantra.title}
                    </p>
                    <p
                      className={`text-base leading-normal ${
                        isDark ? "text-stone-400" : "text-[#433024]"
                      }`}
                    >
                      {selectedMantra.intro}
                    </p>
                  </div>
                ) : null}
                <p
                  className={`max-w-none text-[32px] font-semibold leading-snug tracking-normal ${
                    isDark ? "text-stone-100" : "text-[#2b1d12]"
                  }`}
                  lang="zh-CN"
                >
                  {currentCopyText}
                </p>
                <textarea
                  ref={isMantraMode ? mantraTextareaRef : chantTextareaRef}
                  aria-label={`${currentCopyUnit}抄写输入区`}
                  value={currentCopyAnswer}
                  onChange={(event) =>
                    isMantraMode
                      ? updateMantraAnswer(event.target.value)
                      : updateChantAnswer(event.target.value)
                  }
                  spellCheck={false}
                  autoCorrect="off"
                  className={`min-h-[160px] w-full resize-y rounded border-2 p-6 font-semibold leading-[1.8] tracking-normal outline-none transition focus:shadow-[0_0_0_4px_rgba(139,111,71,0.18)] ${
                    isDark
                      ? currentCopyAnswer.trim().length > 0
                        ? normalizeCopyText(currentCopyAnswer) ===
                          normalizeCopyText(currentCopyText)
                          ? "border-emerald-700 bg-[#211f1c] text-[#f5f1e8] caret-[#f5f1e8]"
                          : "border-amber-700 bg-[#211f1c] text-[#f5f1e8] caret-[#f5f1e8]"
                        : "border-stone-600 bg-[#211f1c] text-[#f5f1e8] caret-[#f5f1e8] placeholder:text-stone-400 focus:border-[#5b3a16]"
                      : currentCopyAnswer.trim().length > 0
                        ? normalizeCopyText(currentCopyAnswer) ===
                          normalizeCopyText(currentCopyText)
                          ? "border-emerald-600 bg-[#fffdf6] text-[#2b1d12] caret-[#2b1d12]"
                          : "border-amber-600 bg-[#fffdf6] text-[#2b1d12] caret-[#2b1d12]"
                        : "border-[#8b6f47] bg-[#fffdf6] text-[#2b1d12] caret-[#2b1d12] placeholder:text-[#5a4231] focus:border-[#5b3a16]"
                  }`}
                  style={{
                    fontFamily:
                      '"Microsoft YaHei", "SimSun", "Noto Serif SC", serif',
                    fontSize,
                  }}
                  placeholder={`在这里抄写${currentCopyUnit}`}
                />
              </section>

              {isMantraMode ? (
                <div className="mantra-copy-actions flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={goToPreviousMantraLine}
                    disabled={!canGoPreviousMantraLine}
                    className={`h-10 rounded px-4 text-base transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonClasses}`}
                  >
                    上一句
                  </button>
                  <button
                    type="button"
                    onClick={goToNextMantraLine}
                    disabled={!canGoNextMantraLine}
                    className={`h-10 rounded px-4 text-base transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonClasses}`}
                  >
                    下一句
                  </button>
                  <button
                    type="button"
                    onClick={restart}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    重新开始
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(isDark ? "light" : "dark")}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    深色模式
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFontSize((size) =>
                        Math.min(size + FONT_STEP, MAX_FONT_SIZE),
                      )
                    }
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    字体变大
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFontSize((size) =>
                        Math.max(size - FONT_STEP, MIN_FONT_SIZE),
                      )
                    }
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    字体变小
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentPosition}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    保存此位置
                  </button>
                  <button
                    type="button"
                    onClick={continueLastPosition}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    继续上次抄写
                  </button>
                  <button
                    type="button"
                    onClick={readCurrentSentence}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    朗读此句
                  </button>
                  <button
                    type="button"
                    onClick={stopReading}
                    className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
                  >
                    停止朗读
                  </button>
                </div>
              ) : null}

              <section
                className={`${isChantMode || isMantraMode ? "chant-copy-counter-panel " : ""}rounded border-2 border-[#d8c6a6] bg-[#fffaf0] p-5 text-[#2b1d12] shadow-sm`}
              >
                <div className="mb-5 flex flex-nowrap items-center gap-3 text-[20px] font-semibold leading-tight">
                  <span className="min-w-[70px] text-center text-[28px] font-bold">
                    {currentCopyCompletedCount}
                  </span>
                  <span>已抄写</span>
                  <span>遍{currentCopyUnit}</span>
                </div>

                <div className="flex flex-col gap-3 text-[18px] font-semibold leading-normal">
                  {chantCounters.map((counter) => (
                    <div
                      key={counter.key}
                      className="flex flex-nowrap items-center gap-4 border-t border-[#d8c6a6] pt-3"
                    >
                      <span className="min-w-[130px] whitespace-nowrap">
                        {isMantraMode
                          ? counter.label.replace("佛号", "咒语")
                          : counter.label}
                        ：
                      </span>
                      <span className="whitespace-nowrap">至今</span>
                      <span className="min-w-[54px] text-center text-[20px] font-bold">
                        {currentCopyTotals[counter.key]}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          isMantraMode
                            ? startMantraCounter(counter.key)
                            : startChantCounter(counter.key)
                        }
                        className="whitespace-nowrap rounded border border-[#d8c6a6] bg-[#fffdf6] px-3 py-1.5 text-[16px] font-semibold text-[#2b1d12] transition hover:bg-[#f7eddb] hover:text-[#1f140c]"
                      >
                        开始累计
                      </button>
                      <button
                        type="button"
                        onClick={isMantraMode ? saveMantraCounter : saveChantCounter}
                        className="whitespace-nowrap rounded border border-[#d8c6a6] bg-[#fffdf6] px-3 py-1.5 text-[16px] font-semibold text-[#2b1d12] transition hover:bg-[#f7eddb] hover:text-[#1f140c]"
                      >
                        保存累计
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          isMantraMode
                            ? clearMantraCounter(counter.key)
                            : clearChantCounter(counter.key)
                        }
                        className="whitespace-nowrap rounded border border-[#d8c6a6] bg-[#fffdf6] px-3 py-1.5 text-[16px] font-semibold text-[#2b1d12] transition hover:bg-[#f7eddb] hover:text-[#1f140c]"
                      >
                        清空累计
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div
              className="scripture-copy-workspace mt-1 flex flex-col gap-4 pt-6"
              style={scriptureCopyTextStyle}
            >
              <div
                className={`scripture-copy-heading flex flex-col gap-3 rounded border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  isDark
                    ? "border-stone-700 bg-[#211f1c] text-stone-100"
                    : "border-[#d9c7a3] bg-[#fff8e8] text-[#2b1d12]"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="scripture-copy-heading-title">
                    {currentBook.title}
                  </span>
                  {currentBook.translator ? (
                    <span className="scripture-copy-heading-meta">
                      译者：{currentBook.translator}
                    </span>
                  ) : null}
                  {currentChapterTitle ? (
                    <span className="scripture-copy-heading-chapter">
                      {currentChapterTitle}
                    </span>
                  ) : null}
                </div>
                <span className="scripture-copy-heading-progress shrink-0">
                  第 {currentIndex + 1} / {currentSentences.length} 句
                </span>
              </div>

              <div>
                <p
                  className={`max-w-none text-[28px] font-medium leading-snug tracking-normal ${
                    isDark ? "text-stone-100" : "text-[#1f140c]"
                  }`}
                  lang="zh-CN"
                >
                  {currentScripture.original}
                </p>
              </div>

              <textarea
                ref={textareaRef}
                aria-label="抄写输入区"
                value={currentAnswer}
                onChange={(event) => {
                  updateCurrentAnswer(event.target.value);
                  refreshScriptureSuggestions(
                    event.target.value,
                    event.target.selectionStart,
                  );
                }}
                onCompositionStart={() => {
                  scriptureInputComposingRef.current = true;
                  setScriptureSuggestionTarget(null);
                }}
                onCompositionEnd={(event) => {
                  scriptureInputComposingRef.current = false;
                  refreshScriptureSuggestions(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart,
                  );
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    goToNextSentence();
                  }
                }}
                onKeyUp={(event) => {
                  refreshScriptureSuggestions(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart,
                  );
                }}
                onClick={(event) => {
                  refreshScriptureSuggestions(
                    event.currentTarget.value,
                    event.currentTarget.selectionStart,
                  );
                }}
                spellCheck={false}
                autoCorrect="off"
                className={`h-[250px] w-full resize-y rounded-[18px] border p-7 font-medium leading-[1.8] tracking-normal outline-none transition focus:border-[#a77f45] focus:shadow-[0_0_0_4px_rgba(167,127,69,0.13)] ${
                  isDark
                    ? "border-stone-700/80 bg-[#211f1c] text-[#f5f1e8] caret-[#f5f1e8] placeholder:text-stone-500"
                    : "border-[rgba(185,158,110,0.52)] bg-[rgba(255,250,240,0.9)] text-[#2b1d12] caret-[#2b1d12] placeholder:text-[#5a4231]"
                }`}
                style={{
                  fontFamily:
                    '"Noto Serif SC", "Songti SC", "SimSun", serif',
                  fontSize,
                }}
                placeholder="在这里抄写当前经文"
              />
              {scriptureInputSuggestions.length > 0 ? (
                <div
                  className={`flex flex-wrap items-center gap-2 rounded-[14px] border px-3 py-2 ${
                    isDark
                      ? "border-stone-700/80 bg-[#211f1c] text-stone-100"
                      : "border-[rgba(185,158,110,0.45)] bg-[rgba(255,252,245,0.86)] text-[#2b1d12]"
                  }`}
                >
                  <span
                    className={`text-[15px] ${
                      isDark ? "text-stone-400" : "text-[#5a4231]"
                    }`}
                  >
                    候选
                  </span>
                  {scriptureInputSuggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.category}-${suggestion.text}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyScriptureSuggestion(suggestion)}
                      className={`rounded-full border px-3 py-1.5 text-[18px] font-semibold leading-none transition ${
                        isDark
                          ? "border-amber-200/25 bg-amber-100/10 text-amber-100 hover:bg-amber-100/18"
                          : "border-[rgba(167,127,69,0.38)] bg-[#fffaf0] text-[#2b1d12] hover:bg-[#f7eddb]"
                      }`}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {!isCopyPhraseMode &&
          !isDrawingMode &&
          !isSutraReadingMode &&
          !isBuddhaNameRecitationMode &&
          !isMantraRecitationMode &&
          !isBuddhistMusicMode &&
          !isBackgroundMusicMode ? (
            <div className="scripture-copy-actions flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    stopExplanationAudio();
                    setCurrentIndex((index) =>
                      clampIndex(index - 1, currentSentences.length - 1),
                    );
                  }}
                  disabled={!canGoPrevious}
                  className={`h-10 rounded px-4 text-base transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonClasses}`}
                >
                  上一句
                </button>
                <button
                  type="button"
                  onClick={goToNextSentence}
                  disabled={!canGoNext}
                  className={`h-10 rounded px-4 text-base transition disabled:cursor-not-allowed disabled:opacity-40 ${buttonClasses}`}
                >
                  下一句
                </button>
              <button
                type="button"
                onClick={restart}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                重新开始
              </button>
              <button
                type="button"
                onClick={() => setMode(isDark ? "light" : "dark")}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                深色模式
              </button>
              <button
                type="button"
                onClick={() =>
                  setFontSize((size) => Math.min(size + FONT_STEP, MAX_FONT_SIZE))
                }
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                字体变大
              </button>
              <button
                type="button"
                onClick={() =>
                  setFontSize((size) => Math.max(size - FONT_STEP, MIN_FONT_SIZE))
                }
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                字体变小
              </button>
              <button
                type="button"
                onClick={saveCurrentPosition}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                保存此位置
              </button>
              <button
                type="button"
                onClick={continueLastPosition}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                继续上次抄写
              </button>
              <button
                type="button"
                onClick={readCurrentSentence}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                朗读此句
              </button>
              <button
                type="button"
                onClick={stopReading}
                className={`h-10 rounded px-4 text-base transition ${buttonClasses}`}
              >
                停止朗读
              </button>
            </div>
          ) : null}

          {notice ? (
            <p
              className={`${isScriptureMode ? "scripture-copy-notice " : ""}${isChantMode || isMantraMode ? "chant-copy-notice " : ""}text-[20px] leading-normal ${
                isDark ? "text-amber-200" : "text-[#2b1d12]"
              }`}
            >
              {notice}
            </p>
          ) : null}

          {!isCopyPhraseMode &&
          !isDrawingMode &&
          !isSutraReadingMode &&
          !isBuddhaNameRecitationMode &&
          !isMantraRecitationMode &&
          !isBuddhistMusicMode &&
          !isBackgroundMusicMode ? (
            <article
              className={`scripture-copy-explanation w-full rounded border p-7 text-[24px] leading-[2] tracking-normal ${
                isDark
                  ? "border-stone-700 bg-[#211f1c] text-stone-100"
                  : "border-[#d9c7a3] bg-[#fff8e8] text-[#2b1d12]"
              }`}
            >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[28px] font-semibold leading-normal">
                每一句经文的详细解释
              </h2>
              <button
                type="button"
                onClick={playExplanationAudio}
                disabled={isCurrentExplanationLoading}
                aria-pressed={isCurrentExplanationPlaying}
                className={`inline-flex h-8 items-center gap-2 rounded px-3 text-[15px] leading-none transition duration-200 disabled:cursor-wait disabled:opacity-80 ${explanationListenButtonClasses}`}
              >
                {isCurrentExplanationPlaying ? (
                  <>
                    <span className="text-[13px] text-white">⏸</span>
                    <span>正在播放</span>
                  </>
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white"
                    />
                    <span>
                      {isCurrentExplanationLoading
                        ? "正在准备"
                        : isCurrentExplanationPaused
                          ? "继续播放"
                          : "听解释"}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div
              ref={explanationContentRef}
              data-explanation-full-content
              className={`space-y-6 rounded px-2 py-1 transition-colors duration-500 ${
                isCurrentExplanationPlaying
                  ? isDark
                    ? "bg-[#4a3724]/28"
                    : "bg-[#f3dcae]/34"
                  : "bg-transparent"
              }`}
            >
              <section
                className={`space-y-9 rounded border px-5 py-6 ${
                  isDark
                    ? "border-stone-700/80 bg-[#f8f0df]/92 text-[#1f140c]"
                    : "border-[#dcc89f]/80 bg-[#fffdf6]/78 text-[#2b1d12]"
                }`}
              >
                {detailExplanationBlocks.map((block, blockIndex) => (
                  <div
                    key={`detail-block-${blockIndex}-${block.phrase}`}
                    className={blockIndex === 0 ? "" : "border-t border-[#dcc89f]/80 pt-7"}
                  >
                    <p className="whitespace-pre-wrap break-words text-[26px] font-black leading-[1.9] text-black">
                      {block.phrase}
                    </p>

                    <p className="mt-4 whitespace-pre-wrap break-words text-[22px] leading-[2] text-[#0000ff]">
                      {block.explanation}
                    </p>

                    <div className="mt-5 space-y-3 text-[20px] leading-[2] text-[#2b1d12]">
                      {block.terms.length > 0 ? (
                        block.terms.map((term) => (
                          <p key={`term-${blockIndex}-${term.name}`}>
                            <span className="font-semibold text-[#7b3fb0]">
                              {term.name}：
                            </span>
                            {term.meaning}
                          </p>
                        ))
                      ) : null}
                    </div>
                  </div>
                ))}
              </section>
            </div>
            </article>
          ) : null}
        </section>

          <footer
            className={`no-print mt-8 border-t px-4 pb-7 pt-5 text-center transition-colors ${
              isDark
                ? "border-stone-700/80 text-stone-300"
                : "border-[rgba(185,158,110,0.42)] text-[#5a4231]"
            }`}
          >
            <p className="text-[13px] leading-relaxed">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
            <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed">
              {"本网站部分链接为 Amazon 联盟链接。\n您通过这些链接购买商品时，\n本站可能获得少量佣金，\n但不会增加您的购买成本。"}
            </p>
          </footer>
        </div>

        <AdColumn
          slots={adSlots.right}
          isDark={isDark}
          side="right"
          slotCount={renderedAdSlotCount}
        />
      </div>
    </main>
  );
}

