// Adds the full text of each chapter to its Linked Art record, as HTML in the
// `content` property (with `format: "text/html"`).
//
// Runs after the build (eleventy.after), so the text is taken from the final
// chapter pages: citations, cross-references and footnotes are already
// resolved. Site navigation is removed and all links are made absolute, so the
// HTML stands on its own outside the website.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SITE = "https://phd.julsraemy.ch";

function chapterHtml(file, pageUrl) {
    const { document } = new JSDOM(fs.readFileSync(file, "utf8")).window;
    const article = document.querySelector("article.thesis-content");
    if (!article) return null;

    article.querySelectorAll(".thesis-breadcrumb, .thesis-pager, script, .Z3988").forEach(el => el.remove());
    // Acronym links point to the site's acronym page: keep only the <abbr>
    article.querySelectorAll("a.acronym").forEach(a => a.replaceWith(...a.childNodes));
    article.querySelectorAll("*").forEach(el => {
        for (const attr of [...el.attributes]) {
            if (attr.name.startsWith("data-pagefind")) el.removeAttribute(attr.name);
        }
    });
    for (const [selector, attr] of [["[href]", "href"], ["[src]", "src"]]) {
        article.querySelectorAll(selector).forEach(el => {
            const value = el.getAttribute(attr);
            if (value && !/^(https?:|mailto:|data:)/.test(value)) el.setAttribute(attr, new URL(value, pageUrl).href);
        });
    }
    return article.innerHTML.replace(/\n\s*\n+/g, "\n").trim();
}

function addChapterText(outputDir) {
    const recordsDir = path.join(outputDir, "linked-art", "text", "thesis");
    if (!fs.existsSync(recordsDir)) return 0;
    let count = 0;
    for (const name of fs.readdirSync(recordsDir).filter(f => f.endsWith(".json"))) {
        const slug = name.replace(/\.json$/, "");
        const page = path.join(outputDir, "thesis", `${slug}.html`);
        if (!fs.existsSync(page)) continue;
        const recordFile = path.join(recordsDir, name);
        const record = JSON.parse(fs.readFileSync(recordFile, "utf8"));
        const html = chapterHtml(page, `${SITE}/thesis/${slug}.html`);
        if (!html) continue;
        // keep content/format after the descriptive properties for readability
        const { subject_of, ...rest } = record;
        const updated = { ...rest, format: "text/html", content: html, subject_of };
        fs.writeFileSync(recordFile, JSON.stringify(updated, null, 2));
        count++;
    }
    return count;
}

module.exports = { addChapterText };
