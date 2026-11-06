// Shared data for every chapter page in src/thesis/
module.exports = {
    layout: "thesis.njk",
    permalink: "/thesis/{{ page.fileSlug }}.html",
    place: "Basel, Switzerland",
    university: "University of Basel",
    date: "2024-12-23",
    handle: "20.500.14716/148352",
    doi: "10.5451/unibas-ep96807",
    // Same keywords as the thesis (src/thesis.md), for the citation metadata
    keywords: "Actor-Network Theory; Community of Practice; Cultural Anthropology Switzerland; Cultural Heritage; Digital Infrastructure; International Image Interoperability Framework; Knowledge Practices; Linked Art; Linked Data; LUX; Participatory Archives; Photographic Archives; Semantic Interoperability; Web Annotation Data Model",
    changeFreq: "monthly",
    sitemapPriority: "0.8",
    eleventyComputed: {
        // Chapters are schema:Chapter; front/back matter pages are generic parts
        schemaType: data => data.chapter ? "Chapter" : "CreativeWork",
        description: data => `${data.chapter ? `Chapter ${data.chapter}: ` : ""}${data.title} – from the PhD thesis "Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability" by Julien A. Raemy (University of Basel, 2024), https://hdl.handle.net/20.500.14716/148352`
    }
};
