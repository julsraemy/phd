const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItAnchor = require("markdown-it-anchor");
const { JSDOM } = require("jsdom");
// Helper modules are (re)loaded at the start of every build so that edits to
// them take effect in the dev server (Node would otherwise keep them cached).
const HELPERS = ["./src/data/acronyms.json", "./src/_data/thesisToc.js", "./src/utils/citations.js", "./src/utils/acronyms.js", "./src/data/research.json", "./src/utils/research.js"];
let acronyms, thesisToc, citations, markAcronyms, acronymListHtml, research;
function loadHelpers() {
    for (const mod of HELPERS) delete require.cache[require.resolve(mod)];
    acronyms = require("./src/data/acronyms.json");
    thesisToc = require("./src/_data/thesisToc.js");
    citations = require("./src/utils/citations.js");
    ({ markAcronyms, acronymListHtml } = require("./src/utils/acronyms.js"));
    research = require("./src/utils/research.js");
}
loadHelpers();

function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const isThesisPage = url => url === "/thesis.html" || url.startsWith("/thesis/");

module.exports = function(eleventyConfig) {
    // RSS Feed
    eleventyConfig.addPlugin(pluginRss);

    // ------------------------------------------------------------------------
    // Markdown
    // ------------------------------------------------------------------------
    const markdownLibrary = markdownIt({
        html: true,
        linkify: true,
        typographer: true,
    }).use(markdownItAttrs)
    .use(markdownItAnchor)
    .use(markdownItFootnote);

    // Footnotes keep their source label (e.g. [^42] -> 42) instead of being
    // renumbered from 1 on every chapter page, so anchors (#fn42) stay stable.
    const fnLabel = token => String(token.meta.label ?? token.meta.id + 1);
    markdownLibrary.renderer.rules.footnote_anchor_name = (tokens, idx) => fnLabel(tokens[idx]);
    markdownLibrary.renderer.rules.footnote_caption = (tokens, idx) => {
        let n = fnLabel(tokens[idx]);
        if (tokens[idx].meta.subId > 0) n += `:${tokens[idx].meta.subId}`;
        return `[${n}]`;
    };
    markdownLibrary.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
        const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        const value = /^\d+$/.test(id) ? ` value="${id}"` : "";
        return `<li id="fn${id}" class="footnote-item"${value}>`;
    };

    // Open external links in a new tab
    const defaultRender = markdownLibrary.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };
    markdownLibrary.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        const hrefIndex = tokens[idx].attrIndex('href');
        if (hrefIndex >= 0) {
            const href = tokens[idx].attrs[hrefIndex][1];
            if (href.startsWith('http') && !href.includes('phd.julsraemy.ch')) {
                tokens[idx].attrPush(['target', '_blank']);
                tokens[idx].attrPush(['rel', 'noopener noreferrer']);
            }
        }
        return defaultRender(tokens, idx, options, env, self);
    };

    eleventyConfig.setLibrary("md", markdownLibrary);

    // ------------------------------------------------------------------------
    // Citations (src/utils/citations.js)
    // ------------------------------------------------------------------------
    eleventyConfig.on("eleventy.before", () => { loadHelpers(); citations.reset(); });
    eleventyConfig.addFilter("references", text => citations.renderCitations(text));
    eleventyConfig.addFilter("bibliography", text => citations.bibliographyFor(text));
    eleventyConfig.addShortcode("fullBibliography", () =>
        `<div class="bibliography-full">${citations.fullBibliography().replace(/\n/g, "")}</div>`);

    // ------------------------------------------------------------------------
    // Post-processing of rendered pages
    // ------------------------------------------------------------------------

    // Acronyms: <abbr> on every occurrence, first one per page links to the list
    eleventyConfig.addTransform("acronyms", function(content, outputPath) {
        if (!outputPath?.endsWith(".html")) return content;
        const url = this.page.url;
        if (!isThesisPage(url) && url !== "/pia.html") return content;
        const dom = new JSDOM(content);
        const document = dom.window.document;
        const root = document.querySelector(".thesis-content") || document.querySelector("main");
        markAcronyms(document, root, { link: isThesisPage(url) });
        return dom.serialize();
    });

    // Rewrite in-thesis links (#sec:..., /thesis.html#cha:..., #ref-key) so they
    // point to the page that actually contains the target id.
    eleventyConfig.addTransform("thesisCrossRefs", function(content, outputPath) {
        if (!outputPath?.endsWith(".html")) return content;
        const { ids } = thesisToc();
        const url = this.page.url;
        const local = new Set();
        for (const [, id] of content.matchAll(/\sid="([^"]+)"/g)) local.add(id);

        return content.replace(/href="((?:\/?thesis\.html)?)#([^"]+)"/g, (match, prefix, id) => {
            let target;
            try { target = decodeURIComponent(id); } catch { target = id; }
            if (!prefix && local.has(target)) return match;
            const page = target.startsWith("ref-") ? citations.BIB_PAGE : ids[target];
            if (!page || (page === url && !prefix)) return match;
            return `href="${page}#${id}"`;
        });
    });

    // ------------------------------------------------------------------------
    // Generated thesis content (each returns one compact HTML block so that
    // Markdown does not interfere with it)
    // ------------------------------------------------------------------------
    const tocLink = (item) =>
        `<a href="${item.url}">${item.num ? `<span class="toc-num">${item.num}</span> ` : ""}${escapeHtml(item.title)}</a>`;

    // Table of contents on /thesis.html
    eleventyConfig.addShortcode("thesisToc", function() {
        const { front, chapters, back } = thesisToc();
        const list = (items, withSections) => items.map(ch => {
            const sections = withSections && ch.sections.length
                ? `<ol>${ch.sections.map(s => `<li>${tocLink(s)}</li>`).join("")}</ol>` : "";
            return `<li>${tocLink(ch)}${sections}</li>`;
        }).join("");
        return `<nav class="thesis-toc" aria-label="Table of contents">`
            + `<ol class="toc-matter">${list(front, false)}</ol>`
            + `<ol>${list(chapters, true)}</ol>`
            + `<ol class="toc-matter">${list(back, false)}</ol></nav>`;
    });

    // Acronyms page
    eleventyConfig.addShortcode("acronymList", () => acronymListHtml());

    // Lists of figures, tables and code snippets
    eleventyConfig.addShortcode("figureLists", function() {
        const { figures } = thesisToc();
        const sections = [
            ["figures", "List of Figures", "Figure"],
            ["tables", "List of Tables", "Table"],
            ["code-snippets", "List of Code Snippets", "Code Snippet"],
        ];
        return sections.map(([id, title, kind]) => {
            const items = figures.filter(f => f.kind === kind).map(f =>
                `<li><a class="figure-num" href="${f.url}">${kind} ${f.num}</a><span class="figure-caption">${f.caption}</span></li>`);
            return `<section class="figure-list-section"><h2 id="${id}">${title}</h2><ol class="figure-list">${items.join("")}</ol></section>`;
        }).join("");
    });

    // Appendix B: enlarged versions of figures, given as "fig:id" arguments
    eleventyConfig.addShortcode("appendixFigures", function(...ids) {
        const { figures } = thesisToc();
        return `<div class="appendix-figures">` + ids.map((id, i) => {
            const f = figures.find(x => x.id === id);
            if (!f) throw new Error(`appendixFigures: unknown figure ${id}`);
            const n = `B.${i + 1}`;
            return `<figure id="fig:appendix-${n}" class="appendix-figure">`
                + `<a href="${f.img}" target="_blank" rel="noopener" title="Open the full-size image">`
                + `<img src="${f.img}" alt="${escapeHtml(f.alt || "")}" loading="lazy"></a>`
                + `<figcaption><strong>Figure ${n}</strong>: Enlarged view of <a href="${f.url}">Figure ${f.num}</a>: ${f.caption}</figcaption></figure>`;
        }).join("") + `</div>`;
    });

    // IIIF viewers (pages need `viewers: true` in their front matter to load /js/viewers.js)
    eleventyConfig.addShortcode("mirador", function(manifest, caption) {
        const embed = `https://projectmirador.org/embed/?iiif-content=${encodeURIComponent(manifest)}`;
        return `<figure class="iiif-viewer iiif-mirador" data-manifest="${escapeHtml(manifest)}" data-embed="${escapeHtml(embed)}" data-title="${escapeHtml("Mirador: " + caption)}">`
            + `<div class="viewer-frame"><button class="viewer-load" type="button">Load the IIIF viewer (Mirador)</button></div>`
            + `<figcaption>${caption} · <a href="${escapeHtml(embed)}" target="_blank" rel="noopener noreferrer">Open in Mirador</a>`
            + ` · <a href="${escapeHtml(manifest)}" target="_blank" rel="noopener noreferrer">IIIF Manifest</a></figcaption></figure>`;
    });
    eleventyConfig.addShortcode("iiifImage", function(info, caption, label) {
        return `<figure class="iiif-viewer iiif-image" data-info="${escapeHtml(info)}">`
            + `<div class="viewer-frame" role="img" aria-label="${escapeHtml(label || caption)}"></div>`
            + `<figcaption>${caption} · Zoomable image (IIIF Image API): <a href="${escapeHtml(info)}" target="_blank" rel="noopener noreferrer">info.json</a></figcaption></figure>`;
    });

    // Research outputs (/research.html): APA reference + COinS per item, JSON-LD graph
    eleventyConfig.addShortcode("researchItem", id => research.item(id));
    eleventyConfig.addShortcode("researchJsonLd", () => research.jsonLd());

    eleventyConfig.addFilter("indexByUrl", (pages, url) => pages.findIndex(p => p.url === url));

    // Legacy filter: sources now use plain acronyms (marked up automatically)
    eleventyConfig.addFilter("abbr", function(key) {
        return acronyms[key] ? `<abbr title="${escapeHtml(acronyms[key])}">${key}</abbr>` : key;
    });

    // ------------------------------------------------------------------------
    // Collections
    // ------------------------------------------------------------------------
    eleventyConfig.addCollection("sitePages", function(collectionApi) {
        return collectionApi.getAll().filter(function(item) {
            // Exclude specific pages like 404 and all pages under /s/
            return !item.url.startsWith('/s/') && item.url !== '/404.html';
        });
    });

    // Pages announced in RSS/JSON feeds (thesis chapters are not separate posts)
    eleventyConfig.addCollection("feedPages", function(collectionApi) {
        return collectionApi.getAll().filter(item =>
            !item.url.startsWith('/s/') && !item.url.startsWith('/thesis/') && item.url !== '/404.html');
    });

    // ------------------------------------------------------------------------
    // Static files and global data
    // ------------------------------------------------------------------------
    eleventyConfig.addWatchTarget("./src/utils/");
    eleventyConfig.addWatchTarget("./src/data/acronyms.json");
    eleventyConfig.addWatchTarget("./src/data/research.json");

    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy({"src/data": "data"});
    eleventyConfig.addPassthroughCopy("src/404.md");
    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });
    eleventyConfig.addPassthroughCopy("src/js");

    eleventyConfig.addGlobalData("site", {
        "url": "https://phd.julsraemy.ch"
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: ["md", "njk", "html", "liquid"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk",
    };
};
