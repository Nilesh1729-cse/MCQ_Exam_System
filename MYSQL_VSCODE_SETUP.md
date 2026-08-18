# MySQL VSCode Extension Setup Guide

## Overview
This guide helps you connect your Exam System project to MySQL through the VSCode MySQL extension for easy database management and querying.

## Step 1: Install MySQL Extension
1. Open VSCode
2. Go to **Extensions** (Ctrl+Shift+X)
3. Search for "MySQL" 
4. Install the official **MySQL** extension by Jun Han or **Database Client** by Weijan Chen (either works)

## Step 2: Configure Connection in VSCode

### Option A: Using MySQL Extension by Jun Han
1. Click the **MySQL** icon in the left sidebar
2. Click **+** to add a new connection
3. Fill in the connection details:
   - **Host**: `localhost`
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: `Nilesh` (from your .env file)
   - **Database**: `exam_system`
4. Click "Connect"

### Option B: Using MySQL for VSCode Extension
1. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux)
2. Type "MySQL" and select "MySQL: New Connection"
3. Enter the connection details:
   - **Host**: `localhost`
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: `Nilesh`
   - **Default Database**: `exam_system`

## Step 3: Verify Your .env File

Make sure your `.env` file has these correct values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Nilesh
DB_NAME=exam_system
```

Currently in your project:
- ✅ DB_HOST=localhost
- ✅ DB_PORT=3306
- ✅ DB_USER=root
- ✅ DB_PASSWORD=Nilesh
- ✅ DB_NAME=exam_system

## Step 4: Initialize Database

Before running the server, initialize your database:

```bash
cd backend
npm run db:init
```

This runs the `database/init.js` script which creates all tables from `database/schema.sql`.

## Step 5: Start Your Backend Server

```bash
cd backend
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## Step 6: Browse Your Database in VSCode

1. In the MySQL sidebar, you should see your `exam_system` connection
2. Expand it to see the three tables:
   - **users** - All registered users (admin, examiner, student)
   - **questions** - Exam questions (max 10)
   - **scores** - Student exam results

3. Right-click any table to:
   - View data
   - Run queries
   - Edit records
   - Delete records

## Common Issues & Solutions

### Connection Refused Error
**Problem**: "Error: connect ECONNREFUSED 127.0.0.1:3306"
- Make sure MySQL server is running
- On Windows: Check MySQL Service in Services
- On Mac: `brew services start mysql`
- On Linux: `sudo systemctl start mysql`

### Access Denied Error
**Problem**: "Access denied for user 'root'@'localhost'"
- Verify password in `.env` matches your MySQL root password
- Try resetting MySQL: `mysql -u root -p` and enter your password

### Database Doesn't Exist
**Problem**: "Unknown database 'exam_system'"
- Run initialization: `npm run db:init` from backend folder
- This creates the database and all tables

### Port Already in Use
**Problem**: "EADDRINUSE :::5000"
- Change PORT in `.env` to an available port (e.g., 5001)
- Or kill the process using port 5000

## What Was Fixed in Your Project

1. ✅ **Connection Pool Usage**: All controllers now use the shared connection pool from `config/db.js` instead of creating new connections per request
2. ✅ **Improved Performance**: Connections are now reused from the pool instead of creating overhead for each API call
3. ✅ **Proper Resource Management**: Connections are released back to the pool with `finally` blocks

## Testing the Connection

Once everything is set up, test with:

```bash
# Check if server starts without errors
npm start

# In another terminal, test the health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","db":"connected","time":"2024-08-18T..."}
```

## Next Steps

- Register a test user: POST to `/api/auth/register`
- Login: POST to `/api/auth/login`
- Create exam questions: POST to `/api/questions` (as examiner)
- View all questions: GET `/api/questions` (authenticated)
- Submit exam: POST to `/api/questions/submit` (as student)

All these operations are now using efficient database connection pooling!
