# Task Manager App

## Description
Task Manager App is a practical task management project that allows users to manage their tasks effectively. It includes functionality for:
- User authentication (sign-up, login, and password reset).
- Task boards and tasks (CRUD operations).
- Drag-and-drop task management.
- User profile updates, including profile picture uploads.

---

## Features

### 1. Authentication
- **Login/Signup**: Users can register and log in using their email and password.
- **Forgot/Reset Password**: Users can reset their password if they forget it.

### 2. Task Management
- **Home Page**: After logging in, users are redirected to the home page.
- **Task Boards**: 
  - Create, update, and delete task boards (CRUD operations).
  - Add, update, and delete tasks within task boards (CRUD operations).
  - Drag and drop tasks between task boards.

### 3. User Profile
- **Profile Page**: Users can update their profile details, including:
  - Name
  - Profile picture (with file upload functionality)

---

## Installation

# Frontend
1. Navigate to the `client` directory.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.

## Tech Stack
- React
- Tailwind CSS

## Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.


# - Backend
1. Navigate to the `server` directory.
2. Create a `.env` file using `.env.example` as a template.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the backend server.

## Tech Stack
- Node.js
- Express.js
- MongoDB


## Create a .env file in the server directory using the provided .env.example file:
## Environment Variables
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret for JWT tokens.
- `EMAIL_USER`: Email address for sending emails.
- `EMAIL_PASSWORD`: Password for email.
- `FRONTEND_URL`: URL of the frontend application.

