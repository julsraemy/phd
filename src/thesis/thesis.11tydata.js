// Shared data for every chapter page in src/thesis/
module.exports = {
    layout: "thesis.njk",
    permalink: "/thesis/{{ page.fileSlug }}.html",
    schemaType: "Chapter",
    place: "Basel, Switzerland",
    university: "University of Basel",
    date: "2024-12-23",
    doi: "10.5451/unibas-ep96807",
    changeFreq: "monthly",
    sitemapPriority: "0.8",
    eleventyComputed: {
        description: data => `Chapter ${data.chapter} – ${data.title} – of the PhD thesis "Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability" by Julien A. Raemy (University of Basel, 2024).`
    }
};
