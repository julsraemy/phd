---
layout: layout.njk
title: "LOUD for Cultural Heritage – Linked Open Usable Data"
description: "Linked Open Usable Data (LOUD), its design principles and its standards: International Image Interoperability Framework (IIIF), Linked Art, Web Annotation Data Model."
keywords: "Robert Sanderson, LOUD Design Principles, JSON-LD, The right Abstraction for the audience, Few Barriers to entry, Comprehensible by introspection, Documentation with working examples, Few Exceptions, instead many consistent patterns"
date: "2024-02-15"
permalink: "/loud.html"
---

<style type="text/css">
    ol { list-style-type: upper-alpha; }
</style>

# Linked Open Usable Data (LOUD)

A summary page about LOUD, page in construction...

The Semantic Web, with its use of Resource Description Framework (RDF) graphs, offers significant potential for data modelling and reasoning, but faces challenges in terms of query complexity, data handling, and visualisation. Despite these obstacles, the advent of JavaScript Object Notation for Linked Data (JSON-LD) represents a notable advance, providing a flexible data representation that addresses some of these issues by allowing dual treatment as both JSON and a graph.

Linked Open Data (LOD) has been pivotal in fostering a web of openly connected datasets. The progression to Linked Open Usable Data (LOUD) underscores an evolution towards making data not just accessible and linked but also readily usable for a broader audience, particularly software developers. This shift is propelled by the understanding that data's real value is unlocked through its usage. LOUD aims to enhance scalability, both from technical perspectives and in terms of data production and adoption, making data more interconnected and thus more useful.

