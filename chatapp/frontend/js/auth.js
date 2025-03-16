async function registerUser(event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // ✅ Ensure passwords match
    if (password !== confirmPassword) {
        alert("❌ Passwords do not match. Please try again.");
        return;
    }

    // ✅ Convert username and email to lowercase
    username = username.toLowerCase();
    email = email.toLowerCase();

    const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        alert("✅ Registration successful! Redirecting to login...");
        window.location.href = "login.html";
    } else {
        alert(`❌ Registration failed: ${data.message}`);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
});

async function loginUser(event) {
    event.preventDefault();

    let emailOrUsername = document
        .getElementById("emailOrUsername")
        .value.trim();
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    emailOrUsername = emailOrUsername.toLowerCase();

    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await response.json();

    if (response.ok) {
        // ✅ Store user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id); // ✅ Store user ID
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userVerified", data.user.verified);
        localStorage.setItem("userRole", data.user.role || "user"); // ✅ Default role = "user"
        localStorage.setItem(
            "profilePicture",
            data.user.profilePicture || "default-avatar.png"
        ); // ✅ Store profile picture
        localStorage.setItem("lastLogin", new Date().toISOString()); // ✅ Store last login time

        if (rememberMe) {
            localStorage.setItem("rememberedLogin", emailOrUsername);
        } else {
            localStorage.removeItem("rememberedLogin");
        }

        alert("✅ Login Successful!");
        window.location.href = "dashboard.html";
    } else {
        alert(`❌ Login failed: ${data.message}`);
    }
}

// ✅ Prefill login input on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedLogin = localStorage.getItem("rememberedLogin");
    if (savedLogin) {
        document.getElementById("emailOrUsername").value = savedLogin;
        document.getElementById("rememberMe").checked = true;
    }
});
