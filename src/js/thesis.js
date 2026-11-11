// Thesis navigation: mobile drawer + highlighting of the current section in the sidebar.
(function () {
    const sidebar = document.getElementById("thesis-sidebar");
    const toggle = document.querySelector(".toc-toggle");
    const backdrop = document.querySelector(".toc-backdrop");
    if (!sidebar) return;

    // --- Drawer (small screens) ---------------------------------------------
    function setOpen(open) {
        document.body.classList.toggle("toc-open", open);
        toggle?.setAttribute("aria-expanded", String(open));
        if (backdrop) backdrop.hidden = !open;
    }
    toggle?.addEventListener("click", () => setOpen(!document.body.classList.contains("toc-open")));
    backdrop?.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });
    sidebar.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });

    // --- Scrollspy -----------------------------------------------------------
    const links = new Map();
    sidebar.querySelectorAll("a[data-target]").forEach(a => links.set(a.dataset.target, a));
    const headings = Array.from(document.querySelectorAll(".thesis-content h2[id], .thesis-content h3[id]"))
        .filter(h => links.has(h.id));
    if (!headings.length) return;

    let active = null;
    function activate(id) {
        const link = links.get(id);
        if (!link || link === active) return;
        active?.classList.remove("is-active");
        link.classList.add("is-active");
        active = link;
        // keep the active entry visible inside the sidebar without moving the page
        const sRect = sidebar.getBoundingClientRect(), lRect = link.getBoundingClientRect();
        if (lRect.top < sRect.top + 40 || lRect.bottom > sRect.bottom - 40) {
            sidebar.scrollTop += lRect.top - sRect.top - sRect.height / 3;
        }
    }

    function update() {
        const offset = window.innerHeight * 0.25;
        let current = headings[0];
        for (const h of headings) {
            if (h.getBoundingClientRect().top - offset <= 0) current = h; else break;
        }
        activate(current.id);
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
    }, { passive: true });
    update();
})();

// Hover previews (pointer devices only):
//  - citations show their bibliography entry, from the page itself or from
//    the full bibliography page;
//  - footnote markers show the footnote text.
(function () {
    const cites = document.querySelectorAll("a.cite[data-refs]");
    const notes = document.querySelectorAll(".footnote-ref a[href^='#fn']");
    if ((!cites.length && !notes.length) || !window.matchMedia("(hover: hover)").matches) return;

    let remote = null; // Promise<Document> for /thesis/bibliography.html
    function entry(id) {
        const local = document.getElementById("ref-" + id);
        if (local) return Promise.resolve(local);
        remote = remote || fetch("/thesis/bibliography.html")
            .then(r => r.text())
            .then(html => new DOMParser().parseFromString(html, "text/html"));
        return remote.then(doc => doc.getElementById("ref-" + id));
    }

    const clean = el => {
        const c = el.cloneNode(true);
        c.removeAttribute("id");
        c.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
        c.querySelectorAll(".footnote-backref").forEach(x => x.remove());
        return c;
    };

    async function citationContent(link) {
        const entries = (await Promise.all(link.dataset.refs.split(" ").map(entry))).filter(Boolean);
        return entries.map(clean);
    }

    function footnoteContent(link) {
        const li = document.getElementById(link.hash.slice(1));
        if (!li) return [];
        const label = document.createElement("span");
        label.className = "fn-preview-label";
        // Numbered notes read "42."; notes with their own marker (e.g. [^*]) read "*"
        label.textContent = li.dataset.label
            || (li.getAttribute("value") || link.textContent.replace(/\D/g, "")) + ".";
        const body = Array.from(li.children).map(clean);
        body[0]?.prepend(label, " ");
        return body;
    }

    const box = document.createElement("div");
    box.className = "cite-preview";
    box.setAttribute("role", "tooltip");
    box.hidden = true;
    document.body.append(box);

    let current = null, hideTimer = null;
    function hide() { box.hidden = true; current = null; }
    function scheduleHide() { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 200); }

    async function show(link, content) {
        clearTimeout(hideTimer);
        if (current === link) return;
        current = link;
        const nodes = await content(link);
        if (current !== link || !nodes.length) return;
        box.classList.toggle("is-footnote", content === footnoteContent);
        box.replaceChildren(...nodes);
        box.hidden = false;
        const r = link.getBoundingClientRect();
        const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - box.offsetWidth - 16);
        const below = r.bottom + box.offsetHeight + 12 < window.innerHeight;
        box.style.left = Math.max(window.scrollX + 8, left) + "px";
        box.style.top = (below ? window.scrollY + r.bottom + 6 : window.scrollY + r.top - box.offsetHeight - 6) + "px";
    }

    function bind(links, content) {
        links.forEach(link => {
            link.addEventListener("mouseenter", () => show(link, content));
            link.addEventListener("mouseleave", scheduleHide);
            link.addEventListener("focus", () => show(link, content));
            link.addEventListener("blur", scheduleHide);
        });
    }
    bind(cites, citationContent);
    bind(notes, footnoteContent);
    box.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    box.addEventListener("mouseleave", scheduleHide);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
})();
