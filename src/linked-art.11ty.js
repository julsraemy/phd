// Linked Art API (https://linked.art/api/1.0/) records for the thesis.
//
//   /linked-art/text/thesis.json            the thesis   (Textual Work, LinguisticObject)
//   /linked-art/text/thesis/<chapter>.json  each chapter (Textual Work, part_of the thesis)
//   /linked-art/person/julsraemy.json       the author   (Person)
//
// Records are generated from the thesis outline (src/_data/thesisToc.js) and
// the front matter of src/thesis.md, so they follow the HTML version.
const buildToc = require("./_data/thesisToc.js");

const SITE = "https://phd.julsraemy.ch";
const BASE = `${SITE}/linked-art`;
const CONTEXT = "https://linked.art/ns/v1/linked-art.json";
const HANDLE = "https://hdl.handle.net/20.500.14716/148352";
const DOI = "10.5451/unibas-ep96807";
const PUBLISHED = "2024-12-23";
const URN = "urn:nbn:ch:bel-bau-diss155487";

const THESIS_ID = `${BASE}/text/thesis.json`;
const PERSON_ID = `${BASE}/person/julsraemy.json`;
const PERSON_NAME = "Julien Antoine Raemy";
const chapterId = url => `${BASE}/text/thesis/${url.split("/").pop().replace(/\.html$/, "")}.json`;

// --- Vocabulary (Getty AAT, as used in the Linked Art model) -----------------
const aat = (n, label, meta) => {
    const t = { id: `http://vocab.getty.edu/aat/${n}`, type: "Type", _label: label };
    if (meta) t.classified_as = [meta];
    return t;
};
const TYPE_OF_WORK = aat("300435443", "Type of Work");
const BRIEF_TEXT = aat("300418049", "Brief Text");
const THESIS = aat("300028028", "Thesis", TYPE_OF_WORK);
const CHAPTER = aat("300311699", "Chapter", TYPE_OF_WORK);
const PRIMARY_NAME = aat("300404670", "Primary Name");
const DISPLAY_NAME = aat("300404669", "Display Name");
const SORT_VALUE = aat("300456575", "Sort Value");
const DOI_TYPE = aat("300417432", "Digital Object Identifier");
const ABSTRACT = aat("300026032", "Abstract", BRIEF_TEXT);
const PUBLISHING = aat("300054686", "Publishing");
const WEB_PAGE = aat("300264578", "Web Page");
const ENGLISH = { id: "http://vocab.getty.edu/aat/300388277", type: "Language", _label: "English" };

// --- Shared structures ----------------------------------------------------------
const name = (content, type = PRIMARY_NAME) => ({ type: "Name", classified_as: [type], content });
const ref = (id, type, label) => ({ id, type, _label: label });
const PERSON_REF = ref(PERSON_ID, "Person", PERSON_NAME);
const UNIBAS = ref("https://ror.org/02s6k3f65", "Group", "University of Basel");
const BASEL = ref("http://www.wikidata.org/entity/Q78", "Place", "Basel");

const timespan = day => ({
    type: "TimeSpan",
    _label: day,
    begin_of_the_begin: `${day}T00:00:00Z`,
    end_of_the_end: `${day}T23:59:59Z`,
});

// Digital Links pattern: a web page carrying the text
const webPage = (url, label, format = "text/html") => ({
    type: "LinguisticObject",
    digitally_carried_by: [{
        type: "DigitalObject",
        _label: label,
        classified_as: [WEB_PAGE],
        format,
        access_point: [{ id: url, type: "DigitalObject" }],
    }],
});

function thesisRecord(abstract) {
    const title = "Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability";
    return {
        "@context": CONTEXT,
        id: THESIS_ID,
        type: "LinguisticObject",
        _label: title,
        classified_as: [THESIS],
        identified_by: [
            name(title),
            { type: "Identifier", classified_as: [DOI_TYPE], content: DOI },
            { type: "Identifier", _label: "Handle", content: HANDLE.replace("https://hdl.handle.net/", "") },
            { type: "Identifier", _label: "URN:NBN", content: URN },
        ],
        referred_to_by: abstract ? [{ type: "LinguisticObject", classified_as: [ABSTRACT], content: abstract, language: [ENGLISH] }] : undefined,
        equivalent: [ref(HANDLE, "LinguisticObject", title), ref(`https://doi.org/${DOI}`, "LinguisticObject", title), ref(`https://nbn-resolving.org/${URN}`, "LinguisticObject", title)],
        language: [ENGLISH],
        created_by: {
            type: "Creation",
            carried_out_by: [PERSON_REF],
            timespan: { type: "TimeSpan", _label: "2021–2024", begin_of_the_begin: "2021-02-01T00:00:00Z", end_of_the_end: "2024-12-23T23:59:59Z" },
        },
        used_for: [{
            type: "Activity",
            _label: "Publication of the thesis",
            classified_as: [PUBLISHING],
            timespan: timespan(PUBLISHED),
            took_place_at: [BASEL],
            carried_out_by: [UNIBAS],
        }],
        subject_of: [
            webPage(`${SITE}/thesis.html`, "HTML version"),
            webPage(HANDLE, "PDF version (edoc, University of Basel)"),
        ],
    };
}

function chapterRecord(c) {
    const label = `Chapter ${c.num}: ${c.title}`;
    return {
        "@context": CONTEXT,
        id: chapterId(c.url),
        type: "LinguisticObject",
        _label: label,
        classified_as: [CHAPTER],
        identified_by: [
            name(c.title),
            name(label, DISPLAY_NAME),
            { type: "Identifier", classified_as: [SORT_VALUE], content: String(c.num).padStart(2, "0") },
        ],
        language: [ENGLISH],
        part_of: [ref(THESIS_ID, "LinguisticObject", "Linked Open Usable Data for Cultural Heritage")],
        created_by: { type: "Creation", carried_out_by: [PERSON_REF] },
        subject_of: [webPage(`${SITE}${c.url}`, `HTML version of chapter ${c.num}`)],
    };
}

function personRecord() {
    return {
        "@context": CONTEXT,
        id: PERSON_ID,
        type: "Person",
        _label: PERSON_NAME,
        identified_by: [name(PERSON_NAME)],
        equivalent: [
            ref("https://orcid.org/0000-0002-4711-5759", "Person", PERSON_NAME),
            ref("https://julsraemy.ch/#person", "Person", PERSON_NAME),
        ],
        subject_of: [webPage("https://julsraemy.ch", "Personal website")],
    };
}

class LinkedArt {
    data() {
        const toc = buildToc();
        const records = [{ kind: "thesis", url: "/linked-art/text/thesis.json" }]
            .concat(toc.chapters.map(c => ({ kind: "chapter", chapter: c, url: new URL(chapterId(c.url)).pathname })))
            .concat([{ kind: "person", url: "/linked-art/person/julsraemy.json" }]);
        return {
            toc,
            records,
            pagination: { data: "records", size: 1, alias: "record" },
            permalink: data => data.record.url,
            eleventyExcludeFromCollections: true,
        };
    }

    render(data) {
        const r = data.record;
        let doc;
        if (r.kind === "thesis") {
            const landing = (data.collections.all || []).find(p => p.url === "/thesis.html");
            doc = thesisRecord(landing && landing.data.description);
        } else if (r.kind === "chapter") {
            doc = chapterRecord(r.chapter);
        } else {
            doc = personRecord();
        }
        return JSON.stringify(doc, null, 2);
    }
}

module.exports = LinkedArt;
