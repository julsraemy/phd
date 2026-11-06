// IIIF viewers, loaded only on pages that use them (front matter: viewers: true).
//
//  - .iiif-mirador: shows a preview of the manifest's first image; Mirador
//    (projectmirador.org/embed) is only loaded when the reader asks for it.
//  - .iiif-image:   a zoomable IIIF image (Leaflet + Leaflet-IIIF), loaded when
//    it scrolls into view.
(function () {
    const LEAFLET = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/";
    const LEAFLET_IIIF = "https://cdn.jsdelivr.net/npm/leaflet-iiif@3.0.0/leaflet-iiif.js";

    // --- Mirador -----------------------------------------------------------------
    const first = v => Array.isArray(v) ? v[0] : v;
    const idOf = o => o && (o.id || o["@id"]);

    // A preview image URL for a IIIF Presentation 2 or 3 manifest
    function previewUrl(manifest) {
        const canvas = first(manifest.items) || first(first(manifest.sequences)?.canvases);
        const anno = first(first(canvas?.items)?.items) || first(canvas?.images);
        const body = first(anno?.body) || anno?.resource;
        const service = first(body?.service);
        if (idOf(service)) return `${idOf(service).replace(/\/$/, "")}/full/!800,600/0/default.jpg`;
        return idOf(first(manifest.thumbnail)) || idOf(body);
    }

    document.querySelectorAll(".iiif-mirador").forEach(fig => {
        const frame = fig.querySelector(".viewer-frame");
        const button = fig.querySelector(".viewer-load");
        fetch(fig.dataset.manifest)
            .then(r => r.json())
            .then(m => {
                const url = previewUrl(m);
                if (url) frame.style.backgroundImage = `url("${url}")`;
            })
            .catch(() => {});
        button.addEventListener("click", () => {
            const iframe = document.createElement("iframe");
            iframe.src = fig.dataset.embed;
            iframe.title = fig.dataset.title;
            iframe.allowFullscreen = true;
            frame.replaceChildren(iframe);
            frame.style.backgroundImage = "";
            frame.classList.add("is-loaded");
            iframe.focus();
        });
    });

    // --- Leaflet-IIIF ------------------------------------------------------------
    const images = document.querySelectorAll(".iiif-image");
    if (!images.length) return;

    function load(src, type) {
        return new Promise((resolve, reject) => {
            const el = document.createElement(type === "css" ? "link" : "script");
            if (type === "css") { el.rel = "stylesheet"; el.href = src; resolve(); }
            else { el.src = src; el.onload = resolve; el.onerror = reject; }
            document.head.append(el);
        });
    }

    let leaflet = null;
    const ensureLeaflet = () => leaflet = leaflet || load(LEAFLET + "leaflet.css", "css")
        .then(() => load(LEAFLET + "leaflet.js"))
        .then(() => load(LEAFLET_IIIF));

    function show(fig) {
        const el = fig.querySelector(".viewer-frame");
        ensureLeaflet().then(() => {
            const map = L.map(el, { center: [0, 0], crs: L.CRS.Simple, zoom: 0, attributionControl: false });
            L.tileLayer.iiif(fig.dataset.info, { fitBounds: true }).addTo(map);
            el.classList.add("is-loaded");
        }).catch(() => {
            el.textContent = "The zoomable image could not be loaded.";
        });
    }

    const observer = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { observer.unobserve(e.target); show(e.target); }
    }), { rootMargin: "200px" });
    images.forEach(fig => observer.observe(fig));
})();
