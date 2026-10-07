# Exam System (MCQ)

A client-server multiple-choice exam application with three roles: **Student**, **Examiner**, and **Admin**. It uses a static HTML/CSS/JavaScript frontend, an Express.js API, and MySQL for data storage.

For the full architecture, database, authentication, and API reference, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Features

- Secure registration and login with JWT authentication
- Student, examiner, and admin role-based access
- Examiner question bank management (maximum 10 questions)
- Timed 10-minute student assessment
- Automatic scoring and score storage
- One exam submission per student
- Admin dashboard with user, question, and exam metrics

## Requirements

- Node.js 18 or later
- MySQL Server
- VS Code with the Live Server or Five Server extension (recommended)

## Setup

1. Open the project folder in VS Code.
2. Confirm the MySQL credentials in [backend/.env](backend/.env). The default database is `exam_system`.
3. Open a VS Code terminal and run:

   ```bash
   cd backend
   npm install
   npm run db:init
   ```

   This creates the `exam_system` database and its tables.

## Run the application

Start the backend from the `backend` folder:

```bash
npm start
```

Expected output:

```text
MySQL connection OK.
API listening on http://localhost:5001
```

Then open [frontend/index.html](frontend/index.html) with Live Server/Five Server. It will normally be available at one of these addresses:

- `http://localhost:5500/...`
- `http://127.0.0.1:5500/...`

Both local addresses are allowed by the backend.

## Using the system

1. Register an **Examiner** account and add up to 10 MCQ questions.
2. Register a **Student** account and take the timed exam.
3. Register an **Admin** account to view system totals and registered users.

> This project currently permits role selection during registration for demonstration purposes. In a production system, admin creation should be restricted.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | Get the signed-in user |
| `GET` | `/api/questions` | Get questions (answer keys are hidden from students) |
| `POST` | `/api/questions` | Add a question (examiner/admin) |
| `DELETE` | `/api/questions/:id` | Delete a question (owner/admin) |
| `POST` | `/api/questions/submit` | Submit student answers and calculate score |
| `GET` | `/api/admin/dashboard` | Get admin users and metrics |
| `GET` | `/api/health` | Check API and database status |

## Troubleshooting

- **"Could not reach the server"**: Ensure `npm start` is still running in the `backend` terminal, then refresh the frontend.
- **MySQL connection error**: Start the MySQL service and verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`.
- **Port 5001 already in use**: Stop the other process using the port, or change `PORT` in `backend/.env` and update the frontend API base URL accordingly.
