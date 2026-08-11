# 🔑 Demo Credentials

The project includes default/demo accounts for testing the three different roles.

| Role    | Email              | Password      |
| ------- | ------------------ | ------------- |
| Admin   | `admin@asms.com`   | `Admin@123`   |
| Teacher | `teacher@asms.com` | `Teacher@123` |
| Student | `student@asms.com` | `Student@123` |

# Assignment & Submission Management System

A full-stack **Assignment & Submission Management System (ASMS)** designed to manage users, courses, subjects, assignments, and student submissions through role-based access control.

The system provides separate dashboards and permissions for **Admin, Teacher, and Student** users. Authentication is implemented using **JWT**, while the backend is built with **ASP.NET Core Web API and MongoDB**, and the frontend uses **Next.js, TypeScript, and Tailwind CSS**.

---

## 🚀 Project Overview

The Assignment & Submission Management System allows educational institutions to manage the complete assignment lifecycle:

- Admin manages users, courses, subjects, and teacher assignments.
- Teachers create and manage assignments for specific courses and subjects.
- Teachers review student submissions and provide marks, feedback, and status updates.
- Students view assignments, submit their work, update submissions before deadlines, and view their marks and feedback.
- JWT-based authentication protects the application and provides role-based authorization.

---

## 👥 User Roles

### Admin

Admin users have full management access to the system.

**Permissions:**

- Users: CRUD
- Courses: CRUD
- Subjects: CRUD
- Assign teachers to subjects
- Assignments: Read
- Submissions: Read

### Teacher

Teachers are responsible for managing assignments and evaluating submissions.

**Permissions:**

- Assignments: CRUD
- Define assignment:
  - Title
  - Description
  - Deadline
  - Maximum marks

- Publish/Draft assignments
- Assign assignments to a specific course and subject
- Submissions:
  - Read
  - Update marks
  - Update feedback
  - Update submission status

### Student

Students can view assignments and submit their work.

**Permissions:**

- Assignments: Read
- Submissions:
  - Create
  - Update until deadline
  - Read

- Marks/Feedback: Read

---

## ✨ Main Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based authorization
- Separate Admin, Teacher, and Student access
- Protected API endpoints
- Environment variables for sensitive configuration

### 👤 User Management

Admin can:

- Create users
- View users
- Update users
- Delete users
- Manage user roles

### 📚 Course Management

Admin can:

- Create courses
- View courses
- Update courses
- Delete courses

### 📖 Subject Management

Admin can:

- Create subjects
- View subjects
- Update subjects
- Delete subjects
- Assign teachers to subjects

### 📝 Assignment Management

Teachers can:

- Create assignments
- View assignments
- Update assignments
- Delete assignments
- Set title and description
- Set deadline
- Set maximum marks
- Assign an assignment to a course
- Assign an assignment to a subject
- Save assignments as Draft
- Publish assignments

### 📤 Submission Management

Students can:

- Submit assignments
- View their submissions
- Update submissions before the deadline

Teachers can:

- View student submissions
- Add marks
- Add feedback
- Update submission status

Students can:

- View their marks
- View teacher feedback
- View submission status

---

# 🛠️ Technology Stack

## Backend

- **ASP.NET Core Web API**
- **C#**
- **MongoDB**
- **JWT Authentication**
- **Swagger / OpenAPI**
- Environment Variables / Configuration

## Frontend

- **Next.js**
- **TypeScript**
- **React**
- **Tailwind CSS**
- Environment Variables / Configuration

## Database

- **MongoDB**

# 🛠️ Technology version

## Backend

ASP.NET Core Web API (.NET 10)
C#
MongoDB.Driver 3.10.0
JWT Bearer Authentication
BCrypt.Net-Next 4.2.0
Swagger / OpenAPI
DotNetEnv 3.2.0

## Frontend

Next.js 15.5.0
React 19.1.0
TypeScript 5.7.2
Tailwind CSS 3.4.17
Lucide React 0.468.0
