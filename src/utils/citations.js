// Citation processing for the thesis (replaces eleventy-plugin-citeproc's filters).
//
// - One citeproc-js engine, with every key cited anywhere in the thesis
//   registered up front, so year suffixes (2009a/2009b) are consistent site-wide.
// - Each cited work is wrapped in a link to its bibliography entry (#ref-<key>).
// - Parenthetical  [@key p. 4; @other]  ->  (Author, 2020, p. 4; Other, 2021)
//   Narrative      @key                 ->  Author (2020)
//   Suppressed     [-@key]              ->  (2020)
// - <pre>/<code> are never touched, so `@context`, `@prefix` etc. are safe.
const fs = require("fs");
const path = require("path");
const CSL = require("citeproc");
const Citr = require("@zettlr/citr");

const ROOT = path.join(__dirname, "..");
const STYLE = fs.readFileSync(path.join(__dirname, "apa-no-initials.csl"), "utf8");
const LOCALE = fs.readFileSync(path.join(__dirname, "locales-en-GB.xml"), "utf8");
// BibTeX case-protection braces ("Request for {Comments}") are not meaningful in CSL
const unbrace = e => Object.fromEntries(Object.entries(e).map(([k, v]) =>
    [k, typeof v === "string" && k !== "id" ? v.replace(/[{}]/g, "") : v]));
const LIBRARY = Object.fromEntries(
    JSON.parse(fs.readFileSync(path.join(__dirname, "bib-data.json"), "utf8")).map(e => [e.id, unbrace(e)])
);

const BIB_PAGE = "/thesis/bibliography.html";
const CODE = /<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/g;
// Bracketed clusters, or a bare narrative @key that is not part of a word, URL or e-mail
// (a narrative @key may carry a locator in brackets: "@key [p. 4]")
const CITATION = /\[[^\[\]]*@[^\[\]]+\]|(?<![\w@/.:-])@[\w][\w:.#$%&+?~/-]*\w(?:\s?\[[^\[\]@]*\])?/g;

// Citr only knows "[@key locator]"; normalise "@key [locator]" first
function parse(raw) {
    const m = raw.match(/^@(\S+?)\s?\[([^\]]*)\]$/);
    try { return Citr.parseSingle(m ? `[@${m[1]} ${m[2]}]` : raw); } catch { return null; }
}

const escapeAttr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function makeEngine() {
    return new CSL.Engine({
        retrieveLocale: () => LOCALE,
        retrieveItem: id => LIBRARY[id],
    }, STYLE);
}

// All keys cited in the thesis sources, in order of first appearance
function citedKeysIn(text) {
    const keys = [];
    const masked = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "").replace(CODE, "");
    for (const raw of masked.match(CITATION) || []) {
        const items = parse(raw);
        if (!items) continue;
        for (const { id } of items) if (LIBRARY[id] && !keys.includes(id)) keys.push(id);
    }
    return keys;
}

function thesisSources() {
    const dir = path.join(ROOT, "thesis");
    return [path.join(ROOT, "thesis.md")]
        .concat(fs.readdirSync(dir).filter(f => f.endsWith(".md")).sort().map(f => path.join(dir, f)))
        .map(f => fs.readFileSync(f, "utf8"));
}

