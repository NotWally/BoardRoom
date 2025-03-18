document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Initializing Google Login...");

    google.accounts.id.initialize({
        client_id: process.env.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: "popup", // ✅ Force popup mode (bypasses FedCM issues)
    });
    google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
        theme: "none",
        size: "large",
    });
    const customButton = document.getElementById("customGoogleBtn");
    if (customButton) {
        customButton.addEventListener("click", function (event) {
            event.preventDefault(); // ✅ Prevent accidental form submission
            console.log("🖱 Google button clicked!");
            google.accounts.id.prompt(); // ✅ Open the Google login popup
        });
    } else {
        console.error("❌ customGoogleBtn not found!");
    }
});

function handleCredentialResponse(response) {
    console.log("🔍 Received Google Token:", response.credential);

    fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("✅ Google login successful:", data);
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "dashboard.html"; // ✅ Redirect to dashboard
            } else {
                alert("Google login failed.");
            }
        })
        .catch((error) => console.error("❌ Error:", error));
}
