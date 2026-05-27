from __future__ import annotations

import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


DOCX = Path("source-ksitigarbha.docx")
OUT_DIR = Path("app/data/ksitigarbha")

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

GLOSSARY = {
    "如是我闻": "佛经常见开头，表示这是弟子亲耳听佛说法，后来如实记录下来。",
    "忉利天": "佛教所说欲界第二层天，又称三十三天；《地藏经》第一品的法会发生在这里。",
    "菩萨": "发愿追求觉悟、并愿意帮助众生离苦得乐的人。",
    "菩萨摩诃萨": "“摩诃萨”意为大菩萨，指愿力广大、修行深厚的菩萨。",
    "地藏菩萨": "以救度罪苦众生、特别是地狱众生为大愿的菩萨。",
    "本愿": "最根本、最坚定的大愿，是菩萨长期修行的核心方向。",
    "摩诃萨": "大菩萨，表示愿心、慈悲和智慧都非常广大。",
    "三千大千世界": "佛教宇宙观中极广大的世界体系，用来表示范围非常辽阔。",
    "劫": "佛教表示极长时间的单位，常用来说明修行和因果时间非常久远。",
    "十地": "菩萨修行的十个高阶位，表示智慧和功德逐步圆满。",
    "声闻": "听佛说法而修行、追求解脱的弟子类型，证果者常称阿罗汉。",
    "阿罗汉": "已经断除主要烦恼、获得解脱的修行圣者。",
    "辟支佛": "又称独觉，在没有佛住世时依观察因缘而觉悟的人。",
    "业": "身、口、意的行为力量；善恶行为会形成相应结果。",
    "业力": "过去行为形成的牵引力量，会影响当下和未来的遭遇。",
    "众生": "一切有情生命，包括人、天、鬼神、畜生等会感受苦乐的生命。",
    "六道": "天、人、阿修罗、畜生、饿鬼、地狱六种轮回生命状态。",
    "三宝": "佛、法、僧。佛是觉悟者，法是佛的教导，僧是依佛法修行的清净团体。",
    "五浊恶世": "众生烦恼重、见解混乱、寿命短促、时代混浊的世界状态。",
    "娑婆世界": "佛教称释迦牟尼佛教化的这个堪忍世界，也就是充满烦恼但可以修行的世界。",
    "天龙八部": "佛经中护持佛法的八类众生，包括天、龙、夜叉、乾闼婆、阿修罗等。",
    "无间地狱": "极重苦报的地狱，称“无间”是因受苦几乎没有间断。",
    "恶趣": "痛苦的生命去处，通常指地狱、饿鬼、畜生三恶道。",
    "因果": "有因必有果，善恶行为会在条件成熟时产生相应结果。",
    "供养": "以恭敬心奉献财物、时间、行为或修行功德，支持三宝或利益众生。",
    "布施": "愿意给予和分享，包括财物、帮助、安慰、知识和无畏。",
    "波罗蜜": "到彼岸的修行方法，帮助人从烦恼走向智慧和解脱。",
    "般若": "能看清人生和事物真相的深智慧，不只是普通聪明。",
    "禅定": "心安住、清明、不散乱的状态。",
    "神通": "修行或佛菩萨智慧慈悲所显现的特殊能力，不是修行的最终目标。",
    "如来": "佛的称号之一，表示圆满觉悟、如实而来的人。",
    "世尊": "佛的尊称，意思是世间最值得尊敬的觉悟者。",
    "法王子": "继承佛法智慧、能护持和弘扬正法的大菩萨称号。",
    "阿耨多罗三藐三菩提": "无上正等正觉，也就是圆满成佛的智慧。",
    "涅槃": "烦恼止息、超越生死痛苦的清凉安稳境界。",
    "阎浮提": "佛经中常指人间世界，尤其是我们所处的这个人类世界。",
    "由旬": "古印度距离单位，佛经中常用来表示很远的距离。",
    "夜叉": "佛经中的一类鬼神，有的护法，有的形象可怖。",
    "鬼王": "鬼神众中的首领或有力量者，经中常参与护法、问法或说明因果。",
    "像法": "佛灭度后佛法仍有形象和教法流传的时期。",
    "善根": "过去和现在积累的善因、信心、智慧和向善能力。",
    "正见": "正确的见解，特别是相信因果、明白善恶和修行方向。",
    "五蕴": "佛教对人的身心活动的五种分类：色、受、想、行、识。",
    "空": "不是没有，而是指一切都依因缘变化，没有永远固定不变的实体。",
    "阿僧祇": "佛经中表示极大数量的词，常用来形容时间或数量不可计数。",
    "那由他": "佛经中表示极大数量的词。",
    "四十九日": "佛教丧葬和超荐中常说的重要阶段，表示亡者随业转变的关键时期。",
}


