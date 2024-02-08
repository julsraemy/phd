module.exports = function(eleventyConfig) {
    // Copy the `assets/` directory (including fonts and stylesheets) to the output folder
    eleventyConfig.addPassthroughCopy("assets");
  
    // Copy the `src/data` directory to `data` in the output folder
    eleventyConfig.addPassthroughCopy({"src/data": "data"});

    // Add passthrough copy rule for the 404 page
    eleventyConfig.addPassthroughCopy("src/404.md");
  
    // Custom domain configuration (CNAME file)
    eleventyConfig.addPassthroughCopy("CNAME");
  
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