let state = null;
function init() {
    if (state) return state;
    const allKeys = [];
    for (const src of thesisSources()) for (const k of citedKeysIn(src)) if (!allKeys.includes(k)) allKeys.push(k);

    const engine = makeEngine();
    engine.updateItems(allKeys);
    const [meta, entries] = engine.makeBibliography();
    const html = {};
    meta.entry_ids.forEach(([id], i) => {
        const body = entries[i].trim()
            .replace(/^<div class="csl-entry">/, "").replace(/<\/div>$/, "")
            // make bare URLs clickable
            .replace(/(^|[\s(>])(https?:\/\/[^\s<]+?)(?=[.,;)]?(?:\s|<|$))/g,
                '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
        html[id] = `<div class="csl-entry" id="ref-${escapeAttr(id)}">${body}</div>`;
    });
    state = { engine, order: meta.entry_ids.map(([id]) => id), html };
    return state;
}

// makeCitationCluster renders against the registry built in init() without
// re-registering items, so disambiguation (2009a/2009b) stays global.
// (processCitationCluster would drop the other items and lose the suffixes.)
function cluster(items) {
    return init().engine.makeCitationCluster(items);
}

const link = (ids, text) =>
    `<a class="cite" href="#ref-${escapeAttr(ids[0])}" data-refs="${escapeAttr(ids.join(" "))}">${text}</a>`;
const unwrap = s => (s.startsWith("(") && s.endsWith(")")) ? s.slice(1, -1) : s;

function renderCitation(raw) {
    let items = parse(raw);
    if (!items) return raw;
    items = items.filter(i => LIBRARY[i.id]);
    if (!items.length) return raw;
    const clean = items.map(({ id, locator, label, prefix, suffix, ...rest }) => {
        const item = { id, ...rest };
        if (prefix) item.prefix = prefix;
        if (suffix) item.suffix = suffix;
        if (locator) { item.locator = locator; item.label = label || "page"; }
        return item;
    });

    // Narrative: Author (Year)
    if (!raw.startsWith("[") && clean.length === 1) {
        const author = cluster([{ ...clean[0], "author-only": true }]).replace(/ &#38; | &amp; | & /g, " and ");
        const year = cluster([{ ...clean[0], "suppress-author": true }]);
        return `<span class="citation narrative">${link([clean[0].id], `${author} ${year}`)}</span>`;
    }

    // "&#38;" contains ";" -- protect it while splitting on "; "
    const AMP = "\u0001";
    const render = list => cluster(list).replace(/&#38;/g, AMP);
    const full = render(clean);
    const body = unwrap(full);
    const open = body === full ? "" : "(", close = body === full ? "" : ")";
    const finish = s => `<span class="citation">${open}${s}${close}</span>`.replace(/\u0001/g, "&#38;");
    if (clean.length === 1) return finish(link([clean[0].id], body));

    // Several works: link each "Author, Year" (or each year in a collapsed
    // same-author group such as "Schmoll, 2009b, 2009a") to its entry
    const parts = clean.map(it => {
        const text = unwrap(render([it]));
        const cut = text.indexOf(", ");
        return { id: it.id, text, author: cut > 0 ? text.slice(0, cut) : text, year: cut > 0 ? text.slice(cut + 2) : "" };
    });
    const store = [];
    const hold = html => { store.push(html); return `\u0002${store.length - 1}\u0002`; };
    const groups = body.split("; ").map(group => {
        let g = group;
        for (const p of parts) {
            if (p.used) continue;
            if (g.includes(p.text)) { g = g.replace(p.text, hold(link([p.id], p.text))); p.used = true; }
        }
        for (const p of parts) {
            if (p.used || !p.year) continue;
            const re = new RegExp(`(, )(${p.year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?=,|$)`);
            if (re.test(g)) { g = g.replace(re, (_, sep, y) => sep + hold(link([p.id], y))); p.used = true; }
        }
        return g;
    });
    return finish(groups.join("; ").replace(/\u0002(\d+)\u0002/g, (_, i) => store[i]));
}

// Replace citations in rendered HTML, leaving code and attribute values alone
function renderCitations(htmlText) {
    if (typeof htmlText !== "string" || !htmlText.includes("@")) return htmlText;
    init();
    const store = [];
    const shield = s => { store.push(s); return `\u0000${store.length - 1}\u0000`; };
    let out = htmlText
        .replace(CODE, shield)
        .replace(/<script\b[\s\S]*?<\/script>/g, shield)
        .replace(/<\/?[a-zA-Z][^>]*>/g, shield); // tags + attributes (href="...@...")
    out = out.replace(CITATION, m => renderCitation(m));
    return out.replace(/\u0000(\d+)\u0000/g, (_, i) => store[i]);
}

// Bibliography entries for the keys cited in `text` (rendered or source), in sorted order
function bibliographyFor(text) {
    const { order, html } = init();
    const keys = new Set(citedKeysIn(String(text)));
    return order.filter(id => keys.has(id)).map(id => html[id]).join("\n");
}

function fullBibliography() {
    const { order, html } = init();
    return order.map(id => html[id]).join("\n");
}

function reset() { state = null; }

module.exports = { renderCitations, bibliographyFor, fullBibliography, citedKeysIn, reset, BIB_PAGE };
