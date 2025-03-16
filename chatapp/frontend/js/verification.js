document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const verificationSection = document.getElementById("verificationSection");
    const resendBtn = document.getElementById("resendVerification");

    if (!token) return;

    try {
        const response = await fetch("/api/auth/user", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const user = await response.json();
        console.log(`🔍 User Verified Status: ${user.verified}`);

        if (!user.verified) {
            verificationSection.style.display = "block";
            restoreCountdown(); // ✅ Restore timer after refresh
        }
    } catch (error) {
        console.error("❌ Error checking verification:", error);
    }

    // ✅ Resend Verification Email
    resendBtn.addEventListener("click", async () => {
        if (resendBtn.disabled) return; // Prevent multiple clicks

        try {
            resendBtn.disabled = true;
            resendBtn.innerText = "Sending..."; // ✅ Step 1: Show "Sending..."

            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to resend email");

            // ✅ Step 2: After 2s, change to "Sent!"
            setTimeout(() => {
                resendBtn.innerText = "Sent!";
            }, 2000);

            // ✅ Step 3: After 3 more seconds, start countdown
            setTimeout(() => {
                startCountdown(60);
            }, 5000);
        } catch (error) {
            console.error("❌ Error resending verification email:", error);
            alert("Error sending email. Try again later.");
            resendBtn.disabled = false;
            resendBtn.innerText = "Resend Verification Email"; // Reset button
        }
    });

    function startCountdown(seconds) {
        let endTime = Date.now() + seconds * 1000;
        localStorage.setItem("resendCountdownEnd", endTime); // ✅ Store end time

        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);

        function updateCountdown() {
            let timeLeft = Math.floor(
                (localStorage.getItem("resendCountdownEnd") - Date.now()) / 1000
            );

            if (timeLeft > 0) {
                resendBtn.innerText = `Resend in ${timeLeft}s`;
                resendBtn.disabled = true;
            } else {
                clearInterval(countdownInterval);
                localStorage.removeItem("resendCountdownEnd"); // ✅ Remove stored countdown
                resendBtn.disabled = false;
                resendBtn.innerText = "Resend Verification Email";
            }
        }
    }

    function restoreCountdown() {
        let endTime = localStorage.getItem("resendCountdownEnd");
        if (endTime) {
            let timeLeft = Math.floor((endTime - Date.now()) / 1000);
            if (timeLeft > 0) {
                startCountdown(timeLeft); // ✅ Resume countdown after refresh
            }
        }
    }
});
