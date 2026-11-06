// Automatic acronym markup, driven by src/data/acronyms.json.
//
// Sources contain plain text ("IIIF", "APIs"); at build time every occurrence in
// the page body becomes <abbr title="…"> linking to the Acronyms page; the
// first occurrence on a page is highlighted. Code, links, headings and bibliography entries
// are left untouched.
const acronyms = require("../data/acronyms.json");

const ACRONYMS_PAGE = "/thesis/acronyms.html";
const SKIP = "a, abbr, code, pre, script, style, h1, h2, h3, h4, h5, h6, .csl-entry, .thesis-breadcrumb, .thesis-pager, .thesis-toc, .acronym-list, .no-acronyms";

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keys = Object.keys(acronyms).sort((a, b) => b.length - a.length);
// Whole "words" only; an optional plural "s" (APIs); "JSON-LD" wins over "JSON"
const PATTERN = new RegExp(`(?<![\\w/])(${keys.map(escapeRe).join("|")})(s?)(?![\\w/])`, "g");
const HAS_MATCH = new RegExp(PATTERN.source); // non-global: no lastIndex state

const anchorId = key => "acr-" + key.replace(/[^A-Za-z0-9]+/g, "-");

function markAcronyms(document, root, { link = true } = {}) {
    if (!root) return 0;
    const NodeFilter = document.defaultView.NodeFilter;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: node => (node.parentElement && node.parentElement.closest(SKIP))
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) if (HAS_MATCH.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);

    const seen = new Set();
    let count = 0;
    for (const node of nodes) {
        const text = node.nodeValue;
        const frag = document.createDocumentFragment();
        let last = 0;
        for (const m of text.matchAll(PATTERN)) {
            const [, key, plural] = m;
            frag.append(text.slice(last, m.index));
            const abbr = document.createElement("abbr");
            abbr.title = acronyms[key];
            abbr.textContent = key;
            if (link) {
                // every occurrence links to the list; the first one per page stands out
                const link = document.createElement("a");
                link.className = seen.has(key) ? "acronym" : "acronym acronym-first";
                link.href = `${ACRONYMS_PAGE}#${anchorId(key)}`;
                link.append(abbr);
                frag.append(link);
            } else {
                frag.append(abbr);
            }
            if (plural) frag.append(plural);
            seen.add(key);
            count++;
            last = m.index + m[0].length;
        }
        frag.append(text.slice(last));
        node.replaceWith(frag);
    }
    return count;
}

// Definition list for the Acronyms page
function acronymListHtml() {
    const sorted = Object.keys(acronyms).sort((a, b) =>
        a.localeCompare(b, "en", { sensitivity: "base", numeric: true }));
    const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<dl class="acronym-list">${sorted.map(k =>
        `<dt id="${anchorId(k)}">${esc(k)}</dt><dd>${esc(acronyms[k])}</dd>`).join("")}</dl>`;
}

module.exports = { markAcronyms, acronymListHtml, anchorId, PATTERN };
