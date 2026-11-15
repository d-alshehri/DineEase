# 🍽️ DineEase – Restaurant Management SaaS

A web-based SaaS application that helps restaurants and cafes display menus, share prices, and manage table reservations.

**Course:** SE371 – Web Application Development  
**Project:** Semester Project – Phase 2  
**Project Title:** Full-Stack SaaS Web Application Development  
**Development Phase:** Back-End Development (Node.js, Express, MySQL, EJS)  
**Year:** 2026

---

## 📌 Project Overview

In Phase 1 we built the DineEase front-end with HTML5, CSS3 and JavaScript.
In Phase 2 the static website becomes a full-stack web application:

- A **Node.js + Express** server serves every page and the static files (CSS, JS).
- Data is stored in a **MySQL** database (plans, user profiles, feedback).
- **Web API routes** (under `/api`) let the pages create, read, update and delete data as JSON.
- Pages are rendered with **EJS** templates that share one head, navigation bar and footer.

## ✨ Features

- **Home page:** the pricing plans come from the database.
- **Plans (customers):** `/plans` lists all plans and `/plans/:id` shows one plan, rendered with EJS from MySQL. "View Plan" on the home page opens the plan's own page.
- **Manage Plans:** `/plans/manage` lets you add, edit and delete plans (with an on-page "are you sure?" step before deleting).
- **User profiles:** sign up, log in (passwords are hashed with bcrypt) and a profile page that shows the user's real data and plan.
- **Feedback & Support:** send feedback, see the recent feedback (rendered with EJS from MySQL), search it by keyword and delete it.
- **Search:** a live plan search (database), plus the Phase 1 search of sample data stored in `public/js/search.js`.
- **Shared layout:** one navigation bar for all EJS pages that highlights the current page.
- **404 page** for unknown URLs, and a JSON 404 for unknown API URLs.
- Old Phase 1 URLs (for example `/index.html`) redirect to the new routes.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 | Page structure, forms and responsive styling |
| JavaScript (browser) | Form handling and `fetch()` calls to the API |
| Node.js | JavaScript runtime for the server |
| Express 4 | Web server, page routes and web API routes |
| EJS 3 | Templates and shared partials (head, nav, footer) |
| MySQL + mysql2 | Database and the Node.js database driver (promise pool) |
| bcryptjs | Password hashing |
| dotenv | Loads database settings from the `.env` file |
| Git & GitHub | Version control and collaboration |

## 📁 Project Structure

```text
DineEase/
├── server.js              # Main server: settings, middleware, routes, 404, error handler
├── db.js                  # MySQL connection pool (mysql2/promise)
├── package.json
├── .env.example           # Copy to .env and add your own MySQL password
│
├── routes/
│   ├── pages.js           # Page routes (res.render), read data from MySQL for the views
│   ├── plans.js           # Web API: /api/plans
│   ├── profiles.js        # Web API: /api/profiles
│   └── feedback.js        # Web API: /api/feedback
│
├── views/                 # EJS templates
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── nav.ejs
│   │   └── footer.ejs
│   ├── index.ejs          # Home page
│   ├── support.ejs        # Feedback & Support
│   ├── 404.ejs
│   ├── error.ejs
│   ├── plans/
│   │   ├── plan-details.ejs  # All plans: /plans (read-only) and /plans/manage (Edit / Delete)
│   │   ├── plan.ejs          # One plan's own page (/plans/:id)
│   │   └── add-plan.ejs      # Add Plan AND Edit Plan form
│   └── profile/
│       ├── login.ejs
│       ├── add-user.ejs
│       └── profile.ejs
│
├── public/                # Static files, served as-is
│   ├── css/  (style.css = site theme for every page, plans.css, support.css)
│   └── js/   (plans-api.js, feedback-api.js, delete-buttons.js, search.js, add-user.js, login.js)
│
├── sql/
│   └── schema.sql         # Creates the database, all tables and sample plans
│
└── tests/
    ├── api.test.js        # Plans + profiles API tests
    └── feedback-smoke.js  # Feedback API smoke test
```

## 🚀 How to Run the Project

**Requirements:** Node.js 18 or newer, and MySQL Server (for example with MySQL Workbench).

1. Clone the repository and open the folder:

   ```bash
   git clone https://github.com/d-alshehri/DineEase.git
   cd DineEase
   ```

2. Install the packages:

   ```bash
   npm install
   ```