The endeavour to make JSON-LD a polyglot format, serving both JSON and RDF, introduces some complexities as pointed out by this [blog post from Tess O'Connor](https://tess.oconnor.cx/2023/09/polyglots-and-interoperability):

- _Dual Data Models_: Catering to two different data models increases complexity for developers and complicates the development and interoperability of tools.
- _Algorithmic Complexity_: Adapting algorithms to accommodate dual models can lead to confusion and inefficiency.
- _Brittleness and Performance Issues_: The specifics of JSON-LD, especially the `@context` mechanism, can introduce fragility and performance overheads, deterring its use in performance-critical applications.

To mitigate the challenges associated with polyglot formats, a strategic approach that emphasises simplicity and clarity is recommended. Firstly, adopting a straightforward JSON format that does not require prior knowledge of RDF simplifies interaction and immediately broadens the appeal and usability of the data. In addition, creating canonical mappings from this JSON format to the RDF data model can meet the needs of those who require the capabilities of RDF, ensuring that the base format remains accessible while enabling interaction with Linked Data toolchains. Moreover, ensuring the use of stable contexts, as exemplified by the LOUD standards, is essential for maintaining consistent and reliable data interchange.

By adopting these strategies, the benefits of both JSON and RDF can be effectively leveraged without burdening users with the complexities of a polyglot approach.

Building on this foundation of simplicity and accessibility, the LOUD design principles come into play, offering a structured approach to making data not only available but intuitively usable. These principles are designed to guide the development and dissemination of data in ways that directly address the needs of developers and users alike.

## LOUD Design Principles

One of the main purposes of LOUD is to make the data more easily accessible to software developers, who play a key role in interacting with the data and building software and services on top of it, and to some extent to academics. As such, striking a delicate balance between the dual imperatives of data completeness and accuracy, which depend on the underlying ontological construct, and the pragmatic considerations of scalability and usability, becomes imperative. 

Similar to Tim-Berners Lee's [Five Star Open Data Deployment Scheme](https://5stardata.info/), Robert Sanderson listed [five design principles that underpin LOUD](https://linked.art/loud/):

1. The right Abstraction for the audience
2. Few Barriers to entry
3. Comprehensible by introspection
4. Documentation with working examples
5. Few Exceptions, instead many consistent patterns

### A. The right Abstraction for the audience 

Developers do not need the same level of access to data as ontologists, in the same way that a driver does not need the same level of access to the inner workings of their car as a mechanic. Use cases and requirements should drive the interoperability layer between systems, not ontological purity.


### B. Few Barriers to entry

It should be easy to get started with the data and build something. If it takes a long time to understand the model, ontology, sparql query syntax and so forth, then developers will look for easier targets. Conversely, if it is easy to start and incrementally improve, then more people will use the data.

### C. Comprehensible by introspection 


The data should be understandable to a large degree simply by looking at it, rather than requiring the developer to read the ontology and vocabularies. Using JSON-LD lets us to talk to the developer in their language, which they already understand.

### D. Documentation with working examples

You can never intuit all of the rules for the data. Documentation clarifies the patterns that the developer can expect to encounter, such that they can implement robustly. Example use cases allow contextualization for when the pattern will be encountered, and working examples let you drop the data into the system to see if it implements that pattern correctly.

### E. Few Exceptions, instead many consistent patterns 

Every exception that you have in an API (and hence ontology) is another rule that the developer needs to learn in order to use the system. Every exception is jarring, and requires additional code to manage. While not everything is homogenous, a set of patterns that manage exceptions well is better than many custom fields.

## LOUD Standards

Systems embodying LOUD principles include the International Image Interoperability Framework (IIIF), the Web Annotation Data Model, and Linked Art, demonstrating the ethos of making data more accessible, connected, and usable:

- **International Image Interoperability Framework** (IIIF), especially the IIIF Presentation API 3.0 which describes how the structure and layout of a digital object can be made available in a standard manner, defining their appearance in viewers and players through the `Manifest`, a JSON-LD file bundling all elements of a IIIF resource with essential metadata and structural information.
- **Web Annotation Data Model**: It offers a standardised framework for creating annotations on web resources, promoting semantic data integration and use across the web.
- **Linked Art**: A community effort to define a metadata application profile and API for describing and interacting with cultural heritage resources.

IIIF and Linked Art are both community-driven initiatives.

(...)

### IIIF

[IIIF](https://iiif.io) is both a model for presenting and annotating content as well as a global community that develops shared application programming interfaces (APIs), implements them in software, and exposes interoperable content.

Currently, IIIF has introduced [six specifications](https://iiif.io/api/), with the Image and Presentation APIs being the most notable, both updated to version 3 in June 2020 and often considered the core IIIF APIs. Additionally, the Content Search and Authorization Flow APIs, both at version 2 and released in 2022 and 2023 respectively, are expected to receive updates to match the core APIs' standards. The Change Discovery and Content State APIs, both in version 1.0, play essential roles in discovering, aggregating, and sharing IIIF resources.

Despite its strengths in facilitating the sharing and interoperability of digital objects, IIIF can sometimes appear disconnected, especially in contexts where discovery and linking to semantic data is not fully realised. However, this perceived disconnect provides an opportunity for improvement through the implementation of robust discovery mechanisms.

(...)

<div class="container">
<iframe src="https://mirador-dev.netlify.app/__tests__/integration/mirador/" width="800" height="600" marginwidth="0" marginheight="0" frameborder="0" scrolling="no" id="frame" allowfullscreen="">You need an iFrame capable browser to view this.</iframe>
</div>

### Web Annotation Data Model

The [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) is a World Wide Web Consortium (W3C) standard that provides an extensible and interoperable framework for creating and sharing annotations across various platforms. It defines relationships between resources using an RDF graph, which includes the `annotation`, a web resource, the `body`, and the `target`. This model allows a single comment to be associated with multiple resources.

Here is an example of machine-generated annotations in a IIIF setting. The JSON-LD snippet represents an `AnnotationPage` that contains one or more annotations related to a particular IIIF resource.

```json
{
  "@context": "http://iiif.io/api/presentation/3/context.json",
  "id": "https://iiif.participatory-archives.ch/annotations/SGV_12N_08589-p1-list.json",
  "type": "AnnotationPage",
  "items": [
    {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "id": "https://iiif.participatory-archives.ch/annotations/SGV_12N_08589-p1-list/annotation-436121.json",
      "motivation": "commenting",
      "type": "Annotation",
      "body": [
        {
          "type": "TextualBody",
          "value": "person",
          "purpose": "commenting"
        },
        {
          "type": "TextualBody",
          "value": "Object Detection (vitrivr)",
          "purpose": "tagging"
        },
        {
          "type": "TextualBody",
          "value": "<br><small>Detection score: 0.9574</small>",
          "purpose": "commenting"
        }
      ],
      "target": {
        "source": "https://iiif.participatory-archives.ch/SGV_12N_08589/canvas/p1",
        "selector": {
          "type": "FragmentSelector",
          "conformsTo": "http://www.w3.org/TR/media-frags/",
          "value": "xywh=319,2942,463,523"
        },
        "dcterms:isPartOf": {
          "type": "Manifest",
          "id": "https://iiif.participatory-archives.ch/SGV_12N_08589/manifest.json"
        }
      }
    },
```

#### Body

The `body` of an annotation is where the content of the annotation is defined. In this example, there are three textual bodies:

- A "TextualBody" with the value "person" for `commenting`.
- Another "TextualBody" with the value "Object Detection (vitrivr)" for `tagging`.
- A third "TextualBody" with HTML content indicating a detection score, also for `commenting`.

These bodies represent the content of the annotation, including comments and tags related to the annotated resource.

#### Target

The `target` specifies where the annotation applies. In this setting, it points to a specific area of a IIIF Canvas. Key details include:
- The source URL, identifying the specific Canvas within this IIIF Presentation API 3.0 resource.
- A selector of type "FragmentSelector", using the Media Fragments specification (with a value indicating the specific rectangular area on the canvas targeted by the annotation).
- A link (`dcterms:isPartOf`) to the IIIF Manifest that the Canvas is part of.

### Linked Art

[Linked Art](https://linked.art) is a community and a CIDOC ([ICOM International Committee for Documentation](https://cidoc.mini.icom.museum/)) Working Group collaborating to define a metadata application profile for describing cultural heritage, and the technical means for conveniently interacting with it.

| **Level**         | **Linked Art**                      |
|----------------|---------------------------------|
| **Conceptual Model**      | [CIDOC Conceptual Reference Model](https://www.cidoc-crm.org/) (CRM)                       |
| **Ontology**   | [RDF encoding of CRM 7.1](https://www.cidoc-crm.org/html/cidoc_crm_v7.1.2.html), plus extensions       |
| **Vocabulary** | [Getty Vocabularies](https://www.getty.edu/research/tools/vocabularies/), mainly the Art & Architecture Thesaurus (AAT), as well as the Thesaurus of Geographic Names (TGN) and the Union List of Artist Names (ULAN) |
| **Profile**    | Object-based cultural heritage (mainly art museum oriented)  |
| **API**        | [JSON-LD 1.1](https://www.w3.org/TR/json-ld11/), following REST (representational state transfer) and web patterns                         |

<figure>
  <img src="https://julsraemy.ch/prezi/assets/linkedart_50k_feet.svg" alt="Linked Art from 50k feet">
  <figcaption>Linked Art from 50,000 feet</figcaption>
</figure>

(...)

## LOUD Ecosystem

These three systems are complementary and can be used either separately or in conjunction.

<figure>
  <img src="https://julsraemy.ch/prezi/assets/loud-infra-example.jpg" alt="LOUD-Driven Infrastructure">
  <figcaption>LOUD-Driven Infrastructure [Felsing et al. 2023]</figcaption>
</figure>

A LOUD ecosystem is characterised by an emphasis on interoperability between independently developed systems. This approach to design and implementation promotes semantic interoperability, ensuring that data can be understood and used across platforms and applications without the need for centralised coordination. By adhering to the LOUD principles, systems can communicate more effectively and share data in a way that is meaningful and useful to a wide range of users. This level of interoperability supports the creation of a more integrated and accessible digital environment, where data from different sources can be seamlessly connected and used for a variety of purposes.