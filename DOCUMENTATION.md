# Exam System Documentation

## Overview

Exam System is a role-based, web-based MCQ assessment application. Students take a timed assessment, examiners maintain the question bank, and administrators view system-level activity.

## Architecture

The application has three layers:

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript | Login, registration, dashboards, timer, and exam interaction |
| API | Node.js and Express | Authentication, role authorization, questions, scoring, and validation |
| Database | MySQL | Persists users, questions, and scores |

The frontend calls the Express API at `http://localhost:5001/api` by default. The backend accepts local frontend origins at both `localhost:5500` and `127.0.0.1:5500`.

## Roles and permissions

| Role | Capabilities |
| --- | --- |
| Student | View exam questions without answer keys, take the 10-minute exam, and submit one score |
| Examiner | Add questions, view answer keys, and delete questions they created |
| Admin | View platform metrics and registered users; can manage all questions |

> The registration screen permits choosing a role to make local development and demonstrations easier. Production deployments should restrict administrator and examiner account creation.

## Project structure

```text
backend/
  config/          MySQL pool configuration
  controllers/     Authentication, question, and admin request handlers
  database/        Schema and database initialization script
  middleware/      JWT authorization, validation, and error handling
  routes/          API route definitions
  server.js        Express application entry point
frontend/
  css/             Application styling
  js/              Shared API client and page behaviour
  *.html           Login, registration, and role dashboard pages
```

## Database

The database is named `exam_system` and includes these tables:

| Table | Purpose |
| --- | --- |
| `users` | Account name, email, password hash, role, and creation time |
| `questions` | MCQ text, four options, correct option, and examiner owner |
| `scores` | A student's final score, question total, and submission time |

Question records are linked to their creator. Score records are linked to students and have a unique student constraint so an exam can only be submitted once.

Initialize the database with:

```bash
cd backend
npm run db:init
```

## Configuration

Copy `backend/.env.example` to `backend/.env`, then set your local values:

```env
PORT=5001
CLIENT_ORIGIN=http://localhost:5500
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=exam_system
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Never commit `.env` or real database/JWT credentials.

## Running locally

Install dependencies and start the API:

```bash
cd backend
npm install
npm start
```

Then serve `frontend/index.html` with VS Code Live Server or Five Server. The browser address will usually use port `5500`.

## API reference

All protected routes require this header:

```text
Authorization: Bearer <JWT_TOKEN>
```

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a user account |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Signed in | Get the current user profile |
| `GET` | `/api/questions` | Signed in | Get the question bank; answer keys are hidden from students |
| `POST` | `/api/questions` | Examiner, Admin | Create a question; the global limit is 10 |
| `DELETE` | `/api/questions/:id` | Examiner, Admin | Delete an owned question, or any question for admins |
| `POST` | `/api/questions/submit` | Student | Calculate and persist a student's score |
| `GET` | `/api/admin/dashboard` | Admin | Get user, question, and exam totals |
| `GET` | `/api/health` | Public | Check API/database availability |

### Example: register

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "secure-password",
  "role": "student"
}
```

### Example: create a question

```json
{
  "question_text": "Which HTTP method is normally used to retrieve a resource?",
  "option_a": "GET",
  "option_b": "POST",
  "option_c": "PUT",
  "option_d": "DELETE",
  "correct_option": "A"
}
```

### Example: submit an exam

```json
{
  "answers": [
    { "questionId": "1", "selectedOption": "A" },
    { "questionId": "2", "selectedOption": "C" }
  ]
}
```

## Exam lifecycle

1. An examiner creates up to 10 questions.
2. A student opens the exam and the 10-minute timer begins.
3. The student selects answers and submits, or the timer submits completed answers automatically.
4. The API compares answers with the protected answer key and stores the result.
5. The student sees their score; the administrator's exam count increases.

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| Frontend says it cannot reach the server | Ensure `npm start` is running and refresh the browser. |
| MySQL connection fails | Start MySQL and check the `DB_*` values in `backend/.env`. |
| Port is already in use | Stop the process using the configured port, or choose another `PORT` and update `window.API_BASE_URL` for the frontend. |
| Browser blocks the API request | Use Live Server/Five Server on port 5500 and ensure `CLIENT_ORIGIN` matches its origin. |
