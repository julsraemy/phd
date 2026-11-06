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
