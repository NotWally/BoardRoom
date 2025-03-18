# 🚀 BoardRoom Authentication System

![Node.js](https://img.shields.io/badge/Node.js-16%2B-green?style=for-the-badge&logo=node.js)  
![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?style=for-the-badge&logo=express)  
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)  
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=for-the-badge)  
![Google OAuth](https://img.shields.io/badge/OAuth-Google-red?style=for-the-badge&logo=google)  
![Nodemailer](https://img.shields.io/badge/Emails-Nodemailer-yellow?style=for-the-badge&logo=gmail)  

## 📌 Overview
**BoardRoom** is a **secure authentication system** built with **Node.js, Express, MongoDB, and JavaScript**. It provides **secure user authentication** with **email verification, password reset, Google OAuth, and user account management**.

### ✨ Features:
- ✅ **Secure JWT Authentication**  
- ✅ **Email Verification (with resend option)**  
- ✅ **Google OAuth Login**  
- ✅ **Password Reset via Email**  
- ✅ **Account Management (Change Username, Delete Account)**  
- ✅ **Responsive & Animated UI with GSAP**  

---

## 📂 Project Structure

### 🔒 Backend Files
| File | Description |
|------|------------|
| `auth.js` | Handles authentication routes (Register, Login, Google OAuth, Password Reset) |
| `User.js` | MongoDB User Schema (password hashing, verification, OAuth fields) |

### 🖥 Frontend Files
| File | Description |
|------|------------|
| `index.html` | Landing page |
| `login.html` | User login with Google OAuth |
| `register.html` | User registration & email verification |
| `dashboard.html` | User dashboard with verification status |
| `verified.html` | Confirmation page for email verification |
| `reset-password.html` | Password reset page |

### 📜 JavaScript Files
| File | Description |
|------|------------|
| `google-auth.js` | Google OAuth login integration |
| `auth.js` | Manages user registration & login |
| `dash.js` | Fetches user data, checks verification |
| `verification.js` | Handles email verification checks |
| `logout.js` | Logs out users and clears local storage |

---

## 🔧 Installation & Setup

### 📌 Prerequisites
- **Node.js** (v14+)
- **MongoDB** (Atlas or Local)
- **Gmail SMTP** (for email verification)
- **Google Cloud Credentials** (for OAuth)

### 🛠 Setup Steps
```bash
# Clone the repo
git clone https://github.com/yourusername/boardroom-auth.git
cd boardroom-auth

# Install dependencies
npm install

# Create a .env file and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@example.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id

# Start the server
npm start
# 📌 Visit: [http://localhost:5000/](http://localhost:5000/)

## 🤝 Contributing

Feel free to contribute:

```

```
bash
git checkout -b new-feature
git commit -m "Added new feature"
git push origin new-feature
```

### 🔐 Authentication Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login` | Login with email/username & password |
| POST   | `/api/auth/google-login` | Login via Google OAuth |
| POST   | `/api/auth/resend-verification` | Resend verification email |
| GET    | `/api/auth/verify-email/:token` | Verify email |
| POST   | `/api/auth/forgot-password` | Send password reset email |
| POST   | `/api/auth/reset-password` | Reset user password |
| GET    | `/api/auth/user` | Get current user data |
| DELETE | `/api/auth/delete-account` | Delete user account |

## 🎨 Screenshots
✅ **Login/Register Page:**
![image](https://github.com/user-attachments/assets/1338b6dd-eb2d-4d6d-9872-64b6d4e9cfad)
![image](https://github.com/user-attachments/assets/8b337e3d-6b7a-48ed-95ab-6873dc528778)
![image](https://github.com/user-attachments/assets/bda36490-7051-404c-a95e-f16b260c9ac3)
![image](https://github.com/user-attachments/assets/2bcd5a47-4d02-426a-bada-e4269edfd3b1)
![image](https://github.com/user-attachments/assets/4ddb6f59-9bae-431a-a4a5-9951a4a9a004)

## 📜 License

📌 **MIT License** – Use freely!

## 📝 Author

👨‍💻 **Alex Nedelcu** – Developer

⭐ If you found this useful, consider starring the repo! ⭐

---
