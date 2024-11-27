const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
});

// Load saved theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.body.dataset.theme = savedTheme;
}