def clean_text(text: str) -> str:
    replacements = {
        "\u00a0": " ",
        "\u3000": " ",
        "\t": " ",
        "「": "“",
        "」": "”",
        "『": "“",
        "』": "”",
        ";": "；",
        "?": "？",
        ":": "：",
        ",": "，",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"\s+", " ", text).strip()
    return text.replace(" ，", "，").replace(" 。", "。").replace(" ：", "：")


def read_paragraphs() -> list[dict[str, object]]:
    with ZipFile(DOCX) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    paragraphs: list[dict[str, object]] = []
    for paragraph in root.findall(".//w:body/w:p", NS):
        text = clean_text(
            "".join((node.text or "") for node in paragraph.findall(".//w:t", NS))
        )
        if not text:
            continue

        colors: list[str] = []
        for run in paragraph.findall("./w:r", NS):
            color = run.find("./w:rPr/w:color", NS)
            if color is not None:
                value = color.get(f"{{{NS['w']}}}val")
                if value:
                    colors.append(value)

        paragraphs.append(
            {
                "text": text,
                "is_original": "0000FF" not in set(colors or ["auto"]),
            }
        )
    return paragraphs


def is_chapter_title(text: str) -> bool:
    compact = text.replace(" ", "")
    return "品第" in compact and len(compact) <= 24 and compact[-1] in "一二三四五六七八九十"


def normalize_chapter_title(text: str) -> str:
    compact = text.replace(" ", "")
    return re.sub(r"[A-Za-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜüɡ]+", "", compact)


def split_original(text: str, max_len: int = 92) -> list[str]:
    parts = [part.strip() for part in re.split(r"(?<=[。！？；])", text) if part.strip()]
    chunks: list[str] = []
    current = ""

    for part in parts:
        if not current:
            current = part
        elif len(current) + len(part) <= max_len:
            current += part
        else:
            chunks.append(current)
            current = part

    if current:
        chunks.append(current)

    final: list[str] = []
    for chunk in chunks:
        if len(chunk) <= max_len + 20:
            final.append(chunk)
            continue

        buffer = ""
        for piece in re.split(r"(?<=[，、])", chunk):
            if not piece:
                continue
            if buffer and len(buffer) + len(piece) > max_len:
                final.append(buffer)
                buffer = piece
            else:
                buffer += piece
        if buffer:
            final.append(buffer)

    return final or [text]


def glossary_for(original: str, explanation: str) -> list[dict[str, str]]:
    haystack = original + "\n" + explanation
    items: list[dict[str, str]] = []
    seen: set[str] = set()

    for term, meaning in GLOSSARY.items():
        if term in haystack:
            items.append({"term": term, "meaning": meaning})
            seen.add(term)

    for match in re.finditer(r"([\u4e00-\u9fff]{2,12})：([^。\n]{6,120})", explanation):
        term = match.group(1).strip()
        meaning = match.group(2).strip() + "。"
        if term in seen:
            continue
        if term.startswith(("意思", "比如", "包括", "说明", "这里", "第一", "第二", "第三", "第四", "第五")):
            continue
        items.append({"term": term, "meaning": meaning})
        seen.add(term)

    return items[:10]


