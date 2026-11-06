const path = require('path');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItFootnote = require("markdown-it-footnote");
const markdownItAnchor = require("markdown-it-anchor");
const { JSDOM } = require("jsdom");
const acronyms = require("./src/data/acronyms.json");
const thesisToc = require("./src/_data/thesisToc.js");

// Citeproc internals (eleventy-plugin-citeproc), used directly so that code can
// be shielded from citation processing (see `shieldCode` below).
const getCsl = require("eleventy-plugin-citeproc/src/csl");
const citeReferences = require("eleventy-plugin-citeproc/src/references");
const citeBibliography = require("eleventy-plugin-citeproc/src/bibliography");

// Temporarily replace <pre> and <code> elements with placeholders so that
// `@context`, `@prefix`, e-mail-like strings etc. are never read as citations.
function shieldCode(fn) {
    return function (text, ...args) {
        if (typeof text !== "string") return fn(text, ...args);
        const store = [];
        const masked = text.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/g, m => {
            store.push(m);
            return `\u0000CODE${store.length - 1}\u0000`;
        });
        const out = fn(masked, ...args);
        return typeof out === "string"
            ? out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => store[i])
            : out;
    };
}

function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = function(eleventyConfig) {
    // RSS Feed
    eleventyConfig.addPlugin(pluginRss);

    // Markdown Configuration
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

    // Custom rule for opening external links in a new tab
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

    // Citations and bibliographies (code blocks are shielded)
    const csl = getCsl({
        bibliographicStylePath: path.join(__dirname, 'src/utils/apa-no-initials.csl'),
        bibliographicLocalizationPath: path.join(__dirname, 'src/utils/locales-en-GB.xml'),
        bibliographicDataPath: path.join(__dirname, 'src/utils/bib-data.json'),
        deduplicate: true,
        sort: true
    });
    eleventyConfig.addFilter("references", shieldCode(text => citeReferences(text, csl)));
    eleventyConfig.addFilter("bibliography", shieldCode((text, options) => citeBibliography(text, csl, options)));

    eleventyConfig.addTransform("handleCitations", function(content, outputPath) {
        if (!outputPath?.endsWith(".html")) return content;
        if (!content.includes('id="bibliography"')) return content;

        const dom = new JSDOM(content);
        const document = dom.window.document;
        const bibliography = document.querySelector("#bibliography");

        if (bibliography) {
            const citationsArray = Array.from(bibliography.querySelectorAll(".bibliography-entry"));
            const uniqueCitations = new Map();

            citationsArray.forEach(citation => {
                const citationText = citation.textContent.trim();
                if (citationText && !uniqueCitations.has(citationText)) {
                    uniqueCitations.set(citationText, citation.cloneNode(true));
                }
            });

            const heading = bibliography.querySelector("h2")?.outerHTML || "";
            bibliography.innerHTML = heading;
            Array.from(uniqueCitations.values())
                .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
                .forEach(citation => {
                    citation.removeAttribute("id"); // proper per-entry anchors come in phase 2
                    citation.innerHTML = citation.innerHTML.replace(
                        /(^|[^"'>])(https?:\/\/[^\s<]+)/g,
                        '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
                    );
                    bibliography.appendChild(citation);
                });
        }

        return dom.serialize();
    });

    // Rewrite in-thesis links (#sec:..., /thesis.html#cha:...) so they point to
    // the chapter page that actually contains the target id.
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
            const page = ids[target];
            if (!page || (page === url && !prefix)) return match;
            return `href="${page}#${id}"`;
        });
    });

    // Table of contents on /thesis.html (rendered as one compact HTML block so
    // Markdown does not interfere with it)
    eleventyConfig.addShortcode("thesisToc", function() {
        const { chapters } = thesisToc();
        const items = chapters.map(ch => {
            const sections = ch.sections.length
                ? `<ol>${ch.sections.map(s => `<li><a href="${s.url}"><span class="toc-num">${s.num}</span> ${escapeHtml(s.title)}</a></li>`).join("")}</ol>`
                : "";
            return `<li><a href="${ch.url}"><span class="toc-num">${ch.num}</span> ${escapeHtml(ch.title)}</a>${sections}</li>`;
        }).join("");
        return `<nav class="thesis-toc" aria-label="Table of contents"><ol>${items}</ol></nav>`;
    });

    eleventyConfig.addFilter("indexByUrl", (pages, url) => pages.findIndex(p => p.url === url));

    // Custom Collections
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

    // Abbr
    eleventyConfig.addFilter("abbr", function(key) {
        if (acronyms[key]) {
          return `<abbr title="${acronyms[key]}">${key}</abbr>`;
        }
        return key;
      });

    // Static File Copying
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy({"src/data": "data"});
    eleventyConfig.addPassthroughCopy("src/404.md");
    eleventyConfig.addPassthroughCopy("CNAME");
    eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });
    eleventyConfig.addPassthroughCopy("src/js");

    // Global Site Data
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
