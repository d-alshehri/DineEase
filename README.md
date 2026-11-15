# DineEase – Restaurant Management SaaS

DineEase is a web app for restaurants and cafes. They can show their menu and prices, offer subscription plans, and let customers reserve tables.

**Course:** SE371 – Web Application Development  
**Project:** Semester Project – Phase 2 (Full-Stack SaaS Web Application)  
**Year:** 2026

## About the project

In Phase 1 we built the front-end with HTML, CSS and JavaScript.
In Phase 2 we turned it into a full-stack app:

- A Node.js + Express server serves all the pages and the static files.
- The data is stored in a MySQL database (plans, user profiles and feedback).
- The pages use EJS templates with a shared head, navigation bar and footer.
- The API routes under `/api` return JSON and are used by the forms on the pages.

## Features

- **Home page:** features section and pricing plans (loaded from the database).
- **Plans:** `/plans` lists all plans, and each plan has its own page at `/plans/:id`. "View Plan" on the home page opens it.
- **Manage Plans:** `/plans/manage` is where plans are added, edited and deleted. Delete asks for confirmation first.
- **Sign up, log in and profile:** passwords are hashed with bcrypt. The profile page shows the user's details and plan from the database. The "This month" card and the reservations table are still sample data.
- **Feedback & Support:** send feedback, see the recent feedback, search it by keyword and delete it.
- **Plan search:** searches the plans in the database.
- **Phase 1 sample search:** searches dummy data stored in `public/js/search.js` and shows the results in a table.
- **404 page** for unknown pages, and a JSON 404 for unknown API URLs.
- The old Phase 1 URLs (like `/index.html`) redirect to the new pages.

## Technologies

| Technology | Used for |
|---|---|
| HTML5 / CSS3 | Page structure, forms, responsive layout |
| JavaScript | Form handling and `fetch()` calls to the API |
| Node.js + Express 4 | Server, page routes and API routes |
| EJS 3 | Page templates and shared partials |
| MySQL + mysql2 | Database and database driver |
| bcryptjs | Password hashing |
| dotenv | Reads the database settings from `.env` |
| Git & GitHub | Version control |

## Project structure

```text
DineEase/
├── server.js             # Express app: middleware, routes, 404 and error handler
├── db.js                 # MySQL connection pool
├── package.json
├── .env.example          # copy to .env and add your MySQL password
├── routes/
│   ├── pages.js          # page routes (render the EJS views)
│   ├── plans.js          # /api/plans
│   ├── profiles.js       # /api/profiles
│   └── feedback.js       # /api/feedback
├── views/
│   ├── partials/         # head.ejs, nav.ejs, footer.ejs
│   ├── index.ejs         # home page
│   ├── support.ejs       # feedback & support
│   ├── 404.ejs
│   ├── error.ejs
│   ├── plans/
│   │   ├── plan-details.ejs   # /plans and /plans/manage
│   │   ├── plan.ejs           # /plans/:id
│   │   └── add-plan.ejs       # add and edit plan form
│   └── profile/          # login.ejs, add-user.ejs, profile.ejs
├── public/
│   ├── css/              # style.css (all pages), plans.css, support.css
│   └── js/               # plans-api.js, feedback-api.js, delete-buttons.js,
│                         # search.js, add-user.js, login.js
├── sql/
│   ├── schema.sql        # creates the database, plans and user_profiles, and 3 sample plans
│   └── feedback.sql      # creates the Feedback table
└── tests/
    ├── api.test.js       # plans and profiles API
    ├── feedback-smoke.js # feedback API
    └── pages.test.js     # page routes
```

## How to run it

You need Node.js 18 or newer and MySQL (we used MySQL Workbench).

1. Clone the repo and install the packages:

   ```bash
   git clone https://github.com/d-alshehri/DineEase.git
   cd DineEase
   npm install
   ```

2. In MySQL Workbench, run `sql/schema.sql` first, then `sql/feedback.sql`.
   `schema.sql` creates the `dineease` database, the `plans` and `user_profiles` tables, and 3 sample plans (Starter, Growth, Premium). `feedback.sql` creates the `Feedback` table.

3. Copy `.env.example` to a new file called `.env` and put your own MySQL password in `DB_PASSWORD`. `.env` is in `.gitignore`, so it won't be committed.

   ```text
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=dineease
   PORT=3000
   ```

4. Start the server:

   ```bash
   npm start
   ```

   You should see `DineEase running at http://localhost:3000` and `Successfully connected to database server...`.
   `npm run dev` also works. It restarts the server when you save a file.

5. Open http://localhost:3000 in your browser.

## Tests

Start the server first (`npm start`), then run the tests in a second terminal:

```bash
npm test               # plans + profiles API: 24 passed, 0 failed
npm run test:feedback  # feedback API: PASS: Create, Read, keyword Search, Delete
npm run test:pages     # all pages load with the nav and show the database data: 21 passed, 0 failed
```

The API tests add their own test data and delete it at the end. The page test only reads data.

## Routes

### Page routes (`routes/pages.js`)

