# Full-Stack E-Commerce Project (Monorepo)

An enterprise-grade, modern Full-Stack E-Commerce platform built with **Next.js 16 Pages Router**, **Express.js**, and **MongoDB Atlas**.

---

## 📁 Monorepo Structure

```
ecommerce/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # Database and configuration files
│   │   └── db.js             # MongoDB Atlas connection with strict validation
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Express middlewares (JWT auth, error handler)
│   │   ├── authMiddleware.js # Cookie-based JWT verification & role authorization
│   │   └── errorMiddleware.js# 404 & Centralized error handler
│   ├── models/               # Mongoose schema definitions
│   ├── routes/               # Express REST route endpoints
│   ├── uploads/              # Storage directory for Multer image uploads
│   ├── utils/                # Utility helpers (token generator, cookie helpers)
│   │   └── generateToken.js  # JWT cookie generator & clearer
│   ├── .env.example          # Template for backend environment variables
│   ├── .gitignore            # Backend gitignore
│   ├── package.json          # Backend dependencies and scripts
│   └── server.js             # Express application entrypoint
│
└── frontend/                 # Next.js 16 (Pages Router) + Tailwind CSS
    ├── components/           # Reusable UI components (Navbar, Footer, etc.)
    │   ├── Navbar.js
    │   └── Footer.js
    ├── pages/                # Next.js Pages Router (NO App Router)
    │   ├── _app.js           # Custom App root wrapper
    │   ├── index.js          # Homepage with live backend integration status
    │   ├── login.js          # User Sign In
    │   ├── register.js       # User Registration
    │   ├── products/         # Products catalog
    │   │   └── index.js
    │   ├── categories/       # Category hierarchy
    │   │   └── index.js
    │   └── admin/            # Admin control center
    │       └── index.js
    ├── public/               # Static assets
    ├── styles/               # Global CSS & Tailwind setup
    │   └── globals.css
    ├── utils/                # Frontend helpers
    │   └── api.js            # Reusable API fetch client with credentials
    ├── .env.local.example    # Frontend environment variable template
    ├── .gitignore            # Frontend gitignore
    ├── next.config.js        # Next.js configuration (image domains)
    ├── package.json          # Frontend dependencies and scripts
    ├── postcss.config.js     # PostCSS configuration
    └── tailwind.config.js    # Tailwind CSS configuration
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (Pages Router ONLY) |
| **UI Library** | React 19 (JavaScript Only, NO TypeScript) |
| **Styling** | Tailwind CSS v3 & PostCSS |
| **Data Fetching** | Native Fetch API with `credentials: 'include'` |
| **Backend Framework** | Node.js + Express.js (MVC Architecture) |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Authentication** | JWT stored in HTTP-only Secure Cookies, bcrypt password hashing |
| **File Uploads** | Multer (storing to `backend/uploads`) |

