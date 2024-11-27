const increaseFontBtn = document.getElementById("font-increase");
const decreaseFontBtn = document.getElementById("font-decrease");
const mainContent = document.querySelector("main");

// Function to adjust font size
function adjustFontSize(factor) {
    const currentSize = parseFloat(getComputedStyle(mainContent).fontSize);
    const newSize = currentSize * factor;

    mainContent.style.fontSize = `${newSize}px`;
    localStorage.setItem("contentFontSize", newSize);
}

// Event listeners for buttons
increaseFontBtn.addEventListener("click", () => adjustFontSize(1.1));
decreaseFontBtn.addEventListener("click", () => adjustFontSize(0.9));

// Load saved font size on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedFontSize = localStorage.getItem("contentFontSize");
    if (savedFontSize) {
        mainContent.style.fontSize = `${savedFontSize}px`;
    }
});
