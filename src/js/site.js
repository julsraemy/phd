// Site-wide behaviour: mobile menu, text size and light/dark theme.
(function () {
    // --- Mobile menu ------------------------------------------------------------
    const trigger = document.querySelector(".nav-trigger");
    const menu = document.getElementById("site-menu");
    trigger?.addEventListener("click", () => {
        const open = menu.classList.toggle("collapsed") === false;
        trigger.setAttribute("aria-expanded", String(open));
        trigger.classList.toggle("active", open);
    });

    // --- Text size (applies to the main content, remembered) --------------------
    const main = document.querySelector("main");
    const saved = parseFloat(localStorage.getItem("contentFontSize"));
    if (main && saved) main.style.fontSize = `${saved}px`;
    function resize(factor) {
        const size = parseFloat(getComputedStyle(main).fontSize) * factor;
        main.style.fontSize = `${size}px`;
        localStorage.setItem("contentFontSize", size);
    }
    document.getElementById("font-increase")?.addEventListener("click", () => resize(1.1));
    document.getElementById("font-decrease")?.addEventListener("click", () => resize(1 / 1.1));

    // --- Light / dark theme --------------------------------------------------------
    // Default follows the system setting; the button stores an explicit choice.
    const root = document.documentElement;
    const toggle = document.getElementById("theme-toggle");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches;
    const sync = () => {
        toggle?.setAttribute("aria-pressed", String(isDark()));
        toggle?.setAttribute("title", isDark() ? "Switch to light mode" : "Switch to dark mode");
    };
    toggle?.addEventListener("click", () => {
        const next = isDark() ? "light" : "dark";
        root.dataset.theme = next;
        try { localStorage.setItem("theme", next); } catch (e) {}
        sync();
    });
    systemDark.addEventListener?.("change", sync);
    sync();

    // --- Print: links whose text already is the URL need no "<url>" suffix -------
    document.querySelectorAll('main a[href^="http"]').forEach(a => {
        if (a.textContent.includes("://") || a.textContent.trim().startsWith("www.")) a.classList.add("bare-url");
    });
})();
