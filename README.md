BoardRoom Authentication System

📌 Overview

BoardRoom is a secure and modern authentication system built with Node.js, Express.js, MongoDB, and JavaScript. It supports email/password authentication, Google OAuth, email verification, and password reset functionality. The frontend is powered by HTML, CSS, and JavaScript, with GSAP animations for a smooth user experience.

📂 Project Structure

🔒 Backend Files

1️⃣ auth.js

This is the main authentication API that handles:

User registration (with email verification)

User login (with JWT authentication)

Google OAuth login

Resending verification emails

Password reset (forgot & reset password)

Account deletion

Fetching user details

🔹 Uses bcryptjs for password hashing, jsonwebtoken for authentication, and nodemailer for email notifications.

2️⃣ User.js

This is the MongoDB model for users, defining fields such as:

username (required, unique)

email (required, unique)

password (hashed, required for email signups)

googleId (for Google OAuth users)

verified (boolean for email verification status)

verificationToken (used for email verification)

resetToken & resetTokenExpires (for password reset functionality)

🖥 Frontend Files

3️⃣ index.html

Landing page of BoardRoom.

Contains a brief introduction and links to login/register pages.

4️⃣ login.html

Login form with email/username + password authentication.

Google Sign-In integration.

"Forgot Password" functionality for password resets.

5️⃣ register.html

Registration form where users can sign up.

Includes password confirmation and validation.

Upon successful registration, a verification email is sent.

6️⃣ dashboard.html

User dashboard that displays the logged-in user's information.

Change username feature.

Account deletion option.

Email verification banner (if the user hasn’t verified their email yet).

7️⃣ verified.html

Confirmation page shown when a user successfully verifies their email.

Includes confetti animation for a better UX.

8️⃣ reset-password.html

Password reset page where users enter a new password.

The reset token is passed via URL parameters.

📜 JavaScript Files

9️⃣ google-auth.js

Handles Google OAuth login.

Uses Google Identity Services API to authenticate users.

Redirects to the dashboard upon successful login.

🔟 auth.js

Manages user registration & login.

Sends API requests to the backend authentication routes.

Stores JWT token & user details in localStorage for persistent sessions.

1️⃣1️⃣ dash.js

Fetches the logged-in user data.

Checks if the user's email is verified.

Displays a list of registered users (rotating effect).

1️⃣2️⃣ verification.js

Handles email verification status checking.

Manages the "Resend Verification Email" button.

Implements a countdown timer to prevent multiple resends.

1️⃣3️⃣ logout.js

Logs out the user by removing the JWT token from localStorage.

Redirects back to the login page.

🔧 Installation & Setup

📌 Prerequisites

Node.js (v14+)

MongoDB (local or cloud-based)

A Gmail account for sending verification emails

A Google Cloud account for OAuth setup

🔨 Steps to Run the Project

1️⃣ Clone the repository:

git clone https://github.com/yourusername/boardroom-auth.git
cd boardroom-auth

2️⃣ Install dependencies:

npm install

3️⃣ Set up environment variables in .env:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@example.com
EMAIL_PASS=your_gmail_app_password
GOOGLE_CLIENT_ID=your_google_client_id

4️⃣ Start the server:

npm start

5️⃣ Open the project in the browser:

http://localhost:5000/

🚀 Features

✅ Secure JWT-based authentication
✅ Email verification with resend functionality
✅ Google OAuth login
✅ Password reset via email
✅ Username change & account deletion
✅ Responsive and animated UI

📜 API Endpoints

🔐 Authentication Routes

Method

Route

Description

POST

/api/auth/register

Register a new user

POST

/api/auth/login

Login user (email/username & password)

POST

/api/auth/google-login

Login via Google OAuth

POST

/api/auth/resend-verification

Resend verification email

GET

/api/auth/verify-email/:token

Verify user email

POST

/api/auth/forgot-password

Send password reset email

POST

/api/auth/reset-password

Reset user password

GET

/api/auth/user

Get current user details

DELETE

/api/auth/delete-account

Delete user account

📌 Contributing

Feel free to contribute by forking the repo and submitting pull requests.

git checkout -b feature-branch
git commit -m "Add new feature"
git push origin feature-branch

📜 License

This project is licensed under the MIT License.

📝 Authors

👨‍💻 Your Name - Developer & Maintainer

🌟 If you found this project useful, consider giving it a star! ⭐
