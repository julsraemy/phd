// Builds the thesis outline from the chapter Markdown files in src/thesis/.
// Used by the sidebar, the ToC on /thesis.html, the prev/next pager and the
// cross-chapter link rewriting in .eleventy.js.
const fs = require("fs");
const path = require("path");

const CHAPTER_DIR = path.join(__dirname, "..", "thesis");
const LANDING = { url: "/thesis.html", title: "Title & Abstract", file: path.join(__dirname, "..", "thesis.md") };

const HEADING = /^(#{1,4}) (\d+(?:\.\d+)*)\.? (.*?)\s*\{id="([^"]+)"\}\s*$/;
const ANY_ID = /(?:\{id="|\sid=")([^"]+)"/g;

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

    const files = fs.readdirSync(CHAPTER_DIR).filter(f => /^\d+-.*\.md$/.test(f)).sort();
    const chapters = files.map(file => {
        const src = fs.readFileSync(path.join(CHAPTER_DIR, file), "utf8");
        const fm = frontMatter(src);
        const url = `/thesis/${file.replace(/\.md$/, "")}.html`;
        const chapter = { num: String(fm.chapter), title: cleanTitle(fm.title), id: fm.chapterId, url, sections: [] };

        let inFence = false, inPre = false;
        for (const line of src.split("\n")) {
            if (/^\s*```/.test(line)) inFence = !inFence;
            if (/<pre[\s>]/.test(line)) inPre = true;
            if (/<\/pre>/.test(line)) { inPre = false; continue; }
            if (inFence || inPre) continue;
            const m = line.match(HEADING);
            if (!m) continue;
            const level = m[1].length;
            const entry = { num: m[2], title: cleanTitle(m[3]), id: m[4], url: `${url}#${m[4]}`, children: [] };
            if (level === 2) chapter.sections.push(entry);
            else if (level === 3 && chapter.sections.length) chapter.sections.at(-1).children.push(entry);
        }

        for (const [, id] of src.matchAll(ANY_ID)) if (!(id in ids)) ids[id] = url;
        return chapter;
    });

    // Linear reading order for the prev/next pager
    const pages = [{ url: LANDING.url, title: LANDING.title }]
        .concat(chapters.map(c => ({ url: c.url, title: `${c.num}. ${c.title}` })));

    return { chapters, pages, ids };
}

module.exports = build;
module.exports.build = build;