| Method | URL | Page |
|---|---|---|
| GET | `/` | Home page |
| GET | `/plans` | All plans |
| GET | `/plans/:id` | One plan |
| GET | `/plans/manage` | Manage plans (edit and delete) |
| GET | `/plans/add` | Add a plan |
| GET | `/plans/:id/edit` | Edit a plan |
| GET | `/support` | Feedback & Support, with the recent feedback |
| GET | `/support?keyword=...` | Same page, only the feedback that matches the keyword |
| GET | `/login` | Log in |
| GET | `/signup` | Sign up |
| GET | `/profile?id=N` | Profile page of user N |

Any other URL shows the 404 page. The old Phase 1 URLs (`/index.html`, `/support.html`, `/plans/plan-details.html`, `/plans/add-plan.html`, `/user-profile/login.html`, `/user-profile/add-user.html`, `/user-profile/Profile.html`) redirect to these routes.

### API routes (return JSON)

| Method | URL | Description |
|---|---|---|
| GET | `/api/plans` | All plans |
| GET | `/api/plans/:id` | One plan |
| POST | `/api/plans` | Add a plan |
| PUT | `/api/plans/:id` | Update a plan |
| DELETE | `/api/plans/:id` | Delete a plan |
| GET | `/api/profiles` | All profiles |
| GET | `/api/profiles/:id` | One profile |
| POST | `/api/profiles` | Sign up |
| POST | `/api/profiles/login` | Log in |
| PUT | `/api/profiles/:id` | Update a profile |
| DELETE | `/api/profiles/:id` | Delete a profile |
| GET | `/api/feedback` | All feedback (add `?keyword=...` to search) |
| GET | `/api/feedback/:id` | One feedback message |
| POST | `/api/feedback` | Send feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |

## Team

| Student | Name | Phase 1 Role | Phase 2 Role |
|---|---|---|---|
| Student 1 | Danah Alshehri | Front-End Design (Home Page & Navigation) | Server Setup & Integration |
| Student 2 | Jawaher Alborethen | User Management | Database & Plans |
| Student 3 | Nadine Kumkumji | Plans Management | Feedback Backend |
| Student 4 | Najlaa Alarfaj | Forms & JavaScript | EJS & Front-End Integration |

### Danah Alshehri

**Phase 1: Front-End Design**
- Built the Home Page with the product overview and the Features section.
- Added the Pricing section with pricing cards.
- Created the reusable navigation menu used on all pages.
- Made the Home Page responsive.
- Coordinated the shared header and footer design.

**Phase 2: Server Setup & Integration**
- Set up the Node.js and Express server (`server.js`).
- Created the server routes and project configuration (`routes/pages.js`, `.env.example`, `package.json`).
- Connected the existing website to the server, with static files served from `public/`.
- Set up the shared EJS layouts and navigation (`views/partials/head.ejs`, `nav.ejs`, `footer.ejs`).

**Files:** `server.js`, `routes/pages.js`, `views/index.ejs`, `views/partials/`, `views/404.ejs`, `views/error.ejs`, `public/css/style.css`

### Jawaher Alborethen

**Phase 1: User Management**
- Built the Profile Page that simulates a logged-in user's dashboard.
- Created the Add New User form with at least four different data types and HTML5 validation.
- Designed the profile information and dashboard sections.
- Made the layouts responsive.

**Phase 2: Database & Plans**
- Created the MySQL Plans table (`sql/schema.sql`).
- Implemented Create, Read, Update and Delete for plans (`routes/plans.js`).
- Connected and tested the Plans API (`tests/api.test.js`).

**Files:** `routes/plans.js`, `routes/profiles.js`, `sql/schema.sql`, `views/profile/`, `public/js/add-user.js`, `public/js/login.js`, `tests/api.test.js`

### Nadine Kumkumji

**Phase 1: Plans Management**
- Built the Plan Details page showing the details of each plan.
- Created the Add New Plan form with at least four different data types and HTML5 validation.
- Styled the plan details and the form.
- Made the pages responsive.

**Phase 2: Feedback Backend**
- Created the MySQL Feedback table.
- Implemented Create, Read and Delete for feedback (`routes/feedback.js`).
- Implemented keyword search using GET (`/api/feedback?keyword=`).
- Tested the Feedback API (`tests/feedback-smoke.js`).

**Files:** `routes/feedback.js`, `sql/feedback.sql`, `tests/feedback-smoke.js`, `public/css/plans.css`

### Najlaa Alarfaj

**Phase 1: Forms & JavaScript**
- Built the Feedback/Support page with Name, Email, Subject and Message fields.
- Implemented the contact form with HTML5 validation.
- Created the search form that queries dummy data stored in a JavaScript file.
- Displayed the search results in a styled HTML table.
- Made the page responsive.

**Phase 2: EJS & Front-End Integration**
- Converted the Plans and Feedback pages into EJS.
- Displayed dynamic data from MySQL on the pages.
- Connected the forms to the backend endpoints.
- Tested the front-end and backend integration.

**Files:** `views/plans/`, `views/support.ejs`, `public/js/plans-api.js`, `public/js/feedback-api.js`, `public/js/search.js`, `public/css/support.css`

All team members contributed to integration, testing, and keeping the website consistent.

## Deadlines

- Phase 1: 31 October 2026
- Phase 2: 16 November 2026

## Repository

https://github.com/d-alshehri/DineEase
