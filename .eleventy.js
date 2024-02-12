const pluginRss = require("@11ty/eleventy-plugin-rss");

module.exports = function(eleventyConfig) {
    // Include all pages in a collection
    eleventyConfig.addCollection("sitePages", function(collectionApi) {
      return collectionApi.getAll().filter(function(item) {
          // Remove 404 from sitePages
          return item.url !== '/404.html';
      });
  });

    // Copy the `assets/` directory (including fonts and stylesheets) to the output folder
    eleventyConfig.addPassthroughCopy("assets");
  
    // Copy the `src/data` directory to `data` in the output folder
    eleventyConfig.addPassthroughCopy({"src/data": "data"});

    // Add passthrough copy rule for the 404 page
    eleventyConfig.addPassthroughCopy("src/404.md");
  
    // Custom domain configuration (CNAME file)
    eleventyConfig.addPassthroughCopy("CNAME");

    // Put robots.txt in root
    eleventyConfig.addPassthroughCopy({ 'src/robots.txt': '/robots.txt' });

    // JavaScript files
    eleventyConfig.addPassthroughCopy("src/js");

    // RSS Feed
    eleventyConfig.addPlugin(pluginRss);

    eleventyConfig.addGlobalData("site", {
      "url": "https://phd.julsraemy.ch"
      // any other site-wide global data...
  });
  
    // Optionally, set a global permalink structure (if you decide to apply a uniform structure)
    // eleventyConfig.addTransform('permalink', function(content, outputPath) {
    //   // Logic to transform outputPath or content as needed
    // });
  
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