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

    // --- Copy buttons: code blocks and the "Cite as" reference ----------------
    const copyText = async text => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fallback for browsers without the async clipboard (or non-secure origins)
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.setAttribute("readonly", "");
            ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand("copy");
            ta.remove();
            return ok;
        }
    };
    const addCopyButton = (host, getText, label) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "copy-btn";
        btn.textContent = "Copy";
        btn.setAttribute("aria-label", label);
        const status = document.createElement("span");
        status.className = "visually-hidden";
        status.setAttribute("aria-live", "polite");
        btn.addEventListener("click", async () => {
            const ok = await copyText(getText());
            btn.textContent = ok ? "Copied" : "Failed";
            status.textContent = ok ? "Copied to clipboard" : "Copy failed";
            btn.classList.toggle("copied", ok);
            clearTimeout(btn._t);
            btn._t = setTimeout(() => {
                btn.textContent = "Copy";
                status.textContent = "";
                btn.classList.remove("copied");
            }, 1800);
        });
        host.append(btn, status);
    };
    document.querySelectorAll("main pre").forEach(pre => {
        // Wrap so the button stays put while the code scrolls horizontally
        const wrap = document.createElement("div");
        wrap.className = "copy-wrap";
        pre.before(wrap);
        wrap.appendChild(pre);
        addCopyButton(wrap, () => (pre.querySelector("code") || pre).textContent.replace(/\n$/, ""), "Copy code to clipboard");
    });
    document.querySelectorAll("main .cite-as").forEach(p => {
        addCopyButton(p, () => {
            const clone = p.cloneNode(true);
            clone.querySelectorAll("strong:first-child, .copy-btn, .visually-hidden").forEach(el => el.remove());
            return clone.textContent.replace(/\s+/g, " ").trim();
        }, "Copy citation to clipboard");
    });

    // --- Back to top (shown once the page has been scrolled down) -------------
    const toTop = document.querySelector(".back-to-top");
    if (toTop) {
        const toggleTop = () => { toTop.hidden = window.scrollY < 600; };
        window.addEventListener("scroll", toggleTop, { passive: true });
        toTop.addEventListener("click", () => {
            const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
            document.getElementById("content")?.focus({ preventScroll: true });
        });
        toggleTop();
    }
})();
