// Research outputs (src/data/research.json, CSL-JSON) rendered for /research.html:
//   - an APA reference per item (citeproc-js, apa.csl)
//   - a COinS span per item, so Zotero's connector offers every item on the page
//   - a schema.org JSON-LD @graph describing all items
// The same CSL-JSON file is published at /data/research.json for direct import.
const fs = require("fs");
const path = require("path");
const CSL = require("citeproc");

const ITEMS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "research.json"), "utf8"));
const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const STYLE = fs.readFileSync(path.join(__dirname, "apa.csl"), "utf8");
const LOCALE = fs.readFileSync(path.join(__dirname, "locales-en-GB.xml"), "utf8");
const ME = "https://julsraemy.ch/#person";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isMe = p => p.family === "Raemy" && /^Julien/.test(p.given || "");
const fullName = p => [p.given, p.family].filter(Boolean).join(" ");
const year = i => String(i.issued["date-parts"][0][0]);
const isoDate = i => i.issued["date-parts"][0].map((n, k) => k ? String(n).padStart(2, "0") : n).join("-");
const pidUrl = i => i.DOI ? `https://doi.org/${i.DOI}` : i.URL;

function get(id) {
    const item = BY_ID[id];
    if (!item) throw new Error(`research: unknown item "${id}"`);
    return item;
}

// --- APA reference ---------------------------------------------------------
let engine;
function reference(id) {
    get(id);
    engine = engine || new CSL.Engine({ retrieveLocale: () => LOCALE, retrieveItem: k => BY_ID[k] }, STYLE);
    engine.updateItems([id]); // one at a time: no 2023a/2023b across sections
    const html = engine.makeBibliography()[1][0].trim()
        .replace(/^<div class="csl-entry">/, "").replace(/<\/div>$/, "")
        .replace(/(https?:\/\/[^\s<]+?)(?=[.,;)]?(?:\s|<|$))/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
}

// --- COinS (OpenURL ContextObject in SPAN) -----------------------------------
const ZOTERO_TYPES = { software: "computerProgram", speech: "presentation", article: "preprint" };
function coins(id) {
    const i = get(id);
    const p = new URLSearchParams();
    p.append("ctx_ver", "Z39.88-2004");
    const pages = i.page ? i.page.replace("-", "–") : null;
    switch (i.type) {
        case "article-journal":
            p.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:journal");
            p.append("rft.genre", "article");
            p.append("rft.atitle", i.title);
            p.append("rft.jtitle", i["container-title"]);
            break;
        case "chapter":
        case "paper-conference":
            p.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:book");
            p.append("rft.genre", i.type === "chapter" ? "bookitem" : "proceeding");
            p.append("rft.atitle", i.title);
            p.append("rft.btitle", i["container-title"]);
            break;
        case "thesis":
            p.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:dissertation");
            p.append("rft.title", i.title);
            p.append("rft.inst", i.publisher);
            p.append("rft.degree", "PhD dissertation");
            break;
        case "report":
            p.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:book");
            p.append("rft.genre", "report");
            p.append("rft.btitle", i.title);
            break;
        default: // software, posters, preprints: no OpenURL genre of their own
            // Zotero (zotero/utilities openurl.js) makes genre=document a document,
            // whose title only rft.title sets (rft.btitle is ignored, and a span
            // without a title is looked up by DOI or dropped); rft.type, appended
            // last, then gives it its Zotero item type
            p.append("rft_val_fmt", "info:ofi/fmt:kev:mtx:book");
            p.append("rft.genre", "document");
            p.append("rft.title", i.title);
    }
    p.append("rft.date", year(i));
    for (const a of i.author || []) p.append("rft.au", fullName(a));
    if (i.volume) p.append("rft.volume", i.volume);
    if (i.issue) p.append("rft.issue", i.issue);
    if (pages) p.append("rft.pages", pages);
    if (i.publisher && i.type !== "thesis") p.append("rft.pub", i.publisher);
    if (i["publisher-place"]) p.append("rft.place", i["publisher-place"]);
    if (i.language) p.append("rft.language", i.language);
    if (i.DOI) p.append("rft_id", `info:doi/${i.DOI}`);
    p.append("rft_id", pidUrl(i));
    if (ZOTERO_TYPES[i.type]) p.append("rft.type", ZOTERO_TYPES[i.type]);
    return `<span class="Z3988" title="${esc(p.toString())}"></span>`;
}

function item(id) {
    return `<p class="research-item" id="${esc(id)}">${reference(id)}${coins(id)}</p>`;
}

// --- schema.org JSON-LD --------------------------------------------------------
function person(p) {
    return isMe(p) ? { "@id": ME } : { "@type": "Person", "name": fullName(p), "givenName": p.given, "familyName": p.family };
}

function node(i) {
    const n = {
        "@type": "CreativeWork",
        "@id": pidUrl(i),
        "name": i.title,
        "author": (i.author || []).map(person),
        "datePublished": isoDate(i),
        "inLanguage": i.language,
        "url": pidUrl(i),
    };
    if (i.DOI) n.identifier = { "@type": "PropertyValue", "propertyID": "DOI", "value": i.DOI };
    if (i.editor) n.editor = i.editor.map(person);
    if (i.page) n.pagination = i.page.replace("-", "–");
    const publisher = i.publisher ? { "@type": "Organization", "name": i.publisher } : undefined;
    switch (i.type) {
        case "article-journal":
            Object.assign(n, { "@type": "ScholarlyArticle",
                "isPartOf": { "@type": "Periodical", "name": i["container-title"] },
                "volumeNumber": i.volume, "issueNumber": i.issue });
            break;
        case "chapter":
            Object.assign(n, { "@type": "Chapter",
                "isPartOf": { "@type": "Book", "name": i["container-title"], "editor": n.editor, publisher } });
            delete n.editor;
            break;
        case "paper-conference":
            Object.assign(n, { "@type": "ScholarlyArticle",
                "isPartOf": { "@type": "Book", "name": i["container-title"], "editor": n.editor, publisher, "volumeNumber": i.volume } });
            delete n.editor;
            break;
        case "software":
            Object.assign(n, { "@type": "SoftwareSourceCode", "softwareVersion": i.version,
                "codeRepository": i.URL && i.URL.includes("github.com") ? i.URL : undefined });
            break;
        case "speech":
            Object.assign(n, { "@type": "CreativeWork", "genre": i.genre,
                "recordedAt": { "@type": "Event", "name": i["event-title"], "location": i["event-place"] } });
            break;
        case "article":
            Object.assign(n, { "@type": "ScholarlyArticle", "genre": i.genre, publisher });
            break;
        case "report":
            Object.assign(n, { "@type": "Report", "genre": i.genre, publisher, "numberOfPages": i["number-of-pages"] });
            break;
        case "thesis":
            Object.assign(n, { "@type": "Thesis", "genre": i.genre,
                "sourceOrganization": { "@type": "CollegeOrUniversity", "@id": "https://ror.org/02s6k3f65", "name": i.publisher } });
            break;
    }
    return JSON.parse(JSON.stringify(n)); // drop undefined values
}

function jsonLd() {
    const graph = { "@context": "https://schema.org", "@graph": ITEMS.map(node) };
    return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2).replace(/</g, "\\u003c")}\n</script>`;
}

module.exports = { item, reference, coins, jsonLd, ITEMS };
