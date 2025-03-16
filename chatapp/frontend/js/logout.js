document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }
});
