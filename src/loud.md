---
layout: layout.njk
title: "LOUD for Cultural Heritage – Linked Open Usable Data"
description: "Linked Open Usable Data (LOUD), its design principles and its standards: International Image Interoperability Framework (IIIF), Linked Art, Web Annotation Data Model."
keywords: "Robert Sanderson, LOUD Design Principles, JSON-LD, The right Abstraction for the audience, Few Barriers to entry, Comprehensible by introspection, Documentation with working examples, Few Exceptions, instead many consistent patterns"
date: "2024-02-13"
permalink: "/loud.html"
---

<style type="text/css">
    ol { list-style-type: upper-alpha; }
</style>

# Linked Open Usable Data (LOUD)

A summary page about LOUD, page in construction...

The Semantic Web, with its use of Resource Description Framework (RDF) graphs, offers significant potential for data modelling and reasoning, but faces challenges in terms of query complexity, data handling, and visualisation. Despite these obstacles, the advent of JavaScript Object Notation for Linked Data (JSON-LD) represents a notable advance, providing a flexible data representation that addresses some of these issues by allowing dual treatment as both JSON and a graph.

## LOUD Design Principles

One of the main purposes of LOUD is to make the data more easily accessible to software developers, who play a key role in interacting with the data and building software and services on top of it, and to some extent to academics. As such, striking a delicate balance between the dual imperatives of data completeness and accuracy, which depend on the underlying ontological construct, and the pragmatic considerations of scalability and usability, becomes imperative. 

Similar to Tim-Berners Lee's [Five Star Open Data Deployment Scheme](https://5stardata.info/), Robert Sanderson listed [five design principles that underpin LOUD](https://linked.art/loud/):

1. The right Abstraction for the audience
2. Few Barriers to entry
3. Comprehensible by introspection
4. Documentation with working examples
5. Few Exceptions, instead many consistent patterns

## LOUD Standards

Three systems adhering to the LOUD design principles have been identified:

- International Image Interoperability Framework (IIIF), especially the IIIF Presentation API 3.0 
- Web Annotation Data Model
- Linked Art 

These three systems are complementary and can be used either separately or in conjunction.

<figure>
  <img src="https://julsraemy.ch/prezi/assets/loud-infra-example.jpg" alt="LOUD-Driven Infrastructure" width="60%">
  <figcaption>LOUD-Driven Infrastructure [Felsing et al. 2023]</figcaption>
</figure>



### IIIF

[IIIF](https://iiif.io) is both a model for presenting and annotating content as well as a global community that develops shared application programming interfaces (APIs), implements them in software, and exposes interoperable content.

Currently, IIIF has introduced [six specifications](https://iiif.io/api/), with the Image and Presentation APIs being the most notable, both updated to version 3 in June 2020 and often considered the core IIIF APIs. Additionally, the Content Search and Authorization Flow APIs, both at version 2 and released in 2022 and 2023 respectively, are expected to receive updates to match the core APIs' standards. The Change Discovery and Content State APIs, both in version 1.0, play essential roles in discovering, aggregating, and sharing IIIF resources.

(...)

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

<div id="map" data-iiif-url="https://julsraemy.ch/hostiiing/images/pdm-overview/info.json" style="height: 400px; width: 100%;"></div>



(...)
