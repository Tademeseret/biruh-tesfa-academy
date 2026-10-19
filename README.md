# Biruh Tesfa Academy — Web Application

A full-stack web application for **Biruh Tesfa Academy**, a private school in Injibara town
serving students from **KG1–KG3** and **Grade 1–6**. Public registration, a bilingual
(English/Amharic) parent-facing site, a student portal for learning materials, and a
director admin dashboard for approvals and content management.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React.js, Tailwind CSS, `react-i18next`, `axios`, `react-router-dom` |
| Backend    | Node.js, Express.js, `multer` |
| Database   | MySQL (via `mysql2`) |
| Auth       | JWT (`jsonwebtoken`) + `bcrypt` for the director/admin login |

## Project Structure

```
biruh-tesfa-academy/
├── backend/
│   ├── config/
│   │   └── multer.js            # File upload configuration (receipts, PDFs, images)
│   ├── controllers/              # Route logic (one file per resource)
│   ├── database/
│   │   └── schema.sql            # Full MySQL schema + seed director account
│   ├── middleware/
│   │   ├── auth.js               # JWT verification for admin routes
│   │   └── errorHandler.js       # Centralized error + 404 handling
│   ├── routes/                   # Express routers (one file per resource)
│   ├── uploads/                  # Uploaded files land here (gitignored in practice)
│   │   ├── receipts/
│   │   ├── resources/
│   │   ├── announcements/
│   │   └── gallery/
│   ├── .env.example
│   ├── db.js                     # MySQL connection pool
│   ├── package.json
│   └── server.js                 # App entrypoint
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js    # Shared axios instance + JWT interceptor
    │   ├── components/           # Navbar, LanguageToggle, AnnouncementBoard, Gallery
    │   ├── i18n/
    │   │   ├── i18n.js
    │   │   └── locales/
    │   │       ├── en.json
    │   │       └── am.json
    │   ├── pages/                # HomePage, RegistrationPage, StudentPortal,
    │   │                         # AdminLogin, AdminDashboard
    │   ├── App.jsx                # Router
    │   ├── index.css              # Tailwind + brand theme (white / green / blue)
    │   └── index.js
    ├── .env.example
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

## Prerequisites

Install these **before** running the project:

1. **Node.js** v18 LTS or newer, and npm (comes bundled with Node).
   Check with: `node -v` and `npm -v`
2. **MySQL Server** v8.0 or newer, running locally or accessible remotely.
   Check with: `mysql --version`
3. A MySQL client of your choice to run the schema script (MySQL Workbench,
   `mysql` CLI, DBeaver, TablePlus, etc.)
4. **Git** (optional, if you're cloning/versioning this project).

## Setup Instructions

### 1. Create the database

Log in to MySQL and run the schema script:

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates the `biruh_tesfa_academy` database, all tables (`students`, `payments`,
`resources`, `announcements`, `gallery`, `admins`), and seeds one default director
account:

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your real MySQL credentials and a long random `JWT_SECRET`:

```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=biruh_tesfa_academy

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=8h

MAX_FILE_SIZE_MB=10
```

Start the API:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

The API runs at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` if your backend runs on a different host/port:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React dev server:

```bash
npm start
```

The site runs at `http://localhost:3000`.

### 4. Log in as director

Go to `http://localhost:3000/admin/login` and use the seeded credentials above to
reach the Director Dashboard (Registrations, Upload Resources, Announcements, Gallery tabs).

## API Overview

| Method | Endpoint                              | Access  | Purpose |
|--------|----------------------------------------|---------|---------|
| POST   | `/api/auth/login`                      | Public  | Admin/director login, returns JWT |
| POST   | `/api/students/register`               | Public  | Submit registration + receipt (`multipart/form-data`) |
| GET    | `/api/students/:id/status`             | Public  | Check a submitted application's status |
| GET    | `/api/resources?grade=Grade3`          | Public  | List worksheets/textbooks for a grade |
| GET    | `/api/announcements`                   | Public  | List announcements |
| GET    | `/api/gallery`                         | Public  | List gallery photos |
| GET    | `/api/admin/registrations`             | Admin   | List all registrations (filter by `?status=`) |
| PATCH  | `/api/admin/registrations/:id`         | Admin   | Approve/reject a registration |
| POST   | `/api/admin/resources`                 | Admin   | Upload a worksheet/textbook PDF |
| DELETE | `/api/admin/resources/:id`             | Admin   | Remove a resource |
| POST   | `/api/admin/announcements`             | Admin   | Publish an announcement |
| DELETE | `/api/admin/announcements/:id`         | Admin   | Remove an announcement |
| POST   | `/api/admin/gallery`                   | Admin   | Add a gallery photo |
| DELETE | `/api/admin/gallery/:id`               | Admin   | Remove a gallery photo |

All `Admin` routes require an `Authorization: Bearer <token>` header, obtained from
`/api/auth/login`.

## Design Notes

- **Brand theme**: white background throughout, with green (`#15803D`) and blue
  (`#1D4ED8`) as the primary text/accent colors — configured centrally in
  `frontend/tailwind.config.js` and `frontend/src/index.css` so it's easy to retint later.
- **Bilingual support**: every UI string lives in `src/i18n/locales/en.json` and
  `am.json`. Add a new key to both files and reference it with `t('your.key')` —
  no component code changes needed to support a new phrase in both languages.
- **File uploads**: `multer` writes files to `backend/uploads/<category>/` with
  sanitized, timestamped filenames, and the folder is served statically at
  `/uploads/...` so the frontend can display/download receipts, PDFs, and photos
  directly.
- **Security basics included**: parameterized SQL queries (no string concatenation),
  MIME-type + size-limited file uploads, JWT-protected admin routes, bcrypt-hashed
  passwords, and centralized error handling. For a production launch, also add
  rate limiting, HTTPS, HTTP-only cookie storage for tokens (instead of
  `localStorage`), and server-side input validation (e.g. `express-validator` or `zod`).

## Next Steps / Suggested Enhancements

- Add pagination to the registrations and resources lists as data grows.
- Add email/SMS notifications when a registration is approved or rejected.
- Add role-based permissions if you introduce `staff` accounts with limited access.
- Add automated tests (Jest + Supertest for the API, React Testing Library for the UI).
