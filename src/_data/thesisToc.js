// Builds the thesis outline from the Markdown files in src/thesis/.
// Used by the sidebar, the ToC on /thesis.html, the prev/next pager, the
// cross-chapter link rewriting and the lists of figures/tables/code snippets.
//
// Front matter of a page in src/thesis/:
//   title:   page title
//   chapter: chapter number (chapters only)
//   part:    "front" | "back" (non-chapter pages)
//   order:   position within its part
//   toc:     optional list of in-page anchors to show in the sidebar, e.g.
//            toc: "figures=List of Figures|tables=List of Tables"
const fs = require("fs");
const path = require("path");

const CHAPTER_DIR = path.join(__dirname, "..", "thesis");
const LANDING = { url: "/thesis.html", title: "Title & Abstract", file: path.join(__dirname, "..", "thesis.md") };

const HEADING = /^(#{1,4}) (\d+(?:\.\d+)*)\.? (.*?)\s*\{id="([^"]+)"\}\s*$/;
const ANY_ID = /(?:\{id="|\sid=")([^"]+)"/g;
const FIGURE = /<figure id="((?:fig|tab|lst):[^"]+)"[\s\S]*?<\/figure>/g;
const CAPTION = /<strong>\s*(Figure|Table|Code Snippet)\s*([A-Z]?[\d.]*\d)\s*:?\s*<\/strong>\s*:?\s*([\s\S]*?)<\/figcaption>/;

function cleanTitle(s) {
    return s
        .replace(/\{\{ "([^"]+)" \| abbr \| safe \}\}/g, "$1")
        .replace(/\[\^[^\]]+\]/g, "")
        .replace(/[*_`]/g, "")
        .trim();
}

function frontMatter(src) {
    const m = src.match(/^---\n([\s\S]*?)\n---/);
    const data = {};
    if (m) {
        for (const line of m[1].split("\n")) {
            const kv = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
            if (kv) data[kv[1]] = kv[2];
        }
    }
    return data;
}

function build() {
    const ids = {};
    for (const [, id] of fs.readFileSync(LANDING.file, "utf8").matchAll(ANY_ID)) ids[id] = LANDING.url;

    const pages = fs.readdirSync(CHAPTER_DIR).filter(f => f.endsWith(".md")).map(file => {
        const src = fs.readFileSync(path.join(CHAPTER_DIR, file), "utf8");
        const fm = frontMatter(src);
        const url = `/thesis/${file.replace(/\.md$/, "")}.html`;
        const isChapter = fm.chapter !== undefined;
        const entry = {
            url,
            title: cleanTitle(fm.title || file),
            num: isChapter ? String(fm.chapter) : "",
            id: fm.chapterId,
            part: isChapter ? "main" : (fm.part || "back"),
            order: Number(isChapter ? fm.chapter : fm.order || 0),
            sections: [],
            figures: [],
        };
        if (fm.toc) {
            entry.sections = fm.toc.split("|").map(pair => {
                const [anchor, label] = pair.split("=");
                return { num: "", title: label, id: anchor, url: `${url}#${anchor}`, children: [] };
            });
        }

        let inFence = false;
        for (const line of src.split("\n")) {
            if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
            if (inFence) continue;
            const m = line.match(HEADING);
            if (!m) continue;
            const level = m[1].length;
            const item = { num: m[2], title: cleanTitle(m[3]), id: m[4], url: `${url}#${m[4]}`, children: [] };
            if (level === 2) entry.sections.push(item);
            else if (level === 3 && entry.sections.length) entry.sections.at(-1).children.push(item);
        }

        for (const fig of src.matchAll(FIGURE)) {
            const cap = fig[0].match(CAPTION);
            if (!cap) continue;
            entry.figures.push({
                id: fig[1], kind: cap[1], num: cap[2],
                caption: cap[3].replace(/\s+/g, " ").trim(),
                url: `${url}#${fig[1]}`,
                img: (fig[0].match(/<img[\s\S]*?src="([^"]+)"/) || [])[1],
                alt: (fig[0].match(/<img[\s\S]*?alt="([^"]*)"/) || [])[1],
            });
        }

        for (const [, id] of src.matchAll(ANY_ID)) if (!(id in ids)) ids[id] = url;
        return entry;
    });

    const byOrder = (a, b) => a.order - b.order;
    const front = pages.filter(p => p.part === "front").sort(byOrder);
    const chapters = pages.filter(p => p.part === "main").sort(byOrder);
    const back = pages.filter(p => p.part === "back").sort(byOrder);

    // Linear reading order for the prev/next pager
    const linear = [{ url: LANDING.url, title: LANDING.title }]
        .concat(front.map(p => ({ url: p.url, title: p.title })))
        .concat(chapters.map(c => ({ url: c.url, title: `${c.num}. ${c.title}` })))
        .concat(back.map(p => ({ url: p.url, title: p.title })));

    const figures = chapters.concat(back).flatMap(p => p.figures);

    // Appendix B re-displays figures via {% appendixFigures "fig:a", ... %}
    for (const p of back) {
        const src = fs.readFileSync(path.join(CHAPTER_DIR, p.url.split("/").pop().replace(/\.html$/, ".md")), "utf8");
        const call = src.match(/\{%\s*appendixFigures\s+([\s\S]*?)%\}/);
        if (!call) continue;
        [...call[1].matchAll(/"([^"]+)"/g)].forEach(([, id], i) => {
            const f = figures.find(x => x.id === id);
            if (!f) return;
            const n = `B.${i + 1}`;
            figures.push({ ...f, id: `fig:appendix-${n}`, num: n, url: `${p.url}#fig:appendix-${n}`,
                caption: `Enlarged view of ${f.caption}` });
        });
    }

    return { front, chapters, back, pages: linear, ids, figures };
}

module.exports = build;
module.exports.build = build;
