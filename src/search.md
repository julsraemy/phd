---
layout: layout.njk
title: "LOUD for Cultural Heritage – Search"
description: "Search the HTML version of the PhD thesis Linked Open Usable Data for Cultural Heritage and the pages of this website"
permalink: "/search.html"
noSearchIndex: true
eleventyExcludeFromCollections: true
---

# Search

Search the HTML version of the thesis and the other pages of this website. Use the filter to restrict results to the thesis.

<link rel="stylesheet" href="/pagefind/pagefind-component-ui.css">
<script src="/pagefind/pagefind-component-ui.js" type="module"></script>

<div class="search-ui">
  <pagefind-config highlight-param="highlight" excerpt-length="40"></pagefind-config>
  <div class="search-bar">
    <pagefind-input autofocus></pagefind-input>
    <pagefind-filter-dropdown filter="section" label="Section" single-select></pagefind-filter-dropdown>
  </div>
  <pagefind-summary default-message="Type at least one word to search."></pagefind-summary>
  <pagefind-results></pagefind-results>
</div>

<script type="module">
  // Pre-fill from the URL: /search.html?q=term&section=Thesis
  const params = new URLSearchParams(location.search);
  const q = params.get("q"), section = params.get("section");
  if (q || section) {
    await customElements.whenDefined("pagefind-results");
    const instance = window.PagefindComponents.getInstanceManager().getInstance("default");
    if (q && section) instance.triggerSearchWithFilters(q, { section: [section] });
    else if (q) instance.triggerSearch(q);
    else instance.triggerFilter("section", [section]);
    const input = document.querySelector("pagefind-input input");
    if (input && q) input.value = q;
  }
</script>
