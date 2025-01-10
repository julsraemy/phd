const path = require('path'); 
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const markdownItFootnote = require("markdown-it-footnote"); 
const markdownItAnchor = require("markdown-it-anchor");
const eleventyCiteproc = require("eleventy-plugin-citeproc");
const { JSDOM } = require("jsdom"); 
const acronyms = require("./src/data/acronyms.json");

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

    // Custom rule for opening external links in a new tab
    const defaultRender = markdownLibrary.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    markdownLibrary.renderer.rules.link_open = function(tokens, idx, options, env, self) {
        const hrefIndex = tokens[idx].attrIndex('href');
        if (hrefIndex >= 0) {
            const href = tokens[idx].attrs[hrefIndex][1];
            if (href.startsWith('http') && !href.includes('phd.julsraemy.ch')) { // Adjust your domain
                tokens[idx].attrPush(['target', '_blank']);
                tokens[idx].attrPush(['rel', 'noopener noreferrer']);
            }
        }
        return defaultRender(tokens, idx, options, env, self);
    };

    eleventyConfig.setLibrary("md", markdownLibrary);

    // Citeproc Plugin for Citations and Bibliographies
    eleventyConfig.addPlugin(eleventyCiteproc, {
        bibliographicStylePath: path.join(__dirname, 'src/utils/apa-no-initials.csl'),
        bibliographicLocalizationPath: path.join(__dirname, 'src/utils/locales-en-GB.xml'),
        bibliographicDataPath: path.join(__dirname, 'src/utils/bib-data.json'),
        deduplicate: true,
        sort: true
    });

    eleventyConfig.addTransform("handleCitations", function(content, outputPath) {
        if (!outputPath?.endsWith(".html")) return content;
        
        const dom = new JSDOM(content);
        const document = dom.window.document;
        const bibliography = document.querySelector("#bibliography");
        
        if (bibliography) {
            const citationsArray = Array.from(bibliography.children);
            const uniqueCitations = new Map();
            
            // Create bibliography entries with IDs
            citationsArray.forEach((citation, index) => {
                const citationText = citation.textContent.trim();
                if (citationText && !citationText.startsWith('Bibliography')) {
                    const authorYear = citationText.match(/^([^,]+),\s*([^(.]+)/);
                    if (authorYear) {
                        const [_, author, year] = authorYear;
                        const cleanId = `${author.replace(/[^a-zA-Z]/g, '')}${year.trim()}`;
                        citation.id = cleanId;
                    }
                    if (!uniqueCitations.has(citationText)) {
                        uniqueCitations.set(citationText, citation.cloneNode(true));
                    }
                }
            });
    
            // Sort and rebuild bibliography
            bibliography.innerHTML = '<h2 id="bib-Bibliography">Bibliography</h2>';
            Array.from(uniqueCitations.values())
                .sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()))
                .forEach(citation => bibliography.appendChild(citation));
        }
        
        return dom.serialize();
    });

    eleventyConfig.addTransform("makeUrlsClickable", function(content, outputPath) {
        // Apply only to HTML files
        if (outputPath && outputPath.endsWith(".html")) {
            const dom = new JSDOM(content);
            const document = dom.window.document;
    
            // Select the bibliography section
            const bibliography = document.querySelector("#bibliography");
            if (bibliography) {
                // Replace all URLs with clickable links in the innerHTML of the bibliography
                bibliography.innerHTML = bibliography.innerHTML.replace(
                    /(https?:\/\/[^\s<]+)/g,
                    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
                );
            }
    
            return dom.serialize();
        }
    
        // Return unchanged content for non-HTML files
        return content;
    });  

    // Custom Collections
    eleventyConfig.addCollection("sitePages", function(collectionApi) {
        return collectionApi.getAll().filter(function(item) {
            // Exclude specific pages like 404 and all pages under /s/
            return !item.url.startsWith('/s/') && item.url !== '/404.html';
        });
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

