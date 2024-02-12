const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {
    // RSS Feed
    eleventyConfig.addPlugin(pluginRss);

    // Markdown Configuration
    const markdownLibrary = markdownIt({
        html: true,
        linkify: true,
        typographer: true,
    }).use(markdownItAttrs);

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

    // Custom Collections
    eleventyConfig.addCollection("sitePages", function(collectionApi) {
        return collectionApi.getAll().filter(function(item) {
            // Exclude specific pages like 404
            return item.url !== '/404.html';
        });
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