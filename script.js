// Thème automatique + toggle
const themeToggle = document.getElementById("themeToggle");
const userTheme = localStorage.getItem("theme");

if (userTheme) {
    document.documentElement.setAttribute("data-theme", userTheme);
} else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
}

themeToggle.onclick = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
};

// Liens externes (avertissement)
const externalCards = document.querySelectorAll(".card.external");
const warning = document.getElementById("externalWarning");
const continueBtn = document.getElementById("continue");
const cancelBtn = document.getElementById("cancel");

let pendingURL = "";

externalCards.forEach(card => {
    card.addEventListener("click", () => {
        pendingURL = card.dataset.url;
        warning.classList.remove("hidden");
    });
});

continueBtn.onclick = () => {
    window.location.href = pendingURL;
};

cancelBtn.onclick = () => {
    warning.classList.add("hidden");
};
