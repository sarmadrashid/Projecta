#  Projecta

A Production-Oriented Project Management REST API built with Node.js, Express.js and MongoDB.

Projecta provides a secure and scalable backend for collaborative project management, featuring authentication, role-based authorization, project collaboration, task management, notes, file attachments, and cloud storage integration.

---

## 📖 Overview

Projecta is a RESTful backend API that enables teams to efficiently collaborate on software projects.

It provides a complete workflow for managing projects, assigning tasks, tracking subtasks, sharing notes, and handling project attachments while following modern backend development practices.

This project was built with a strong emphasis on **clean architecture, security, scalability, and maintainability** rather than simply implementing CRUD operations.

---

#  Features

## Authentication & Security

- User Registration
- Secure Login
- JWT Authentication
- Access Token & Refresh Token
- Refresh Token Rotation
- Logout
- Email Verification
- Forgot Password
- Password Reset
- Change Password
- Password Hashing using bcrypt
- HTTP-only Cookies
- Environment-based Configuration

---

## User & Role Management

- Role-Based Access Control (RBAC)
- Project Admin
- Project Member
- Owner/Admin Permissions

---

## Project Management

- Create Projects
- Update Projects
- Delete Projects
- Fetch User Projects
- Project Details
- Project Member Management

---

## Task Management

- Create Tasks
- Update Tasks
- Delete Tasks
- Assign Tasks
- Update Status
- Upload Multiple Attachments
- Remove Individual Attachments

---

## Subtasks

- Create Subtasks
- Update Subtasks
- Mark Complete / Incomplete
- Delete Subtasks

---

## Notes

- Create Notes
- Update Notes
- Delete Notes
- Retrieve Project Notes

---

## File Management

- Multer
- Cloudinary Integration
- Multiple File Uploads
- Automatic Temporary File Cleanup
- Automatic Cloudinary Asset Deletion

---

## Validation

- Express Validator
- MongoDB ObjectId Validation
- Request Validation Middleware
- Centralized Error Handling

---

## Database

- MongoDB
- Mongoose ODM
- Aggregation Pipelines
- MongoDB Transactions
- Compound Indexes
- References between Collections

---

# Architecture

Projecta follows a modular backend architecture.

```text
src
│
├── controllers
├── routes
├── models
├── middlewares
├── validators
├── utils
├── DB
├── constants
└── index.js
```

Each module has a dedicated responsibility which keeps the codebase maintainable and easy to scale.

---

# 🛠 Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Token)
- bcrypt

### File Storage

- Multer
- Cloudinary

### Validation

- Express Validator

### Email

- Nodemailer
- Brevo SMTP
- Mailgen

---

# API Modules

- Authentication
- Projects
- Project Members
- Tasks
- Subtasks
- Notes
- Attachments
- Health Check

---

# Installation

Clone the repository

```bash
git clone https://github.com/sarmadrashid/Projecta.git
```

Move into the project

```bash
cd Projecta
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```bash
cp .env.example .env
```

Start the development server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file using the provided `.env.example`.

```env
# Database
MONGO_DB_URI=

# Server
PORT=
SERVER_URL=
CORS_ORIGIN=

# JWT
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

# Mail
BREVO_SMTP_HOST=
BREVO_SMTP_PORT=
BREVO_SMTP_USER=
BREVO_SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# Authentication Flow

```text
User Login
      │
      ▼
Generate Access Token
Generate Refresh Token
      │
      ▼
Access Protected Routes
      │
      ▼
Access Token Expires
      │
      ▼
Refresh Token Endpoint
      │
      ▼
New Access Token Issued
```

---

# File Upload Flow

```text
Client
   │
   ▼
Multer
   │
   ▼
Temporary Local Storage
   │
   ▼
Cloudinary Upload
   │
   ▼
Store URL & Public ID
   │
   ▼
Delete Temporary File
```

---

# Security Practices

- JWT Authentication
- Password Hashing
- Environment Variables
- Secure SMTP Email Delivery
- Input Validation
- Centralized Error Handling
- Role-Based Authorization
- Secure Cookie Support
- Cloud Storage for Attachments
- MongoDB Transactions for Critical Operations

---

# Testing

The API has been manually tested using Postman.

The following modules have been tested:

- Authentication
- Authorization
- Projects
- Members
- Tasks
- Subtasks
- Notes
- Attachments
- Password Recovery
- Cloudinary Uploads

---

# 📖 API Documentation

>

## https://documenter.getpostman.com/view/41965656/2sBY4SLyYg

---

# 🌐 Live API

>

## https://projecta-tiim.onrender.com/

---

# Future Improvements

- Docker Support
- Swagger / OpenAPI Documentation
- Unit Testing (Jest)
- Integration Testing (Supertest)
- Redis Caching
- WebSockets
- Email Queue (BullMQ + Redis)
- Activity Logs
- Notifications
- GitHub Actions CI/CD

---

# Contributing

Contributions, suggestions and feedback are always welcome.

If you would like to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a Pull Request.

---

# Author

**Muhammad Sarmad**

Backend Developer • BS Applied Computing Student • Passionate about Backend Engineering, System Design and Building Scalable APIs.

GitHub: https://github.com/sarmadrashid

LinkedIn: https://www.linkedin.com/in/muhammad-sarmad-37b8a9323

---

# License

Licensed under the ISC License.

---

If you found this project helpful, consider giving the repository a star.
