document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const verificationSection = document.getElementById("verificationSection");

    if (!token) {
        window.location.href = "login.html";
        return;
    }
    try {
        const response = await fetch("/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            console.error("❌ Failed to fetch user data. Redirecting...");
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        const user = await response.json();
        console.log(`🔍 User verified: ${user.verified}`);

        if (!user.verified) {
            console.warn(
                "⚠️ User is NOT verified. Showing verification banner."
            );
            verificationSection.style.display = "block";
        } else {
            console.log("✅ User is verified. Hiding verification banner.");
            verificationSection.style.display = "none";
        }
    } catch (error) {
        console.error("⚠️ Error fetching user data:", error);
    }
});
