---
layout: thesis.njk
title: "Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability"
description: "Digital technologies have fundamentally transformed how Cultural Heritage (CH) collections are accessed and engaged with. Linked Open Usable Data (LOUD) specifications, including the International Image Interoperability Framework (IIIF) Presentation API 3.0, Linked Art, and the Web Annotation Data Model (WADM), have emerged as web standards to facilitate the description and dissemination of these valuable resources. Despite the widespread adoption of IIIF, implementing LOUD specifications, particularly in combination, remains challenging. This is especially evident in the development and assessment of infrastructures, or sites of assemblage, that support these standards.

This research is guided by two perspectives: community practices and semantic interoperability. The first perspective assesses how organizations, individuals, and apparatuses engage with and contribute to the consensus-making processes surrounding LOUD. By examining these practices, the social fabrics of the LOUD ecosystem can be better understood. The second perspective focuses on making data meaningful to machines in a standardized, interoperable manner that promotes the exchange of well-formed information. This research is grounded in the SNSF-funded project, *Participatory Knowledge Practices in Analogue and Digital Image Archives* (PIA) (2021–2025), which aims to develop a citizen science platform for three photographic collections from the Cultural Anthropology Switzerland (CAS) archives. Actor-Network Theory (ANT) forms the theoretical foundation, aiming to describe the collaborative structures of the LOUD ecosystem and emphasize the role of non-human actors.

Beyond its implementation within the PIA project, this research includes an analysis of the social dynamics within the IIIF and Linked Art communities and an investigation of Yale's Collections Discovery platform, LUX. The research identifies socio-technical requirements for developing specifications aligned with LOUD principles. It also examines how the implementation of LOUD standards in PIA highlights their potential benefits and limitations in facilitating data reuse and broader participation. Additionally, it explores Yale University's large-scale deployment of LOUD standards, emphasizing the importance of ensuring consistency between Linked Art and IIIF resources within the LUX platform for the CH domain.

The core methodology of this thesis is an actor- and practice-centered inquiry, focusing on a detailed examination of specific cosmologies within LOUD-driven communities, PIA, and LUX. This micro-perspective approach provides rich empirical evidence to unravel the intricate web of cultural processes and constellations in these contexts.

Key empirical findings indicate that LOUD enhances the discoverability and integration of data in CH, requiring community-driven consensus on model interoperability. However, significant challenges include engaging marginalized groups, sustaining long-term participation, and balancing technological and social factors. Strategic use of technology and the capture of digital materiality are critical, but LOUD also poses challenges related to resource investment, data consistency, and the broader implementation of complex patterns.

LOUD should lead efforts to improve the accessibility and usability of CH data. The community-driven methodologies of IIIF and Linked Art inherently foster collaboration and transparency, making these standards essential tools in evolving data management practices. Even for institutions and projects that do not adopt these specifications, the socio-technical practices of LOUD offer vital insights into effective digital stewardship and strategies for community engagement."
changeFreq: "daily"
sitemapPriority: "1.0"
schemaType: "Thesis"
place: "Basel, Switzerland"
university: "University of Basel"
date: "2024-12-23"
handle: "20.500.14716/148352"
doi: "10.5451/unibas-ep96807"
urn: "urn:nbn:ch:bel-bau-diss155487"
permalink: "/thesis.html"
keywords: "Actor-Network Theory; Community of Practice; Cultural Anthropology Switzerland; Cultural Heritage; Digital Infrastructure; International Image Interoperability Framework; Knowledge Practices; Linked Art; Linked Data; LUX; Participatory Archives; Photographic Archives; Semantic Interoperability; Web Annotation Data Model"
---

# Linked Open Usable Data for Cultural Heritage: Perspectives on Community Practices and Semantic Interoperability

PhD Thesis in Digital Humanities, completed as part of the Graduate School of Social Sciences' (G3S) doctoral programme. It was successfully defended on 18 November 2024 ([slides](https://julsraemy.ch/prezi/loud4ch-doctoral-examination.html)) and published on 23 December 2024.

This page hosts a lightweight HTML version of my thesis, optimised for easier access and readability (_mindful of digital limitations and with some trade-offs_). The PDF version (e-dissertation) is available on the University of Basel's repository, edoc: https://hdl.handle.net/20.500.14716/148352 (also available via the DOI https://doi.org/10.5451/unibas-ep96807), as well as on the Swiss National Library's catalogue: https://nbn-resolving.org/urn:nbn:ch:bel-bau-diss155487.  