def build_chapters() -> list[dict[str, object]]:
    chapters: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    pending: dict[str, object] | None = None
    skip_originals = {"地藏 菩萨 本愿 经 卷上", "地藏菩萨本愿经卷中", "地藏菩萨本愿经卷下"}

    for paragraph in read_paragraphs():
        text = str(paragraph["text"])
        is_original = bool(paragraph["is_original"])

        if is_original and is_chapter_title(text):
            if pending and current:
                current["sentences"].append(pending)
                pending = None
            current = {"chapterTitle": normalize_chapter_title(text), "chapterIntro": "", "sentences": []}
            chapters.append(current)
            continue

        if current is None:
            continue
        if text in skip_originals or text.startswith("“恭请"):
            continue

        if is_original:
            if pending:
                current["sentences"].append(pending)
            pending = {"original": text, "explanation_parts": []}
        else:
            if pending:
                pending["explanation_parts"].append(text)
            elif not current["chapterIntro"]:
                current["chapterIntro"] = text
            else:
                current["chapterIntro"] += "\n" + text

    if pending and current:
        current["sentences"].append(pending)

    output: list[dict[str, object]] = []
    for chapter in chapters:
        sentences = []
        for item in chapter["sentences"]:
            original = str(item["original"])
            explanation = "\n".join(item["explanation_parts"]).strip()
            if not explanation:
                explanation = str(chapter.get("chapterIntro", "")).strip()
            if not explanation:
                explanation = "这一句为本品原文，解释内容将在后续版本继续补充。"

            chunks = split_original(original)
            for index, chunk in enumerate(chunks):
                sentence_explanation = explanation
                if len(chunks) > 1:
                    sentence_explanation = f"本句是原文长段拆分后的第 {index + 1} 小句。\n{explanation}"
                sentences.append(
                    {
                        "original": chunk,
                        "explanation": sentence_explanation,
                        "glossary": glossary_for(chunk, sentence_explanation),
                    }
                )
        output.append({"chapterTitle": str(chapter["chapterTitle"]), "sentences": sentences})

    return output


def write_typescript(chapters: list[dict[str, object]]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for path in OUT_DIR.glob("chapter-*.ts"):
        path.unlink()

    for index, chapter in enumerate(chapters, 1):
        const_name = f"chapter{index:02d}"
        content = "// This file is generated from 原文加解释 地藏菩萨本愿经.docx.\n"
        content += f"export const {const_name} = "
        content += json.dumps(chapter, ensure_ascii=False, indent=2)
        content += " as const;\n"
        (OUT_DIR / f"chapter-{index:02d}.ts").write_text(content, encoding="utf-8")

    imports = []
    names = []
    for index in range(1, len(chapters) + 1):
        imports.append(f'import {{ chapter{index:02d} }} from "./chapter-{index:02d}";')
        names.append(f"  chapter{index:02d},")

    index_ts = "\n".join(imports) + "\n\n"
    index_ts += "export type KsitigarbhaGlossaryItem = {\n  term: string;\n  meaning: string;\n};\n\n"
    index_ts += "export type KsitigarbhaSentence = {\n  original: string;\n  explanation: string;\n  glossary: KsitigarbhaGlossaryItem[];\n};\n\n"
    index_ts += "export type KsitigarbhaChapter = {\n  chapterTitle: string;\n  sentences: KsitigarbhaSentence[];\n};\n\n"
    index_ts += "export const ksitigarbhaSutra = {\n"
    index_ts += '  title: "地藏经",\n'
    index_ts += '  displayName: "《地藏菩萨本愿经》",\n'
    index_ts += "  chapters: [\n"
    index_ts += "\n".join(names)
    index_ts += "\n  ],\n} as const;\n\n"
    index_ts += "export const ksitigarbhaSentences = ksitigarbhaSutra.chapters.flatMap((chapter) =>\n"
    index_ts += "  chapter.sentences.map((sentence) => ({\n"
    index_ts += "    ...sentence,\n"
    index_ts += "    chapterTitle: chapter.chapterTitle,\n"
    index_ts += "  })),\n"
    index_ts += ");\n"
    (OUT_DIR / "index.ts").write_text(index_ts, encoding="utf-8")
    Path("app/data/ksitigarbha.ts").write_text('export * from "./ksitigarbha";\n', encoding="utf-8")


def main() -> None:
    chapters = build_chapters()
    if not chapters:
        raise RuntimeError("No chapters were detected in the DOCX.")
    write_typescript(chapters)
    print("chapters", len(chapters))
    for index, chapter in enumerate(chapters, 1):
        print(index, chapter["chapterTitle"], len(chapter["sentences"]))
    print("total", sum(len(chapter["sentences"]) for chapter in chapters))
    print(json.dumps(chapters[0]["sentences"][0], ensure_ascii=False, indent=2)[:1000])


if __name__ == "__main__":
    main()
