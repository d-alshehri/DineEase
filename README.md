# 🍽️ DineEase – Restaurant Management SaaS

A responsive web-based SaaS application designed to simplify restaurant management through an organized and user-friendly interface.

**Course:** SE371 – Web Application Development  
**Project:** Semester Project – Phase 1  
**Project Title:** Full-Stack SaaS Web Application Development  
**Development Phase:** Front-End Development  
**Year:** 2026

---

## 📌 Project Overview

DineEase is a web-based restaurant management application designed to provide users with an accessible and organized platform for exploring subscription plans, managing user profiles, and accessing support services.

The project is developed as part of the SE371 semester project. Phase 1 focuses on building the front-end using HTML5, CSS3, and JavaScript.

## 🎯 Project Objectives

- Develop a responsive and user-friendly website.
- Apply HTML5 semantic elements.
- Use CSS Flexbox and Grid for page layouts.
- Implement HTML5 form validation.
- Create interactive features using JavaScript.
- Maintain consistent styling and navigation across all pages.
- Ensure compatibility with mobile, tablet, and desktop screens.

## ✨ Features

### 1. Home Page
- Introduction to DineEase.
- Overview of application features.
- Display of subscription pricing plans.
- Navigation to other website sections.

### 2. Plans Management
- View subscription plan details.
- Add new plans through a form.
- Display plan information.
- Store plan data using browser local storage.

### 3. User Profile
- User login interface.
- User registration form.
- Profile dashboard.
- Display of user information.

### 4. Feedback & Support
- Contact and feedback form.
- Fields for Name, Email, Subject, and Message.
- HTML5 form validation.
- Feedback submission confirmation.

### 5. Plan Search
- Search for available subscription plans.
- Retrieve dummy plan data from a JavaScript file.
- Display matching results in a styled HTML table.
- Display a message when no results are found.

### 6. Responsive Design
- Responsive navigation.
- Flexible page layouts.
- CSS Flexbox and Grid.
- Media queries for different screen sizes.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure and forms |
| CSS3 | Styling and responsive layouts |
| JavaScript | Search functionality and interactivity |
| Local Storage | Browser-based data storage |
| Git & GitHub | Version control and collaboration |

## 📁 Project Structure

```text
DineEase/
│
├── index.html
├── support.html
├── README.md
│
├── css/
│   ├── style.css
│   ├── support.css
│   ├── plans.css
│   ├── Userprofile.css
│   └── user.css
│
├── js/
│   ├── search.js
│   └── plans.js
│
├── plans/
│   ├── add-plan.html
│   └── plan-details.html
│
└── user-profile/
    ├── login.html
    ├── Profile.html
    └── add-user.html
```

## 🚀 How to Run the Project

1. Clone or download the repository:

   ```bash
   git clone https://github.com/d-alshehri/DineEase.git
   ```

2. Open the project folder:

   ```bash
   cd DineEase
   ```

3. Open `index.html` in your web browser.

4. Navigate through the website using the navigation menu.

**Recommended:** Use Visual Studio Code with the Live Server extension for local development.

## 👥 Team Members & Contributions

The DineEase project is developed collaboratively by the following four students:

| Student | Name | Responsibilities |
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
| Student 2 | Jawaher Alborethen | User Management | User & Plans Database |
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
- Integrated everyone's work into one app: the EJS pages, the Plans and Feedback APIs and the profile pages.
- Tested the full app on her device: the API tests, the feedback test, the page tests (`tests/pages.test.js`) and every form in the browser.

**Files:** `server.js`, `routes/pages.js`, `views/index.ejs`, `views/partials/`, `views/404.ejs`, `views/error.ejs`, `public/css/style.css`, `tests/pages.test.js`

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

Danah integrated everyone's work and tested the full project on her device, where the app runs.

## Deadlines

- Phase 1: 31 October 2026
- Phase 2: 16 November 2026

## Repository

https://github.com/d-alshehri/DineEase