For machines, the thesis and each of its chapters (full text included) are also available as [Linked Art](https://linked.art/) JSON-LD: https://phd.julsraemy.ch/linked-art/text/thesis.json.

<div id="authors">
  <h3>Dr. Julien A. Raemy</h3>
  <p>University of Basel, Basel, Switzerland</p>
  <p class="thesis-year">2024</p>
  <p>
    <a href="https://orcid.org/0000-0002-4711-5759" target="_blank">
      <img alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
      https://orcid.org/0000-0002-4711-5759
    </a>
  </p>
</div>

<div id="supervisors">
  <h3>Supervisors</h3>
  <ul>
    <li>
      Prof. Dr. Peter Fornaro (University of Basel) 
      <a href="https://orcid.org/0000-0003-1485-4923" target="_blank">
        <img alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
        https://orcid.org/0000-0003-1485-4923
      </a>
    </li>
    <li>Prof. Dr. Walter Leimgruber (University of Basel)</li>
    <li>
      Dr. Robert Sanderson (Yale University) 
      <a href="https://orcid.org/0000-0003-4441-6852" target="_blank">
        <img alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
        https://orcid.org/0000-0003-4441-6852
      </a>
    </li>
  </ul>
</div>

## Abstract {id="abstract"}

Digital technologies have fundamentally transformed how Cultural Heritage (CH) collections are accessed and engaged with. [Linked Open Usable Data](loud.html) (LOUD) specifications, including the [International Image Interoperability Framework (IIIF) Presentation API 3.0](https://iiif.io/api/presentation/3.0/), [Linked Art](https://linked.art), and the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/), have emerged as web standards to facilitate the description and dissemination of these valuable resources. Despite the widespread adoption of IIIF, implementing LOUD specifications, particularly in combination, remains challenging. This is especially evident in the development and assessment of infrastructures, or sites of assemblage, that support these standards.

This research is guided by two perspectives: community practices and semantic interoperability. The first perspective assesses how organizations, individuals, and apparatuses engage with and contribute to the consensus-making processes surrounding LOUD. By examining these practices, the social fabrics of the LOUD ecosystem can be better understood. The second perspective focuses on making data meaningful to machines in a standardized, interoperable manner that promotes the exchange of well-formed information. This research is grounded in the SNSF-funded project, [Participatory Knowledge Practices in Analogue and Digital Image Archives](pia.html) (PIA) (2021–2025), which aims to develop a citizen science platform for three photographic collections from the Cultural Anthropology Switzerland (CAS) archives. Actor-Network Theory (ANT) forms the theoretical foundation, aiming to describe the collaborative structures of the LOUD ecosystem and emphasize the role of non-human actors.

Beyond its implementation within the PIA project, this research includes an analysis of the social dynamics within the IIIF and Linked Art communities and an investigation of Yale's Collections Discovery platform, [LUX](https://lux.collections.yale.edu/). The research identifies socio-technical requirements for developing specifications aligned with LOUD principles. It also examines how the implementation of LOUD standards in PIA highlights their potential benefits and limitations in facilitating data reuse and broader participation. Additionally, it explores Yale University's large-scale deployment of LOUD standards, emphasizing the importance of ensuring consistency between Linked Art and IIIF resources within the LUX platform for the CH domain.

The core methodology of this thesis is an actor- and practice-centered inquiry, focusing on a detailed examination of specific cosmologies within LOUD-driven communities, PIA, and LUX. This micro-perspective approach provides rich empirical evidence to unravel the intricate web of cultural processes and constellations in these contexts.

Key empirical findings indicate that LOUD enhances the discoverability and integration of data in CH, requiring community-driven consensus on model interoperability. However, significant challenges include engaging marginalized groups, sustaining long-term participation, and balancing technological and social factors. Strategic use of technology and the capture of digital materiality are critical, but LOUD also poses challenges related to resource investment, data consistency, and the broader implementation of complex patterns.

LOUD should lead efforts to improve the accessibility and usability of CH data. The community-driven methodologies of IIIF and Linked Art inherently foster collaboration and transparency, making these standards essential tools in evolving data management practices. Even for institutions and projects that do not adopt these specifications, the socio-technical practices of LOUD offer vital insights into effective digital stewardship and strategies for community engagement.

### Keywords {id="keywords"}
Actor-Network Theory; Community of Practice; Cultural Anthropology Switzerland; Cultural Heritage; Digital Infrastructure; International Image Interoperability Framework; Knowledge Practices; Linked Art; Linked Data; LUX; Participatory Archives; Photographic Archives; Semantic Interoperability; Web Annotation Data Model

## Table of Contents {id="toc"}

{% thesisToc %}
