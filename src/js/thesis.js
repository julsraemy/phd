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

// Citation previews: hovering (or focusing) a citation shows its bibliography
// entry. Entries come from the page itself, or from the full bibliography page.
(function () {
    const links = document.querySelectorAll("a.cite[data-refs]");
    if (!links.length || !window.matchMedia("(hover: hover)").matches) return;

    let remote = null; // Promise<Document> for /thesis/bibliography.html
    function entry(id) {
        const local = document.getElementById("ref-" + id);
        if (local) return Promise.resolve(local);
        remote = remote || fetch("/thesis/bibliography.html")
            .then(r => r.text())
            .then(html => new DOMParser().parseFromString(html, "text/html"));
        return remote.then(doc => doc.getElementById("ref-" + id));
    }

    const box = document.createElement("div");
    box.className = "cite-preview";
    box.setAttribute("role", "tooltip");
    box.hidden = true;
    document.body.append(box);

    let current = null, hideTimer = null;
    function hide() { box.hidden = true; current = null; }
    function scheduleHide() { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 200); }

    async function show(link) {
        clearTimeout(hideTimer);
        if (current === link) return;
        current = link;
        const ids = link.dataset.refs.split(" ");
        const entries = (await Promise.all(ids.map(entry))).filter(Boolean);
        if (current !== link || !entries.length) return;
        box.replaceChildren(...entries.map(e => { const c = e.cloneNode(true); c.removeAttribute("id"); return c; }));
        box.hidden = false;
        const r = link.getBoundingClientRect();
        const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - box.offsetWidth - 16);
        const below = r.bottom + box.offsetHeight + 12 < window.innerHeight;
        box.style.left = Math.max(window.scrollX + 8, left) + "px";
        box.style.top = (below ? window.scrollY + r.bottom + 6 : window.scrollY + r.top - box.offsetHeight - 6) + "px";
    }

    links.forEach(link => {
        link.addEventListener("mouseenter", () => show(link));
        link.addEventListener("mouseleave", scheduleHide);
        link.addEventListener("focus", () => show(link));
        link.addEventListener("blur", scheduleHide);
    });
    box.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    box.addEventListener("mouseleave", scheduleHide);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
})();
