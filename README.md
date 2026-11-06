# Linked Open Usable Data for Cultural Heritage

A website about my PhD thesis on Linked Open Usable Data (LOUD), with an HTML version of the thesis: <https://phd.julsraemy.ch>

Title: *Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability*

- PDF version on the University of Basel's repository (edoc): <https://hdl.handle.net/20.500.14716/148352> (DOI: <https://doi.org/10.5451/unibas-ep96807>)
- Swiss National Library's e-Helvetica: <https://nbn-resolving.org/urn:nbn:ch:bel-bau-diss155487>

## Running the site

The site is built with [11ty](https://www.11ty.dev/) and searched with [Pagefind](https://pagefind.app/).

```
npm install        # once
npm run build      # build the site into _site/ and create the search index
npm start          # serve on http://localhost:8080/ and rebuild on changes
```

Run `npm run build` at least once before `npm start`, so that the search index exists (`npm run search-index` refreshes it). Pushing to `main` builds and deploys the site to GitHub Pages (`.github/workflows/deploy.yml`); `_site/` is not committed.

## Where things are

| What | Where |
|---|---|
| Thesis landing page (title, abstract, table of contents) | `src/thesis.md` → `/thesis.html` |
| Chapters, front and back matter | `src/thesis/*.md` → `/thesis/*.html` |
| Bibliography data (CSL-JSON, exported from Zotero) | `src/utils/bib-data.json` |
| Acronyms | `src/data/acronyms.json` |
| Research outputs (CSL-JSON, also served at `/data/research.json`) | `src/data/research.json` |
| Layouts and sidebar | `src/_includes/` |
| Build logic (citations, acronyms, ToC, viewers…) | `.eleventy.js`, `src/utils/`, `src/_data/thesisToc.js` |
| Styles and scripts | `assets/stylesheets/style.css`, `src/js/` |

## Writing conventions

- **Chapters**: each file in `src/thesis/` has front matter with `title` and `chapter` (number); front and back matter pages use `part: "front"` or `"back"` and `order`. The sidebar, the table of contents, the prev/next links and the lists of figures, tables and code snippets are generated from the files.
- **Headings** carry their number and an id, e.g. `## 3.1 What Makes Cultural Heritage Data Stand Out? {id="sec:standout"}`. Links such as `[Section 3.1](#sec:standout)` work across chapters: they are rewritten to the right page at build time.
- **Citations** use Pandoc syntax with keys from `bib-data.json`: `[@key]`, `[@key p. 4]`, `[@a; @b]`, `[-@key]`, and narrative `@key` or `@key [p. 4]`. Each citation links to its entry in the chapter's references and in the full bibliography.
- **Acronyms** are written as plain text (`IIIF`, `APIs`); every occurrence listed in `acronyms.json` is marked up and linked to the Acronyms page automatically.
- **Footnotes** use `[^n]` and keep their number on the page.
- **Figures, tables and code snippets** are `<figure id="fig:…">`, `"tab:…"` or `"lst:…"` with a caption starting with `<strong>Figure 3.1</strong>:`; code goes in fenced code blocks inside the figure.
- **IIIF viewers** (pages with `viewers: true` in their front matter): `{% mirador "manifest-url", "caption" %}` and `{% iiifImage "info.json-url", "caption", "description" %}`.
- **Research outputs**: add a CSL-JSON item to `src/data/research.json` and place it on `src/research.md` with `{% researchItem "id" %}`; the APA reference, COinS and JSON-LD are generated.