3. Create the database: open `sql/schema.sql` in MySQL Workbench and run the whole script.
   It creates the `dineease` database, the `plans`, `user_profiles` and `Feedback` tables, and 3 sample plans.

4. Create your `.env` file: copy `.env.example`, name the copy `.env`, and change
   `DB_PASSWORD` to **your own** MySQL password. `.env` is in `.gitignore`, so it is never committed.

5. Start the server:

   ```bash
   npm start
   ```

   The terminal shows `DineEase running at http://localhost:3000` and
   `Successfully connected to database server...`.
   (`npm run dev` also works: it restarts the server automatically when you save a file.)

6. Open **http://localhost:3000** in your browser.

## 🧪 How to Run the Tests

Keep the server running (`npm start`), then in a **second terminal** run:

```bash
npm test               # plans + profiles API tests -> "24 passed, 0 failed"
npm run test:feedback  # feedback API test -> "PASS: Create, Read, keyword Search, Delete"
```

The tests create their own test data and delete it at the end.

## 🗺️ Routes

### Page routes (return web pages) – `routes/pages.js`

| Method | URL | Page |
|---|---|---|
| GET | `/` | Home page (`views/index.ejs`), plans from the database |
| GET | `/plans` | All plans for customers, read-only (`views/plans/plan-details.ejs`) |
| GET | `/plans/:id` | One plan's own page (`views/plans/plan.ejs`) |
| GET | `/plans/manage` | Manage plans: Edit / Delete buttons (`views/plans/plan-details.ejs`) |
| GET | `/plans/add` | Add a new plan (`views/plans/add-plan.ejs`) |
| GET | `/plans/:id/edit` | Edit a plan: the same form, filled in (`views/plans/add-plan.ejs`) |
| GET | `/support` | Feedback & Support with the recent feedback (`views/support.ejs`) |
| GET | `/support?keyword=...` | Same page, only the feedback that contains the keyword |
| GET | `/login` | Log in (`views/profile/login.ejs`) |
| GET | `/signup` | Sign up (`views/profile/add-user.ejs`) |
| GET | `/profile?id=N` | Profile page of user N (`views/profile/profile.ejs`) |
| GET | any other URL | 404 page (`views/404.ejs`) |

Old Phase 1 URLs (`/index.html`, `/support.html`, `/plans/plan-details.html`, `/plans/add-plan.html`,
`/user-profile/login.html`, `/user-profile/add-user.html`, `/user-profile/Profile.html`) redirect (301) to the routes above.

### Web API routes (return JSON only)

| Method | URL | Description |
|---|---|---|
| GET | `/api/plans` | List all plans |
| GET | `/api/plans/:id` | Get one plan |
| POST | `/api/plans` | Create a plan |
| PUT | `/api/plans/:id` | Update a plan |
| DELETE | `/api/plans/:id` | Delete a plan |
| GET | `/api/profiles` | List all profiles |
| GET | `/api/profiles/:id` | Get one profile |
| POST | `/api/profiles` | Create a profile (sign up) |
| POST | `/api/profiles/login` | Log in with email and password |
| PUT | `/api/profiles/:id` | Update a profile |
| DELETE | `/api/profiles/:id` | Delete a profile |
| GET | `/api/feedback?keyword=...` | List feedback, or search by keyword |
| GET | `/api/feedback/:id` | Get one feedback message |
| POST | `/api/feedback` | Send feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |

Unknown `/api/...` URLs return `{ "error": "Not found" }` with status 404.

## 👥 Team Members & Contributions

| Student | Name | Phase 1 | Phase 2 |
|---|---|---|---|
| Student 1 | Danah Alshehri | Home Page and Navigation | Server Setup & Integration (Node.js/Express setup, server routes and configuration, connecting the website to the server, shared EJS layouts and navigation) |
| Student 2 | Jawaher Alborethen | User Profile and Add User Form | Plans table & CRUD API |
| Student 3 | Nadine Kumkumji | Plan Details and Add Plan Form | Feedback table, API & keyword search |
| Student 4 | Najlaa Alarfaj | Feedback & Support and Plan Search | EJS Plans & Feedback pages, front-end integration |

All team members contribute to project integration, testing, and keeping the website consistent.

## 📅 Project Deadlines

**Phase 1 Submission:** 31 October 2026  
**Phase 2 Submission:** 8 November 2026

## 🔗 Repository

[GitHub – DineEase](https://github.com/d-alshehri/DineEase)

---

*DineEase – Making Restaurant Management Easier.*
